from typing import Literal

from pydantic import BaseModel, ConfigDict

from liuliangchuhai.presentation.http.schemas import NonBlankString


class DigitalHumanRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    script: NonBlankString
    language: NonBlankString


class DigitalHumanResponse(BaseModel):
    media_url: NonBlankString


class DigitalHumanErrorResponse(BaseModel):
    code: Literal[
        "digital_human_unavailable",
        "digital_human_rejected",
        "invalid_digital_human_response",
        "digital_human_deadline_exceeded",
    ]
    message: str
