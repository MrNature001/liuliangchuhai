from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, StringConstraints

NonBlankString = Annotated[str, StringConstraints(strict=True, min_length=1, pattern=r"\S")]


class ImageRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    prompt: NonBlankString
    language: NonBlankString
    headline: NonBlankString


class ImageResponse(BaseModel):
    media_url: NonBlankString
    provider: NonBlankString


class ImageErrorResponse(BaseModel):
    code: Literal["image_unavailable", "image_rejected", "invalid_image_response"]
    message: str
