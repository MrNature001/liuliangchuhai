import pytest
from liuliangchuhai.infrastructure.digital_human.speech import resolve_voice


@pytest.mark.parametrize(
    ("language", "voice"),
    [
        ("中文", "zh-CN-XiaoxiaoNeural"),
        ("Chinese", "zh-CN-XiaoxiaoNeural"),
        ("zh-CN", "zh-CN-XiaoxiaoNeural"),
        ("English", "en-US-AvaNeural"),
        ("en", "en-US-AvaNeural"),
        ("Tiếng Việt", "vi-VN-HoaiMyNeural"),
        ("thai", "th-TH-PremwadeeNeural"),
        ("Bahasa Melayu", "ms-MY-YasminNeural"),
        ("Indonesian", "id-ID-GadisNeural"),
    ],
)
def test_language_labels_map_to_a_regional_voice(language: str, voice: str) -> None:
    assert resolve_voice(language) == voice


def test_unknown_language_falls_back_to_english() -> None:
    assert resolve_voice("Klingon") == "en-US-AvaNeural"
