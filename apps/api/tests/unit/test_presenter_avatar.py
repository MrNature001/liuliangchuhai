import subprocess
from pathlib import Path

import pytest
from liuliangchuhai.infrastructure.digital_human import avatar, mux


def _audio(tmp_path: Path, source: str) -> Path:
    tmp_path.mkdir(parents=True, exist_ok=True)
    path = tmp_path / "clip.mp3"
    subprocess.run(
        [
            mux.ffmpeg_path(),
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-f",
            "lavfi",
            "-i",
            source,
            "-t",
            "2",
            str(path),
        ],
        check=True,
        timeout=60,
    )
    return path


@pytest.mark.asyncio
async def test_loudness_returns_one_value_per_frame(tmp_path: Path) -> None:
    values = await avatar.loudness(_audio(tmp_path, "sine=frequency=440"), 50)

    assert len(values) == 50
    assert all(0.0 <= value <= 1.0 for value in values)


@pytest.mark.asyncio
async def test_speech_moves_the_mouth_and_silence_barely_does(tmp_path: Path) -> None:
    spoken = await avatar.loudness(_audio(tmp_path, "sine=frequency=300"), 40)
    silent = await avatar.loudness(_audio(tmp_path / "quiet", "anullsrc=r=24000:cl=mono"), 40)

    assert sum(spoken) / len(spoken) > 0.6
    assert sum(silent) / len(silent) < 0.2


@pytest.mark.asyncio
async def test_build_encodes_a_clip_of_the_requested_length(tmp_path: Path) -> None:
    audio = _audio(tmp_path, "sine=frequency=300")
    clip = await avatar.build(
        audio=audio, destination=tmp_path / "avatar.mp4", duration_seconds=2.0, fps=25
    )

    assert clip.stat().st_size > 10_000
    assert await mux.probe_duration(clip) == pytest.approx(2.0, abs=0.2)
