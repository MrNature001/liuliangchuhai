from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from liuliangchuhai.bootstrap.app import create_app
from liuliangchuhai.bootstrap.settings import Settings

REQUEST = {
    "prompt": "A tea gift box on a wooden table, soft morning light",
    "language": "英语",
    "headline": "A quiet gift from Guangxi",
}


@pytest.fixture
def client(tmp_path: Path) -> TestClient:
    return TestClient(
        create_app(Settings(_env_file=None, image_provider="drawn", media_dir=str(tmp_path)))
    )


def test_the_drawn_provider_returns_a_served_png(client: TestClient, tmp_path: Path) -> None:
    response = client.post("/image", json=REQUEST)

    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "drawn"
    assert body["media_url"].startswith("/media/keyvisual-")
    assert (tmp_path / Path(body["media_url"]).name).is_file()


def test_the_mock_provider_returns_its_placeholder(tmp_path: Path) -> None:
    client = TestClient(
        create_app(Settings(_env_file=None, image_provider="mock", media_dir=str(tmp_path)))
    )

    body = client.post("/image", json=REQUEST).json()

    assert body == {"media_url": "mock://images/generated-image.png", "provider": "mock"}


@pytest.mark.parametrize(
    "payload",
    [
        {**REQUEST, "prompt": ""},
        {**REQUEST, "language": "   "},
        {k: v for k, v in REQUEST.items() if k != "headline"},
        {**REQUEST, "extra": True},
    ],
)
def test_request_validation_rejects_blank_or_extra_fields(
    client: TestClient, payload: dict[str, object]
) -> None:
    assert client.post("/image", json=payload).status_code == 422


def test_health_reports_the_image_provider(client: TestClient) -> None:
    providers = client.get("/health").json()["providers"]["image"]

    assert providers == {"provider": "drawn", "available": True}


def test_the_openai_provider_requires_a_key(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="IMAGE_API_KEY"):
        Settings(_env_file=None, image_provider="openai", media_dir=str(tmp_path))
