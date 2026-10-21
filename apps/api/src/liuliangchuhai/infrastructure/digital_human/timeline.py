"""Caption timing for the local presenter.

Timings come from the speech synthesiser's own boundary events; these helpers
only split, estimate, rescale and serialise them, so the module stays pure and
testable without a network or a media toolchain.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

_SENTENCE = re.compile(r"[^.!?。！？\n]+[.!?。！？]?", re.UNICODE)
_CJK = re.compile(r"[㐀-鿿豈-﫿]")
_THAI = re.compile(r"[฀-๿]")

# Reading-rate priors, used only when the synthesiser reports no boundaries.
_SECONDS_PER_LATIN_WORD = 0.34
_SECONDS_PER_CJK_CHAR = 0.19
_SECONDS_PER_THAI_CHAR = 0.055
_MIN_CUE_SECONDS = 0.9


@dataclass(frozen=True, slots=True)
class Caption:
    """One caption cue; times are seconds from the start of the audio."""

    start: float
    end: float
    text: str


def split_sentences(script: str) -> tuple[str, ...]:
    """Split a script into caption-sized units without dropping characters."""
    normalised = " ".join(script.replace("\r", " ").split())
    if not normalised:
        return ()
    units = (match.group(0).strip() for match in _SENTENCE.finditer(normalised))
    return tuple(unit for unit in units if unit)


def estimate_seconds(text: str) -> float:
    """Estimate speech duration for one caption unit using script-aware rates."""
    cjk = len(_CJK.findall(text))
    thai = len(_THAI.findall(text))
    latin = len(re.findall(r"[A-Za-z0-9']+", text))
    estimate = (
        cjk * _SECONDS_PER_CJK_CHAR
        + thai * _SECONDS_PER_THAI_CHAR
        + latin * _SECONDS_PER_LATIN_WORD
    )
    return max(_MIN_CUE_SECONDS, estimate)


def build_timeline(script: str, total_seconds: float) -> tuple[Caption, ...]:
    """Distribute a measured duration across sentences by estimated weight.

    Used only when the synthesiser reports no boundary events, so a caption can
    never outlive the audio and every cue stays monotonic.
    """
    units = split_sentences(script)
    if not units or total_seconds <= 0:
        return ()
    weights = [estimate_seconds(unit) for unit in units]
    scale = total_seconds / sum(weights)
    captions: list[Caption] = []
    cursor = 0.0
    for unit, weight in zip(units, weights, strict=True):
        end = min(total_seconds, cursor + weight * scale)
        if end <= cursor:
            continue
        captions.append(Caption(start=round(cursor, 3), end=round(end, 3), text=unit))
        cursor = end
    return tuple(captions)


def rescale(captions: tuple[Caption, ...], total_seconds: float) -> tuple[Caption, ...]:
    """Stretch cues so the last one ends with the measured audio length.

    The synthesiser reports exact offsets, so this only corrects the small drift
    between the streamed boundary clock and the encoded MP3.
    """
    if not captions or total_seconds <= 0:
        return captions
    last = max(cue.end for cue in captions)
    if last <= 0:
        return captions
    if abs(total_seconds - last) <= max(0.08, total_seconds * 0.04):
        return captions
    factor = total_seconds / last
    return tuple(
        Caption(start=round(cue.start * factor, 3), end=round(cue.end * factor, 3), text=cue.text)
        for cue in captions
    )


def srt_timestamp(seconds: float) -> str:
    milliseconds = round(max(0.0, seconds) * 1000)
    hours, rest = divmod(milliseconds, 3_600_000)
    minutes, rest = divmod(rest, 60_000)
    secs, millis = divmod(rest, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def to_srt(captions: tuple[Caption, ...]) -> str:
    """Serialise cues as SubRip, the format ffmpeg burns in."""
    blocks = [
        f"{index}\n{srt_timestamp(cue.start)} --> {srt_timestamp(cue.end)}\n{cue.text}\n"
        for index, cue in enumerate(captions, start=1)
    ]
    return "\n".join(blocks)


__all__ = [
    "Caption",
    "build_timeline",
    "estimate_seconds",
    "rescale",
    "split_sentences",
    "srt_timestamp",
    "to_srt",
]
