"""A drawn virtual-streamer avatar that speaks the narration.

No model file, no GPU, no recording: the character is composed from vector-ish
Pillow shapes and animated from the narration's own loudness. The mouth opens on
syllables and closes in the gaps, the eyes blink on a slow cycle, and the whole
figure sways gently, so a generated script produces a moving presenter rather
than a still card.

The look is deliberately a flat chibi — a stylised 2D character is what a
virtual streamer is, and it tolerates the mouth being approximate in a way a
photoreal face does not.
"""

from __future__ import annotations

import asyncio
import math
import subprocess
from array import array
from functools import lru_cache
from pathlib import Path
from typing import TypedDict

from PIL import Image, ImageDraw

from liuliangchuhai.application.ports.digital_human_errors import DigitalHumanUnavailable
from liuliangchuhai.infrastructure.digital_human.mux import ffmpeg_path

WIDTH = 1080
HEIGHT = 1920
_SUPERSAMPLE = 2

_PAPER = (250, 246, 236)
_PAPER_DEEP = (238, 230, 212)
_INK = (38, 44, 38)
_JADE = (45, 92, 74)
_JADE_DEEP = (28, 62, 52)
_TERRACOTTA = (196, 108, 74)
_SKIN = (247, 214, 186)
_SKIN_SHADE = (226, 184, 152)
_HAIR = (58, 44, 48)
_HAIR_LIGHT = (86, 66, 70)
_BLAZER = (54, 104, 88)
_EYE = (44, 58, 62)

# Character geometry, in delivered pixels.
_HEAD = (300, 470, 780, 1050)
_NECK = (494, 980, 586, 1170)
_EYE_LEFT = (398, 730, 502, 852)
_EYE_RIGHT = (578, 730, 682, 852)
_MOUTH = (486, 936, 594, 936)
_BLUSH = ((322, 842, 400, 884), (680, 842, 758, 884))
_BODY_TOP = 1124

_MOUTH_STATES = 7
_EYES_BOX = (386, 664, 694, 866)
_MOUTH_BOX = (460, 900, 620, 1024)


def _s(value: float) -> int:
    return round(value * _SUPERSAMPLE)


def _canvas() -> Image.Image:
    return Image.new("RGBA", (WIDTH * _SUPERSAMPLE, HEIGHT * _SUPERSAMPLE), (0, 0, 0, 0))


def _ellipse(box: tuple[int, int, int, int], origin: tuple[int, int] = (0, 0)) -> list[int]:
    """A delivered-pixel box as a supersampled one, relative to a sprite origin."""
    left, top, right, bottom = box
    ox, oy = origin
    return [_s(left - ox), _s(top - oy), _s(right - ox), _s(bottom - oy)]


def _sprite(box: tuple[int, int, int, int], paint) -> tuple[Image.Image, tuple[int, int]]:
    """Render one small layer at supersample and shrink it to delivered pixels."""
    left, top, right, bottom = box
    layer = Image.new(
        "RGBA", ((right - left) * _SUPERSAMPLE, (bottom - top) * _SUPERSAMPLE), (0, 0, 0, 0)
    )
    paint(ImageDraw.Draw(layer, "RGBA"), (left, top))
    return layer.resize((right - left, bottom - top), Image.Resampling.LANCZOS), (left, top)


def _blend(start: tuple[int, int, int], end: tuple[int, int, int], t: float):
    return tuple(round(a + (b - a) * t) for a, b in zip(start, end, strict=True))


def _background() -> Image.Image:
    """The same paper stage the stills use, so the shots cut together."""
    strip = Image.new("RGB", (1, HEIGHT))
    strip.putdata(
        [
            _blend(_PAPER, _PAPER_DEEP, min(1.0, max(0.0, (y / (HEIGHT - 1) - 0.55) / 0.45)))
            for y in range(HEIGHT)
        ]
    )
    scene = strip.resize((WIDTH, HEIGHT)).convert("RGBA")
    disc = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    ImageDraw.Draw(disc).ellipse([150, 420, 930, 1200], fill=(*_TERRACOTTA, 34))
    scene.alpha_composite(disc)
    return scene


def _hair_back(layer: Image.Image) -> None:
    """A bob that hugs the head instead of swallowing it."""
    draw = ImageDraw.Draw(layer, "RGBA")
    draw.rounded_rectangle(_ellipse((286, 486, 794, 1012)), radius=_s(238), fill=_HAIR)


def _body(layer: Image.Image) -> None:
    draw = ImageDraw.Draw(layer, "RGBA")
    draw.rounded_rectangle(_ellipse(_NECK), radius=_s(46), fill=_SKIN_SHADE)
    draw.polygon(
        [
            (_s(52), _s(HEIGHT)),
            (_s(104), _s(1570)),
            (_s(226), _s(1334)),
            (_s(348), _s(_BODY_TOP + 46)),
            (_s(440), _s(_BODY_TOP)),
            (_s(640), _s(_BODY_TOP)),
            (_s(732), _s(_BODY_TOP + 46)),
            (_s(854), _s(1334)),
            (_s(976), _s(1570)),
            (_s(1028), _s(HEIGHT)),
        ],
        fill=_BLAZER,
    )
    draw.ellipse(_ellipse((360, 1126, 512, 1252)), fill=_BLAZER)
    draw.ellipse(_ellipse((568, 1126, 720, 1252)), fill=_BLAZER)
    draw.polygon(
        [(_s(474), _s(_BODY_TOP + 4)), (_s(540), _s(1318)), (_s(606), _s(_BODY_TOP + 4))],
        fill=(*_PAPER, 255),
    )
    draw.line([(_s(540), _s(1214)), (_s(540), _s(1318))], fill=(*_TERRACOTTA, 210), width=_s(4))


def _head(layer: Image.Image) -> None:
    draw = ImageDraw.Draw(layer, "RGBA")
    draw.ellipse(_ellipse((334, 492, 746, 1036)), fill=_SKIN)
    # Ears.
    draw.ellipse(_ellipse((306, 756, 352, 840)), fill=_SKIN_SHADE)
    draw.ellipse(_ellipse((728, 756, 774, 840)), fill=_SKIN_SHADE)
    # Fringe: one smooth dome, with a lighter sweep so it is not a flat cap.
    draw.pieslice(_ellipse((316, 446, 764, 892)), 180, 360, fill=_HAIR)
    draw.arc(_ellipse((360, 500, 720, 860)), 200, 330, fill=_HAIR_LIGHT, width=_s(7))
    draw.arc(_ellipse((522, 868, 558, 900)), 200, 340, fill=_SKIN_SHADE, width=_s(5))
    for box in _BLUSH:
        draw.ellipse(_ellipse(box), fill=(226, 138, 120, 70))


def _eyes(state: str) -> tuple[Image.Image, tuple[int, int]]:
    """Both eyes on one layer, so a blink is a single swap."""

    def paint(draw: ImageDraw.ImageDraw, origin: tuple[int, int]) -> None:
        for box in (_EYE_LEFT, _EYE_RIGHT):
            draw.arc(
                _ellipse((box[0] + 8, box[1] - 48, box[2] - 8, box[1] - 16), origin),
                200,
                340,
                fill=_HAIR,
                width=_s(8),
            )
            if state == "closed":
                draw.arc(
                    _ellipse((box[0] + 6, box[1] + 40, box[2] - 6, box[3] - 10), origin),
                    200,
                    340,
                    fill=_EYE,
                    width=_s(9),
                )
                continue
            draw.ellipse(_ellipse(box, origin), fill=(255, 253, 248))
            draw.ellipse(
                _ellipse((box[0] + 16, box[1] + 10, box[2] - 16, box[3] - 6), origin),
                fill=_EYE,
            )
            draw.ellipse(
                _ellipse((box[0] + 30, box[1] + 26, box[2] - 40, box[3] - 44), origin),
                fill=(255, 255, 255),
            )
            draw.arc(_ellipse(box, origin), 190, 350, fill=_HAIR, width=_s(8))

    return _sprite(_EYES_BOX, paint)


def _mouth(state: int) -> tuple[Image.Image, tuple[int, int]]:
    """Mouth shapes from a closed smile to a wide open vowel."""
    left, top, right, _ = _MOUTH
    openness = state / (_MOUTH_STATES - 1)

    def paint(draw: ImageDraw.ImageDraw, origin: tuple[int, int]) -> None:
        if state == 0:
            draw.arc(
                _ellipse((left + 12, top - 16, right - 12, top + 32), origin),
                20,
                160,
                fill=(158, 78, 70),
                width=_s(7),
            )
            return
        height = 14 + openness * 60
        draw.ellipse(_ellipse((left, top, right, round(top + height)), origin), fill=(146, 62, 58))
        draw.ellipse(
            _ellipse(
                (left + 22, round(top + height * 0.56), right - 22, round(top + height * 0.94)),
                origin,
            ),
            fill=(214, 128, 118),
        )

    return _sprite(_MOUTH_BOX, paint)


class _Assets(TypedDict):
    """Every layer is rendered once and composited per frame."""

    base: Image.Image
    eyes_open: Image.Image
    eyes_closed: Image.Image
    mouths: list[Image.Image]


@lru_cache(maxsize=1)
def _assets() -> _Assets:
    """Render every layer once; frames only composite them afterwards."""
    back = _canvas()
    _body(back)
    _hair_back(back)
    _head(back)
    base = Image.alpha_composite(
        _background(), back.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    )
    return {
        "base": base,
        "eyes_open": _eyes("open")[0],
        "eyes_closed": _eyes("closed")[0],
        "mouths": [_mouth(state)[0] for state in range(_MOUTH_STATES)],
    }


def _frame(assets: _Assets, mouth: int, blink: bool, sway: int) -> Image.Image:
    scene = assets["base"].copy()
    eyes = assets["eyes_closed"] if blink else assets["eyes_open"]
    scene.paste(eyes, (_EYES_BOX[0] + sway, _EYES_BOX[1]), eyes)
    sprite = assets["mouths"][mouth]
    scene.paste(sprite, (_MOUTH_BOX[0] + sway, _MOUTH_BOX[1]), sprite)
    return scene


def _envelope_blocking(audio: Path, frames: int) -> list[float]:
    """Per-frame loudness of the narration, normalised to 0..1."""
    process = subprocess.run(
        [
            ffmpeg_path(),
            "-v",
            "quiet",
            "-i",
            str(audio),
            "-ac",
            "1",
            "-ar",
            "8000",
            "-f",
            "s16le",
            "-",
        ],
        capture_output=True,
        check=False,
    )
    samples = array("h")
    samples.frombytes(process.stdout[: len(process.stdout) // 2 * 2])
    if not samples:
        return [0.0] * frames
    per_frame = max(1, len(samples) // max(1, frames))
    values = []
    for index in range(frames):
        chunk = samples[index * per_frame : (index + 1) * per_frame]
        if not chunk:
            values.append(0.0)
            continue
        values.append(math.sqrt(sum(sample * sample for sample in chunk) / len(chunk)))
    ranked = sorted(values)
    ceiling = ranked[int(len(ranked) * 0.95)] or 1.0
    normalised = [min(1.0, value / ceiling) for value in values]
    # Smooth, and keep a little life in the pauses instead of a hard zero.
    smoothed = []
    for index in range(len(normalised)):
        window = normalised[max(0, index - 1) : index + 2]
        smoothed.append(max(0.12, sum(window) / len(window)))
    return smoothed


async def loudness(audio: Path, frames: int) -> list[float]:
    return await asyncio.to_thread(_envelope_blocking, audio, frames)


def _encode_blocking(assets: _Assets, envelope: list[float], destination: Path, fps: int) -> None:
    process = subprocess.Popen(
        [
            ffmpeg_path(),
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "rgb24",
            "-s",
            f"{WIDTH}x{HEIGHT}",
            "-r",
            str(fps),
            "-i",
            "-",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(destination),
        ],
        stdin=subprocess.PIPE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    assert process.stdin is not None
    try:
        for index, openness in enumerate(envelope):
            seconds = index / fps
            mouth = min(_MOUTH_STATES - 1, round(openness * (_MOUTH_STATES - 1)))
            blink = (seconds % 3.7) < 0.13
            sway = round(7 * math.sin(2 * math.pi * seconds / 4.2))
            process.stdin.write(_frame(assets, mouth, blink, sway).convert("RGB").tobytes())
    except BrokenPipeError:
        raise DigitalHumanUnavailable("ffmpeg stopped while encoding the avatar") from None
    finally:
        process.stdin.close()
    if process.wait() != 0:
        raise DigitalHumanUnavailable("ffmpeg could not encode the avatar")


async def build(*, audio: Path, destination: Path, duration_seconds: float, fps: int = 25) -> Path:
    """Animate the avatar against the narration and encode it as a clip."""
    frames = max(1, round(duration_seconds * fps))
    assets = await asyncio.to_thread(_assets)
    envelope = await loudness(audio, frames)
    destination.parent.mkdir(parents=True, exist_ok=True)
    await asyncio.to_thread(_encode_blocking, assets, envelope, destination, fps)
    if not destination.is_file() or destination.stat().st_size == 0:
        raise DigitalHumanUnavailable("the avatar clip came out empty")
    return destination


__all__ = ["HEIGHT", "WIDTH", "build", "loudness"]
