from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, StringConstraints

NonBlankString = Annotated[str, StringConstraints(strict=True, min_length=1, pattern=r"\S")]


class VideoRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    prompt: NonBlankString
    image_url: NonBlankString | None = None


class VideoResponse(BaseModel):
    media_url: NonBlankString
    provider: NonBlankString


class VideoErrorResponse(BaseModel):
    code: Literal[
        "video_unavailable", "video_rejected", "invalid_video_response", "video_deadline_exceeded"
    ]
    message: str
