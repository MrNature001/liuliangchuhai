from pathlib import Path

import pytest
from liuliangchuhai.infrastructure.digital_human import poster
from PIL import Image


@pytest.mark.asyncio
async def test_frame_is_a_full_bleed_vertical_clip_still(tmp_path: Path) -> None:
    path = await poster.draw(tmp_path / "poster.png", title="六堡茶", language="中文")

    with Image.open(path) as image:
        assert image.size == (poster.WIDTH, poster.HEIGHT)
        assert image.format == "PNG"


@pytest.mark.asyncio
async def test_frame_is_drawn_rather_than_blank(tmp_path: Path) -> None:
    path = await poster.draw(
        tmp_path / "poster.png", title="Six堡 tea from Wuzhou", language="英语"
    )

    with Image.open(path).convert("RGB") as image:
        extrema = image.getextrema()
    # A blank canvas would report min == max on every channel.
    assert any(low != high for low, high in extrema)


def test_wrap_prefers_word_boundaries() -> None:
    font = _font(48)

    lines = poster.wrap_text("Hello, and welcome to a quiet moment with tea.", font, 700)

    assert len(lines) > 1
    assert all(line == " ".join(line.split()) for line in lines)
    assert not any(line.endswith("-") for line in lines)
    # Words stay whole: no line may start mid-word.
    expected = ["Hello,", "and", "welcome", "to", "a", "quiet", "moment", "with", "tea."]
    assert " ".join(lines).split() == expected


def test_wrap_never_opens_a_line_with_closing_punctuation() -> None:
    font = _font(54)
    text = "梧州六堡茶来自广西梧州，茶汤红浓，适合作为礼物。"

    for width in (320, 420, 520):
        lines = poster.wrap_text(text, font, width)
        assert all(not line.startswith(("，", "。", "、")) for line in lines)


def test_wrap_still_splits_scripts_without_spaces() -> None:
    font = _font(48)

    lines = poster.wrap_text("สวัสดีครับวันนี้อากาศดีมาก", font, 300)

    assert len(lines) > 1
    assert "".join(lines) == "สวัสดีครับวันนี้อากาศดีมาก"


@pytest.mark.asyncio
async def test_background_override_replaces_the_drawn_scene(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    photo = tmp_path / "photo.png"
    Image.new("RGB", (600, 900), (255, 0, 255)).save(photo)
    monkeypatch.setenv("LIULIANGCHUHAI_VIDEO_BACKGROUND", str(photo))

    path = await poster.draw(tmp_path / "poster.png", title="六堡茶", language="中文")

    with Image.open(path).convert("RGB") as image:
        red, green, _ = image.getpixel((12, 12))
    # Paper would keep all three channels high; magenta keeps green near zero.
    assert red > 140
    assert green < 100


def test_asset_signature_notices_a_new_photo(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.delenv("LIULIANGCHUHAI_VIDEO_BACKGROUND", raising=False)
    baseline = poster.asset_signature()

    photo = tmp_path / "photo.png"
    Image.new("RGB", (40, 40), (10, 20, 30)).save(photo)
    monkeypatch.setenv("LIULIANGCHUHAI_VIDEO_BACKGROUND", str(photo))

    assert poster.asset_signature() != baseline


def test_caption_font_resolves_a_family_name() -> None:
    family, directory = poster.caption_font("六堡茶来自梧州")

    assert family
    assert Path(directory).is_dir()


def test_caption_lines_fit_the_declared_width() -> None:
    from PIL import ImageFont

    lines = poster.caption_lines(
        "Hello, and welcome to a quiet moment with Wuzhou Liubao tea.",
        max_width=poster.caption_max_width(),
    )
    font = ImageFont.truetype(poster.find_font(), poster.caption_size())

    assert lines
    assert all(font.getlength(line) <= poster.caption_max_width() for line in lines)


def _font(size: int):
    from PIL import ImageFont

    return ImageFont.truetype(poster.find_font(), size)
