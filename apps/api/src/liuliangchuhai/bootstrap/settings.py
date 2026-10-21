from pathlib import Path
from typing import Self

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env relative to apps/api/ so every launch directory finds the same file.
_env_file = Path(__file__).resolve().parent.parent.parent.parent / ".env"


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
    digital_human_provider: str = "mock"
    cors_origins: list[str] = ["http://localhost:3000"]

    @model_validator(mode="after")
    def require_selected_provider_credentials(self) -> Self:
        if "deepseek" in (self.llm_provider, self.assistant_provider) and (
            self.deepseek_api_key is None or not self.deepseek_api_key.get_secret_value().strip()
        ):
            raise ValueError(
                "LIULIANGCHUHAI_DEEPSEEK_API_KEY is required when the LLM or assistant "
                "provider is deepseek"
            )
        return self
