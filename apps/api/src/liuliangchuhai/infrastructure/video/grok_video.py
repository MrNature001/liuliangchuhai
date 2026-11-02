"""Grok Imagine video: xAI's asynchronous clip API behind a relay.

The protocol is the one sub2api exposes for Grok groups: submit on
`/v1/videos/generations`, poll `/v1/videos/{request_id}`, then download the
finished MP4 from the path named by `video.url` (usually `/content`). It is not
Ark's task protocol, which the same relay only serves to its OpenAI or
composite groups.

Status is `pending` while rendering and `done` on success; a finished task
reports `video.url`, which is relative to the same base URL.
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import io
from pathlib import Path
from typing import Final
from urllib.parse import urlsplit

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

_GENERATIONS_PATH: Final = "/v1/videos/generations"
_VIDEO_PATH: Final = "/v1/videos/{request_id}"
_CONTENT_PATH: Final = "/v1/videos/{request_id}/content"

_RUNNING: Final = frozenset({"pending", "queued", "running", "processing", "in_progress"})
_SUCCEEDED: Final = frozenset({"done", "succeeded", "completed"})
_FAILED: Final = frozenset({"failed", "error", "cancelled", "canceled", "expired"})

_DEFAULT_BASE_URL: Final = "https://api.x.ai"
_POLL_SECONDS: Final = 5.0


class GrokVideoAdapter:
    """`grok-imagine-video-1.5`, billed per generated second."""

    _PROVIDER = "grok-video"

    def __init__(
        self,
        *,
        api_key: str,
        media_root: Path,
        base_url: str = _DEFAULT_BASE_URL,
        model: str = "grok-imagine-video-1.5",
        resolution: str = "480P",
        duration_seconds: int = 4,
        aspect_ratio: str = "9:16",
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
        if not 1 <= duration_seconds <= 15:
            raise ValueError("duration_seconds must be between 1 and 15")
        if not public_prefix.strip():
            raise ValueError("public_prefix must be a nonblank string")
        self._api_key = api_key.strip()
        self._base_url = base_url.strip().rstrip("/")
        self._model = model.strip()
        self._resolution = normalized
        self._duration = duration_seconds
        self._aspect_ratio = aspect_ratio.strip()
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
                    _VIDEO_PATH.format(request_id="probe"), headers=self._headers()
                )
        except (httpx.HTTPError, httpx.InvalidURL):
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
            try:
                async with asyncio.timeout(self._timeout_seconds):
                    request_id = await self._submit(client, payload)
                    remote = await self._poll(client, request_id)
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
        payload: dict[str, object] = {
            "model": self._model,
            "prompt": prompt.strip(),
            "duration": self._duration,
            "resolution": self._resolution.lower(),
        }
        if image:
            # The still drives the framing; an explicit ratio would fight it.
            payload["image"] = {"url": image}
        elif self._aspect_ratio:
            payload["aspect_ratio"] = self._aspect_ratio
        return payload

    def _inline(self, image_path: str) -> str:
        """Read a local picture and hand it over as a data URI."""
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
            response = await client.post(_GENERATIONS_PATH, json=payload, headers=self._headers())
        except (httpx.HTTPError, httpx.InvalidURL):
            raise VideoUnavailable("the video relay request failed") from None

        if response.status_code in {400, 422}:
            raise VideoRejected(_with_detail("the video relay rejected the input", response))
        if response.status_code in {401, 403}:
            raise VideoUnavailable(_with_detail("the video relay refused the API key", response))
        if not response.is_success:
            raise VideoUnavailable("the video relay request failed")

        try:
            return _request_id(response.json())
        except ValueError:
            raise InvalidVideoResponse("the video relay returned no readable task") from None

    async def _poll(self, client: httpx.AsyncClient, request_id: str) -> str:
        while True:
            try:
                response = await client.get(
                    _VIDEO_PATH.format(request_id=request_id), headers=self._headers()
                )
            except (httpx.HTTPError, httpx.InvalidURL):
                raise VideoUnavailable("the video relay request failed") from None
            # 202 is the documented "still rendering" answer; its body may only
            # carry progress, not a status, so it short-circuits to a sleep.
            if response.status_code == 202:
                await asyncio.sleep(self._poll_interval)
                continue
            if not response.is_success:
                raise VideoUnavailable("the video relay request failed")

            try:
                payload = response.json()
            except ValueError:
                raise InvalidVideoResponse("the video relay returned an unreadable task") from None

            state = _state(payload)
            if state in _SUCCEEDED or (not state and _optional_video_url(payload)):
                return _video_url(payload)
            if state in _FAILED:
                raise VideoError(f"the video relay reported a {state} render")
            if state not in _RUNNING:
                raise InvalidVideoResponse("the video relay returned an unknown task state")
            await asyncio.sleep(self._poll_interval)

    async def _download(self, client: httpx.AsyncClient, url: str) -> bytes:
        absolute = url if url.startswith(("http://", "https://")) else self._base_url + url
        # Never hand the key to a foreign CDN, only to the relay's own origin.
        # A prefix comparison would leak it to `relay.example.evil.com`.
        headers = self._headers() if _same_origin(absolute, self._base_url) else {}
        try:
            response = await client.get(absolute, headers=headers)
        except (httpx.HTTPError, httpx.InvalidURL):
            raise VideoUnavailable("the finished clip could not be downloaded") from None
        if not response.is_success or not response.content:
            raise VideoUnavailable("the finished clip could not be downloaded")
        return response.content


def _same_origin(url: str, base: str) -> bool:
    left, right = urlsplit(url), urlsplit(base)
    return (left.scheme, left.netloc) == (right.scheme, right.netloc)


def _request_id(payload: object) -> str:
    if isinstance(payload, dict):
        for key in ("request_id", "id", "task_id"):
            value = payload.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
    raise InvalidVideoResponse("the video relay returned no task id")


def _state(payload: object) -> str:
    if isinstance(payload, dict):
        value = payload.get("status")
        if isinstance(value, str) and value.strip():
            return value.strip().lower()
    return ""


def _optional_video_url(payload: object) -> str:
    if not isinstance(payload, dict):
        return ""
    video = payload.get("video")
    if isinstance(video, dict):
        value = video.get("url")
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


def _video_url(payload: object) -> str:
    """A finished Grok task names the MP4 under ``video.url``."""
    value = _optional_video_url(payload)
    if value:
        return value
    if isinstance(payload, dict):
        for key in ("video_url", "url"):
            candidate = payload.get(key)
            if isinstance(candidate, str) and candidate.strip():
                return candidate.strip()
    raise InvalidVideoResponse("the video relay returned no finished video")


def _with_detail(fallback: str, response: httpx.Response) -> str:
    """Keep the relay's own explanation, which names the group or model fault."""
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


__all__ = ["GrokVideoAdapter"]
