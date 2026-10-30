from liuliangchuhai.application.ports.video import VideoPort
from liuliangchuhai.domain.video import GeneratedClip, VideoGenerationInput


class GenerateVideoUseCase:
    def __init__(self, videos: VideoPort) -> None:
        self._videos = videos

    async def execute(self, request: VideoGenerationInput) -> GeneratedClip:
        return await self._videos.generate(request)
