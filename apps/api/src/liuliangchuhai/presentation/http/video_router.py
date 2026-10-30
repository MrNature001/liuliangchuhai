from typing import Literal

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from liuliangchuhai.application.ports.video_errors import (
    InvalidVideoResponse,
    VideoDeadlineExceeded,
    VideoError,
    VideoRejected,
    VideoUnavailable,
)
from liuliangchuhai.application.use_cases.generate_video import GenerateVideoUseCase
from liuliangchuhai.domain.video import VideoGenerationInput
from liuliangchuhai.presentation.http.video_schemas import (
    VideoErrorResponse,
    VideoRequest,
    VideoResponse,
)


def create_video_router(generate_video: GenerateVideoUseCase) -> APIRouter:
    router = APIRouter()

    @router.post(
        "/video",
        response_model=VideoResponse,
        operation_id="generate_video",
        responses={
            422: {"model": VideoErrorResponse, "description": "Provider rejected the input"},
            502: {"model": VideoErrorResponse, "description": "Unreadable provider result"},
            503: {"model": VideoErrorResponse, "description": "Provider is unavailable"},
            504: {"model": VideoErrorResponse, "description": "Render exceeded the local deadline"},
        },
    )
    async def generate_short_clip(request: VideoRequest) -> VideoResponse | JSONResponse:
        generation = VideoGenerationInput(prompt=request.prompt, image_url=request.image_url)
        try:
            clip = await generate_video.execute(generation)
        except VideoRejected:
            return _error(422, "video_rejected", "The video input was rejected.")
        except InvalidVideoResponse:
            return _error(502, "invalid_video_response", "Provider returned an unreadable result.")
        except VideoDeadlineExceeded:
            return _error(504, "video_deadline_exceeded", "The render did not finish in time.")
        except VideoUnavailable:
            return _error(503, "video_unavailable", "Video generation is unavailable.")
        except VideoError:
            return _error(503, "video_unavailable", "Video generation is unavailable.")
        return VideoResponse(media_url=clip.media_url, provider=clip.provider)

    return router


def _error(
    status_code: int,
    code: Literal[
        "video_unavailable", "video_rejected", "invalid_video_response", "video_deadline_exceeded"
    ],
    message: str,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content=VideoErrorResponse(code=code, message=message).model_dump(),
    )
