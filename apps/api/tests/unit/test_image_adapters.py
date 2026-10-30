import base64
import io
from pathlib import Path

import httpx
import pytest
from liuliangchuhai.application.ports.image_errors import (
    ImageRejected,
    ImageUnavailable,
    InvalidImageResponse,
)
from liuliangchuhai.domain.image import GeneratedImage, ImageGenerationInput
from liuliangchuhai.infrastructure.images.drawn import DrawnImageAdapter
from liuliangchuhai.infrastructure.images.mock import MockImageAdapter
from liuliangchuhai.infrastructure.images.openai_compatible import (
    OpenAICompatibleImageAdapter,
)
from PIL import Image

REQUEST = ImageGenerationInput(
    prompt="A tea gift box on a wooden table, soft morning light",
    language="英语",
    headline="A quiet gift from Guangxi",
)


def _png() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (8, 8), (20, 60, 200)).save(buffer, format="PNG")
    return buffer.getvalue()


PNG = _png()


def test_the_contract_rejects_blank_fields() -> None:
    with pytest.raises(ValueError, match="prompt"):
        ImageGenerationInput(prompt="  ", language="英语", headline="标题")
    with pytest.raises(ValueError, match="media_url"):
        GeneratedImage(media_url=" ", provider="drawn")


@pytest.mark.asyncio
async def test_the_mock_returns_a_placeholder_without_generating() -> None:
    image = await MockImageAdapter().generate(REQUEST)

    assert image.media_url.startswith("mock://")


@pytest.mark.asyncio
async def test_the_drawn_adapter_writes_a_real_png(tmp_path: Path) -> None:
    adapter = DrawnImageAdapter(media_root=tmp_path, public_prefix="/media")

    image = await adapter.generate(REQUEST)

    assert image.provider == "drawn"
    path = tmp_path / Path(image.media_url).name
    assert path.is_file()
    with Image.open(path) as drawn:
        assert drawn.size == (1080, 1920)


@pytest.mark.asyncio
async def test_the_drawn_adapter_reuses_an_identical_request(tmp_path: Path) -> None:
    adapter = DrawnImageAdapter(media_root=tmp_path, public_prefix="/media")

    first = await adapter.generate(REQUEST)
    second = await adapter.generate(REQUEST)

    assert first == second


def _openai(handler, tmp_path: Path, **kwargs) -> OpenAICompatibleImageAdapter:
    return OpenAICompatibleImageAdapter(
        api_key="sk-test",
        model="gpt-image-1",
        media_root=tmp_path,
        transport=httpx.MockTransport(handler),
        **kwargs,
    )


@pytest.mark.asyncio
async def test_openai_saves_base64_output(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("/images/generations")
        assert request.headers["Authorization"] == "Bearer sk-test"
        return httpx.Response(200, json={"data": [{"b64_json": base64.b64encode(PNG).decode()}]})

    image = await _openai(handler, tmp_path).generate(REQUEST)

    assert image.provider == "openai-image"
    assert (tmp_path / Path(image.media_url).name).read_bytes() == PNG


@pytest.mark.asyncio
async def test_openai_downloads_a_url_response(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.host == "cdn.example":
            return httpx.Response(200, content=PNG)
        return httpx.Response(200, json={"data": [{"url": "https://cdn.example/a.png"}]})

    image = await _openai(handler, tmp_path).generate(REQUEST)

    assert (tmp_path / Path(image.media_url).name).read_bytes() == PNG


@pytest.mark.asyncio
async def test_openai_maps_upstream_failures(tmp_path: Path) -> None:
    with pytest.raises(ImageRejected):
        await _openai(lambda request: httpx.Response(400), tmp_path).generate(REQUEST)
    with pytest.raises(ImageUnavailable):
        await _openai(lambda request: httpx.Response(401), tmp_path).generate(REQUEST)
    with pytest.raises(InvalidImageResponse):
        await _openai(lambda request: httpx.Response(200, json={"data": []}), tmp_path).generate(
            REQUEST
        )
    with pytest.raises(InvalidImageResponse):
        await _openai(lambda request: httpx.Response(200, text="not json"), tmp_path).generate(
            REQUEST
        )


@pytest.mark.asyncio
async def test_openai_status_is_false_when_the_transport_fails(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("offline")

    status = await _openai(handler, tmp_path).status()

    assert status.available is False


def test_openai_requires_a_key(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="api_key"):
        OpenAICompatibleImageAdapter(api_key=" ", model="gpt-image-1", media_root=tmp_path)
