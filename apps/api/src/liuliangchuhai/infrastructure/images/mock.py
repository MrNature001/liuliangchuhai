from liuliangchuhai.application.ports.status import ProviderStatus
from liuliangchuhai.domain.image import GeneratedImage, ImageGenerationInput


class MockImageAdapter:
    """Deterministic fallback that performs no image generation."""

    async def status(self) -> ProviderStatus:
        return ProviderStatus(provider="mock", available=True)

    async def generate(self, request: ImageGenerationInput) -> GeneratedImage:
        return GeneratedImage(media_url="mock://images/generated-image.png", provider="mock")
