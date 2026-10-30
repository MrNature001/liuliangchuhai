"""Wan 2.2 speech-to-video: a photo plus a narration becomes a talking clip.

Unlike `videoretalk`, which re-drives the lips of an existing recording, this
model wants only a still portrait. That removes the one thing a solo developer
cannot easily supply — a video of themselves — while keeping the same port.

Both inputs must be reachable by Alibaba, so the narration and (when the
portrait is a local file) the image are pushed through DashScope's own upload
endpoint first. Nothing here needs a public server.

Limits from the model card: audio must be at most 20 seconds and 15 MB, the
image is jpg/jpeg/png/bmp/webp between 400 and 7000 pixels on each side, and
the output is 480P or 720P. A longer narration is rejected rather than
silently truncated.
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import io
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
from liuliangchuhai.infrastructure.digital_human import mux, qwen_tts

_BASE_URL: Final = "https://dashscope.aliyuncs.com/api/v1"
_SUBMIT_PATH: Final = "/services/aigc/image2video/video-synthesis"
_TASK_PATH: Final = "/tasks/{task_id}"

_RUNNING: Final = frozenset({"PENDING", "RUNNING"})
_SUCCEEDED: Final = "SUCCEEDED"
_FAILED: Final = frozenset({"FAILED", "CANCELED", "UNKNOWN"})

_MAX_AUDIO_SECONDS: Final = 20.0
_MAX_AUDIO_BYTES: Final = 15 * 1024 * 1024
_POLL_SECONDS: Final = 5.0


class WanSpeechToVideoAdapter:
    """A still portrait narrated by the script, rendered by `wan2.2-s2v`."""

    _MODEL: Final = "wan2.2-s2v"

    def __init__(
        self,
        *,
        api_key: str,
        portrait: str,
        timeout_seconds: float,
        media_root: Path,
        media_url_prefix: str = "/media",
        resolution: str = "720P",
        tts_base_url: str = "",
        tts_model: str = "qwen-audio-3.1-tts-flash",
        tts_voice: str = "longanhuan_v3.1",
        poll_interval_seconds: float = _POLL_SECONDS,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        if not api_key.strip():
            raise ValueError("api_key must be a nonblank string")
        if not portrait.strip():
            raise ValueError("portrait must be a nonblank string")
        if resolution not in {"480P", "720P"}:
            raise ValueError("resolution must be 480P or 720P")
        self._api_key = api_key.strip()
        self._portrait = portrait.strip()
        self._timeout_seconds = timeout_seconds
        self._media_root = media_root
        self._media_url_prefix = media_url_prefix.rstrip("/")
        self._resolution = resolution
        self._tts_base_url = tts_base_url.strip().rstrip("/")
        self._tts_model = tts_model
        self._tts_voice = tts_voice
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
                trust_env=False,
            ) as client:
                response = await client.get(
                    _TASK_PATH.format(task_id="probe"), headers=self._headers()
                )
        except httpx.HTTPError:
            return ProviderStatus(provider="wan-s2v", available=False)
        return ProviderStatus(provider="wan-s2v", available=response.status_code < 500)

    async def generate(self, generation: DigitalHumanGenerationInput) -> GeneratedVideo:
        audio_url = await self._upload_narration(generation)
        image_url = await self._upload_portrait()

        payload: dict[str, object] = {
            "model": self._MODEL,
            "input": {"image_url": image_url, "audio_url": audio_url},
            "parameters": {"resolution": self._resolution},
        }
        async with httpx.AsyncClient(
            base_url=_BASE_URL,
            timeout=httpx.Timeout(30.0),
            transport=self._transport,
            trust_env=False,
        ) as client:
            task_id = await self._submit(client, payload)
            try:
                async with asyncio.timeout(self._timeout_seconds):
                    remote = await self._poll(client, task_id)
            except TimeoutError:
                raise DigitalHumanDeadlineExceeded(
                    "the speech-to-video render exceeded the local deadline"
                ) from None
        return GeneratedVideo(media_url=await self._persist(remote))

    async def _upload_narration(self, generation: DigitalHumanGenerationInput) -> str:
        """Speak the script through Qwen TTS and keep the URL it returns.

        The video model downloads the audio itself, so it needs a real URL with
        an .mp3 extension — a data URI is rejected on file-type detection and a
        local file is unreachable. Qwen TTS writes one for us. The file is also
        cached so its duration can be measured before spending a render.
        """
        if not self._tts_base_url:
            raise DigitalHumanUnavailable("no speech endpoint is configured for this provider")
        url = await qwen_tts.synthesise_url(
            api_key=self._api_key,
            text=generation.script,
            model=self._tts_model,
            voice=self._tts_voice,
            base_url=self._tts_base_url,
            transport=self._transport,
        )
        digest = hashlib.sha256(f"{generation.script}|{generation.language}".encode()).hexdigest()[
            :24
        ]
        self._media_root.mkdir(parents=True, exist_ok=True)
        cached = self._media_root / f"narration-{digest}.mp3"
        await qwen_tts.download(url, cached, transport=self._transport)
        if cached.stat().st_size > _MAX_AUDIO_BYTES:
            raise DigitalHumanRejected("the narration exceeds the model's 15 MB audio limit")
        seconds = await mux.probe_duration(cached)
        if seconds > _MAX_AUDIO_SECONDS:
            raise DigitalHumanRejected(
                "the narration is longer than the model's 20-second audio limit"
            )
        return url

    async def _upload_portrait(self) -> str:
        """Inline a local picture; a remote URL is passed through untouched.

        DashScope's upload endpoint issues private objects the render service
        cannot read, so a base64 data URI is the only way a file on this machine
        can be used without publishing it.
        """
        if self._portrait.startswith(("http://", "https://", "oss://", "data:")):
            return self._portrait
        path = Path(self._portrait).expanduser()
        if not path.is_file():
            raise DigitalHumanUnavailable("the configured portrait could not be found")
        try:
            from PIL import Image, ImageOps

            with Image.open(path) as opened:
                picture = ImageOps.exif_transpose(opened).convert("RGB")
        except OSError:
            raise DigitalHumanRejected(
                "the configured portrait is not a readable picture"
            ) from None
        picture.thumbnail((1024, 1024))
        buffer = io.BytesIO()
        picture.save(buffer, format="JPEG", quality=88)
        return "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode()

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

    async def _poll(self, client: httpx.AsyncClient, task_id: str) -> str:
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
                return _result_url(output)
            if state in _FAILED:
                raise DigitalHumanError("DashScope reported a failed render")
            if state not in _RUNNING:
                raise InvalidDigitalHumanResponse("DashScope returned an unknown task state")
            await asyncio.sleep(self._poll_interval)

    async def _persist(self, remote_url: str) -> str:
        """Copy the clip home before its signed URL expires."""
        name = f"presenter-{hashlib.sha256(remote_url.encode()).hexdigest()[:24]}.mp4"
        destination = self._media_root / name
        if destination.is_file() and destination.stat().st_size > 0:
            return f"{self._media_url_prefix}/{name}"

        self._media_root.mkdir(parents=True, exist_ok=True)
        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(180.0), transport=self._transport, trust_env=False
            ) as client:
                response = await client.get(remote_url)
        except httpx.HTTPError:
            raise DigitalHumanUnavailable("the finished clip could not be downloaded") from None
        if not response.is_success or not response.content:
            raise DigitalHumanUnavailable("the finished clip could not be downloaded")
        destination.write_bytes(response.content)
        return f"{self._media_url_prefix}/{name}"


def _result_url(output: object) -> str:
    """The finished clip arrives as ``output.video_url``."""
    if not isinstance(output, dict):
        raise InvalidDigitalHumanResponse("DashScope returned no result")
    for key in ("video_url", "url"):
        value = output.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    results = output.get("results")
    if isinstance(results, dict):
        value = results.get("video_url")
        if isinstance(value, str) and value.strip():
            return value.strip()
    raise InvalidDigitalHumanResponse("DashScope returned no finished video")


__all__ = ["WanSpeechToVideoAdapter"]
