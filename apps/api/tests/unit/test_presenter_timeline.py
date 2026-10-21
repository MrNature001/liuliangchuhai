import itertools

import pytest
from liuliangchuhai.infrastructure.digital_human.timeline import (
    Caption,
    build_timeline,
    estimate_seconds,
    rescale,
    split_sentences,
    srt_timestamp,
    to_srt,
)


def test_sentences_keep_punctuation_and_drop_blanks() -> None:
    script = "六堡茶来自梧州。它适合冲泡！  Is it good?  \n\n 是。"

    assert split_sentences(script) == (
        "六堡茶来自梧州。",
        "它适合冲泡！",
        "Is it good?",
        "是。",
    )


def test_split_handles_scripts_without_spaces() -> None:
    assert split_sentences("สวัสดีครับวันนี้อากาศดี") == ("สวัสดีครับวันนี้อากาศดี",)


def test_estimate_seconds_grows_with_length() -> None:
    assert estimate_seconds("茶") < estimate_seconds("这是一句更长的话，用于测试语速估计。")
    assert estimate_seconds("") == pytest.approx(0.9)


def test_build_timeline_covers_the_whole_duration_without_overlaps() -> None:
    captions = build_timeline("第一句。第二句。第三句。", 9.0)

    assert len(captions) == 3
    assert captions[0].start == 0.0
    assert captions[-1].end == pytest.approx(9.0)
    for earlier, later in itertools.pairwise(captions):
        assert earlier.end <= later.start


def test_build_timeline_returns_nothing_for_missing_input() -> None:
    assert build_timeline("", 5.0) == ()
    assert build_timeline("有内容。", 0.0) == ()


def test_rescale_is_a_no_op_within_tolerance() -> None:
    captions = (Caption(0.0, 4.9, "句子"),)

    assert rescale(captions, 5.0) == captions


def test_rescale_stretches_when_the_audio_is_longer() -> None:
    captions = (Caption(0.0, 2.0, "一"), Caption(2.0, 4.0, "二"))

    stretched = rescale(captions, 8.0)

    assert stretched[0].start == 0.0
    assert stretched[-1].end == pytest.approx(8.0)
    assert stretched[0].end == pytest.approx(4.0)


def test_srt_uses_millisecond_timestamps_and_sequential_indices() -> None:
    text = to_srt((Caption(0.0, 1.5, "第一句"), Caption(1.5, 61.25, "第二句")))

    assert "1\n00:00:00,000 --> 00:00:01,500\n第一句" in text
    assert "2\n00:00:01,500 --> 00:01:01,250\n第二句" in text


def test_srt_timestamp_handles_zero_and_large_values() -> None:
    assert srt_timestamp(0) == "00:00:00,000"
    assert srt_timestamp(3661.5) == "01:01:01,500"
    assert srt_timestamp(-3) == "00:00:00,000"
