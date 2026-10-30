from dataclasses import dataclass


def _require_nonblank_string(value: object, field: str) -> None:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a nonblank string")


@dataclass(frozen=True, slots=True)
class VideoGenerationInput:
    """A clip request: either an image to animate, or a prompt to draw first."""

    prompt: str
    image_url: str | None = None
    # A file under the media directory. The adapter inlines it as a data URI,
    # so a local picture needs no hosting at all.
    image_path: str | None = None

    def __post_init__(self) -> None:
        _require_nonblank_string(self.prompt, "prompt")
        if self.image_url is not None:
            _require_nonblank_string(self.image_url, "image_url")
        if self.image_path is not None:
            _require_nonblank_string(self.image_path, "image_path")
        if self.image_url and self.image_path:
            raise ValueError("send either image_url or image_path, not both")


@dataclass(frozen=True, slots=True)
class GeneratedClip:
    media_url: str
    provider: str

    def __post_init__(self) -> None:
        _require_nonblank_string(self.media_url, "media_url")
        _require_nonblank_string(self.provider, "provider")
