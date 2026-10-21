"""Key-free digital presenter.

No vendor account, no GPU and no outbound rendering service: the narration is
synthesised with Edge neural voices, the poster is drawn locally with Pillow and
ffmpeg muxes both into an MP4. Output is written under the API's ``media``
directory and served by the same FastAPI app, so it works from mainland China,
from the demo markets and from anywhere else that can reach the site.
"""

from __future__ import annotations

import asyncio
import hashlib
import tempfile
from pathlib import Path

from liuliangchuhai.application.ports.digital_human_errors import (
    DigitalHumanDeadlineExceeded,
    DigitalHumanUnavailable,
    InvalidDigitalHumanResponse,
)
from liuliangchuhai.application.ports.status import ProviderStatus
from liuliangchuhai.domain.digital_human import DigitalHumanGenerationInput, GeneratedVideo
from liuliangchuhai.infrastructure.digital_human import mux, poster, speech, timeline


class LocalPresenterAdapter:
    """Deterministic, offline-capable presenter used when no vendor is configured."""

    _PROVIDER = "local-presenter"

    def __init__(
        self,
        *,
        media_root: Path,
        public_prefix: str,
        timeout_seconds: float,
        voice_hints: dict[str, str] | None = None,
    ) -> None:
        if not public_prefix.strip():
            raise ValueError("public_prefix must be a nonblank string")
        self._media_root = media_root
        self._public_prefix = public_prefix.strip().rstrip("/")
        self._timeout_seconds = timeout_seconds
        self._voice_hints = dict(voice_hints or {})

    async def status(self) -> ProviderStatus:
        """Report availability without synthesising anything."""
        return ProviderStatus(
            provider=self._PROVIDER,
            available=poster.font_available() and mux.ffmpeg_available(),
        )

    async def generate(self, generation: DigitalHumanGenerationInput) -> GeneratedVideo:
        try:
            async with asyncio.timeout(self._timeout_seconds):
                return await self._render(generation)
        except TimeoutError:
            raise DigitalHumanDeadlineExceeded(
                "local presenter exceeded the local deadline"
            ) from None

    async def _render(self, generation: DigitalHumanGenerationInput) -> GeneratedVideo:
        voice = self._voice_hints.get(generation.language.strip().lower())
        # Content-addressed output: an identical script is served without re-rendering.
        digest = hashlib.sha256(
            f"{generation.script}|{generation.language}|{voice or ''}".encode()
        ).hexdigest()[:24]
        name = f"presenter-{digest}.mp4"
        destination = self._media_root / name
        self._media_root.mkdir(parents=True, exist_ok=True)
        if destination.is_file() and destination.stat().st_size > 0:
            return GeneratedVideo(media_url=f"{self._public_prefix}/{name}")

        with tempfile.TemporaryDirectory(prefix="presenter-") as workspace:
            root = Path(workspace)
            speech_clip = await speech.synthesise(
                generation.script, generation.language, voice, root / "narration.mp3"
            )
            seconds = await mux.probe_duration(speech_clip.audio_path)
            if seconds <= 0:
                raise InvalidDigitalHumanResponse("narration has no measurable duration")
            cues = timeline.rescale(speech_clip.cues, seconds) or timeline.build_timeline(
                generation.script, seconds
            )
            subtitle_file = root / "captions.srt"
            subtitle_file.write_text(timeline.to_srt(cues), encoding="utf-8")
            still = await poster.draw(
                root / "poster.png",
                title=speech.headline(generation.script),
                script=generation.script,
                language=generation.language,
            )
            await mux.render(
                poster=still,
                audio=speech_clip.audio_path,
                subtitles=subtitle_file,
                destination=destination,
                duration_seconds=seconds,
                timeout_seconds=self._timeout_seconds,
            )

        if not destination.is_file() or destination.stat().st_size == 0:
            raise DigitalHumanUnavailable("local presenter produced no video")
        return GeneratedVideo(media_url=f"{self._public_prefix}/{name}")


__all__ = ["LocalPresenterAdapter"]
