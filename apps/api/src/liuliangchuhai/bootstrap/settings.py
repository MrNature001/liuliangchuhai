from pathlib import Path
from typing import Self

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env relative to apps/api/ so every launch directory finds the same file.
_API_DIR = Path(__file__).resolve().parent.parent.parent.parent
_env_file = _API_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="LIULIANGCHUHAI_",
        env_file=str(_env_file) if _env_file.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    llm_provider: str = "mock"
    assistant_provider: str = "mock"
    deepseek_api_key: SecretStr | None = None
    deepseek_model: str = "deepseek-v4-flash"
    deepseek_timeout_seconds: float = Field(default=20, gt=0)
    # Content plans produce six long assets from one completion and legitimately
    # outlast a single market-analysis call; keep the budgets independent.
    content_plan_timeout_seconds: float = Field(default=60, gt=0)
    digital_human_provider: str = "mock"
    heygen_api_key: SecretStr | None = None
    heygen_avatar_id: str = ""
    heygen_voice_id: str = ""
    digital_human_timeout_seconds: float = Field(default=300, gt=0)
    # Key visuals. `drawn` composites the plan's prompt into the site's own art
    # with no key at all; `openai` speaks the Images API and also works through
    # a third-party relay, which is why the base URL is configurable.
    image_provider: str = "drawn"
    image_base_url: str = "https://api.openai.com/v1"
    image_api_key: SecretStr | None = None
    image_model: str = "gpt-image-1"
    image_size: str = "1024x1536"
    image_timeout_seconds: float = Field(default=120, gt=0)
    # Alibaba Cloud Bailian (DashScope) talking-head renderer. `videoretalk`
    # re-drives the lips of one source clip, so the clip must be reachable.
    dashscope_api_key: SecretStr | None = None
    dashscope_source_video_url: str = ""
    # Where the key-free local presenter writes rendered MP4 files. Relative
    # values resolve against apps/api so the path is independent of the CWD.
    media_dir: str = "media"
    media_url_prefix: str = "/media"
    # Optional catalog enrichment. `off` keeps the curated demo catalog exactly
    # as shipped; `openfoodfacts` adds a product photo/link where it has a match.
    product_source: str = "off"
    product_source_timeout_seconds: float = Field(default=8, gt=0)
    cors_origins: list[str] = ["http://localhost:3000"]

    @property
    def resolved_media_dir(self) -> Path:
        """Absolute media directory, anchored to apps/api for relative values."""
        candidate = Path(self.media_dir)
        return candidate if candidate.is_absolute() else _API_DIR / candidate

    @model_validator(mode="after")
    def require_selected_provider_credentials(self) -> Self:
        if "deepseek" in (self.llm_provider, self.assistant_provider) and (
            self.deepseek_api_key is None or not self.deepseek_api_key.get_secret_value().strip()
        ):
            raise ValueError(
                "LIULIANGCHUHAI_DEEPSEEK_API_KEY is required when the LLM or assistant "
                "provider is deepseek"
            )
        if self.digital_human_provider == "heygen":
            if self.heygen_api_key is None or not self.heygen_api_key.get_secret_value().strip():
                raise ValueError(
                    "LIULIANGCHUHAI_HEYGEN_API_KEY is required when the digital-human "
                    "provider is heygen"
                )
            if not self.heygen_avatar_id.strip() or not self.heygen_voice_id.strip():
                raise ValueError(
                    "LIULIANGCHUHAI_HEYGEN_AVATAR_ID and LIULIANGCHUHAI_HEYGEN_VOICE_ID "
                    "are required when the digital-human provider is heygen"
                )
        if self.digital_human_provider == "dashscope":
            if (
                self.dashscope_api_key is None
                or not self.dashscope_api_key.get_secret_value().strip()
            ):
                raise ValueError(
                    "LIULIANGCHUHAI_DASHSCOPE_API_KEY is required when the digital-human "
                    "provider is dashscope"
                )
            if not self.dashscope_source_video_url.strip():
                raise ValueError(
                    "LIULIANGCHUHAI_DASHSCOPE_SOURCE_VIDEO_URL is required when the "
                    "digital-human provider is dashscope"
                )
        if self.image_provider == "openai" and (
            self.image_api_key is None or not self.image_api_key.get_secret_value().strip()
        ):
            raise ValueError(
                "LIULIANGCHUHAI_IMAGE_API_KEY is required when the image provider is openai"
            )
        return self
