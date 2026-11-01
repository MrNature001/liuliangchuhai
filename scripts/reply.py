"""Draft a reply to a buyer message.

    uv run --project apps/api python -I scripts/reply.py "这个能便宜点吗，我买十套"

The model only writes the sentence; the business rules live in the prompt below
so every reply quotes the same prices and refuses the same jobs.
"""

from __future__ import annotations

import sys
from pathlib import Path

import httpx

ENV = Path(__file__).resolve().parent.parent / "apps/api/.env"

SYSTEM = """你是一个在闲鱼上接单的人，帮做 AI 商品图和短视频。你在回复买家消息。

业务范围：茶叶、食品、广西特产、手作品类的商品配图与短视频。其他品类可以试。

价格（不能说别的数）：
- 单张配图 30 元
- 10 秒短视频 80 元
- 一整套（配图 + 视频 + 六套文案）200 元
- 加真人照片口播 +100 元

流程：买家发产品照片和几句介绍 → 先做一版给他看 → 满意再付款 → 两天内交付。

回复要求：
- 中文，口语，像真人在闲鱼聊天，不要客服腔、不要"亲"、不要表情符号堆砌
- 三到五句话，不要长段落
- 先问清产品再谈价格；不知道做什么产品时不要直接报价
- 做不好的活直接说做不好，不要硬接
- 每条回复以一个问题结尾，把对话留在自己这边
- 不要承诺做不到的事（比如"保证爆款""一定能卖出去"）
- 不要主动提 AI 生成的法律标识，除非买家问是不是 AI 做的

只输出回复正文，不要解释，不要引号。"""


def _api_key() -> str:
    for line in ENV.read_text(encoding="utf-8").splitlines():
        if line.startswith("LIULIANGCHUHAI_DEEPSEEK_API_KEY="):
            return line.split("=", 1)[1].strip()
    raise SystemExit("apps/api/.env 里没有 DEEPSEEK_API_KEY")


def _model() -> str:
    for line in ENV.read_text(encoding="utf-8").splitlines():
        if line.startswith("LIULIANGCHUHAI_DEEPSEEK_MODEL="):
            return line.split("=", 1)[1].strip()
    return "deepseek-flash"


def reply(message: str) -> str:
    payload = {
        "model": _model(),
        "stream": False,
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": message},
        ],
    }
    with httpx.Client(
        base_url="https://api.deepseek.com",
        timeout=httpx.Timeout(30.0),
        trust_env=False,
        headers={"Authorization": f"Bearer {_api_key()}"},
    ) as client:
        response = client.post("/chat/completions", json=payload)
    if not response.is_success:
        raise SystemExit(f"请求失败：{response.status_code}")
    return response.json()["choices"][0]["message"]["content"].strip()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit('用法：python scripts/reply.py "买家说的话"')
    print(reply(" ".join(sys.argv[1:])))
