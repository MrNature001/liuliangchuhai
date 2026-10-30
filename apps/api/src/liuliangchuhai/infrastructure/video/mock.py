from liuliangchuhai.application.ports.status import ProviderStatus
from liuliangchuhai.domain.video import GeneratedClip, VideoGenerationInput


class MockVideoAdapter:
    """Deterministic fallback that performs no video generation."""

    async def status(self) -> ProviderStatus:
        return ProviderStatus(provider="mock", available=True)

    async def generate(self, request: VideoGenerationInput) -> GeneratedClip:
        return GeneratedClip(media_url="mock://videos/generated-clip.mp4", provider="mock")
