"""Wan image-to-video: a still becomes a short clip.

The model fetches its input by URL, so the still has to be publicly reachable.
Two sources satisfy that: a URL the caller supplies, or a picture minted through
Bailian's own image endpoint, which hands back a signed URL rather than bytes.
A file on this machine cannot be used — DashScope's upload endpoint issues
private objects that the video service is not authorised to read.

When no `image_url` is given the adapter draws the still first, so one request
can go from a prompt to a moving shot without any other setup.
"""

from __future__ import annotations

import asyncio
import hashlib
from pathlib import Path
from typing import Final

import httpx

from liuliangchuhai.application.ports.status import ProviderStatus
from liuliangchuhai.application.ports.video_errors import (
    InvalidVideoResponse,
    VideoDeadlineExceeded,
    VideoError,
    VideoRejected,
    VideoUnavailable,
)
from liuliangchuhai.domain.video import GeneratedClip, VideoGenerationInput

_BASE_URL: Final = "https://dashscope.aliyuncs.com/api/v1"
_SUBMIT_PATH: Final = "/services/aigc/video-generation/video-synthesis"
_TASK_PATH: Final = "/tasks/{task_id}"
_IMAGE_PATH: Final = "/images/generations"

_RUNNING: Final = frozenset({"PENDING", "RUNNING"})
_SUCCEEDED: Final = "SUCCEEDED"
_FAILED: Final = frozenset({"FAILED", "CANCELED", "UNKNOWN"})

_POLL_SECONDS: Final = 5.0


class WanImageToVideoAdapter:
    """`wan2.2-i2v-flash`, with an optional still generated on the way in."""

    _PROVIDER = "wan-i2v"

    def __init__(
        self,
        *,
        api_key: str,
        media_root: Path,
        public_prefix: str = "/media",
        model: str = "wan2.2-i2v-flash",
        resolution: str = "480P",
        still_base_url: str = "",
        still_model: str = "qwen-image-3.0-pro",
        still_size: str = "1024x1536",
        timeout_seconds: float = 600,
        poll_interval_seconds: float = _POLL_SECONDS,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        if not api_key.strip():
            raise ValueError("api_key must be a nonblank string")
        if resolution not in {"480P", "720P"}:
            raise ValueError("resolution must be 480P or 720P")
        if not public_prefix.strip():
            raise ValueError("public_prefix must be a nonblank string")
        self._api_key = api_key.strip()
        self._media_root = media_root
        self._public_prefix = public_prefix.strip().rstrip("/")
        self._model = model
        self._resolution = resolution
        self._still_base_url = still_base_url.strip().rstrip("/")
        self._still_model = still_model
        self._still_size = still_size
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
        try:
            async with httpx.AsyncClient(
                base_url=_BASE_URL, timeout=httpx.Timeout(10.0), transport=self._transport
            ) as client:
                response = await client.get(
                    _TASK_PATH.format(task_id="probe"),
                    headers={"Authorization": f"Bearer {self._api_key}"},
                )
        except httpx.HTTPError:
            return ProviderStatus(provider=self._PROVIDER, available=False)
        return ProviderStatus(provider=self._PROVIDER, available=response.status_code < 500)

    async def generate(self, request: VideoGenerationInput) -> GeneratedClip:
        image_url = request.image_url.strip() if request.image_url else ""
        async with httpx.AsyncClient(
            base_url=_BASE_URL, timeout=httpx.Timeout(60.0), transport=self._transport
        ) as client:
            if not image_url:
                image_url = await self._draw_still(client, request.prompt)
            task_id = await self._submit(client, image_url, request.prompt)
            try:
                async with asyncio.timeout(self._timeout_seconds):
                    remote = await self._poll(client, task_id)
            except TimeoutError:
                raise VideoDeadlineExceeded(
                    "the video render exceeded the local deadline"
                ) from None
            content = await self._download(client, remote)

        name = f"clip-{_digest(request, content)}.mp4"
        self._media_root.mkdir(parents=True, exist_ok=True)
        (self._media_root / name).write_bytes(content)
        return GeneratedClip(media_url=f"{self._public_prefix}/{name}", provider=self._PROVIDER)

    async def _draw_still(self, client: httpx.AsyncClient, prompt: str) -> str:
        """Mint a publicly reachable still, because a local file will not do."""
        if not self._still_base_url:
            raise VideoRejected(
                "this provider needs a publicly reachable image_url, or a configured "
                "still endpoint to draw one"
            )
        try:
            response = await client.post(
                self._still_base_url + _IMAGE_PATH,
                json={
                    "model": self._still_model,
                    "prompt": f"{prompt}\n\nVertical composition, photographic, no text.",
                    "n": 1,
                    "size": self._still_size,
                },
                headers={"Authorization": f"Bearer {self._api_key}"},
            )
        except httpx.HTTPError:
            raise VideoUnavailable("the still could not be drawn") from None
        if not response.is_success:
            raise VideoUnavailable("the still could not be drawn")
        try:
            url = response.json()["data"][0]["url"]
        except (KeyError, IndexError, TypeError, ValueError):
            raise InvalidVideoResponse("the still endpoint returned no URL") from None
        if not isinstance(url, str) or not url.strip():
            raise InvalidVideoResponse("the still endpoint returned no URL")
        return url.strip()

    async def _submit(self, client: httpx.AsyncClient, image_url: str, prompt: str) -> str:
        payload: dict[str, object] = {
            "model": self._model,
            "input": {"img_url": image_url, "prompt": prompt},
            "parameters": {"resolution": self._resolution},
        }
        try:
            response = await client.post(_SUBMIT_PATH, json=payload, headers=self._headers())
        except httpx.HTTPError:
            raise VideoUnavailable("DashScope request failed") from None

        if response.status_code in {400, 422}:
            raise VideoRejected("DashScope rejected the video input")
        if response.status_code in {401, 403}:
            raise VideoUnavailable("DashScope rejected the API key")
        if not response.is_success:
            raise VideoUnavailable("DashScope request failed")

        try:
            task_id = response.json()["output"]["task_id"]
        except (KeyError, TypeError, ValueError):
            raise InvalidVideoResponse("DashScope returned no task id") from None
        if not isinstance(task_id, str) or not task_id.strip():
            raise InvalidVideoResponse("DashScope returned no task id")
        return task_id.strip()

    async def _poll(self, client: httpx.AsyncClient, task_id: str) -> str:
        while True:
            try:
                response = await client.get(
                    _TASK_PATH.format(task_id=task_id),
                    headers={"Authorization": f"Bearer {self._api_key}"},
                )
            except httpx.HTTPError:
                raise VideoUnavailable("DashScope request failed") from None
            if not response.is_success:
                raise VideoUnavailable("DashScope request failed")

            try:
                output = response.json()["output"]
                state = output["task_status"]
            except (KeyError, TypeError, ValueError):
                raise InvalidVideoResponse("DashScope returned an unreadable task") from None

            if state == _SUCCEEDED:
                return _result_url(output)
            if state in _FAILED:
                raise VideoError("DashScope reported a failed render")
            if state not in _RUNNING:
                raise InvalidVideoResponse("DashScope returned an unknown task state")
            await asyncio.sleep(self._poll_interval)

    async def _download(self, client: httpx.AsyncClient, url: str) -> bytes:
        try:
            response = await client.get(url)
        except httpx.HTTPError:
            raise VideoUnavailable("the finished clip could not be downloaded") from None
        if not response.is_success or not response.content:
            raise VideoUnavailable("the finished clip could not be downloaded")
        return response.content


def _result_url(output: object) -> str:
    """The clip lands under ``output.video_url`` or ``output.results.video_url``."""
    if not isinstance(output, dict):
        raise InvalidVideoResponse("DashScope returned no result")
    for container in (output, output.get("results")):
        if isinstance(container, dict):
            value = container.get("video_url")
            if isinstance(value, str) and value.strip():
                return value.strip()
    raise InvalidVideoResponse("DashScope returned no finished video")


def _digest(request: VideoGenerationInput, content: bytes) -> str:
    seed = f"{request.prompt}|{request.image_url or ''}".encode()
    return hashlib.sha256(seed + b"|" + content[:2048]).hexdigest()[:24]


__all__ = ["WanImageToVideoAdapter"]
