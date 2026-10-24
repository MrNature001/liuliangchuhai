from pathlib import Path

import pytest
from liuliangchuhai.infrastructure.digital_human.local_presenter import avatar_clip
from liuliangchuhai.infrastructure.digital_human.mux import is_video_clip, plan_scenes

FADE = 0.7


def test_footage_suffixes_are_told_apart_from_stills() -> None:
    assert is_video_clip(Path("avatar.mp4"))
    assert is_video_clip(Path("AVATAR.MOV"))
    assert is_video_clip(Path("clip.webm"))
    assert not is_video_clip(Path("opening.png"))
    assert not is_video_clip(Path("poster"))


def test_avatar_clip_is_found_in_the_media_directory(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.delenv("LIULIANGCHUHAI_AVATAR_CLIP", raising=False)
    assert avatar_clip(tmp_path) is None

    clip = tmp_path / "avatar.mp4"
    clip.write_bytes(b"not really a video")

    assert avatar_clip(tmp_path) == clip


def test_avatar_clip_honours_the_override_but_ignores_a_missing_file(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("LIULIANGCHUHAI_AVATAR_CLIP", str(tmp_path / "missing.mp4"))
    assert avatar_clip(tmp_path) is None

    clip = tmp_path / "elsewhere.mp4"
    clip.write_bytes(b"x")
    monkeypatch.setenv("LIULIANGCHUHAI_AVATAR_CLIP", str(clip))

    assert avatar_clip(tmp_path) == clip


def test_one_scene_uses_the_whole_clip() -> None:
    plan, fade = plan_scenes(1, 12.0, FADE, [1.0])

    assert plan == [12.0]
    assert fade == 0.0


def test_scene_durations_cover_the_audio_once_the_fades_are_subtracted() -> None:
    plan, fade = plan_scenes(3, 20.0, FADE, [0.34, 0.44, 0.22])

    assert fade == pytest.approx(FADE)
    assert len(plan) == 3
    assert sum(plan) - fade * 2 == pytest.approx(20.0)
    # The body scene holds the longest.
    assert plan[1] > plan[0] > plan[2]


def test_a_short_clip_collapses_to_a_single_scene() -> None:
    plan, fade = plan_scenes(3, 1.2, FADE, [0.34, 0.44, 0.22])

    assert plan == [1.2]
    assert fade == 0.0


def test_missing_or_mismatched_weights_fall_back_to_equal_shares() -> None:
    even, _ = plan_scenes(3, 20.0, FADE, None)
    mismatched, _ = plan_scenes(3, 20.0, FADE, [1.0])

    assert even == pytest.approx([20.0 / 3 + FADE * 2 / 3] * 3)
    assert mismatched == pytest.approx(even)
