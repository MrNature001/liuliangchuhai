from typing import Literal

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from liuliangchuhai.application.ports.digital_human_errors import (
    DigitalHumanDeadlineExceeded,
    DigitalHumanError,
    DigitalHumanRejected,
    DigitalHumanUnavailable,
    InvalidDigitalHumanResponse,
)
from liuliangchuhai.application.use_cases.generate_digital_human import (
    GenerateDigitalHumanUseCase,
)
from liuliangchuhai.domain.digital_human import DigitalHumanGenerationInput
from liuliangchuhai.presentation.http.digital_human_schemas import (
    DigitalHumanErrorResponse,
    DigitalHumanRequest,
    DigitalHumanResponse,
)


def create_digital_human_router(
    generate_digital_human: GenerateDigitalHumanUseCase,
) -> APIRouter:
    router = APIRouter()

    @router.post(
        "/digital-human",
        response_model=DigitalHumanResponse,
        operation_id="generate_digital_human",
        responses={
            422: {
                "model": DigitalHumanErrorResponse,
                "description": "Provider rejected the generation input",
            },
            502: {
                "model": DigitalHumanErrorResponse,
                "description": "Provider returned an unreadable result",
            },
            503: {
                "model": DigitalHumanErrorResponse,
                "description": "Provider is temporarily unavailable",
            },
            504: {
                "model": DigitalHumanErrorResponse,
                "description": "Generation exceeded the local deadline",
            },
        },
    )
    async def generate_digital_human_video(
        request: DigitalHumanRequest,
    ) -> DigitalHumanResponse | JSONResponse:
        generation = DigitalHumanGenerationInput(script=request.script, language=request.language)
        try:
            video = await generate_digital_human.execute(generation)
        except DigitalHumanRejected:
            return _error(422, "digital_human_rejected", "Generation input was rejected.")
        except InvalidDigitalHumanResponse:
            return _error(
                502, "invalid_digital_human_response", "Provider returned an unreadable result."
            )
        except DigitalHumanDeadlineExceeded:
            return _error(
                504, "digital_human_deadline_exceeded", "Generation did not finish in time."
            )
        except DigitalHumanUnavailable:
            return _error(503, "digital_human_unavailable", "Digital human service is unavailable.")
        except DigitalHumanError:
            return _error(503, "digital_human_unavailable", "Digital human service is unavailable.")
        return DigitalHumanResponse(media_url=video.media_url)

    return router


def _error(
    status_code: int,
    code: Literal[
        "digital_human_unavailable",
        "digital_human_rejected",
        "invalid_digital_human_response",
        "digital_human_deadline_exceeded",
    ],
    message: str,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content=DigitalHumanErrorResponse(code=code, message=message).model_dump(),
    )
