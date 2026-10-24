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


async def render(
    *,
    poster: Path,
    audio: Path,
    subtitles: Path,
    destination: Path,
    duration_seconds: float,
    timeout_seconds: float,
    frames_per_second: int = 2,
) -> Path:
    """Mux the still poster, the narration and the burned-in captions."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    # Paths reach ffmpeg through the filter string; escape the Windows drive colon
    # the way libass expects (forward slashes plus an escaped colon).
    subtitle_arg = str(subtitles).replace("\\", "/").replace(":", r"\:")

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
            f"scale=1080:1920:force_original_aspect_ratio=decrease,"
            f"pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xf7f5ee,"
            f"subtitles='{subtitle_arg}':force_style="
            "'FontName=Microsoft YaHei,FontSize=15,PrimaryColour=&H00211E26,"
            "OutlineColour=&H00ECEFE2,BorderStyle=3,Outline=1,Shadow=0,MarginV=40'"
        ),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-tune",
        "stillimage",
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
) -> Path:
    """Burn captions into an existing clip, re-encoding only what changed.

    Used by provider adapters that return a finished talking-head render: the
    remote service owns the picture, so only the caption overlay happens here.
    """
    destination.parent.mkdir(parents=True, exist_ok=True)
    # libass reads the path out of the filter string, so a Windows drive colon
    # must be escaped the way ffmpeg's own filter escaping expects.
    subtitle_arg = str(subtitles).replace("\\", "/").replace(":", r"\:")

    arguments = [
        ffmpeg_path(),
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(video),
        "-vf",
        (
            f"subtitles='{subtitle_arg}':force_style="
            "'FontName=Microsoft YaHei,FontSize=15,PrimaryColour=&H00211E26,"
            "OutlineColour=&H00ECEFE2,BorderStyle=3,Outline=1,Shadow=0,MarginV=40'"
        ),
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
