"""Frame art for the local presenter.

A vendor digital-human render needs a paid avatar service. This module composes
the frame with Pillow instead: warm paper, a terracotta sun, and a pagoda
skyline drawn from the Southeast Asian vocabulary the demo sells into.
Everything is drawn locally, so the demo still ships a real, playable video with
no account, no network and no stock-photo licence.

The frame deliberately contains no figure of its own. Drawing a person with
primitives reads as clip art, and a real face has to come from real footage —
`LIULIANGCHUHAI_VIDEO_PRESENTER` composites your own cut-out, and the
``dashscope`` provider produces a photoreal talking head from a recorded clip.

Environment overrides:

``LIULIANGCHUHAI_VIDEO_BACKGROUND``  a photo used full-bleed behind the scene
``LIULIANGCHUHAI_VIDEO_PRESENTER``   a cut-out PNG composited over the scene
``LIULIANGCHUHAI_VIDEO_FONT``        a Unicode font path for every drawn glyph
"""

from __future__ import annotations

import asyncio
import hashlib
import os
from collections.abc import Callable
from dataclasses import dataclass
from itertools import pairwise
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

from liuliangchuhai.application.ports.digital_human_errors import DigitalHumanUnavailable

WIDTH = 1080
HEIGHT = 1920

# The site's own palette: warm paper, deep jade, lacquer accents.
_PAPER = (250, 246, 236)
_PAPER_DEEP = (240, 232, 214)
_INK = (38, 44, 38)
_MUTED = (108, 112, 98)
_JADE = (45, 92, 74)
_TERRACOTTA = (196, 108, 74)

_TITLE_MAX_WIDTH = WIDTH - 192
_TITLE_TOP = 292
_CAPTION_SIZE = 54
_CAPTION_MARGIN_V = 168

_FONT_CANDIDATES: tuple[str, ...] = (
    "C:/Windows/Fonts/msyh.ttc",
    "C:/Windows/Fonts/simhei.ttf",
    "/System/Library/Fonts/PingFang.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
)

_BOLD_FONT_CANDIDATES: tuple[str, ...] = (
    "C:/Windows/Fonts/msyhbd.ttc",
    "C:/Windows/Fonts/simhei.ttf",
    "C:/Windows/Fonts/msyh.ttc",
    "/System/Library/Fonts/PingFang.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
)

_THAI_FONT_CANDIDATES: tuple[str, ...] = (
    "C:/Windows/Fonts/LeelawadeeUI.ttf",
    "C:/Windows/Fonts/leelawui.ttf",
    "/System/Library/Fonts/Thonburi.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansThai-Regular.ttf",
)

Colour = tuple[int, int, int]

# Closing punctuation may never open a line; CJK typesetting keeps it hanging.
_NO_LINE_START = frozenset("，。、！？：；）》」』】〕…·,.;:!?)]}")


@dataclass(frozen=True, slots=True)
class PosterSpec:
    """Everything drawn on the frame; no provider or network data."""

    title: str
    brand: str
    subtitle: str


def _override(name: str) -> str:
    return os.environ.get(name, "").strip()


def find_font(*, bold: bool = False) -> str:
    """Return the first available Unicode font path."""
    override = _override("LIULIANGCHUHAI_VIDEO_FONT")
    if override:
        candidates: tuple[str, ...] = (override,)
    elif bold:
        candidates = _BOLD_FONT_CANDIDATES
    else:
        candidates = _FONT_CANDIDATES
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return candidate
    raise DigitalHumanUnavailable("no Unicode font available for video rendering")


def _asset(name: str) -> Path | None:
    """Resolve an operator-supplied image override, if it exists."""
    raw = _override(name)
    if not raw:
        return None
    path = Path(raw).expanduser()
    return path if path.is_file() else None


def asset_signature() -> str:
    """Fingerprint the art inputs so a swapped photo invalidates the cache."""
    parts = []
    for name in ("LIULIANGCHUHAI_VIDEO_BACKGROUND", "LIULIANGCHUHAI_VIDEO_PRESENTER"):
        path = _asset(name)
        if path is None:
            parts.append("-")
        else:
            stat = path.stat()
            parts.append(f"{path.name}:{stat.st_size}:{int(stat.st_mtime)}")
    return hashlib.sha256("|".join(parts).encode()).hexdigest()[:12]


def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    """Greedy wrap that prefers word breaks and still splits unspaced scripts."""
    lines: list[str] = []
    for paragraph in text.replace("\r", "\n").split("\n"):
        current = ""
        for character in paragraph:
            candidate = current + character
            if not current or font.getlength(candidate) <= max_width:
                current = candidate
                continue
            break_at = current.rfind(" ") if " " in current.strip() else -1
            if break_at > 0:
                lines.append(current[:break_at].rstrip())
                current = (current[break_at + 1 :] + character).lstrip()
            elif character in _NO_LINE_START:
                # Let the mark hang instead of opening the next line with it.
                lines.append((current + character).rstrip())
                current = ""
            else:
                lines.append(current.rstrip())
                current = character.lstrip()
        if current.strip():
            lines.append(current.rstrip())
    return lines


def _ellipsize(line: str, font: ImageFont.FreeTypeFont, max_width: int) -> str:
    trimmed = line.rstrip()
    while trimmed and font.getlength(trimmed + "…") > max_width:
        trimmed = trimmed[:-1].rstrip()
    return trimmed + "…"


def caption_max_width() -> int:
    """Usable caption width, leaving the same margin as the title."""
    return WIDTH - 180


def caption_size() -> int:
    """Caption point size in frame pixels; the ASS file states its resolution."""
    return _CAPTION_SIZE


def caption_margin_v() -> int:
    """Distance from the bottom edge to the lowest caption line."""
    return _CAPTION_MARGIN_V


def caption_lines(text: str, *, max_width: int, size: int = _CAPTION_SIZE) -> tuple[str, ...]:
    """Wrap one caption cue so libass never has to guess at a break point."""
    return tuple(wrap_text(text, ImageFont.truetype(find_font(), size), max_width))


def caption_font(text: str) -> tuple[str, str]:
    """Return the family name and directory of a font that can render ``text``."""
    path = find_font()
    if any("\u0e00" <= character <= "\u0e7f" for character in text):
        for candidate in _THAI_FONT_CANDIDATES:
            if Path(candidate).is_file():
                path = candidate
                break
    family = ImageFont.truetype(path, 32).getname()[0] or "Sans"
    return family, str(Path(path).parent)


# ---------------------------------------------------------------- background


def _lerp(start: Colour, end: Colour, t: float) -> Colour:
    return (
        round(start[0] + (end[0] - start[0]) * t),
        round(start[1] + (end[1] - start[1]) * t),
        round(start[2] + (end[2] - start[2]) * t),
    )


def _sample(stops: list[tuple[float, Colour]], t: float) -> Colour:
    for (left, first), (right, second) in pairwise(stops):
        if t <= right:
            span = right - left
            return _lerp(first, second, 0.0 if span <= 0 else (t - left) / span)
    return stops[-1][1]


def _vertical_gradient(stops: list[tuple[float, Colour]]) -> Image.Image:
    strip = Image.new("RGB", (1, HEIGHT))
    strip.putdata([_sample(stops, y / (HEIGHT - 1)) for y in range(HEIGHT)])
    return strip.resize((WIDTH, HEIGHT))


def _pagoda(
    draw: ImageDraw.ImageDraw, cx: float, base_y: float, scale: float, fill: tuple[int, ...]
) -> None:
    """Stacked eaves with upturned tips — the region's most legible silhouette."""
    draw.rectangle([cx - 150 * scale, base_y - 22 * scale, cx + 150 * scale, base_y], fill=fill)  # type: ignore[arg-type]
    y = base_y - 22 * scale
    for half, body, roof in ((196, 62, 52), (162, 56, 46), (126, 50, 42)):
        h, b, r = half * scale, body * scale, roof * scale
        draw.rectangle([cx - h * 0.6, y - b, cx + h * 0.6, y], fill=fill)  # type: ignore[arg-type]
        y -= b
        draw.polygon(  # type: ignore[arg-type]
            [
                (cx - h, y - r * 0.3),
                (cx - h * 0.64, y - r),
                (cx + h * 0.64, y - r),
                (cx + h, y - r * 0.3),
                (cx + h * 0.78, y - r * 0.52),
                (cx, y - r * 0.64),
                (cx - h * 0.78, y - r * 0.52),
            ],
            fill=fill,
        )
        y -= r * 0.92
    draw.polygon(  # type: ignore[arg-type]
        [(cx, y - 74 * scale), (cx - 11 * scale, y), (cx + 11 * scale, y)], fill=fill
    )


def _translucent(scene: Image.Image, paint: Callable[[ImageDraw.ImageDraw], None]) -> None:
    """Draw one translucent element.

    Pillow's ``ImageDraw`` only blends alpha for RGB canvases; on an RGBA canvas
    it writes the colour verbatim, which renders a 30%-alpha sun as solid paint.
    Painting into a transparent layer and compositing that layer blends properly.
    """
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    paint(ImageDraw.Draw(overlay, "RGBA"))
    scene.alpha_composite(overlay)


def _scene(scene: Image.Image) -> None:
    """A temple complex on a low hill, held inside a setting sun."""
    disc_x, disc_y, disc_r = 540, 986, 348
    box = [disc_x - disc_r, disc_y - disc_r, disc_x + disc_r, disc_y + disc_r]

    _translucent(scene, lambda draw: draw.ellipse(box, fill=(*_TERRACOTTA, 112)))
    _translucent(
        scene,
        lambda draw: draw.ellipse(box, outline=(*_TERRACOTTA, 150), width=3),
    )

    def far_hills(draw: ImageDraw.ImageDraw) -> None:
        draw.polygon(
            [
                (-20, 1242),
                (150, 1198),
                (360, 1234),
                (540, 1190),
                (760, 1236),
                (960, 1202),
                (WIDTH + 20, 1240),
                (WIDTH + 20, 1330),
                (-20, 1330),
            ],
            fill=(*_JADE, 38),
        )

    _translucent(scene, far_hills)

    def temples(draw: ImageDraw.ImageDraw) -> None:
        _pagoda(draw, 232, 1268, 0.62, (*_JADE, 168))
        _pagoda(draw, 848, 1278, 0.58, (*_JADE, 168))
        _pagoda(draw, 540, 1300, 0.92, (*_JADE, 168))

    _translucent(scene, temples)

    def ground(draw: ImageDraw.ImageDraw) -> None:
        draw.polygon(
            [
                (-20, 1334),
                (200, 1312),
                (420, 1328),
                (640, 1310),
                (860, 1330),
                (WIDTH + 20, 1316),
                (WIDTH + 20, HEIGHT + 20),
                (-20, HEIGHT + 20),
            ],
            fill=(*_JADE, 26),
        )

    _translucent(scene, ground)


def _background() -> Image.Image:
    """Warm paper under a terracotta sun and a temple skyline."""
    override = _asset("LIULIANGCHUHAI_VIDEO_BACKGROUND")
    if override is not None:
        photo = Image.open(override).convert("RGB")
        return ImageOps.fit(
            photo, (WIDTH, HEIGHT), Image.Resampling.LANCZOS, centering=(0.5, 0.42)
        ).convert("RGBA")

    scene = _vertical_gradient(
        [(0.00, _PAPER), (0.60, _PAPER), (0.90, _PAPER_DEEP), (1.00, _PAPER_DEEP)]
    ).convert("RGBA")
    _scene(scene)
    return scene


def _figure(scene: Image.Image) -> None:
    """Composite an operator-supplied cut-out; never invent a face."""
    override = _asset("LIULIANGCHUHAI_VIDEO_PRESENTER")
    if override is None:
        return
    cutout = Image.open(override).convert("RGBA")
    target_width = int(WIDTH * 0.86)
    ratio = target_width / cutout.width
    cutout = cutout.resize(
        (target_width, max(1, round(cutout.height * ratio))), Image.Resampling.LANCZOS
    )
    scene.alpha_composite(cutout, ((WIDTH - cutout.width) // 2, HEIGHT - cutout.height))


def _vignette(scene: Image.Image) -> None:
    """Warm the corners so the title and the skyline hold focus."""
    mask = Image.radial_gradient("L").resize((WIDTH, HEIGHT))
    mask = mask.point(lambda value: int(value * 0.22))
    shade = Image.new("RGBA", (WIDTH, HEIGHT), (112, 84, 58, 0))
    shade.putalpha(mask)
    scene.alpha_composite(shade)


def _scrim(scene: Image.Image) -> None:
    """Clean paper behind the caption band, whatever sits under it."""
    band = Image.new("RGBA", (1, 460))
    band.putdata([(250, 246, 236, int(215 * (index / 459) ** 1.5)) for index in range(460)])
    scene.alpha_composite(band.resize((WIDTH, 460)), (0, HEIGHT - 460))


# ------------------------------------------------------------------- layout


def _fit_title(text: str, bold_path: str) -> tuple[ImageFont.FreeTypeFont, list[str]]:
    """Shrink the headline until it fits two lines, then ellipsize."""
    lines: list[str] = []
    font = ImageFont.truetype(bold_path, 54)
    for size in (88, 80, 72, 66, 60, 54):
        font = ImageFont.truetype(bold_path, size)
        lines = wrap_text(text, font, _TITLE_MAX_WIDTH)
        if len(lines) <= 2:
            return font, lines
    lines = lines[:2]
    if lines:
        lines[-1] = _ellipsize(lines[-1], font, _TITLE_MAX_WIDTH)
    return font, lines


def _draw_blocking(spec: PosterSpec, destination: Path) -> Path:
    scene = _background()
    _vignette(scene)
    _figure(scene)
    _scrim(scene)

    draw = ImageDraw.Draw(scene, "RGBA")
    bold_path = find_font(bold=True)
    try:
        title_font, title_lines = _fit_title(spec.title, bold_path)
        foot_font = ImageFont.truetype(find_font(), 34)
        seal_font = ImageFont.truetype(bold_path, 56)
    except OSError as error:
        raise DigitalHumanUnavailable("unreadable font for video rendering") from error

    # Seal, top-left, echoing the paper chop on the site.
    draw.rounded_rectangle([72, 88, 216, 232], radius=28, fill=(*_JADE, 255))
    draw.text((144, 160), "桂", font=seal_font, fill=(*_PAPER, 255), anchor="mm")

    cursor = _TITLE_TOP
    for line in title_lines:
        draw.text((WIDTH // 2, cursor), line, font=title_font, fill=(*_INK, 255), anchor="ma")
        cursor += round(title_font.size * 1.32)

    rule_y = cursor + 28
    draw.rounded_rectangle(
        [WIDTH // 2 - 54, rule_y, WIDTH // 2 + 54, rule_y + 6], radius=3, fill=(*_TERRACOTTA, 255)
    )

    # Footer sits on its own chip so it survives any background, drawn or photo.
    footer = f"{spec.brand} · {spec.subtitle}"
    footer_width = round(foot_font.getlength(footer))
    draw.rounded_rectangle(
        [
            WIDTH // 2 - footer_width // 2 - 30,
            HEIGHT - 118,
            WIDTH // 2 + footer_width // 2 + 30,
            HEIGHT - 44,
        ],
        radius=37,
        fill=(*_PAPER, 255),
    )
    draw.text((WIDTH // 2, HEIGHT - 60), footer, font=foot_font, fill=(*_MUTED, 255), anchor="ms")

    destination.parent.mkdir(parents=True, exist_ok=True)
    scene.convert("RGB").save(destination, format="PNG", optimize=True)
    return destination


async def draw(destination: Path, *, title: str, language: str) -> Path:
    """Render the frame off the event loop so a long script cannot block it."""
    spec = _spec(title=title, language=language)
    return await asyncio.to_thread(_draw_blocking, spec, destination)


def _spec(*, title: str, language: str) -> PosterSpec:
    return PosterSpec(title=title, brand="流量出海", subtitle=f"广西 · {language}")


def font_available() -> bool:
    """Cheap availability check used by the health endpoint."""
    try:
        find_font()
        find_font(bold=True)
    except DigitalHumanUnavailable:
        return False
    return True


__all__ = [
    "HEIGHT",
    "WIDTH",
    "PosterSpec",
    "asset_signature",
    "caption_font",
    "caption_lines",
    "caption_margin_v",
    "caption_max_width",
    "caption_size",
    "draw",
    "find_font",
    "font_available",
    "wrap_text",
]
