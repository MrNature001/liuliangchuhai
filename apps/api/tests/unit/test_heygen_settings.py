import pytest
from liuliangchuhai.bootstrap.settings import Settings
from pydantic import ValidationError


def test_heygen_requires_a_key() -> None:
    with pytest.raises(ValidationError, match="HEYGEN_API_KEY"):
        Settings(_env_file=None, digital_human_provider="heygen")


def test_heygen_requires_avatar_and_voice_identifiers() -> None:
    with pytest.raises(ValidationError, match="HEYGEN_AVATAR_ID"):
        Settings(
            _env_file=None,
            digital_human_provider="heygen",
            heygen_api_key="secret",
            heygen_voice_id="voice-1",
        )


def test_heygen_accepts_a_complete_configuration() -> None:
    settings = Settings(
        _env_file=None,
        digital_human_provider="heygen",
        heygen_api_key="secret",
        heygen_avatar_id="avatar-1",
        heygen_voice_id="voice-1",
        digital_human_timeout_seconds=120,
    )

    assert settings.digital_human_provider == "heygen"
    assert settings.digital_human_timeout_seconds == 120


def test_mock_provider_needs_no_heygen_credentials() -> None:
    settings = Settings(_env_file=None)

    assert settings.digital_human_provider == "mock"
    assert settings.heygen_api_key is None
