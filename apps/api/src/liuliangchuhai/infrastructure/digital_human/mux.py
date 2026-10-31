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
from collections.abc import Sequence
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
    # ffmpeg's banner can carry UTF-8 metadata; decode it explicitly so a
    # non-UTF-8 system locale cannot crash the probe.
    process = subprocess.run(
        [ffmpeg_path(), "-hide_banner", "-i", str(media)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
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
_CROSSFADE_SECONDS = 0.7
_SUBTITLE_FILTER = "subtitles='{subtitles}'"
_VIDEO_SUFFIXES = frozenset({".mp4", ".mov", ".mkv", ".webm", ".m4v"})


def is_video_clip(scene: Path) -> bool:
    """Whether a scene is moving footage rather than a still frame."""
    return scene.suffix.lower() in _VIDEO_SUFFIXES


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


def _scene_input(scene: Path, seconds: float, frames_per_second: int) -> list[str]:
    """One input per scene; footage loops so it can fill a longer narration."""
    if is_video_clip(scene):
        return ["-stream_loop", "-1", "-t", f"{seconds:.3f}", "-i", str(scene)]
    return [
        "-loop",
        "1",
        "-framerate",
        str(frames_per_second),
        "-t",
        f"{seconds:.3f}",
        "-i",
        str(scene),
    ]


def _scene_chain(index: int, scene: Path, frames: int, frames_per_second: int) -> str:
    """Land one scene on the delivery format, pushing stills in slowly."""
    if is_video_clip(scene):
        # Footage already moves; crop it to the vertical frame and match the rate.
        return (
            f"[{index}:v]scale=1080:1920:force_original_aspect_ratio=increase,"
            f"crop=1080:1920,fps={frames_per_second},setsar=1,format=yuv420p[v{index}]"
        )
    step = (_MAX_ZOOM - 1.0) / max(1, frames)
    return (
        f"[{index}:v]scale=1620:2880:flags=lanczos,"
        f"zoompan=z='min(1+{step:.8f}*on,{_MAX_ZOOM})':"
        "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
        f"d=1:s=1080x1920:fps={frames_per_second},setsar=1,format=yuv420p[v{index}]"
    )


def plan_scenes(
    scene_count: int, duration_seconds: float, fade: float, weights: list[float] | None
) -> tuple[list[float], float]:
    """Split the clip across scenes so the cross-fades still sum to the audio.

    Returns the on-screen duration of each scene and the fade length actually
    used. A clip too short for the requested cuts collapses to one scene.
    """
    if scene_count <= 1 or duration_seconds <= 0:
        return [duration_seconds], 0.0
    shares = list(weights or []) or [1.0] * scene_count
    if len(shares) != scene_count:
        shares = [1.0] * scene_count
    usable = duration_seconds + fade * (scene_count - 1)
    total = sum(shares)
    durations = [usable * share / total for share in shares]
    if any(duration <= fade + 0.25 for duration in durations):
        return [duration_seconds], 0.0
    return durations, fade


async def render(
    *,
    scenes: Sequence[Path],
    audio: Path,
    subtitles: Path,
    destination: Path,
    duration_seconds: float,
    timeout_seconds: float,
    font_dir: Path | None = None,
    frames_per_second: int = 25,
    weights: Sequence[float] | None = None,
    crossfade_seconds: float = _CROSSFADE_SECONDS,
) -> Path:
    """Mux the scenes, the narration and the burned-in captions.

    Each still gets a slow push-in, and consecutive scenes cross-fade, so the
    clip reads as edited shots rather than one frozen slide. A scene may also be
    a video clip — an avatar recorded elsewhere — which is looped and cropped to
    the vertical frame instead. Transitions are applied before the captions, so
    the text never softens.
    """
    destination.parent.mkdir(parents=True, exist_ok=True)
    plan, fade = plan_scenes(
        len(scenes), duration_seconds, crossfade_seconds, list(weights) if weights else None
    )
    stills = list(scenes)[: len(plan)]

    arguments = [ffmpeg_path(), "-y", "-hide_banner", "-loglevel", "error"]
    for scene, on_screen in zip(stills, plan, strict=True):
        arguments += _scene_input(scene, on_screen, frames_per_second)
    arguments += ["-i", str(audio)]

    graph = [
        _scene_chain(index, stills[index], round(on_screen * frames_per_second), frames_per_second)
        for index, on_screen in enumerate(plan)
    ]
    previous = "v0"
    offset = 0.0
    for index in range(1, len(plan)):
        offset += plan[index - 1] - fade
        graph.append(
            f"[{previous}][v{index}]xfade=transition=fade:duration={fade:.3f}"
            f":offset={offset:.3f}[x{index}]"
        )
        previous = f"x{index}"
    graph.append(f"[{previous}]{_subtitle_filter(subtitles, font_dir)}[vout]")

    arguments += [
        "-filter_complex",
        ";".join(graph),
        "-map",
        "[vout]",
        "-map",
        f"{len(stills)}:a",
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
    "is_video_clip",
    "plan_scenes",
    "probe_duration",
    "render",
]
