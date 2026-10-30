from dataclasses import dataclass


def _require_nonblank_string(value: object, field: str) -> None:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a nonblank string")


@dataclass(frozen=True, slots=True)
class ImageGenerationInput:
    """One key visual: the plan's prompt, plus the copy the frame may carry."""

    prompt: str
    language: str
    headline: str

    def __post_init__(self) -> None:
        _require_nonblank_string(self.prompt, "prompt")
        _require_nonblank_string(self.language, "language")
        _require_nonblank_string(self.headline, "headline")


@dataclass(frozen=True, slots=True)
class GeneratedImage:
    """A finished still the site can show, plus who actually drew it."""

    media_url: str
    provider: str

    def __post_init__(self) -> None:
        _require_nonblank_string(self.media_url, "media_url")
        _require_nonblank_string(self.provider, "provider")
