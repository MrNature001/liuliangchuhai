from liuliangchuhai.application.ports.image import ImagePort
from liuliangchuhai.domain.image import GeneratedImage, ImageGenerationInput


class GenerateImageUseCase:
    def __init__(self, images: ImagePort) -> None:
        self._images = images

    async def execute(self, request: ImageGenerationInput) -> GeneratedImage:
        return await self._images.generate(request)
