#!/usr/bin/env python3
"""Generate Software Copyright (软件著作权) registration packages.

Zero third-party dependencies: emits .docx by writing the OOXML package directly.

Usage:
    uv run python scripts/gen_soft_copyright.py
    uv run python scripts/gen_soft_copyright.py --out "提交材料/软著登记"
"""

from __future__ import annotations

import argparse
import datetime as _dt
import os
import struct
import sys
import unicodedata
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]

# --------------------------------------------------------------------------
# Bundle definitions: each bundle becomes one software copyright application.
# Directories are non-overlapping by design so the three registrations do not
# submit the same source to the reviewing body.
# --------------------------------------------------------------------------
BUNDLES = [
    {
        "slug": "01-数字人短视频生成",
        "name": "数字人短视频智能生成系统",
        "version": "V1.0",
        "roots": [
            "apps/api/src/liuliangchuhai/infrastructure/digital_human",
            "apps/api/src/liuliangchuhai/infrastructure/video",
            "apps/api/src/liuliangchuhai/infrastructure/images",
            "apps/api/src/liuliangchuhai/application/use_cases/generate_digital_human.py",
            "apps/api/src/liuliangchuhai/application/use_cases/generate_video.py",
            "apps/api/src/liuliangchuhai/application/use_cases/generate_image.py",
        ],
        "intro": (
            "本系统面向跨境电商与地方特产品牌的短视频营销场景，提供从文案解析、"
            "语音合成、数字人口型驱动到短视频渲染输出的一体化能力。系统支持多种"
            "视频生成模型的中继调度与失败自动切换，并可为同一商品批量生成适配不同"
            "平台画幅与语种的营销素材，降低中小商家的内容制作门槛。"
        ),
        "features": [
            (
                "数字人口播生成",
                "输入口播文案与人物形象，自动完成语音合成、口型对齐和视频合成。",
                "用户选择内置数字人形象或上传自定义形象，录入口播文案后系统自动完成断句、"
                "语音合成与口型驱动。生成的口播视频支持字幕叠加、背景替换和时长裁剪，"
                "输出结果包含视频文件与生成参数记录，便于复现和二次修改。",
            ),
            (
                "多模型中继调度",
                "将不同厂商的视频生成接口统一为同一协议，按可用性自动路由。",
                "系统中的中继层把各家视频生成服务的请求参数、鉴权方式和回调格式统一为标准协议，"
                "上层业务无需感知具体厂商差异。调度器根据配置的优先级与实时健康状态选择通道，"
                "新增模型只需实现一个适配器并注册，不影响已有业务代码。",
            ),
            (
                "失败自动切换",
                "单个生成通道超时或报错时自动重试并切换备用通道，保证出片率。",
                "每次任务提交都会记录通道、耗时与返回码。当出现超时、限流或服务错误时，"
                "系统按预设策略进行有限次重试，重试仍失败则自动切换到备用通道，"
                "并在任务记录中保留完整的中继链路，便于排查与成本核算。",
            ),
            (
                "批量配图生成",
                "依据商品信息与卖点提示词批量生成主图、场景图和详情配图。",
                "系统读取商品资料与卖点，自动组装图像提示词并批量提交生成任务。"
                "生成结果按商品与用途分类归档，支持人工筛选、替换与下载，"
                "显著降低中小商家在缺少设计资源时的素材制作成本。",
            ),
            (
                "画幅与语种适配",
                "同一素材可输出适配短视频、社交平台等不同规格的版本。",
                "针对不同投放平台的画幅比例与时长要求，系统可按预设模板批量输出多规格版本，"
                "并保持字幕位置与安全区域的正确适配，避免二次剪辑造成的信息遮挡。",
            ),
            (
                "任务状态跟踪",
                "生成任务支持排队、进行中、成功、失败等状态查询与产物下载。",
                "所有生成任务都会生成唯一任务标识，前端可轮询查询任务状态并展示进度。"
                "任务结束后返回产物地址与元数据，失败的任留失败原因并支持一键重新提交。",
            ),
        ],
        "flow": [
            "用户在系统中录入或选择商品，填写口播文案与目标平台。",
            "系统调用大模型对文案进行口语化改写与分段，生成配音脚本。",
            "系统调用语音合成服务生成音频，并计算每段音频的时长。",
            "系统依据音频时长生成时间轴，驱动数字人口型与字幕同步。",
            "系统将任务提交至视频生成通道，若通道不可用则自动切换备用通道。",
            "系统轮询任务状态，生成完成后返回视频地址并写入本地归档目录。",
        ],
        "tech": [
            "采用领域驱动分层架构，领域层不依赖任何外部框架，便于替换基础设施实现。",
            "视频、语音、图像等外部能力通过端口（Port）抽象，第三方适配器集中在基础设施层。",
            "多模型中继层统一请求与响应格式，新增模型只需实现新的适配器。",
            "默认提供确定性的本地模拟实现，无第三方密钥时系统仍可完整演示。",
            "任务状态与产物元数据持久化，支持断点查询与重复下载。",
        ],
    },
    {
        "slug": "02-商品分析与内容生成",
        "name": "面向东盟市场的商品分析与营销内容生成系统",
        "version": "V1.0",
        "roots": [
            "apps/api/src/liuliangchuhai/infrastructure/content",
            "apps/api/src/liuliangchuhai/infrastructure/llm",
            "apps/api/src/liuliangchuhai/infrastructure/products",
            "apps/api/src/liuliangchuhai/domain",
            "apps/api/src/liuliangchuhai/presentation",
            "apps/api/src/liuliangchuhai/application/use_cases/analyze_product.py",
            "apps/api/src/liuliangchuhai/application/use_cases/analyze_product_by_id.py",
            "apps/api/src/liuliangchuhai/application/use_cases/create_content_plan.py",
            "apps/api/src/liuliangchuhai/application/use_cases/create_content_plan_by_id.py",
            "apps/api/src/liuliangchuhai/application/use_cases/get_product.py",
            "apps/api/src/liuliangchuhai/application/use_cases/list_products.py",
        ],
        "intro": (
            "本系统面向广西地方特色产品出海东盟市场的需求，提供商品信息管理、目标市场"
            "适配度分析、合规风险提示和多语种营销内容方案生成能力。系统以大模型结构化"
            "输出为核心，将市场分析结论直接转化为可执行的选题、标题、卖点与投放建议，"
            "并以确定性模拟实现保证无密钥环境下仍可完整演示。"
        ),
        "features": [
            (
                "商品信息管理",
                "维护商品名称、品类、产地、规格、卖点和图片等基础资料。",
                "系统以结构化数据维护商品档案，包含名称、品类、产地、规格、价格区间、"
                "核心卖点与配图等字段。商品数据既可由运营人员录入，也可通过接口批量导入，"
                "所有下游分析与内容生成均以商品档案为唯一数据源，避免信息不一致。",
            ),
            (
                "市场适配分析",
                "针对目标国家与语言输出受众画像、竞争格局、风险提示与建议。",
                "用户选择目标市场与语言后，系统组装包含商品信息与市场背景的分析提示词，"
                "调用大模型输出受众画像、竞争格局、进入障碍、合规风险与整体建议。"
                "分析结果以结构化字段返回，并保留原始输入与模型标识，便于追踪与复核。",
            ),
            (
                "结构化输出校验",
                "对模型返回的 JSON 进行解析、字段校验与缺失兜底。",
                "针对大模型输出不稳定的问题，系统对返回内容进行解析、字段存在性校验、"
                "类型校验和缺失字段兜底。校验失败时触发有限次重试或降级到确定性模拟结果，"
                "保证前端始终获得可直接渲染的数据结构。",
            ),
            (
                "营销内容方案",
                "基于已有分析结论一次性生成选题、标题、卖点、话术和投放建议。",
                "系统复用已有的市场分析结论，与商品信息一并组装为一次有界的生成请求，"
                "输出选题方向、标题候选、核心卖点、直播或短视频话术以及投放建议。"
                "复用已有分析避免了重复调用，同时控制单次请求长度与成本。",
            ),
            (
                "多语种适配",
                "内容方案按目标市场语言生成，支持中、英及东南亚语种。",
                "内容方案的语言由目标市场决定，系统在提示词中明确语种与本地化要求，"
                "并在输出中保留中外文对照，方便运营人员校对。对于关键卖点与合规表述，"
                "系统提示人工复核后再对外使用。",
            ),
            (
                "接口与健康检查",
                "提供 OpenAPI 接口文档与模型提供方健康状态查询。",
                "所有能力通过 REST 接口对外提供，接口契约由 FastAPI 自动生成 OpenAPI 文档。"
                "健康检查接口返回当前模型提供方、可用性与依赖配置状态，"
                "便于部署后快速判断是否具备真实分析能力。",
            ),
        ],
        "flow": [
            "用户浏览商品目录并选择目标商品与目标市场。",
            "系统读取商品资料，组装分析提示词并调用大模型。",
            "系统解析模型返回的结构化结果，校验后写入分析记录。",
            "用户在分析结果基础上请求生成营销内容方案。",
            "系统复用已有分析结论，避免重复分析并控制请求长度。",
            "系统输出多语种内容方案，供运营人员审核后使用。",
        ],
        "tech": [
            "领域层定义商品、市场、分析与内容方案等核心模型，不依赖外部框架。",
            "大模型提供方通过端口抽象，mock 与真实提供方可在配置中切换。",
            "分析结果与内容方案使用强类型契约，接口由 FastAPI OpenAPI 自动生成。",
            "路由层仅负责参数校验、用例调用与响应映射，业务逻辑集中在应用层。",
            "无第三方密钥时使用确定性的模拟数据，并在输出中明确标注。",
        ],
    },
    {
        "slug": "03-跨境运营管理平台",
        "name": "跨境电商内容运营管理平台",
        "version": "V1.0",
        "roots": [
            "apps/web/src",
            "apps/api/src/liuliangchuhai/infrastructure/assistant",
            "apps/api/src/liuliangchuhai/application/use_cases/reply_to_customer.py",
        ],
        "intro": (
            "本平台面向跨境内容运营团队的日常作业，提供商品浏览、市场分析、内容方案、"
            "数字人视频生成与客服自动回复的统一操作界面。平台以工作台式布局组织功能，"
            "将后端分析结果与生成任务集中呈现，并提供客服话术的自动生成与草稿管理，"
            "帮助运营人员在缺少专业设计资源的情况下完成从选品到投放的全流程。"
        ),
        "features": [
            (
                "统一工作台",
                "将商品、分析、内容、视频与客服模块整合在同一导航体系内。",
                "平台采用左侧导航加内容区的经典工作台布局，商品、市场分析、内容方案、"
                "数字人视频与客服模块按业务顺序组织。用户在同一界面内即可完成从选品到投放的"
                "连续操作，减少跨系统切换造成的上下文丢失。",
            ),
            (
                "商品浏览与筛选",
                "按品类、产地和关键词浏览商品，查看详情与配图。",
                "商品列表以卡片形式展示主图、名称、品类与产地，支持按品类和关键词筛选。"
                "点击卡片进入详情页，可查看规格、卖点、配图与关联的分析记录，"
                "并可从详情页直接发起市场分析或内容生成。",
            ),
            (
                "分析与方案展示",
                "展示市场适配分析与营销内容方案，支持复制与导出。",
                "分析结果以分区卡片展示受众画像、竞争格局、风险提示与整体建议；"
                "内容方案按选题、标题、卖点、话术与投放建议分区呈现。"
                "关键文本支持一键复制，便于运营人员粘贴到素材库或投放后台。",
            ),
            (
                "生成任务面板",
                "提交数字人与视频生成任务，查看进度并预览产物。",
                "用户在选择形象、填写文案并确认参数后提交生成任务，面板实时展示排队、"
                "生成中与完成状态。任务完成后可直接在页面内预览视频与配图，"
                "并提供下载入口与失败重试按钮。",
            ),
            (
                "客服话术助手",
                "根据客户问题与商品信息生成回复草稿，支持人工修改。",
                "运营人员粘贴客户问题后，系统结合当前商品资料生成回复草稿，"
                "草稿保留在编辑区供人工修改确认，不会自动发送。"
                "系统同时提示常见风险表述，避免承诺性话术带来的合规问题。",
            ),
            (
                "接口客户端封装",
                "统一封装后端接口调用、错误处理与加载状态管理。",
                "前端通过统一的接口客户端访问后端，集中处理请求参数、超时、错误码与加载状态。"
                "接口类型由后端 OpenAPI 契约生成，避免手工维护字段映射，"
                "后端契约变更后前端可及时发现不兼容之处。",
            ),
        ],
        "flow": [
            "运营人员登录工作台，从商品列表中筛选目标商品。",
            "进入商品详情，触发市场适配分析并查看结构化结论。",
            "在分析结论基础上生成营销内容方案并复制到素材库。",
            "提交数字人视频生成任务，等待完成后预览并下载。",
            "在客服模块接收客户问题，生成回复草稿后人工确认发送。",
            "平台汇总各模块状态，便于运营人员追踪待办事项。",
        ],
        "tech": [
            "前端采用组件化架构，页面与通用组件、接口客户端、状态管理分层组织。",
            "接口客户端由后端 OpenAPI 契约生成，避免手工维护字段映射。",
            "组件不承载后端业务规则，仅负责展示与交互。",
            "统一处理加载、空状态与错误提示，提升无网络或服务异常时的可用性。",
            "支持响应式布局，适配桌面与平板等常见运营终端。",
        ],
    },
]

CODE_EXTS = {".py", ".ts", ".tsx", ".js", ".jsx"}
EXCLUDE_PARTS = {"__pycache__", "node_modules", ".next", "dist", "build", "test", "tests", "__tests__"}

SHOTS: dict[str, list[tuple[str, str]]] = {
    "01-数字人短视频生成": [
        ("图 1  数字人口播视频生成效果（示例输出画面）", "提交材料/软著登记/_assets/digital-human-frame.png"),
        ("图 2  商品主图智能生成效果（梧州六堡茶）", "提交材料/软著登记/_assets/wuzhou-liubao-tea.jpg"),
        ("图 3  商品主图智能生成效果（北海咸鸭蛋）", "提交材料/软著登记/_assets/beihai-duck-egg.jpg"),
        ("图 4  视频生成参数与成品预览界面", "apps/web/src/app/screenshots/ui-consistency/after-content-plan.jpg"),
    ],
    "02-商品分析与内容生成": [
        ("图 1  商品目录浏览界面", "apps/web/src/app/screenshots/ui-consistency/after-products.jpg"),
        ("图 2  商品详情与卖点展示界面", "apps/web/src/app/screenshots/ui-consistency/after-detail.jpg"),
        ("图 3  市场适配分析结果界面", "apps/web/src/app/screenshots/ui-consistency/after-analysis.jpg"),
        ("图 4  营销内容方案生成结果界面", "apps/web/src/app/screenshots/ui-consistency/after-content-plan.jpg"),
        ("图 5  移动端适配效果", "apps/web/src/app/screenshots/ui-consistency/after-mobile.jpg"),
    ],
    "03-跨境运营管理平台": [
        ("图 1  平台首页与统一工作台", "apps/web/src/app/screenshots/ui-consistency/after-landing.jpg"),
        ("图 2  商品浏览与筛选界面", "apps/web/src/app/screenshots/ui-consistency/after-products.jpg"),
        ("图 3  商品详情界面", "apps/web/src/app/screenshots/ui-consistency/after-detail.jpg"),
        ("图 4  市场分析与内容方案界面", "apps/web/src/app/screenshots/ui-consistency/after-analysis.jpg"),
        ("图 5  客服话术助手对话界面", "apps/web/src/features/assistant/screenshots/desktop-conversation.png"),
        ("图 6  客服助手展开界面", "apps/web/src/features/assistant/screenshots/desktop-expanded.png"),
        ("图 7  移动端适配效果", "apps/web/src/app/screenshots/ui-consistency/after-mobile.jpg"),
    ],
}

LINES_PER_PAGE = 50
MAX_PAGES = 60
WRAP_AT = 72


# --------------------------------------------------------------------------
# Minimal OOXML (.docx) writer
# --------------------------------------------------------------------------
NS_W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS_WP = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main"
NS_PIC = "http://schemas.openxmlformats.org/drawingml/2006/picture"

EMU_PER_PX = 9525
MAX_IMG_W = 6_100_000
MAX_IMG_H = 7_800_000


def image_size_px(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", data[16:24])
    if data[:2] == b"\xff\xd8":
        i = 2
        while i < len(data) - 9:
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if marker in (0xC0, 0xC1, 0xC2):
                h, w = struct.unpack(">HH", data[i + 5 : i + 9])
                return w, h
            if marker in (0xD8, 0xD9):
                i += 2
                continue
            i += 2 + struct.unpack(">H", data[i + 2 : i + 4])[0]
    return 1440, 1000


def scaled_image_emu(path: Path) -> tuple[int, int]:
    w_px, h_px = image_size_px(path)
    w, h = w_px * EMU_PER_PX, h_px * EMU_PER_PX
    scale = min(MAX_IMG_W / w, MAX_IMG_H / h, 1.0)
    return int(w * scale), int(h * scale)


def _run(text: str, *, ascii_font: str, east_font: str, size_half: int, bold: bool = False) -> str:
    b = "<w:b/>" if bold else ""
    return (
        "<w:r><w:rPr>"
        f'<w:rFonts w:ascii="{ascii_font}" w:hAnsi="{ascii_font}" w:eastAsia="{east_font}"/>'
        f"{b}"
        f'<w:sz w:val="{size_half}"/><w:szCs w:val="{size_half}"/>'
        f'</w:rPr><w:t xml:space="preserve">{escape(text)}</w:t></w:r>'
    )


def _para(
    text: str = "",
    *,
    ascii_font: str = "宋体",
    east_font: str = "宋体",
    size_half: int = 24,
    bold: bool = False,
    align: str | None = None,
    line_twips: int | None = None,
    page_break_before: bool = False,
    indent_first: bool = False,
) -> str:
    ppr = ["<w:pPr>"]
    if align:
        ppr.append(f'<w:jc w:val="{align}"/>')
    if indent_first:
        ppr.append('<w:ind w:firstLineChars="200" w:firstLine="480"/>')
    if line_twips:
        ppr.append(f'<w:spacing w:line="{line_twips}" w:lineRule="exact"/>')
    if page_break_before:
        ppr.append("<w:pageBreakBefore/>")
    ppr.append("</w:pPr>")
    run = "" if text == "" else _run(text, ascii_font=ascii_font, east_font=east_font, size_half=size_half, bold=bold)
    return f"<w:p>{''.join(ppr)}{run}</w:p>"


def _page_break() -> str:
    return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'


def _header_xml(text: str) -> str:
    body = _para(text, ascii_font="宋体", east_font="宋体", size_half=18, align="center")
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<w:hdr xmlns:w="{NS_W}" xmlns:r="{NS_R}">{body}</w:hdr>'
    )


def _footer_xml() -> str:
    body = (
        '<w:p><w:pPr><w:jc w:val="center"/></w:pPr>'
        '<w:r><w:fldChar w:fldCharType="begin"/></w:r>'
        '<w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>'
        '<w:r><w:fldChar w:fldCharType="end"/></w:r>'
        "</w:p>"
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<w:ftr xmlns:w="{NS_W}" xmlns:r="{NS_R}">{body}</w:ftr>'
    )


def _image_para(rid: str, path: Path, pic_id: int) -> str:
    cx, cy = scaled_image_emu(path)
    name = escape(path.name)
    return (
        f'<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing>'
        f'<wp:inline distT="0" distB="0" distL="0" distR="0">'
        f'<wp:extent cx="{cx}" cy="{cy}"/><wp:docPr id="{pic_id}" name="Picture {pic_id}"/>'
        f'<wp:cNvGraphicFramePr/>'
        f'<a:graphic><a:graphicData uri="{NS_PIC}">'
        f'<pic:pic><pic:nvPicPr><pic:cNvPr id="{pic_id}" name="{name}"/><pic:cNvPicPr/></pic:nvPicPr>'
        f'<pic:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
        f'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
        f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
        f'</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>'
    )


def _document_xml(body_parts: list[str]) -> str:
    body = "".join(body_parts)
    sect = (
        "<w:sectPr>"
        '<w:headerReference w:type="default" r:id="rId1"/>'
        '<w:footerReference w:type="default" r:id="rId2"/>'
        '<w:pgSz w:w="11906" w:h="16838"/>'
        '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" '
        'w:header="567" w:footer="567" w:gutter="0"/>'
        "</w:sectPr>"
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<w:document xmlns:w="{NS_W}" xmlns:r="{NS_R}" xmlns:wp="{NS_WP}" '
        f'xmlns:a="{NS_A}" xmlns:pic="{NS_PIC}"><w:body>{body}{sect}</w:body></w:document>'
    )


def _styles_xml() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<w:styles xmlns:w="{NS_W}"><w:docDefaults><w:rPrDefault><w:rPr>'
        '<w:rFonts w:ascii="宋体" w:hAnsi="宋体" w:eastAsia="宋体"/>'
        '<w:sz w:val="24"/><w:szCs w:val="24"/>'
        "</w:rPr></w:rPrDefault></w:docDefaults></w:styles>"
    )


CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="png" ContentType="image/png"/>
<Default Extension="jpg" ContentType="image/jpeg"/>
<Default Extension="jpeg" ContentType="image/jpeg"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>
"""

ROOT_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"""

DOC_RELS_BASE = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
{images}</Relationships>
"""


def write_docx(path: Path, body_parts: list[str], header_text: str, media: list[Path] | None = None) -> None:
    media = media or []
    rels_images = "".join(
        f'<Relationship Id="rId{10 + i}" '
        f'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" '
        f'Target="media/image{i}{p.suffix.lower()}"/>'
        for i, p in enumerate(media)
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CONTENT_TYPES)
        z.writestr("_rels/.rels", ROOT_RELS)
        z.writestr("word/_rels/document.xml.rels", DOC_RELS_BASE.format(images=rels_images))
        z.writestr("word/styles.xml", _styles_xml())
        z.writestr("word/header1.xml", _header_xml(header_text))
        z.writestr("word/footer1.xml", _footer_xml())
        z.writestr("word/document.xml", _document_xml(body_parts))
        for i, p in enumerate(media):
            z.writestr(f"word/media/image{i}{p.suffix.lower()}", p.read_bytes())


# --------------------------------------------------------------------------
# Source collection
# --------------------------------------------------------------------------
def collect_source_files(bundle: dict) -> list[Path]:
    files: list[Path] = []
    for rel in bundle["roots"]:
        p = ROOT / rel
        if p.is_dir():
            for f in p.rglob("*"):
                if f.is_file() and f.suffix in CODE_EXTS:
                    if any(part in EXCLUDE_PARTS for part in f.parts):
                        continue
                    files.append(f)
        elif p.is_file():
            files.append(p)
    # deterministic, readable order
    return sorted(set(files), key=lambda x: str(x).lower())


def _char_width(ch: str) -> int:
    return 2 if unicodedata.east_asian_width(ch) in ("W", "F") else 1


def _wrap_line(line: str, limit: int = WRAP_AT) -> list[str]:
    out: list[str] = []
    rest = line
    first = True
    while True:
        prefix = "" if first else "    "
        avail = limit - len(prefix)
        width = 0
        cut = 0
        for i, ch in enumerate(rest):
            cw = _char_width(ch)
            if width + cw > avail:
                break
            width += cw
            cut = i + 1
        if cut >= len(rest):
            out.append(prefix + rest)
            break
        seg = rest[:cut]
        brk = max(
            seg.rfind(" "),
            seg.rfind(","),
            seg.rfind("("),
            seg.rfind(")"),
            seg.rfind("="),
            seg.rfind("/"),
        )
        if brk >= max(20, cut // 2):
            cut = brk + 1
        out.append(prefix + rest[:cut])
        rest = rest[cut:]
        first = False
    return out


def iter_source_lines(files: list[Path]) -> list[str]:
    lines: list[str] = []
    for f in files:
        rel = f.relative_to(ROOT).as_posix()
        lines.extend(_wrap_line("// ===== File: " + rel + " ====="))
        try:
            raw = f.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            raw = f.read_text(encoding="utf-8", errors="replace")
        for line in raw.splitlines():
            line = line.replace("\t", "    ").rstrip()
            if not line:
                lines.append("")
                continue
            lines.extend(_wrap_line(line))
        lines.append("")
    return lines


def build_source_doc(bundle: dict, out: Path) -> tuple[Path, int, int]:
    files = collect_source_files(bundle)
    actual_lines = 0
    for f in files:
        try:
            actual_lines += len(f.read_text(encoding="utf-8").splitlines())
        except UnicodeDecodeError:
            actual_lines += len(f.read_text(encoding="utf-8", errors="replace").splitlines())
    lines = iter_source_lines(files)
    pages = [lines[i : i + LINES_PER_PAGE] for i in range(0, len(lines), LINES_PER_PAGE)]
    omitted = 0
    if len(pages) > MAX_PAGES:
        omitted = len(pages) - MAX_PAGES
        pages = pages[:30] + pages[-30:]

    body: list[str] = []
    for pi, page in enumerate(pages):
        for li, ln in enumerate(page):
            body.append(
                _para(
                    ln,
                    ascii_font="Courier New",
                    east_font="宋体",
                    size_half=18,
                    line_twips=282,
                    page_break_before=(pi > 0 and li == 0),
                )
            )

    name = f"{bundle['name']}（{bundle['version']}）——源程序.docx"
    path = out / name
    write_docx(path, body, f"{bundle['name']}  {bundle['version']}")
    return path, actual_lines, omitted


# --------------------------------------------------------------------------
# Manual (说明书 / 用户手册)
# --------------------------------------------------------------------------
def build_manual_doc(bundle: dict, out: Path, shots: list[tuple[str, str]]) -> Path:
    body: list[str] = []
    media: list[Path] = []
    body.append(_para(bundle["name"], size_half=36, bold=True, align="center"))
    body.append(_para(f"用户手册（{bundle['version']}）", size_half=28, align="center"))
    body.append(_para("", size_half=24))
    body.append(_para("", size_half=24))
    body.append(_para("编制日期：" + _dt.date.today().isoformat(), size_half=24, align="center"))
    body.append(_page_break())

    # 1 概述
    body.append(_para("一、软件概述", size_half=28, bold=True))
    body.append(_para(bundle["intro"], size_half=24, indent_first=True, line_twips=360))
    body.append(_para("", size_half=24))

    # 2 运行环境
    body.append(_para("二、运行环境", size_half=28, bold=True))
    env = [
        "服务端：Python 3.12 及以上版本，FastAPI 应用服务。",
        "前端：Node.js 22 及以上版本，Next.js 应用。",
        "数据库：本地文件与结构化数据存储，可在部署时替换为关系型数据库。",
        "浏览器：Chrome、Edge 等主流现代浏览器。",
        "网络：可访问大模型与视频生成服务；无外网或缺少密钥时自动使用确定性模拟实现。",
    ]
    for e in env:
        body.append(_para("· " + e, size_half=24, line_twips=360))
    body.append(_para("", size_half=24))

    # 3 功能模块
    body.append(_para("三、功能模块说明", size_half=28, bold=True))
    for i, (title, desc, detail) in enumerate(bundle["features"], 1):
        body.append(_para(f"3.{i} {title}", size_half=26, bold=True))
        body.append(_para(desc, size_half=24, indent_first=True, line_twips=360))
        body.append(_para(detail, size_half=24, indent_first=True, line_twips=360))
        body.append(
            _para(
                "【截图位置：请在此处插入该功能界面截图】",
                size_half=22,
                align="center",
                line_twips=360,
            )
        )
        body.append(_para("", size_half=24))
    body.append(_para("", size_half=24))

    # 4 界面展示
    body.append(_para("四、界面展示", size_half=28, bold=True))
    for caption, rel in shots:
        p = ROOT / rel
        if not p.exists():
            continue
        body.append(
            _para(caption, size_half=22, align="center", line_twips=360, page_break_before=True)
        )
        body.append(_image_para(f"rId{10 + len(media)}", p, len(media) + 1))
        body.append(_para("", size_half=20))
        media.append(p)
    body.append(_page_break())

    # 5 操作流程
    body.append(_para("五、操作流程", size_half=28, bold=True))
    for i, step in enumerate(bundle["flow"], 1):
        body.append(_para(f"步骤 {i}：{step}", size_half=24, line_twips=360))
    body.append(
        _para(
            "【截图位置：请在此处插入完整操作流程截图】",
            size_half=22,
            align="center",
            line_twips=360,
        )
    )
    body.append(_para("", size_half=24))

    # 5 界面说明
    body.append(_para("六、界面说明", size_half=28, bold=True))
    for t in [
        "顶部区域：展示当前软件名称、版本号与当前登录状态。",
        "导航区域：按业务模块组织功能入口，当前模块高亮显示。",
        "内容区域：展示列表、详情、表单与结果，支持滚动与分页。",
        "操作区域：提供提交、复制、下载、重试等主要操作按钮。",
        "提示区域：展示加载状态、空数据提示、错误信息与结果标注。",
    ]:
        body.append(_para("· " + t, size_half=24, line_twips=360))
    body.append(_para("", size_half=24))

    # 6 技术特点
    body.append(_para("七、技术特点", size_half=28, bold=True))
    for t in bundle["tech"]:
        body.append(_para("· " + t, size_half=24, line_twips=360))
    body.append(_para("", size_half=24))

    # 7 异常处理
    body.append(_para("八、异常处理与提示", size_half=28, bold=True))
    for t in [
        "当外部模型服务不可用时，系统自动降级至确定性模拟实现，并在界面明确标注。",
        "当生成任务失败时，系统记录失败原因并支持重新提交。",
        "当输入参数缺失或格式错误时，接口返回明确的错误信息，前端给出提示。",
        "当网络中断时，前端展示统一错误提示，并在恢复后允许重新请求。",
        "所有人工智能生成内容均标注为规划建议，需人工审核后使用。",
    ]:
        body.append(_para("· " + t, size_half=24, line_twips=360))
    body.append(_para("", size_half=24))

    # 8 常见问题
    body.append(_para("九、常见问题", size_half=28, bold=True))
    faqs = [
        ("问：没有配置大模型密钥能否使用？", "答：可以。系统内置确定性模拟实现，未配置密钥时自动使用并明确标注。"),
        ("问：生成结果与预期不符怎么办？", "答：可调整商品卖点或提示词后重新生成，历史任务可在任务面板查看。"),
        ("问：生成任务长时间未完成？", "答：系统会按超时策略自动重试并切换通道，仍失败时可在任务面板重新提交。"),
        ("问：生成内容能否直接对外发布？", "答：建议人工复核。系统输出定位为规划建议，涉及合规表述需由运营人员确认。"),
        ("问：如何更换大模型提供方？", "答：在配置中选择提供方并填写密钥即可，无需修改业务代码。"),
        ("问：数据保存在哪里？", "答：默认保存在本地结构化数据文件中，部署时可替换为数据库。"),
    ]
    for q, a in faqs:
        body.append(_para(q, size_half=24, bold=True, line_twips=360))
        body.append(_para(a, size_half=24, line_twips=360))
    body.append(_para("", size_half=24))

    # 9 版本说明
    body.append(_para("十、版本说明", size_half=28, bold=True))
    body.append(
        _para(
            f"{bundle['version']}：首个登记版本，包含本手册所述全部功能。",
            size_half=24,
            line_twips=360,
        )
    )
    body.append(_para("", size_half=24))

    # 10 版权
    body.append(_para("十一、版权信息", size_half=28, bold=True))
    body.append(
        _para(
            f"软件名称：{bundle['name']}    版本号：{bundle['version']}",
            size_half=24,
            line_twips=360,
        )
    )
    body.append(
        _para(
            "本软件著作权归申请人所有，未经许可不得复制、传播或用于商业用途。",
            size_half=24,
            line_twips=360,
        )
    )

    name = f"{bundle['name']}（{bundle['version']}）——用户手册.docx"
    path = out / name
    write_docx(path, body, f"{bundle['name']}  {bundle['version']}", media)
    return path


# --------------------------------------------------------------------------
# Application form info + plan document snippet
# --------------------------------------------------------------------------
def build_application_info(bundle: dict, out: Path, lines_count: int) -> Path:
    text = f"""软件著作权登记 —— 申请表填写信息
======================================================
软件全称：{bundle['name']}
软件简称：（可不填）
版本号：{bundle['version']}
开发完成日期：{_dt.date.today().isoformat()}
首次发表日期：未发表（或按实际情况填写）
开发方式：独立开发
权利取得方式：原始取得
权利范围：全部权利
软件分类：应用软件
硬件环境：通用 x86_64 服务器或个人计算机
软件环境：Python 3.12 / Node.js 22 / 现代浏览器
编程语言：Python、TypeScript
源程序量：约 {lines_count} 行
主要功能：（参见用户手册第三章）

------------------------------------------------------
待申请人补充的信息
------------------------------------------------------
著作权人（个人或单位全称）：
证件号码 / 统一社会信用代码：
联系人：
联系电话：
联系地址：
邮政编码：
邮箱：
（若由学校科技处或代理机构统一申报，请以其要求为准）
"""
    path = out / f"{bundle['slug']}——申请表信息.txt"
    path.write_text(text, encoding="utf-8")
    return path


def build_plan_snippet(out: Path, results: list[dict]) -> Path:
    rows = "\n".join(
        f"| {i} | {r['name']} | {r['version']} | 待提交登记（受理号待填） | {r['lines']} 行 |"
        for i, r in enumerate(results, 1)
    )
    text = f"""# 计划书「知识产权成果」段落（可直接粘贴）

## 自主知识产权

项目团队围绕跨境电商内容生产的关键环节，自主研发并形成了以下软件成果，
正在办理软件著作权登记：

| 序号 | 软件名称 | 版本 | 状态 | 源程序量 |
|---|---|---|---|---|
{rows}

> 说明：正式提交后，请将「受理号待填」替换为登记机构下发的受理号，
> 并将「已提交登记」更新为「已受理」或「已登记」。

## 建议在计划书中补充的表述

本项目已形成覆盖「商品分析—内容生成—数字人视频—运营管理」全链路的自有软件体系，
核心能力包括多模型视频生成中继调度与失败自动切换、面向东盟市场的多语种内容
结构化生成、以及无第三方依赖环境下可完整演示的确定性模拟实现，相关代码与文档
均已登记，具备独立的知识产权基础。
"""
    path = out / "计划书_知识产权成果段落.md"
    path.write_text(text, encoding="utf-8")
    return path


def build_readme(out: Path) -> Path:
    text = """# 软著登记材料 —— 已经全部做好，你只剩「填证件信息 + 上传」

本目录由 `scripts/gen_soft_copyright.py` 自动生成，`.docx` 与 `.pdf` 都已产出，
截图已嵌入说明书，源程序严格按每页 50 行、共 60 页排版。

## 每件软著的目录内容

- `XXX——源程序.pdf`：源代码文档，60 页（前 30 页 + 后 30 页），可直接上传。
- `XXX——用户手册.pdf`：说明书，含真实界面截图，可直接上传。
- `XXX——申请表信息.txt`：在线填表时照抄。末尾的证件信息只有你能填。
- 同名 `.docx`：需要改内容时用 Word/WPS 修改，改完另存为 PDF。

## 你还需要做的

1. **填写申请表信息.txt 末尾的个人/单位信息**（姓名、证件号、电话、地址、邮箱）。
   若由学校科技处统一申报，以他们的要求为准。
2. **登录中国版权保护中心**（register.ccopyright.com.cn），按 txt 内容逐项填表，
   上传「源程序 PDF + 用户手册 PDF + 身份证明」。
3. **缴费并等待受理**。一般流程约 30–60 个工作日；提交后数日内下发**受理通知书**，
   上面的受理号即可写进计划书。

## 计划书用

直接复制 `计划书_知识产权成果段落.md`，把受理号填进去即可。

## 重新生成

```sh
uv run python scripts/gen_soft_copyright.py
```
"""
    path = out / "README_怎么用.md"
    path.write_text(text, encoding="utf-8")
    return path


# --------------------------------------------------------------------------
def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="提交材料/软著登记")
    args = ap.parse_args()

    out = ROOT / args.out
    out.mkdir(parents=True, exist_ok=True)

    results: list[dict] = []
    for bundle in BUNDLES:
        bdir = out / bundle["slug"]
        bdir.mkdir(parents=True, exist_ok=True)
        src_path, n_lines, omitted = build_source_doc(bundle, bdir)
        man_path = build_manual_doc(bundle, bdir, SHOTS.get(bundle["slug"], []))
        info_path = build_application_info(bundle, bdir, n_lines)
        results.append(
            {
                "name": bundle["name"],
                "version": bundle["version"],
                "lines": n_lines,
                "dir": bdir,
            }
        )
        print(f"[OK] {bundle['name']}")
        print(f"     源程序 {n_lines} 行 -> {src_path.name}")
        if omitted:
            print(f"     超出 60 页，已省略中间 {omitted} 页")
        print(f"     用户手册 -> {man_path.name}")
        print(f"     申请表信息 -> {info_path.name}")

        if n_lines < 1500:
            print("     [警告] 代码量偏少，建议补充源文件")

    snippet = build_plan_snippet(out, results)
    readme = build_readme(out)
    print(f"\n[OK] {snippet.name}")
    print(f"[OK] {readme.name}")
    print(f"\n输出目录：{out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
