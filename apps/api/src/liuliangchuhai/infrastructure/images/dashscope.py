"""Alibaba Cloud text-to-image, the same account the video providers use.

One Bailian key already unlocks the talking-head renderers, so it is the
cheapest way to also get real photographs: no second vendor, no foreign card.
The call is an async task — submit, poll, then copy the signed URL into local
media before it expires.
"""

from __future__ import annotations

import asyncio
import hashlib
from pathlib import Path
from typing import Final

import httpx

from liuliangchuhai.application.ports.image_errors import (
    ImageRejected,
    ImageUnavailable,
    InvalidImageResponse,
)
from liuliangchuhai.application.ports.status import ProviderStatus
from liuliangchuhai.domain.image import GeneratedImage, ImageGenerationInput

_BASE_URL: Final = "https://dashscope.aliyuncs.com/api/v1"
_SUBMIT_PATH: Final = "/services/aigc/text2image/image-synthesis"
_TASK_PATH: Final = "/tasks/{task_id}"

_RUNNING: Final = frozenset({"PENDING", "RUNNING"})
_SUCCEEDED: Final = "SUCCEEDED"
_FAILED: Final = frozenset({"FAILED", "CANCELED", "UNKNOWN"})

_POLL_SECONDS: Final = 3.0
# 720x1280 is the tallest portrait the model offers; the frame crops from there.
_DEFAULT_SIZE: Final = "720*1280"


class DashScopeImageAdapter:
    """Text-to-image through Alibaba Cloud Model Studio."""

    _PROVIDER = "dashscope-image"

    def __init__(
        self,
        *,
        api_key: str,
        model: str,
        media_root: Path,
        public_prefix: str = "/media",
        size: str = _DEFAULT_SIZE,
        timeout_seconds: float = 120,
        poll_interval_seconds: float = _POLL_SECONDS,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        if not api_key.strip():
            raise ValueError("api_key must be a nonblank string")
        if not model.strip():
            raise ValueError("model must be a nonblank string")
        if not public_prefix.strip():
            raise ValueError("public_prefix must be a nonblank string")
        self._api_key = api_key.strip()
        self._model = model.strip()
        self._size = size.strip()
        self._media_root = media_root
        self._public_prefix = public_prefix.strip().rstrip("/")
        self._timeout_seconds = timeout_seconds
        self._poll_interval = poll_interval_seconds
        self._transport = transport

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
            "X-DashScope-Async": "enable",
        }

    async def status(self) -> ProviderStatus:
        """Report reachability without spending quota."""
        try:
            async with httpx.AsyncClient(
                trust_env=False,
                base_url=_BASE_URL,
                timeout=httpx.Timeout(10.0),
                transport=self._transport,
            ) as client:
                response = await client.get(
                    _TASK_PATH.format(task_id="probe"), headers=self._headers()
                )
        except httpx.HTTPError:
            return ProviderStatus(provider=self._PROVIDER, available=False)
        return ProviderStatus(provider=self._PROVIDER, available=response.status_code < 500)

    async def generate(self, request: ImageGenerationInput) -> GeneratedImage:
        payload: dict[str, object] = {
            "model": self._model,
            "input": {"prompt": _compose_prompt(request)},
            "parameters": {"size": self._size, "n": 1},
        }
        async with httpx.AsyncClient(
            trust_env=False,
            base_url=_BASE_URL,
            timeout=httpx.Timeout(30.0),
            transport=self._transport,
        ) as client:
            task_id = await self._submit(client, payload)
            try:
                async with asyncio.timeout(self._timeout_seconds):
                    remote = await self._poll(client, task_id)
            except TimeoutError:
                raise ImageUnavailable("the image render exceeded the local deadline") from None
            content = await self._download(client, remote)

        name = f"keyvisual-{_digest(request, content)}.png"
        self._media_root.mkdir(parents=True, exist_ok=True)
        (self._media_root / name).write_bytes(content)
        return GeneratedImage(media_url=f"{self._public_prefix}/{name}", provider=self._PROVIDER)

    async def _submit(self, client: httpx.AsyncClient, payload: dict[str, object]) -> str:
        try:
            response = await client.post(_SUBMIT_PATH, json=payload, headers=self._headers())
        except httpx.HTTPError:
            raise ImageUnavailable("DashScope request failed") from None

        if response.status_code in {400, 422}:
            raise ImageRejected("DashScope rejected the image prompt")
        if response.status_code in {401, 403}:
            raise ImageUnavailable("DashScope rejected the API key")
        if not response.is_success:
            raise ImageUnavailable("DashScope request failed")

        try:
            task_id = response.json()["output"]["task_id"]
        except (KeyError, TypeError, ValueError):
            raise InvalidImageResponse("DashScope returned no task id") from None
        if not isinstance(task_id, str) or not task_id.strip():
            raise InvalidImageResponse("DashScope returned no task id")
        return task_id.strip()

    async def _poll(self, client: httpx.AsyncClient, task_id: str) -> str:
        while True:
            try:
                response = await client.get(
                    _TASK_PATH.format(task_id=task_id), headers=self._headers()
                )
            except httpx.HTTPError:
                raise ImageUnavailable("DashScope request failed") from None
            if not response.is_success:
                raise ImageUnavailable("DashScope request failed")

            try:
                output = response.json()["output"]
                state = output["task_status"]
            except (KeyError, TypeError, ValueError):
                raise InvalidImageResponse("DashScope returned an unreadable task") from None

            if state == _SUCCEEDED:
                return _result_url(output)
            if state in _FAILED:
                raise ImageUnavailable("DashScope reported a failed render")
            if state not in _RUNNING:
                raise InvalidImageResponse("DashScope returned an unknown task state")
            await asyncio.sleep(self._poll_interval)

    async def _download(self, client: httpx.AsyncClient, url: str) -> bytes:
        """Keep the bytes: the signed URL expires within a day."""
        try:
            response = await client.get(url)
        except httpx.HTTPError:
            raise ImageUnavailable("the finished picture could not be downloaded") from None
        if not response.is_success or not response.content:
            raise ImageUnavailable("the finished picture could not be downloaded")
        return response.content


def _compose_prompt(request: ImageGenerationInput) -> str:
    """Ask for a vertical, text-free frame so the copy stays in the page."""
    return (
        f"{request.prompt.strip()}\n\n"
        "Vertical composition. Photographic, natural light, uncluttered. "
        "No text, no letters, no logos, no watermarks anywhere in the image."
    )


def _result_url(output: object) -> str:
    """The finished picture arrives under ``output.results[0].url``."""
    if not isinstance(output, dict):
        raise InvalidImageResponse("DashScope returned no result")
    results = output.get("results")
    if isinstance(results, list) and results and isinstance(results[0], dict):
        url = results[0].get("url")
        if isinstance(url, str) and url.strip():
            return url.strip()
    raise InvalidImageResponse("DashScope returned no finished picture")


def _digest(request: ImageGenerationInput, content: bytes) -> str:
    seed = f"{request.prompt}|{request.language}|{request.headline}".encode()
    return hashlib.sha256(seed + b"|" + content[:4096]).hexdigest()[:24]


__all__ = ["DashScopeImageAdapter"]
