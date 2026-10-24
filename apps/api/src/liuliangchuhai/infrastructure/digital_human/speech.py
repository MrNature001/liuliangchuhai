"""Narration for the local presenter: Microsoft Edge neural voices.

The read-aloud endpoint needs no account and is reachable from mainland China and
overseas. It also reports sentence boundaries, so one pass yields both the audio
and caption cues that match the voice exactly.

Voice choice follows the *script*, not the language label. A user may pick
"英语" while the copy is still Chinese, and Edge's monolingual English voice
returns zero audio for Han characters. Every voice below was probed against each
writing system; multilingual voices are the fallback because they accept all of
them.
"""

from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass
from pathlib import Path

from liuliangchuhai.application.ports.digital_human_errors import DigitalHumanUnavailable
from liuliangchuhai.infrastructure.digital_human import timeline

# Boundary events report 100-nanosecond ticks.
_TICKS_PER_SECOND = 10_000_000
_RATE = "+0%"

# Accepts Han, Thai, Vietnamese and Latin text. Used as the universal fallback.
_MULTILINGUAL = "en-US-AvaMultilingualNeural"

# Best voice per writing system, chosen from the probe matrix in tests.
_BY_SCRIPT: dict[str, str] = {
    "han": "zh-CN-XiaoxiaoNeural",
    "thai": "th-TH-PremwadeeNeural",
    "viet": "vi-VN-HoaiMyNeural",
    "latin": _MULTILINGUAL,
    "other": _MULTILINGUAL,
}

# Languages a given voice can actually pronounce, measured against the endpoint.
# A voice absent from a set would return NoAudioReceived for that script.
_VOICE_SCRIPTS: dict[str, frozenset[str]] = {
    "zh-CN-XiaoxiaoNeural": frozenset({"han", "latin", "viet"}),
    "zh-CN-YunxiNeural": frozenset({"han", "viet"}),
    "zh-HK-HiuMaanNeural": frozenset({"han", "latin", "viet"}),
    "en-US-AvaNeural": frozenset({"latin", "viet"}),
    "vi-VN-HoaiMyNeural": frozenset({"latin", "viet"}),
    "th-TH-PremwadeeNeural": frozenset({"thai", "latin", "viet"}),
    "ms-MY-YasminNeural": frozenset({"latin", "viet"}),
    "id-ID-GadisNeural": frozenset({"latin", "viet"}),
    _MULTILINGUAL: frozenset({"han", "thai", "viet", "latin"}),
}

# First matching row wins; matching is substring-based so callers may send a
# language name, an endonym or a BCP-47 tag interchangeably.
_VOICE_RULES: tuple[tuple[tuple[str, ...], str], ...] = (
    (("zh", "chinese", "中文", "汉语", "華語", "中文普通話"), "zh-CN-XiaoxiaoNeural"),
    (("yue", "cantonese", "粤语", "粵語"), "zh-HK-HiuMaanNeural"),
    (("vi", "vietnam", "tiếng việt"), "vi-VN-HoaiMyNeural"),
    (("th", "thai", "ไทย"), "th-TH-PremwadeeNeural"),
    (("ms", "malay", "melayu"), "ms-MY-YasminNeural"),
    (("id", "indonesia"), "id-ID-GadisNeural"),
    (("en", "english", "英语", "英文"), _MULTILINGUAL),
)

_HAN = re.compile(r"[㐀-䶿一-鿿豈-﫿]")
_THAI = re.compile(r"[฀-๿]")
_VIET = re.compile(r"[ăâđêôơưĂÂĐÊÔƠƯàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]")
_LATIN = re.compile(r"[A-Za-zÀ-ɏ]")


def detect_script(text: str) -> str:
    """Classify the writing system that dominates ``text``.

    Counting characters rather than words keeps the answer stable for Chinese
    and Thai, which are written without spaces.
    """
    han = len(_HAN.findall(text))
    thai = len(_THAI.findall(text))
    viet = len(_VIET.findall(text))
    latin = len(_LATIN.findall(text))
    # Vietnamese shares the Latin alphabet, so it only wins when its own
    # diacritics are dense enough to rule out English, Malay or Indonesian.
    if viet >= 2 and viet >= latin * 0.08:
        return "viet"
    scores = {"han": han, "thai": thai, "latin": latin - viet}
    best = max(scores, key=lambda name: scores[name])
    return best if scores[best] > 0 else "other"


def resolve_voice(language: str) -> str:
    """Map a free-text language label to a deterministic edge-tts voice name."""
    needle = language.strip().lower()
    for tokens, voice in _VOICE_RULES:
        if any(token in needle for token in tokens):
            return voice
    return _MULTILINGUAL


def voice_candidates(language: str, text: str) -> tuple[str, ...]:
    """Ordered voices to try, best fit first and never empty.

    The script decides whenever the label disagrees with it, so a Chinese
    script read under an English label still gets a native Chinese voice.
    The requested voice stays in the queue as a second chance because a
    monolingual voice occasionally reads foreign text with an accent instead
    of failing outright.
    """
    script = detect_script(text)
    native = _BY_SCRIPT[script]
    requested = resolve_voice(language)
    ordered: list[str] = [native]
    if requested != native and script in _VOICE_SCRIPTS.get(requested, frozenset()):
        ordered.append(requested)
    if _MULTILINGUAL not in ordered:
        ordered.append(_MULTILINGUAL)
    return tuple(ordered)


_HEADLINE_LIMIT = 58
_HEADLINE_TAIL = "，,。.、;；:：!！?？ "


def headline(script: str) -> str:
    """First sentence, trimmed on a word boundary for a poster title.

    Cutting at a fixed character count used to slice words in half ("for a
    fam"), which reads as a rendering bug rather than a shortened title.
    """
    sentences = timeline.split_sentences(script)
    title = (sentences[0] if sentences else script.strip()).strip().rstrip(_HEADLINE_TAIL)
    if not title:
        return script.strip()[:_HEADLINE_LIMIT]
    if len(title) <= _HEADLINE_LIMIT:
        return title
    cut = title[:_HEADLINE_LIMIT]
    if " " in cut:
        cut = cut[: cut.rfind(" ")]
    return cut.rstrip(_HEADLINE_TAIL) + "…"


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
    voice: str


def _normalise(script: str) -> str:
    return " ".join(script.replace("\r", " ").split())


def _cues_from_events(events: list[timeline.Caption]) -> tuple[timeline.Caption, ...]:
    """Drop empty or inverted cues while keeping the voice's own ordering."""
    return tuple(cue for cue in events if cue.text and cue.end > cue.start)


async def _attempt(text: str, voice: str) -> tuple[bytes, list[timeline.Caption]]:
    """One streaming pass. Raises on an empty result so callers can retry."""
    import edge_tts

    audio = bytearray()
    events: list[timeline.Caption] = []
    async for chunk in edge_tts.Communicate(
        text, voice, rate=_RATE, boundary="SentenceBoundary"
    ).stream():
        kind = chunk.get("type")
        if kind == "audio":
            audio.extend(chunk["data"])
        elif kind == "SentenceBoundary":
            start = round(chunk["offset"] / _TICKS_PER_SECOND, 3)
            end = round((chunk["offset"] + chunk["duration"]) / _TICKS_PER_SECOND, 3)
            events.append(
                timeline.Caption(start=start, end=end, text=str(chunk.get("text", "")).strip())
            )
    if not audio:
        raise RuntimeError("empty audio")
    return bytes(audio), events


async def synthesise(script: str, language: str, voice: str | None, destination: Path) -> Clip:
    """Speak ``script`` into ``destination``, trying voices until one produces audio.

    The endpoint occasionally returns an empty stream for text a voice handles
    fine, so each candidate is retried once before moving on.
    """
    text = _normalise(script)
    if not text:
        raise DigitalHumanUnavailable("speech synthesis received an empty script")

    candidates = (voice,) if voice else voice_candidates(language, text)
    last_error: Exception | None = None
    for candidate in candidates:
        for attempt in range(2):
            try:
                audio, events = await _attempt(text, candidate)
            except Exception as error:  # provider, network and protocol faults
                last_error = error
                if attempt == 0:
                    await asyncio.sleep(0.4)
                continue
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(audio)
            return Clip(
                audio_path=destination,
                cues=_cues_from_events(events),
                voice=candidate,
            )

    raise DigitalHumanUnavailable(
        "speech synthesis failed: no candidate voice produced audio"
    ) from last_error
