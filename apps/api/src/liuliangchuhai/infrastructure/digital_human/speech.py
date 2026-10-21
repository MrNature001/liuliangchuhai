"""Narration for the local presenter: Microsoft Edge neural voices.

The read-aloud endpoint needs no account and is reachable from mainland China and
overseas. It also reports sentence boundaries, so one pass yields both the audio
and caption cues that match the voice exactly.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from liuliangchuhai.application.ports.digital_human_errors import DigitalHumanUnavailable
from liuliangchuhai.infrastructure.digital_human import timeline

# Boundary events report 100-nanosecond ticks.
_TICKS_PER_SECOND = 10_000_000
_DEFAULT_VOICE = "en-US-AvaNeural"
_RATE = "+0%"

# First matching row wins; matching is substring-based so callers may send a
# language name, an endonym or a BCP-47 tag interchangeably.
_VOICE_RULES: tuple[tuple[tuple[str, ...], str], ...] = (
    (("zh", "chinese", "中文", "汉语", "華語"), "zh-CN-XiaoxiaoNeural"),
    (("yue", "cantonese", "粤语", "粵語"), "zh-HK-HiuMaanNeural"),
    (("vi", "vietnam"), "vi-VN-HoaiMyNeural"),
    (("th", "thai"), "th-TH-PremwadeeNeural"),
    (("ms", "malay", "melayu"), "ms-MY-YasminNeural"),
    (("id", "indonesia"), "id-ID-GadisNeural"),
    (("en", "english"), _DEFAULT_VOICE),
)


def resolve_voice(language: str) -> str:
    """Map a free-text language label to a deterministic edge-tts voice name."""
    needle = language.strip().lower()
    for tokens, voice in _VOICE_RULES:
        if any(token in needle for token in tokens):
            return voice
    return _DEFAULT_VOICE


def headline(script: str) -> str:
    """First sentence, trimmed for a poster title."""
    sentences = timeline.split_sentences(script)
    title = sentences[0] if sentences else script.strip()
    trimmed = title[:44].rstrip("，,。.、;；:：!！?？ ")
    return trimmed or script.strip()[:44]


async def available_voices() -> tuple[str, ...]:
    """Report provider reachability for the health endpoint; never raises."""
    try:
        import edge_tts

        voices = await edge_tts.list_voices()
    except Exception:
        return ()
    return tuple(str(voice["ShortName"]) for voice in voices if voice.get("ShortName"))


@dataclass(frozen=True, slots=True)
class Clip:
    """Narration file plus the cue timings the voice itself reported."""

    audio_path: Path
    cues: tuple[timeline.Caption, ...]


def _normalise(script: str) -> str:
    return " ".join(script.replace("\r", " ").split())


def _cues_from_events(events: list[timeline.Caption]) -> tuple[timeline.Caption, ...]:
    """Drop empty or inverted cues while keeping the voice's own ordering."""
    return tuple(cue for cue in events if cue.text and cue.end > cue.start)


async def synthesise(script: str, language: str, voice: str | None, destination: Path) -> Clip:
    """Speak ``script`` into ``destination`` and return cue timings."""
    import edge_tts

    text = _normalise(script)
    if not text:
        raise DigitalHumanUnavailable("speech synthesis received an empty script")

    communicator = edge_tts.Communicate(
        text, voice or resolve_voice(language), rate=_RATE, boundary="SentenceBoundary"
    )

    audio = bytearray()
    events: list[timeline.Caption] = []
    try:
        async for chunk in communicator.stream():
            kind = chunk.get("type")
            if kind == "audio":
                audio.extend(chunk["data"])
            elif kind == "SentenceBoundary":
                start = round(chunk["offset"] / _TICKS_PER_SECOND, 3)
                end = round((chunk["offset"] + chunk["duration"]) / _TICKS_PER_SECOND, 3)
                events.append(
                    timeline.Caption(start=start, end=end, text=str(chunk.get("text", "")).strip())
                )
    except Exception as error:  # provider, network and protocol faults all mean unavailable
        raise DigitalHumanUnavailable("speech synthesis failed") from error

    if not audio:
        raise DigitalHumanUnavailable("speech synthesis produced no audio")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(bytes(audio))
    return Clip(audio_path=destination, cues=_cues_from_events(events))
