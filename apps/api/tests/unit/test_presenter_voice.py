import pytest
from liuliangchuhai.infrastructure.digital_human.speech import (
    detect_script,
    resolve_voice,
    voice_candidates,
)

ZH_SCRIPT = "柳州螺蛳粉是广西柳州的招牌小吃。酸笋的发酵香气与爽滑米粉相遇。"
EN_SCRIPT = "Liuzhou luosifen is a signature snack from Guangxi."
VI_SCRIPT = "Phở chua cay là món ăn đặc trưng của Liễu Châu, Quảng Tây."
TH_SCRIPT = "อาหารขึ้นชื่อจากหลิ่วโจว มณฑลกวางสี"
ID_SCRIPT = "Ini adalah camilan khas dari Liuzhou, Guangxi."

MULTILINGUAL = "en-US-AvaMultilingualNeural"


@pytest.mark.parametrize(
    ("text", "script"),
    [
        (ZH_SCRIPT, "han"),
        (TH_SCRIPT, "thai"),
        (VI_SCRIPT, "viet"),
        (EN_SCRIPT, "latin"),
        (ID_SCRIPT, "latin"),
        ("12345 !!!", "other"),
    ],
)
def test_detect_script_classifies_writing_systems(text: str, script: str) -> None:
    assert detect_script(text) == script


@pytest.mark.parametrize(
    ("language", "voice"),
    [
        ("中文", "zh-CN-XiaoxiaoNeural"),
        ("Chinese", "zh-CN-XiaoxiaoNeural"),
        ("zh-CN", "zh-CN-XiaoxiaoNeural"),
        ("english", MULTILINGUAL),
        ("Tiếng Việt", "vi-VN-HoaiMyNeural"),
        ("thai", "th-TH-PremwadeeNeural"),
        ("Bahasa Melayu", "ms-MY-YasminNeural"),
        ("Indonesian", "id-ID-GadisNeural"),
        ("Klingon", MULTILINGUAL),
    ],
)
def test_language_labels_map_to_a_voice(language: str, voice: str) -> None:
    assert resolve_voice(language) == voice


def test_chinese_script_under_an_english_label_uses_a_chinese_voice() -> None:
    """The bug this guards: '英语' plus Chinese copy used to yield zero audio."""
    candidates = voice_candidates("英语", ZH_SCRIPT)

    assert candidates[0] == "zh-CN-XiaoxiaoNeural"
    assert "en-US-AvaNeural" not in candidates


def test_requested_voice_is_kept_when_it_speaks_the_script() -> None:
    assert voice_candidates("中文", ZH_SCRIPT)[0] == "zh-CN-XiaoxiaoNeural"
    assert voice_candidates("thai", TH_SCRIPT)[0] == "th-TH-PremwadeeNeural"


def test_english_script_under_a_chinese_label_prefers_a_latin_voice() -> None:
    candidates = voice_candidates("中文", EN_SCRIPT)

    assert candidates[0] == MULTILINGUAL
    # The Chinese voice stays available: it reads Latin text acceptably, so it is
    # a usable second attempt rather than a dead end.
    assert candidates.index(MULTILINGUAL) < len(candidates) - 1


def test_candidates_always_end_with_the_multilingual_voice() -> None:
    for language, text in [
        ("中文", ZH_SCRIPT),
        ("English", EN_SCRIPT),
        ("Thai", TH_SCRIPT),
        ("Vietnamese", VI_SCRIPT),
        ("", "???"),
    ]:
        assert voice_candidates(language, text)[-1] == MULTILINGUAL


def test_candidates_are_unique_and_never_empty() -> None:
    for language, text in [("中文", ZH_SCRIPT), ("English", EN_SCRIPT), ("thai", TH_SCRIPT)]:
        candidates = voice_candidates(language, text)
        assert candidates
        assert len(candidates) == len(set(candidates))
