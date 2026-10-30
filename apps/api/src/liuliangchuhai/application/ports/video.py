from typing import Protocol

from liuliangchuhai.application.ports.status import ProviderStatus
from liuliangchuhai.domain.video import GeneratedClip, VideoGenerationInput


class VideoPort(Protocol):
    """Capability boundary for turning a still (or a prompt) into a short clip."""

    async def status(self) -> ProviderStatus:
        """Return provider availability without generating anything."""
        ...

    async def generate(self, request: VideoGenerationInput) -> GeneratedClip:
        """Produce one clip within the adapter deadline, or raise VideoError."""
        ...
