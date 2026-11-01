"""Draw the three sales cards used to list the service.

Text-heavy cards are drawn with Pillow rather than an image model: models
mangle Chinese glyphs, and a price with a wrong character is worse than no
price at all.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1080, 1440
OUT = Path("接单/销售素材")

PAPER = (250, 246, 236)
PAPER_DEEP = (240, 232, 214)
INK = (38, 44, 38)
MUTED = (108, 112, 98)
JADE = (45, 92, 74)
TERRACOTTA = (196, 108, 74)

BOLD = "C:/Windows/Fonts/msyhbd.ttc"
REGULAR = "C:/Windows/Fonts/msyh.ttc"


def font(size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(BOLD if bold else REGULAR, size)


def canvas() -> Image.Image:
    strip = Image.new("RGB", (1, HEIGHT))
    strip.putdata(
        [
            tuple(
                round(a + (b - a) * (y / (HEIGHT - 1)))
                for a, b in zip(PAPER, PAPER_DEEP, strict=True)
            )
            for y in range(HEIGHT)
        ]
    )
    return strip.resize((WIDTH, HEIGHT)).convert("RGBA")


def wrap(text: str, f: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for character in text:
        candidate = current + character
        if current and f.getlength(candidate) > width:
            lines.append(current)
            current = character
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def seal(draw: ImageDraw.ImageDraw) -> None:
    draw.rounded_rectangle([72, 72, 216, 216], radius=28, fill=JADE)
    draw.text((144, 144), "桂", font=font(56, bold=True), fill=PAPER, anchor="mm")


def card_one() -> Image.Image:
    image = canvas()
    draw = ImageDraw.Draw(image, "RGBA")
    seal(draw)

    draw.text((96, 320), "AI 商品图", font=font(104, bold=True), fill=INK)
    draw.text((96, 448), "和短视频", font=font(104, bold=True), fill=INK)
    draw.rounded_rectangle([96, 588, 246, 596], radius=4, fill=TERRACOTTA)

    draw.text(
        (96, 660), "广西特产 · 茶叶 · 食品 · 手作", font=font(44), fill=MUTED
    )
    draw.text((96, 726), "有产品就能做，不需要拍摄团队", font=font(44), fill=MUTED)

    rows = [
        ("01", "一张配图", "按商品定制场景，不是网图拼贴"),
        ("02", "10 秒短视频", "竖屏，直接发抖音小红书"),
        ("03", "六套文案", "中英文都有，卖点/口播/社媒"),
    ]
    y = 880
    for number, title, detail in rows:
        draw.text((96, y), number, font=font(56, bold=True), fill=TERRACOTTA)
        draw.text((200, y - 4), title, font=font(52, bold=True), fill=INK)
        draw.text((200, y + 62), detail, font=font(38), fill=MUTED)
        y += 170
    return image


def card_two() -> Image.Image:
    image = canvas()
    draw = ImageDraw.Draw(image, "RGBA")
    seal(draw)

    draw.text((96, 280), "一套物料长这样", font=font(84, bold=True), fill=INK)
    draw.text((96, 392), "两个广西商品的真实产出", font=font(40), fill=MUTED)

    photo = Path("提交材料/02_商品内容/梧州六堡茶/梧州六堡茶-配图.png")
    if photo.is_file():
        with Image.open(photo) as opened:
            picture = opened.convert("RGB")
            picture.thumbnail((440, 660))
            image.paste(picture, (96, 520))

    text_x = 600
    draw.text((text_x, 560), "文案", font=font(48, bold=True), fill=JADE)
    for index, line in enumerate(
        ["市场判断", "核心卖点 3 条", "图片提示词", "短视频脚本", "直播话术", "社媒文案"]
    ):
        draw.text(
            (text_x, 640 + index * 56), f"· {line}", font=font(38), fill=INK
        )
    draw.text((text_x, 1010), "配图 ×1", font=font(48, bold=True), fill=JADE)
    draw.text((text_x, 1080), "短视频 ×1（10 秒）", font=font(48, bold=True), fill=JADE)
    return image


def card_three() -> Image.Image:
    image = canvas()
    draw = ImageDraw.Draw(image, "RGBA")
    seal(draw)

    draw.text((96, 280), "怎么收费", font=font(84, bold=True), fill=INK)

    rows = [
        ("单张配图", "¥30", "含 1 次修改"),
        ("10 秒短视频", "¥80", "竖屏，可直接投放"),
        ("一整套物料", "¥200", "配图 + 视频 + 六套文案"),
        ("加数字人口播", "¥100", "用你的照片，说出文案"),
    ]
    y = 440
    for name, price, detail in rows:
        draw.rounded_rectangle([96, y, 984, y + 176], radius=24, fill=(255, 255, 255, 190))
        draw.text((136, y + 40), name, font=font(46, bold=True), fill=INK)
        draw.text((136, y + 104), detail, font=font(32), fill=MUTED)
        draw.text((900, y + 56), price, font=font(56, bold=True), fill=TERRACOTTA, anchor="ra")
        y += 196

    draw.text((96, y + 30), "两到三天交付 · 先看样再决定", font=font(40), fill=MUTED)
    draw.text((96, y + 100), "微信：", font=font(44, bold=True), fill=INK)
    draw.line([200, y + 130, 700, y + 130], fill=MUTED, width=3)
    return image


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for index, card in enumerate((card_one, card_two, card_three), start=1):
        path = OUT / f"{index}-{'介绍' if index == 1 else '案例' if index == 2 else '价格'}.png"
        card().convert("RGB").save(path, optimize=True)
        print(path, flush=True)


if __name__ == "__main__":
    main()
