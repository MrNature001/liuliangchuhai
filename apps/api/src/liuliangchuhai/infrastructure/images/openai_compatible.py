"""OpenAI-compatible image generation, including third-party relays.

The request and response shapes follow the documented Images API, but relays
disagree on details: some return ``b64_json``, some return ``url``, some ignore
``response_format`` entirely. This adapter accepts either, and always lands the
bytes in local media so a signed URL that expires in an hour cannot break the
demo later.
"""

from __future__ import annotations

import base64
import binascii
import hashlib
from pathlib import Path

import httpx

from liuliangchuhai.application.ports.image_errors import (
    ImageRejected,
    ImageUnavailable,
    InvalidImageResponse,
)
from liuliangchuhai.application.ports.status import ProviderStatus
from liuliangchuhai.domain.image import GeneratedImage, ImageGenerationInput

_DEFAULT_BASE_URL = "https://api.openai.com/v1"
# 2:3 is the tallest portrait the Images API offers; the frame crops to 9:16.
_DEFAULT_SIZE = "1024x1536"


class OpenAICompatibleImageAdapter:
    """Text-to-image through any endpoint that speaks /images/generations."""

    _PROVIDER = "openai-image"

    def __init__(
        self,
        *,
        api_key: str,
        model: str,
        media_root: Path,
        public_prefix: str = "/media",
        base_url: str = _DEFAULT_BASE_URL,
        size: str = _DEFAULT_SIZE,
        timeout_seconds: float = 120,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        if not api_key.strip():
            raise ValueError("api_key must be a nonblank string")
        if not model.strip():
            raise ValueError("model must be a nonblank string")
        if not public_prefix.strip():
            raise ValueError("public_prefix must be a nonblank string")
        self._api_key = api_key.strip()
        self._model = model.strip()
        self._base_url = base_url.strip().rstrip("/")
        self._size = size.strip()
        self._media_root = media_root
        self._public_prefix = public_prefix.strip().rstrip("/")
        self._timeout = timeout_seconds
        self._transport = transport

    async def status(self) -> ProviderStatus:
        """Report reachability cheaply; generation is what costs money."""
        try:
            async with httpx.AsyncClient(
                trust_env=False,
                base_url=self._base_url,
                timeout=httpx.Timeout(10.0),
                transport=self._transport,
            ) as client:
                response = await client.get(
                    "/models", headers={"Authorization": f"Bearer {self._api_key}"}
                )
        except httpx.HTTPError:
            return ProviderStatus(provider=self._PROVIDER, available=False)
        return ProviderStatus(provider=self._PROVIDER, available=response.status_code < 500)

    async def generate(self, request: ImageGenerationInput) -> GeneratedImage:
        payload = {
            "model": self._model,
            "prompt": _compose_prompt(request),
            "n": 1,
            "size": self._size,
        }
        async with httpx.AsyncClient(
            trust_env=False,
            base_url=self._base_url,
            timeout=httpx.Timeout(self._timeout),
            transport=self._transport,
        ) as client:
            try:
                response = await client.post(
                    "/images/generations",
                    json=payload,
                    headers={"Authorization": f"Bearer {self._api_key}"},
                )
            except httpx.HTTPError:
                raise ImageUnavailable("image request failed") from None

            if response.status_code in {400, 422}:
                raise ImageRejected("the image provider rejected the prompt")
            if response.status_code in {401, 403}:
                raise ImageUnavailable("the image provider rejected the key")
            if not response.is_success:
                raise ImageUnavailable("image request failed")

            data = _first_image(response)
            if data.get("b64_json"):
                content = _decode(data["b64_json"])
            elif data.get("url"):
                content = await _download(client, str(data["url"]))
            else:
                raise InvalidImageResponse("the image provider returned no picture")

        name = f"keyvisual-{_digest(request, content)}.png"
        destination = self._media_root / name
        self._media_root.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(content)
        return GeneratedImage(media_url=f"{self._public_prefix}/{name}", provider=self._PROVIDER)


def _compose_prompt(request: ImageGenerationInput) -> str:
    """Ask for a vertical, text-free frame so the copy stays in the page."""
    return (
        f"{request.prompt.strip()}\n\n"
        "Vertical 2:3 social image. Photographic, natural light, uncluttered. "
        "No text, no letters, no logos, no watermarks anywhere in the image."
    )


def _first_image(response: httpx.Response) -> dict[str, object]:
    try:
        payload = response.json()
    except ValueError:
        raise InvalidImageResponse("the image provider returned no JSON") from None
    if not isinstance(payload, dict):
        raise InvalidImageResponse("the image provider returned an unexpected body")
    items = payload.get("data")
    if not isinstance(items, list) or not items or not isinstance(items[0], dict):
        raise InvalidImageResponse("the image provider returned no picture")
    return items[0]


def _decode(encoded: object) -> bytes:
    if not isinstance(encoded, str) or not encoded.strip():
        raise InvalidImageResponse("the image provider returned an empty picture")
    try:
        content = base64.b64decode(encoded, validate=True)
    except (binascii.Error, ValueError):
        raise InvalidImageResponse("the image provider returned unreadable base64") from None
    if not content:
        raise InvalidImageResponse("the image provider returned an empty picture")
    return content


async def _download(client: httpx.AsyncClient, url: str) -> bytes:
    """Relays often hand back a signed URL; keep the bytes, not the link."""
    try:
        response = await client.get(url)
    except httpx.HTTPError:
        raise ImageUnavailable("the finished picture could not be downloaded") from None
    if not response.is_success or not response.content:
        raise ImageUnavailable("the finished picture could not be downloaded")
    return response.content


def _digest(request: ImageGenerationInput, content: bytes) -> str:
    seed = f"{request.prompt}|{request.language}|{request.headline}".encode()
    return hashlib.sha256(seed + b"|" + content[:4096]).hexdigest()[:24]


__all__ = ["OpenAICompatibleImageAdapter"]
