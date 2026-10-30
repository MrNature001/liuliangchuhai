"""Qwen speech synthesis that hands back a public URL.

`wan2.2-s2v` will only accept an audio track it can download itself, and it
rejects a data URI on file-type detection. DashScope's own upload endpoint is no
help either: it pins the object ACL to private, so the render service cannot
read what it just accepted.

Qwen TTS solves both problems at once — it writes the audio to a signed bucket
URL, which is exactly the shape the video model wants. It also sounds better
than the key-free fallback, and a Chinese voice is what this demo needs.
"""

from __future__ import annotations

from pathlib import Path
from typing import Final

import httpx

from liuliangchuhai.application.ports.digital_human_errors import (
    DigitalHumanUnavailable,
    InvalidDigitalHumanResponse,
)

_WS_PATH: Final = "/services/audio/tts/SpeechSynthesizer"
_BASE_URL: Final = "https://dashscope.aliyuncs.com/api/v1"
_TIMEOUT: Final = 120.0


async def synthesise_url(
    *,
    api_key: str,
    text: str,
    model: str,
    voice: str,
    base_url: str = _BASE_URL,
    transport: httpx.AsyncBaseTransport | None = None,
) -> str:
    """Speak ``text`` and return the public URL of the finished audio."""
    if not text.strip():
        raise DigitalHumanUnavailable("speech synthesis received an empty script")

    payload = {
        "model": model,
        "input": {"text": text.strip(), "voice": voice, "format": "mp3", "sample_rate": 24000},
    }
    try:
        async with httpx.AsyncClient(
            base_url=base_url.rstrip("/"),
            timeout=httpx.Timeout(_TIMEOUT),
            transport=transport,
            trust_env=False,
        ) as client:
            response = await client.post(
                _WS_PATH,
                json=payload,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
            )
    except httpx.HTTPError:
        raise DigitalHumanUnavailable("speech synthesis request failed") from None

    if response.status_code in {401, 403}:
        raise DigitalHumanUnavailable("the speech provider rejected the API key")
    if not response.is_success:
        raise DigitalHumanUnavailable("speech synthesis request failed")

    try:
        url = response.json()["output"]["audio"]["url"]
    except (KeyError, TypeError, ValueError):
        raise InvalidDigitalHumanResponse("the speech provider returned no audio URL") from None
    if not isinstance(url, str) or not url.strip():
        raise InvalidDigitalHumanResponse("the speech provider returned no audio URL")
    return url.strip()


async def download(
    url: str, destination: Path, transport: httpx.AsyncBaseTransport | None = None
) -> Path:
    """Copy the finished audio home so its duration can be measured."""
    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(_TIMEOUT), transport=transport, trust_env=False
        ) as client:
            response = await client.get(url)
    except httpx.HTTPError:
        raise DigitalHumanUnavailable("the narration could not be downloaded") from None
    if not response.is_success or not response.content:
        raise DigitalHumanUnavailable("the narration could not be downloaded")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(response.content)
    return destination


__all__ = ["download", "synthesise_url"]
