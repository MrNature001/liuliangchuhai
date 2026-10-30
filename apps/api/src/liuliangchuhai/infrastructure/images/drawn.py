"""Key visual drawn locally from the content plan's image prompt.

No image model, no key and no network: the poster renderer already knows how to
draw a branded vertical frame, so the "generate the picture" step works on a
plain laptop. What it cannot do is depict a specific product faithfully — that
is what the `openai` adapter is for — so the drawn frame stays a designed
backdrop rather than a pretend product photo.
"""

from __future__ import annotations

import hashlib
from pathlib import Path

from liuliangchuhai.application.ports.image_errors import ImageUnavailable
from liuliangchuhai.application.ports.status import ProviderStatus
from liuliangchuhai.domain.image import GeneratedImage, ImageGenerationInput
from liuliangchuhai.infrastructure.digital_human import poster


class DrawnImageAdapter:
    """Deterministic, offline key visual built from the same art as the video."""

    _PROVIDER = "drawn"

    def __init__(self, *, media_root: Path, public_prefix: str = "/media") -> None:
        if not public_prefix.strip():
            raise ValueError("public_prefix must be a nonblank string")
        self._media_root = media_root
        self._public_prefix = public_prefix.strip().rstrip("/")

    async def status(self) -> ProviderStatus:
        return ProviderStatus(provider=self._PROVIDER, available=poster.font_available())

    async def generate(self, request: ImageGenerationInput) -> GeneratedImage:
        digest = hashlib.sha256(
            f"{request.prompt}|{request.language}|{request.headline}"
            f"|{poster.asset_signature(self._media_root)}".encode()
        ).hexdigest()[:24]
        name = f"keyvisual-{digest}.png"
        destination = self._media_root / name
        if not destination.is_file() or destination.stat().st_size == 0:
            self._media_root.mkdir(parents=True, exist_ok=True)
            await poster.draw(
                destination,
                title=request.headline,
                language=request.language,
                media_root=self._media_root,
                variant="opening",
            )
        if not destination.is_file() or destination.stat().st_size == 0:
            raise ImageUnavailable("the drawn key visual came out empty")
        return GeneratedImage(media_url=f"{self._public_prefix}/{name}", provider=self._PROVIDER)


__all__ = ["DrawnImageAdapter"]
