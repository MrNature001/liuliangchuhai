"""Still-image stage for the local presenter.

A vendor digital-human render needs a paid avatar service. This module draws the
narration as a branded 1080x1920 frame with Pillow instead, so the pipeline
still ships a real, playable video with no account and no API key. Fonts are
resolved from the operating system in a small deterministic order.
"""

from __future__ import annotations

import asyncio
import os
from dataclasses import dataclass
from pathlib import Path

from liuliangchuhai.application.ports.digital_human_errors import DigitalHumanUnavailable

WIDTH = 1080
HEIGHT = 1920

_INK = (33, 38, 30)
_MUTED = (94, 103, 86)
_PAPER = (247, 245, 238)
_BAND = (228, 232, 216)
_SEAL = (65, 86, 60)

_FONT_CANDIDATES: tuple[str, ...] = (
    "C:/Windows/Fonts/msyh.ttc",
    "C:/Windows/Fonts/msyhbd.ttc",
    "C:/Windows/Fonts/simhei.ttf",
    "/System/Library/Fonts/PingFang.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
)

_TITLE_SIZE = 78
_BODY_SIZE = 60
_FOOT_SIZE = 40


@dataclass(frozen=True, slots=True)
class PosterSpec:
    """Everything drawn on the frame; no provider or network data."""

    title: str
    script: str
    brand: str
    subtitle: str


def find_font() -> str:
    """Return the first available Unicode font path."""
    override = os.environ.get("LIULIANGCHUHAI_VIDEO_FONT", "").strip()
    for candidate in ((override,) if override else ()) + _FONT_CANDIDATES:
        if candidate and Path(candidate).is_file():
            return candidate
    raise DigitalHumanUnavailable("no Unicode font available for video rendering")


def _wrap(text: str, font: object, draw: object, max_width: int) -> list[str]:
    """Greedy wrap that also breaks scripts written without spaces."""
    lines: list[str] = []
    for paragraph in text.split("\n"):
        current = ""
        for character in paragraph:
            candidate = current + character
            if current and draw.textlength(candidate, font=font) > max_width:  # type: ignore[attr-defined]
                lines.append(current.rstrip())
                current = character.lstrip()
            else:
                current = candidate
        if current.strip():
            lines.append(current.rstrip())
    return lines


def _draw_blocking(spec: PosterSpec, destination: Path) -> Path:
    from PIL import Image, ImageDraw, ImageFont

    font_path = find_font()
    try:
        title_font = ImageFont.truetype(font_path, _TITLE_SIZE)
        body_font = ImageFont.truetype(font_path, _BODY_SIZE)
        foot_font = ImageFont.truetype(font_path, _FOOT_SIZE)
    except OSError as error:
        raise DigitalHumanUnavailable("unreadable font for video rendering") from error

    image = Image.new("RGB", (WIDTH, HEIGHT), _PAPER)
    draw = ImageDraw.Draw(image)
    draw.rectangle([0, 0, WIDTH, 300], fill=_BAND)
    draw.rectangle([0, HEIGHT - 220, WIDTH, HEIGHT], fill=_BAND)
    draw.rounded_rectangle([80, 112, 220, 236], radius=28, fill=_SEAL)
    draw.text((120, 130), "桂", font=title_font, fill=_PAPER)

    margin = 84
    width = WIDTH - margin * 2
    cursor = 344

    for line in _wrap(spec.title, title_font, draw, width)[:3]:
        draw.text((margin, cursor), line, font=title_font, fill=_INK)
        cursor += _TITLE_SIZE + 22

    cursor += 26
    draw.line([margin, cursor, WIDTH - margin, cursor], fill=_SEAL, width=4)
    cursor += 48

    line_height = _BODY_SIZE + 22
    limit = max(0, (HEIGHT - 300 - cursor) // line_height)
    body_lines = _wrap(spec.script, body_font, draw, width)
    if limit and len(body_lines) > limit:
        body_lines = body_lines[:limit]
        body_lines[-1] = body_lines[-1].rstrip() + "…"
    for line in body_lines:
        draw.text((margin, cursor), line, font=body_font, fill=_INK)
        cursor += line_height

    footer = f"{spec.brand} · {spec.subtitle}"
    for index, line in enumerate(_wrap(footer, foot_font, draw, width)[-2:]):
        draw.text((margin, HEIGHT - 170 + index * 54), line, font=foot_font, fill=_MUTED)

    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, format="PNG", optimize=True)
    return destination


async def draw(destination: Path, *, title: str, script: str, language: str) -> Path:
    """Render the frame off the event loop so a long script cannot block it."""
    spec = _spec(title=title, script=script, language=language)
    return await asyncio.to_thread(_draw_blocking, spec, destination)


def _spec(*, title: str, script: str, language: str) -> PosterSpec:
    return PosterSpec(
        title=title,
        script=script,
        brand="流量出海",
        subtitle=f"广西 · {language}",
    )


def font_available() -> bool:
    """Cheap availability check used by the health endpoint."""
    try:
        find_font()
    except DigitalHumanUnavailable:
        return False
    return True


__all__ = ["HEIGHT", "WIDTH", "PosterSpec", "draw", "find_font", "font_available"]
