from typing import Protocol

from liuliangchuhai.application.ports.status import ProviderStatus
from liuliangchuhai.domain.image import GeneratedImage, ImageGenerationInput


class ImagePort(Protocol):
    """Capability boundary for key-visual generation."""

    async def status(self) -> ProviderStatus:
        """Return provider availability without generating anything."""
        ...

    async def generate(self, request: ImageGenerationInput) -> GeneratedImage:
        """Produce one still within the adapter deadline, or raise ImageError."""
        ...
