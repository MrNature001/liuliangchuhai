"""Run the demo once per product and assemble the submission folder."""

from __future__ import annotations

import json
import shutil
import time
from pathlib import Path

import httpx

API = "http://127.0.0.1:8000"
MEDIA = Path("apps/api/media")
OUT = Path("提交材料")

PRODUCTS = [
    ("wuzhou-liubao-tea", "梧州六堡茶", "Wuzhou Liubao Tea"),
    ("beihai-salted-duck-egg", "北海咸鸭蛋", "Beihai Salted Duck Egg"),
]
COUNTRY = "Malaysia"
LANGUAGE = "英语"


def call(method: str, path: str, payload=None, timeout=600):
    with httpx.Client(trust_env=False, timeout=timeout) as client:
        response = client.request(method, API + path, json=payload)
    if response.status_code != 200:
        raise RuntimeError(f"{path} -> {response.status_code} {response.text[:200]}")
    return response.json()


def fetch(media_url: str, destination: Path) -> Path:
    """Copy a rendered file out of the served media directory."""
    source = MEDIA / Path(media_url).name
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)
    return destination


def write_copy(path: Path, product: str, plan: dict, analysis: dict) -> None:
    lines = [
        f"# {product}",
        "",
        f"目标市场：{COUNTRY}　　目标语言：{LANGUAGE}",
        "",
        "## 市场判断",
        "",
        f"- 推荐等级：{analysis['recommendation']}",
        f"- 匹配分：{analysis['score']}/100",
        f"- 结论：{analysis['summary']}",
        f"- 目标人群：{'；'.join(analysis['target_audiences'])}",
        f"- 主要风险：{'；'.join(analysis['risks'])}",
        "",
        "## 核心卖点",
        "",
    ]
    lines += [f"{index}. {point}" for index, point in enumerate(plan["key_selling_points"], 1)]
    lines += [
        "",
        "## 图片提示词",
        "",
        plan["image_prompt"],
        "",
        "## 短视频创意",
        "",
        plan["short_video_idea"],
        "",
        "## 短视频脚本",
        "",
        plan["short_video_prompt"],
        "",
        "## 直播话术",
        "",
        plan["live_script"],
        "",
        "## 社媒文案",
        "",
        plan["social_caption"],
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "02_商品内容").mkdir(parents=True)

    plans: list[tuple[str, dict]] = []
    for product_id, zh_name, en_name in PRODUCTS:
        print(f"== {zh_name}", flush=True)
        analysis = call(
            "POST",
            "/product-analysis",
            {"product_id": product_id, "country": COUNTRY, "target_audience": "young urban families"},
        )
        print("  analysis ok", flush=True)
        plan = call(
            "POST",
            "/content-plan",
            {
                "product_id": product_id,
                "country": COUNTRY,
                "target_language": LANGUAGE,
                "analysis": analysis,
            },
        )
        print("  plan ok", flush=True)
        folder = OUT / "02_商品内容" / zh_name
        folder.mkdir(parents=True, exist_ok=True)
        write_copy(folder / f"{zh_name}-文案.md", zh_name, plan, analysis)

        image = call("POST", "/image", {
            "prompt": plan["image_prompt"],
            "language": LANGUAGE,
            "headline": plan["key_selling_points"][0],
        })
        fetch(image["media_url"], folder / f"{zh_name}-配图.png")
        print("  image ok", flush=True)

        clip = call("POST", "/video", {"prompt": plan["short_video_prompt"],
                                       "image_path": Path(image["media_url"]).name})
        fetch(clip["media_url"], folder / f"{zh_name}-短视频.mp4")
        print("  clip ok", flush=True)
        plans.append((zh_name, plan))

    # One presenter clip, from the first product's live script.
    zh_name, plan = plans[0]
    short = "".join(plan["live_script"].split(".")[:2]) + "."
    print("== 数字人口播", flush=True)
    video = call("POST", "/digital-human", {"script": short, "language": LANGUAGE},
                 timeout=900)
    fetch(video["media_url"], OUT / "03_数字人口播.mp4")
    print("  presenter ok", flush=True)

    index = [
        "# 提交材料",
        "",
        "本目录是「流量出海」的展示成果：真实商品走完整链路产出的文案、配图与视频。",
        "",
        "```text",
        "02_商品内容/",
        "  梧州六堡茶/          文案、配图、短视频",
        "  北海咸鸭蛋/          文案、配图、短视频",
        "03_数字人口播.mp4      用真人照片驱动的口播视频",
        "```",
        "",
        "## 每个商品包含什么",
        "",
        "| 文件 | 内容 |",
        "|---|---|",
        "| 文案.md | 市场判断、核心卖点、图片提示词、短视频创意与脚本、直播话术、社媒文案 |",
        "| 配图.png | 按图片提示词生成的真实摄影风格配图 |",
        "| 短视频.mp4 | 由配图生成的十秒动态画面 |",
        "",
        "## 生成方式",
        "",
        "全部在同一个页面里按顺序完成：选商品 → 市场分析 → 内容方案 → 生成配图 → 生成短视频。",
        "数字人口播视频使用一张真人照片，由模型驱动口型说出文案。",
        "",
        "文案由语言模型生成，配图与视频由图像/视频模型生成；商品事实以商品目录为准。",
        "",
    ]
    (OUT / "01_说明.md").write_text("\n".join(index), encoding="utf-8")
    print("DONE", flush=True)


if __name__ == "__main__":
    start = time.time()
    main()
    print(f"elapsed {time.time() - start:.0f}s", flush=True)
