from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from liuliangchuhai.bootstrap.app import create_app
from liuliangchuhai.bootstrap.settings import Settings

REQUEST = {"prompt": "a bowl of rice with salted duck egg, warm kitchen light"}


@pytest.fixture
def client(tmp_path: Path) -> TestClient:
    return TestClient(
        create_app(Settings(_env_file=None, video_provider="off", media_dir=str(tmp_path)))
    )


def test_the_default_provider_returns_its_placeholder(client: TestClient) -> None:
    response = client.post("/video", json=REQUEST)

    assert response.status_code == 200
    assert response.json() == {
        "media_url": "mock://videos/generated-clip.mp4",
        "provider": "mock",
    }


def test_an_image_url_is_accepted(client: TestClient) -> None:
    response = client.post("/video", json={**REQUEST, "image_url": "https://cdn.example/a.png"})

    assert response.status_code == 200


@pytest.mark.parametrize(
    "payload",
    [
        {"prompt": ""},
        {"prompt": "   "},
        {},
        {**REQUEST, "extra": True},
    ],
)
def test_request_validation_rejects_blank_or_extra_fields(
    client: TestClient, payload: dict[str, object]
) -> None:
    assert client.post("/video", json=payload).status_code == 422


def test_the_real_provider_requires_a_bailian_key(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="DASHSCOPE_API_KEY"):
        Settings(_env_file=None, video_provider="wan_i2v", media_dir=str(tmp_path))
