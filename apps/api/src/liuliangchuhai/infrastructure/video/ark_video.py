"""Ark-compatible video tasks: Seedance and friends, including relay stations.

Volcengine renders these models asynchronously: submit a task, poll it, then
copy the finished MP4 home before the signed URL expires. Third-party relays
expose the same task shape, so one adapter covers both the official endpoint
and a reseller - only the base URL changes.

A relay key has to come from the group that sells video models. A token issued
to a chat or image group is refused with a 403 ("... is not enabled for this
group"), which surfaces here as VideoUnavailable with the provider's message.
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import io
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

_TASKS_PATH: Final = "/api/v3/contents/generations/tasks"
_TASK_PATH: Final = _TASKS_PATH + "/{task_id}"

_RUNNING: Final = frozenset({"queued", "running", "pending"})
_SUCCEEDED: Final = "succeeded"
_FAILED: Final = frozenset({"failed", "cancelled", "canceled", "expired"})

_DEFAULT_BASE_URL: Final = "https://ark.cn-beijing.volces.com"
_POLL_SECONDS: Final = 5.0


class ArkVideoAdapter:
    """`seedance2.5-A` and other Ark video models, billed per generated second."""

    _PROVIDER = "ark-video"

    def __init__(
        self,
        *,
        api_key: str,
        media_root: Path,
        base_url: str = _DEFAULT_BASE_URL,
        model: str = "seedance2.5-A",
        resolution: str = "480P",
        duration_seconds: int = 5,
        ratio: str = "9:16",
        generate_audio: bool | None = None,
        watermark: bool | None = None,
        public_prefix: str = "/media",
        timeout_seconds: float = 600,
        poll_interval_seconds: float = _POLL_SECONDS,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        if not api_key.strip():
            raise ValueError("api_key must be a nonblank string")
        if not base_url.strip():
            raise ValueError("base_url must be a nonblank string")
        if not model.strip():
            raise ValueError("model must be a nonblank string")
        normalized = resolution.strip().upper()
        if normalized not in {"480P", "720P", "1080P"}:
            raise ValueError("resolution must be 480P, 720P or 1080P")
        if not 4 <= duration_seconds <= 30:
            raise ValueError("duration_seconds must be between 4 and 30")
        if not public_prefix.strip():
            raise ValueError("public_prefix must be a nonblank string")
        self._api_key = api_key.strip()
        self._base_url = base_url.strip().rstrip("/")
        self._model = model.strip()
        self._resolution = normalized
        self._duration = duration_seconds
        self._ratio = ratio.strip()
        self._generate_audio = generate_audio
        self._watermark = watermark
        self._media_root = media_root
        self._public_prefix = public_prefix.strip().rstrip("/")
        self._timeout_seconds = timeout_seconds
        self._poll_interval = poll_interval_seconds
        self._transport = transport

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

    async def status(self) -> ProviderStatus:
        """Report reachability without spending any billed seconds."""
        try:
            async with httpx.AsyncClient(
                base_url=self._base_url,
                timeout=httpx.Timeout(10.0),
                transport=self._transport,
                trust_env=False,
            ) as client:
                response = await client.get(
                    _TASK_PATH.format(task_id="probe"), headers=self._headers()
                )
        except httpx.HTTPError:
            return ProviderStatus(provider=self._PROVIDER, available=False)
        return ProviderStatus(provider=self._PROVIDER, available=response.status_code < 500)

    async def generate(self, request: VideoGenerationInput) -> GeneratedClip:
        image = request.image_url.strip() if request.image_url else ""
        if not image and request.image_path:
            image = self._inline(request.image_path)
        payload = self._payload(request.prompt, image)

        async with httpx.AsyncClient(
            base_url=self._base_url,
            timeout=httpx.Timeout(60.0),
            transport=self._transport,
            trust_env=False,
        ) as client:
            # The deadline covers the whole round trip, not just polling: a slow
            # submit or download would otherwise overshoot it and still return a
            # clip after the caller has given up.
            try:
                async with asyncio.timeout(self._timeout_seconds):
                    task_id = await self._submit(client, payload)
                    remote = await self._poll(client, task_id)
                    content = await self._download(client, remote)
            except TimeoutError:
                raise VideoDeadlineExceeded(
                    "the video render exceeded the local deadline"
                ) from None

        name = f"clip-{_digest(request, content)}.mp4"
        self._media_root.mkdir(parents=True, exist_ok=True)
        (self._media_root / name).write_bytes(content)
        return GeneratedClip(media_url=f"{self._public_prefix}/{name}", provider=self._PROVIDER)

    def _payload(self, prompt: str, image: str) -> dict[str, object]:
        content: list[dict[str, object]] = [{"type": "text", "text": prompt.strip()}]
        if image:
            content.append({"type": "image_url", "image_url": {"url": image}})

        payload: dict[str, object] = {
            "model": self._model,
            "content": content,
            "resolution": self._resolution.lower(),
            "duration": self._duration,
        }
        # A first-frame render must stay adaptive to the still's aspect ratio;
        # without a still the caller's ratio is the only source of framing.
        if image:
            payload["ratio"] = "adaptive"
        elif self._ratio:
            payload["ratio"] = self._ratio
        # Both switches are model-dependent, so leave them out unless asked for:
        # an unknown parameter is rejected outright by some relays.
        if self._generate_audio is not None:
            payload["generate_audio"] = self._generate_audio
        if self._watermark is not None:
            payload["watermark"] = self._watermark
        return payload

    def _inline(self, image_path: str) -> str:
        """Read a local picture and hand it over as a data URI.

        Ark accepts a base64 data URL, so a file on this machine can be
        animated without hosting it anywhere.
        """
        from PIL import Image, ImageOps

        root = self._media_root.resolve()
        requested = Path(image_path)
        candidate = (requested if requested.is_absolute() else root / requested).resolve()
        if root not in candidate.parents and candidate != root:
            raise VideoRejected("image_path must stay inside the media directory")
        if not candidate.is_file():
            raise VideoRejected("image_path does not point at a readable file")

        try:
            with Image.open(candidate) as opened:
                picture = ImageOps.exif_transpose(opened).convert("RGB")
        except OSError:
            raise VideoRejected("image_path is not a readable picture") from None
        picture.thumbnail((1280, 1280))
        buffer = io.BytesIO()
        picture.save(buffer, format="JPEG", quality=88)
        return "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode()

    async def _submit(self, client: httpx.AsyncClient, payload: dict[str, object]) -> str:
        try:
            response = await client.post(_TASKS_PATH, json=payload, headers=self._headers())
        except httpx.HTTPError:
            raise VideoUnavailable("the video relay request failed") from None

        if response.status_code in {400, 422}:
            raise VideoRejected(_with_detail("the video relay rejected the input", response))
        if response.status_code in {401, 403}:
            raise VideoUnavailable(_with_detail("the video relay refused the API key", response))
        if not response.is_success:
            raise VideoUnavailable("the video relay request failed")

        try:
            return _task_id(response.json())
        except ValueError:
            raise InvalidVideoResponse("the video relay returned no readable task") from None

    async def _poll(self, client: httpx.AsyncClient, task_id: str) -> str:
        while True:
            try:
                response = await client.get(
                    _TASK_PATH.format(task_id=task_id), headers=self._headers()
                )
            except httpx.HTTPError:
                raise VideoUnavailable("the video relay request failed") from None
            if not response.is_success:
                raise VideoUnavailable("the video relay request failed")

            try:
                payload = response.json()
            except ValueError:
                raise InvalidVideoResponse("the video relay returned an unreadable task") from None

            state = _state(payload)
            if state == _SUCCEEDED:
                return _video_url(payload)
            if state in _FAILED:
                raise VideoError(f"the video relay reported a {state} render")
            if state not in _RUNNING:
                raise InvalidVideoResponse("the video relay returned an unknown task state")
            await asyncio.sleep(self._poll_interval)

    async def _download(self, client: httpx.AsyncClient, url: str) -> bytes:
        try:
            response = await client.get(url)
        except httpx.HTTPError:
            raise VideoUnavailable("the finished clip could not be downloaded") from None
        if not response.is_success or not response.content:
            raise VideoUnavailable("the finished clip could not be downloaded")
        return response.content


def _task_id(payload: object) -> str:
    """The Ark task id arrives as ``id``; relays occasionally use ``task_id``."""
    if isinstance(payload, dict):
        for key in ("id", "task_id"):
            value = payload.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
        output = payload.get("output")
        if isinstance(output, dict):
            value = output.get("task_id")
            if isinstance(value, str) and value.strip():
                return value.strip()
    raise InvalidVideoResponse("the video relay returned no task id")


def _state(payload: object) -> str:
    if isinstance(payload, dict):
        for container in (payload, payload.get("output")):
            if isinstance(container, dict):
                value = container.get("status") or container.get("task_status")
                if isinstance(value, str) and value.strip():
                    return value.strip().lower()
    raise InvalidVideoResponse("the video relay returned an unreadable task")


def _video_url(payload: object) -> str:
    """The finished clip lands under ``content.video_url`` in the Ark shape."""
    if not isinstance(payload, dict):
        raise InvalidVideoResponse("the video relay returned no result")
    containers: list[object] = [payload]
    for key in ("content", "output", "results", "data"):
        containers.append(payload.get(key))
    for container in containers:
        if isinstance(container, dict):
            value = container.get("video_url")
            if isinstance(value, str) and value.strip():
                return value.strip()
    raise InvalidVideoResponse("the video relay returned no finished video")


def _with_detail(fallback: str, response: httpx.Response) -> str:
    """Keep the relay's own explanation: it names the group-permission fault."""
    try:
        payload = response.json()
    except ValueError:
        return fallback
    if isinstance(payload, dict):
        error = payload.get("error")
        if isinstance(error, dict):
            message = error.get("message")
            if isinstance(message, str) and message.strip():
                return f"{fallback}: {message.strip()}"
    return fallback


def _digest(request: VideoGenerationInput, content: bytes) -> str:
    seed = f"{request.prompt}|{request.image_url or ''}".encode()
    return hashlib.sha256(seed + b"|" + content[:2048]).hexdigest()[:24]


__all__ = ["ArkVideoAdapter"]
