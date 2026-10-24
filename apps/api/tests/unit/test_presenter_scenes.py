import pytest
from liuliangchuhai.infrastructure.digital_human.mux import plan_scenes

FADE = 0.7


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
