import pytest
from httpx import ASGITransport, AsyncClient
from liuliangchuhai.bootstrap.app import create_app
from liuliangchuhai.bootstrap.settings import Settings


@pytest.mark.asyncio
async def test_default_application_requires_no_external_credentials(monkeypatch) -> None:
    monkeypatch.delenv("LIULIANGCHUHAI_LLM_PROVIDER", raising=False)
    monkeypatch.delenv("LIULIANGCHUHAI_DIGITAL_HUMAN_PROVIDER", raising=False)

    # _env_file=None keeps an operator's local .env from overriding the mock defaults.
    async with AsyncClient(
        transport=ASGITransport(app=create_app(Settings(_env_file=None))),
        base_url="http://test",
    ) as client:
        response = await client.get("/health")

    assert response.status_code == 200
    assert response.json()["providers"] == {
        "llm": {"provider": "mock", "available": True},
        "digital_human": {"provider": "mock", "available": True},
    }
