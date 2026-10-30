from typing import Literal

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from liuliangchuhai.application.ports.image_errors import (
    ImageError,
    ImageRejected,
    ImageUnavailable,
    InvalidImageResponse,
)
from liuliangchuhai.application.use_cases.generate_image import GenerateImageUseCase
from liuliangchuhai.domain.image import ImageGenerationInput
from liuliangchuhai.presentation.http.image_schemas import (
    ImageErrorResponse,
    ImageRequest,
    ImageResponse,
)


def create_image_router(generate_image: GenerateImageUseCase) -> APIRouter:
    router = APIRouter()

    @router.post(
        "/image",
        response_model=ImageResponse,
        operation_id="generate_image",
        responses={
            422: {
                "model": ImageErrorResponse,
                "description": "Provider rejected the prompt",
            },
            502: {
                "model": ImageErrorResponse,
                "description": "Provider returned an unreadable result",
            },
            503: {
                "model": ImageErrorResponse,
                "description": "Provider is temporarily unavailable",
            },
        },
    )
    async def generate_key_visual(request: ImageRequest) -> ImageResponse | JSONResponse:
        generation = ImageGenerationInput(
            prompt=request.prompt, language=request.language, headline=request.headline
        )
        try:
            image = await generate_image.execute(generation)
        except ImageRejected:
            return _error(422, "image_rejected", "The image prompt was rejected.")
        except InvalidImageResponse:
            return _error(502, "invalid_image_response", "Provider returned an unreadable result.")
        except ImageUnavailable:
            return _error(503, "image_unavailable", "Image generation is unavailable.")
        except ImageError:
            return _error(503, "image_unavailable", "Image generation is unavailable.")
        return ImageResponse(media_url=image.media_url, provider=image.provider)

    return router


def _error(
    status_code: int,
    code: Literal["image_unavailable", "image_rejected", "invalid_image_response"],
    message: str,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content=ImageErrorResponse(code=code, message=message).model_dump(),
    )
