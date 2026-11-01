"""Turn one client brief into a delivery folder.

Run it from the repository root:

    uv run --project apps/api python -I scripts/new_order.py 接单/客户资料/order.json

Everything happens in-process, so no server has to be running and nothing needs
restarting between orders. The brief is a small JSON file; see
``接单/客户资料/模板.json`` for the fields.
"""

from __future__ import annotations

import asyncio
import json
import shutil
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "apps/api/src"))

from liuliangchuhai.bootstrap.container import build_container  # noqa: E402
from liuliangchuhai.bootstrap.settings import Settings  # noqa: E402
from liuliangchuhai.domain.content_plan import ContentContext  # noqa: E402
from liuliangchuhai.domain.digital_human import DigitalHumanGenerationInput  # noqa: E402
from liuliangchuhai.domain.image import ImageGenerationInput  # noqa: E402
from liuliangchuhai.domain.market_analysis import MarketContext  # noqa: E402
from liuliangchuhai.domain.video import VideoGenerationInput  # noqa: E402

ORDERS = ROOT / "接单"
MEDIA = ROOT / "apps/api/media"
CATALOG = ORDERS / "商品目录.json"
DEMO_CATALOG = (
    ROOT
    / "apps/api/src/liuliangchuhai/infrastructure/products/demo_products.json"
)

REQUIRED = ("商品名", "品类", "产地", "描述", "目标国家", "目标语言", "客户名")


def load_brief(path: Path) -> dict:
    brief = json.loads(path.read_text(encoding="utf-8"))
    missing = [key for key in REQUIRED if not str(brief.get(key, "")).strip()]
    if missing:
        raise SystemExit(f"客户资料缺少：{'、'.join(missing)}")
    return brief


def register_product(brief: dict) -> str:
    """Add (or replace) the product in the working catalog and return its id."""
    if CATALOG.exists():
        records = json.loads(CATALOG.read_text(encoding="utf-8"))
    else:
        records = json.loads(DEMO_CATALOG.read_text(encoding="utf-8"))

    product_id = str(brief.get("商品编号") or f"order-{abs(hash(brief['商品名'])) % 100000}")
    record = {
        "id": product_id,
        "name": brief["商品名"],
        "category": brief["品类"],
        "description": brief["描述"],
        "origin": brief["产地"],
        "cultural_background": brief.get("文化背景") or brief["描述"],
        "images": [],
        "usage": brief.get("用法") or "按商品说明使用",
        "ingredients": brief.get("配料") or [],
        "price": brief.get("价格") or None,
        "purchase_url": brief.get("购买链接") or None,
        "name_en": brief.get("英文名") or None,
    }
    records = [item for item in records if item.get("id") != product_id]
    records.append({key: value for key, value in record.items() if value is not None})
    CATALOG.parent.mkdir(parents=True, exist_ok=True)
    CATALOG.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    return product_id


def copy_out(media_url: str, destination: Path) -> Path:
    source = MEDIA / Path(media_url).name
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)
    return destination


def write_brief_markdown(path: Path, brief: dict, analysis, plan) -> None:
    lines = [
        f"# {brief['商品名']}",
        "",
        f"客户：{brief['客户名']}　　目标市场：{brief['目标国家']}　　语言：{brief['目标语言']}",
        "",
        "## 市场判断",
        "",
        f"- 推荐等级：{analysis.recommendation.value}",
        f"- 匹配分：{analysis.score}/100",
        f"- 结论：{analysis.summary}",
        f"- 目标人群：{'；'.join(analysis.target_audiences)}",
        f"- 主要风险：{'；'.join(analysis.risks)}",
        f"- 文化优势：{'；'.join(analysis.cultural_advantages)}",
        "",
        "## 核心卖点",
        "",
        *[f"{index}. {point}" for index, point in enumerate(plan.key_selling_points, 1)],
        "",
        "## 图片提示词",
        "",
        plan.image_prompt,
        "",
        "## 短视频创意",
        "",
        plan.short_video_idea,
        "",
        "## 短视频脚本",
        "",
        plan.short_video_prompt,
        "",
        "## 直播话术",
        "",
        plan.live_script,
        "",
        "## 社媒文案",
        "",
        plan.social_caption,
        "",
        "---",
        "",
        "图片与视频由 AI 生成，商品细节以实物为准；对外投放需按《人工智能生成合成内容标识办法》标注。",
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")


async def run(brief_path: Path) -> Path:
    brief = load_brief(brief_path)
    product_id = register_product(brief)

    settings = Settings(catalog_file=str(CATALOG))
    container = build_container(settings)

    market = MarketContext(
        country=brief["目标国家"],
        target_audience=brief.get("目标人群") or None,
        market_notes=brief.get("市场备注") or None,
    )
    print("1/5 市场分析…", flush=True)
    analysis = await container.analyze_product_by_id.execute(product_id, market)

    print("2/5 内容方案…", flush=True)
    plan = await container.create_content_plan_by_id.execute(
        product_id, market, analysis, ContentContext(target_language=brief["目标语言"])
    )

    print("3/5 配图…", flush=True)
    image = await container.generate_image.execute(
        ImageGenerationInput(
            prompt=plan.image_prompt,
            language=brief["目标语言"],
            headline=plan.key_selling_points[0],
        )
    )

    clip = None
    if brief.get("生成视频", True):
        print("4/5 短视频（约一分钟）…", flush=True)
        clip = await container.generate_video.execute(
            VideoGenerationInput(
                prompt=plan.short_video_prompt, image_path=Path(image.media_url).name
            )
        )
    else:
        print("4/5 短视频：跳过（客户资料里未开启）", flush=True)

    presenter = None
    if brief.get("生成数字人"):
        print("5/5 数字人口播…", flush=True)
        script = ".".join(plan.live_script.split(".")[:2]).strip() + "."
        presenter = await container.generate_digital_human.execute(
            DigitalHumanGenerationInput(script=script, language=brief["目标语言"])
        )
    else:
        print("5/5 数字人口播：跳过（客户资料里未开启）", flush=True)

    folder = ORDERS / "交付" / f"{brief['客户名']}-{brief['商品名']}-{date.today():%Y%m%d}"
    copy_out(image.media_url, folder / f"{brief['商品名']}-配图.png")
    if clip is not None:
        copy_out(clip.media_url, folder / f"{brief['商品名']}-短视频.mp4")
    if presenter is not None:
        copy_out(presenter.media_url, folder / f"{brief['商品名']}-数字人.mp4")
    write_brief_markdown(folder / f"{brief['商品名']}-文案.md", brief, analysis, plan)

    print(f"\n完成：{folder}", flush=True)
    return folder


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("用法：python scripts/new_order.py 接单/客户资料/order.json")
    asyncio.run(run(Path(sys.argv[1])))
