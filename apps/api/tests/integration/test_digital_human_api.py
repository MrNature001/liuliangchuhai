import pytest
from fastapi.testclient import TestClient
from liuliangchuhai.bootstrap.app import create_app
from liuliangchuhai.bootstrap.settings import Settings


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app(Settings(_env_file=None)))


def test_mock_digital_human_returns_the_placeholder_media_url(client: TestClient) -> None:
    response = client.post("/digital-human", json={"script": "Demo script", "language": "English"})

    assert response.status_code == 200
    assert response.json() == {"media_url": "mock://digital-human/generated-video.mp4"}


@pytest.mark.parametrize(
    "payload",
    [
        {"script": "", "language": "English"},
        {"script": "Demo script", "language": "   "},
        {"script": "Demo script"},
        {"script": "Demo script", "language": "English", "extra": True},
    ],
)
def test_request_validation_rejects_blank_or_extra_fields(
    client: TestClient, payload: dict[str, object]
) -> None:
    assert client.post("/digital-human", json=payload).status_code == 422


def test_health_exposes_the_digital_human_provider(client: TestClient) -> None:
    providers = client.get("/health").json()["providers"]["digital_human"]

    assert providers == {"provider": "mock", "available": True}
