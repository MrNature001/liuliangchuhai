"""DashScope (Alibaba Cloud Bailian) talking-head adapter.

`videoretalk` re-drives the lip movement of a real person in a source clip with
a new narration track. It is the one renderer here that a solo developer in
mainland China can open without a company entity: personal real-name only, a
self-serve API key, plain HTTPS + Bearer, and no GPU. The trade-off is that the
account owner supplies one short clip of themselves, reused for every video.
"""

from __future__ import annotations

import asyncio
import hashlib
import shutil
import tempfile
from pathlib import Path
from typing import Final

import httpx

from liuliangchuhai.application.ports.digital_human_errors import (
    DigitalHumanDeadlineExceeded,
    DigitalHumanError,
    DigitalHumanRejected,
    DigitalHumanUnavailable,
    InvalidDigitalHumanResponse,
)
from liuliangchuhai.application.ports.status import ProviderStatus
from liuliangchuhai.domain.digital_human import DigitalHumanGenerationInput, GeneratedVideo
from liuliangchuhai.infrastructure.digital_human import speech
from liuliangchuhai.infrastructure.digital_human.uploads import upload_file

_BASE_URL: Final = "https://dashscope.aliyuncs.com/api/v1"
_SUBMIT_PATH: Final = "/services/aigc/image2video/video-synthesis"
_TASK_PATH: Final = "/tasks/{task_id}"

# Task states. The first two are non-terminal, so polling continues.
_RUNNING: Final = frozenset({"PENDING", "RUNNING"})
_SUCCEEDED: Final = "SUCCEEDED"
_FAILED: Final = frozenset({"FAILED", "CANCELED", "UNKNOWN"})

_POLL_SECONDS: Final = 5.0


class DashScopeDigitalHumanAdapter:
    """Re-drive a source clip's lip movement with a synthesised narration.

    The source clip and the narration must both be reachable URLs, because the
    remote service fetches them itself. ``videoretalk`` re-drives lips from an
    audio track rather than from text, so this adapter is used through
    :meth:`generate_from_audio` instead of the text-only port method.
    """

    _MODEL: Final = "videoretalk"

    def __init__(
        self,
        *,
        api_key: str,
        source_video_url: str,
        timeout_seconds: float,
        media_root: Path,
        media_url_prefix: str = "/media",
        poll_interval_seconds: float = _POLL_SECONDS,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        if not api_key.strip():
            raise ValueError("api_key must be a nonblank string")
        if not source_video_url.strip():
            raise ValueError("source_video_url must be a nonblank string")
        self._api_key = api_key.strip()
        self._source_video_url = source_video_url.strip()
        self._timeout_seconds = timeout_seconds
        self._media_root = media_root
        self._media_url_prefix = media_url_prefix.rstrip("/")
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
                base_url=_BASE_URL,
                timeout=httpx.Timeout(10.0),
                transport=self._transport,
            ) as client:
                response = await client.get(
                    _TASK_PATH.format(task_id="probe"), headers=self._headers()
                )
        except httpx.HTTPError:
            return ProviderStatus(provider="dashscope", available=False)
        # A 401/404 for a bogus task still proves the service answered; only a
        # transport failure or a 5xx means the provider is unusable.
        return ProviderStatus(provider="dashscope", available=response.status_code < 500)

    async def generate(self, generation: DigitalHumanGenerationInput) -> GeneratedVideo:
        """Speak the script, upload the narration, then re-drive the source clip.

        The port is text-shaped, so the adapter owns the whole chain: Edge TTS
        produces the audio, DashScope's own upload endpoint makes it reachable
        from their side, and the finished clip is pulled into local media before
        the 24-hour signed URL expires.
        """
        audio_path = await self._speak(generation)
        audio_url = await upload_file(
            api_key=self._api_key,
            model=self._MODEL,
            source=audio_path,
            transport=self._transport,
        )
        return await self.generate_from_audio(audio_url)

    async def _speak(self, generation: DigitalHumanGenerationInput) -> Path:
        """Synthesise narration and keep it next to the other rendered media."""
        self._media_root.mkdir(parents=True, exist_ok=True)
        cached = self._media_root / f"narration-{_digest(generation)}.mp3"
        if cached.is_file() and cached.stat().st_size > 0:
            return cached
        with tempfile.TemporaryDirectory(prefix="dashscope-") as workspace:
            clip = await speech.synthesise(
                generation.script,
                generation.language,
                None,
                Path(workspace) / "narration.mp3",
            )
            shutil.copyfile(clip.audio_path, cached)
        return cached

    async def generate_from_audio(self, audio_url: str) -> GeneratedVideo:
        """Submit ``audio_url`` against the configured source clip and poll."""
        if not audio_url.strip():
            raise DigitalHumanRejected("DashScope needs a narration audio URL")

        payload: dict[str, object] = {
            "model": self._MODEL,
            "input": {"video_url": self._source_video_url, "audio_url": audio_url.strip()},
        }

        async with httpx.AsyncClient(
            base_url=_BASE_URL,
            timeout=httpx.Timeout(30.0),
            transport=self._transport,
        ) as client:
            task_id = await self._submit(client, payload)
            try:
                async with asyncio.timeout(self._timeout_seconds):
                    remote = await self._poll(client, task_id)
            except TimeoutError:
                raise DigitalHumanDeadlineExceeded(
                    "DashScope render exceeded the local deadline"
                ) from None
        return GeneratedVideo(media_url=await self._persist(remote.media_url))

    async def _persist(self, remote_url: str) -> str:
        """Download the finished clip before its signed URL expires.

        DashScope keeps results for 24 hours; serving the signed URL straight to
        the browser would hand out a link that silently dies, so the clip is
        copied into the same ``/media`` root the local renderer uses.
        """
        name = f"presenter-{hashlib.sha256(remote_url.encode()).hexdigest()[:24]}.mp4"
        destination = self._media_root / name
        if destination.is_file() and destination.stat().st_size > 0:
            return f"{self._media_url_prefix}/{name}"

        self._media_root.mkdir(parents=True, exist_ok=True)
        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(120.0), transport=self._transport
            ) as client:
                response = await client.get(remote_url)
        except httpx.HTTPError:
            raise DigitalHumanUnavailable("the finished clip could not be downloaded") from None
        if not response.is_success or not response.content:
            raise DigitalHumanUnavailable("the finished clip could not be downloaded")
        destination.write_bytes(response.content)
        return f"{self._media_url_prefix}/{name}"

    async def _submit(self, client: httpx.AsyncClient, payload: dict[str, object]) -> str:
        try:
            response = await client.post(_SUBMIT_PATH, json=payload, headers=self._headers())
        except httpx.HTTPError:
            raise DigitalHumanUnavailable("DashScope request failed") from None

        if response.status_code in {400, 422}:
            raise DigitalHumanRejected("DashScope rejected the render input")
        if response.status_code in {401, 403}:
            raise DigitalHumanUnavailable("DashScope rejected the API key")
        if not response.is_success:
            raise DigitalHumanUnavailable("DashScope request failed")

        try:
            task_id = response.json()["output"]["task_id"]
        except (KeyError, TypeError, ValueError):
            raise InvalidDigitalHumanResponse("DashScope returned no task id") from None
        if not isinstance(task_id, str) or not task_id.strip():
            raise InvalidDigitalHumanResponse("DashScope returned no task id")
        return task_id.strip()

    async def _poll(self, client: httpx.AsyncClient, task_id: str) -> GeneratedVideo:
        while True:
            try:
                response = await client.get(
                    _TASK_PATH.format(task_id=task_id), headers=self._headers()
                )
            except httpx.HTTPError:
                raise DigitalHumanUnavailable("DashScope request failed") from None
            if not response.is_success:
                raise DigitalHumanUnavailable("DashScope request failed")

            try:
                output = response.json()["output"]
                state = output["task_status"]
            except (KeyError, TypeError, ValueError):
                raise InvalidDigitalHumanResponse("DashScope returned an unreadable task") from None

            if state == _SUCCEEDED:
                return GeneratedVideo(media_url=_result_url(output))
            if state in _FAILED:
                raise DigitalHumanError("DashScope reported a failed render")
            if state not in _RUNNING:
                raise InvalidDigitalHumanResponse("DashScope returned an unknown task state")
            await asyncio.sleep(self._poll_interval)


def _digest(generation: DigitalHumanGenerationInput) -> str:
    """Stable cache key so re-running the same script reuses one mp3."""
    seed = f"{generation.script}|{generation.language}"
    return hashlib.sha256(seed.encode("utf-8")).hexdigest()[:24]


def _result_url(output: object) -> str:
    """Read the finished clip URL, which lives under ``results.video_url``."""
    if not isinstance(output, dict):
        raise InvalidDigitalHumanResponse("DashScope returned no result")
    results = output.get("results")
    if isinstance(results, dict):
        video_url = results.get("video_url")
        if isinstance(video_url, str) and video_url.strip():
            return video_url.strip()
    raise InvalidDigitalHumanResponse("DashScope returned no finished video")


__all__ = ["DashScopeDigitalHumanAdapter"]
