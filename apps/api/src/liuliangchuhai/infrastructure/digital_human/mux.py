"""Audio/video assembly for the local presenter.

ffmpeg is pulled from the ``imageio-ffmpeg`` wheel so the demo needs no system
install, no GPU and no account. Captions are burned in from an SRT generated
by :mod:`timeline`, which keeps the shipped video self-describing when the
viewer plays it outside the app.
"""

from __future__ import annotations

import asyncio
import shutil
import subprocess
from pathlib import Path

from liuliangchuhai.application.ports.digital_human_errors import (
    DigitalHumanDeadlineExceeded,
    DigitalHumanUnavailable,
)


def ffmpeg_path() -> str:
    """Resolve an ffmpeg binary, preferring the bundled wheel."""
    try:
        import imageio_ffmpeg  # type: ignore[import-untyped]
    except ImportError:  # pragma: no cover - the wheel is a declared dependency
        bundled = ""
    else:
        bundled = imageio_ffmpeg.get_ffmpeg_exe()
    if bundled and Path(bundled).is_file():
        return bundled
    system = shutil.which("ffmpeg")
    if system:
        return system
    raise DigitalHumanUnavailable("ffmpeg is not available for video rendering")


def _probe_blocking(media: Path) -> float:
    process = subprocess.run(
        [ffmpeg_path(), "-hide_banner", "-i", str(media)],
        capture_output=True,
        text=True,
        check=False,
    )
    banner = process.stderr
    for line in banner.splitlines():
        if "Duration:" not in line:
            continue
        stamp = line.split("Duration:", 1)[1].split(",", 1)[0].strip()
        hours, minutes, seconds = stamp.split(":")
        return int(hours) * 3600 + int(minutes) * 60 + float(seconds)
    raise DigitalHumanUnavailable("unreadable audio duration")


def ffmpeg_available() -> bool:
    """Report whether a usable ffmpeg binary exists."""
    try:
        return bool(ffmpeg_path())
    except DigitalHumanUnavailable:
        return False


async def probe_duration(media: Path) -> float:
    """Read a media duration off the event loop, from ffmpeg's stderr banner."""
    return await asyncio.to_thread(_probe_blocking, media)


def _run_blocking(arguments: list[str], timeout_seconds: float) -> None:
    """Run ffmpeg in a worker thread.

    asyncio subprocess transports are unavailable on the selector event loop that
    uvicorn's reloader uses on Windows, so the blocking API is the portable one.
    """
    try:
        completed = subprocess.run(
            arguments,
            capture_output=True,
            timeout=timeout_seconds,
            check=False,
        )
    except subprocess.TimeoutExpired:
        raise DigitalHumanDeadlineExceeded("video assembly exceeded the local deadline") from None
    except OSError as error:
        raise DigitalHumanUnavailable("ffmpeg could not be started") from error
    if completed.returncode != 0:
        tail = completed.stderr.decode("utf-8", "replace").strip().splitlines()[-1:]
        raise DigitalHumanUnavailable(f"ffmpeg failed: {tail[0] if tail else completed.returncode}")


async def _run(arguments: list[str], *, timeout_seconds: float) -> None:
    await asyncio.to_thread(_run_blocking, arguments, timeout_seconds)


_MAX_ZOOM = 1.08
_SUBTITLE_FILTER = "subtitles='{subtitles}'"


def _subtitle_filter(subtitles: Path, font_dir: Path | None) -> str:
    """Build the libass filter argument with Windows-safe escaping."""
    # libass reads the path out of the filter string; a drive colon must be
    # escaped the way ffmpeg's own filter escaping expects.
    escaped = str(subtitles).replace("\\", "/").replace(":", r"\:")
    argument = _SUBTITLE_FILTER.format(subtitles=escaped)
    if font_dir is not None:
        font_path = str(font_dir).replace("\\", "/").replace(":", r"\:")
        argument += f":fontsdir='{font_path}'"
    return argument


async def render(
    *,
    poster: Path,
    audio: Path,
    subtitles: Path,
    destination: Path,
    duration_seconds: float,
    timeout_seconds: float,
    font_dir: Path | None = None,
    frames_per_second: int = 25,
) -> Path:
    """Mux the poster, the narration and the burned-in captions.

    A slow push-in keeps the clip from reading as a frozen slide; the zoom is
    applied to the art only, before the captions, so the text never softens.
    """
    destination.parent.mkdir(parents=True, exist_ok=True)
    frames = max(1, round(duration_seconds * frames_per_second))
    step = (_MAX_ZOOM - 1.0) / frames

    arguments = [
        ffmpeg_path(),
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-loop",
        "1",
        "-framerate",
        str(frames_per_second),
        "-i",
        str(poster),
        "-i",
        str(audio),
        "-vf",
        (
            f"scale=1620:2880:flags=lanczos,"
            f"zoompan=z='min(1+{step:.8f}*on,{_MAX_ZOOM})':"
            "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            f"d=1:s=1080x1920:fps={frames_per_second},"
            f"{_subtitle_filter(subtitles, font_dir)}"
        ),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-pix_fmt",
        "yuv420p",
        "-r",
        str(frames_per_second),
        "-t",
        f"{duration_seconds:.3f}",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-shortest",
        "-movflags",
        "+faststart",
        str(destination),
    ]
    await _run(arguments, timeout_seconds=timeout_seconds)
    if not destination.is_file() or destination.stat().st_size == 0:
        raise DigitalHumanUnavailable("ffmpeg produced no video")
    return destination


async def burn_subtitles(
    *,
    video: Path,
    subtitles: Path,
    destination: Path,
    timeout_seconds: float,
    font_dir: Path | None = None,
) -> Path:
    """Burn captions into an existing clip, re-encoding only what changed.

    Used by provider adapters that return a finished talking-head render: the
    remote service owns the picture, so only the caption overlay happens here.
    """
    destination.parent.mkdir(parents=True, exist_ok=True)

    arguments = [
        ffmpeg_path(),
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(video),
        "-vf",
        _subtitle_filter(subtitles, font_dir),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "copy",
        "-movflags",
        "+faststart",
        str(destination),
    ]
    await _run(arguments, timeout_seconds=timeout_seconds)
    if not destination.is_file() or destination.stat().st_size == 0:
        raise DigitalHumanUnavailable("ffmpeg produced no captioned video")
    return destination


__all__ = [
    "burn_subtitles",
    "ffmpeg_available",
    "ffmpeg_path",
    "probe_duration",
    "render",
]
