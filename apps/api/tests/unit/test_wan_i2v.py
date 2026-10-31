import json
from pathlib import Path

import httpx
import pytest
from liuliangchuhai.application.ports.video_errors import (
    InvalidVideoResponse,
    VideoError,
    VideoRejected,
    VideoUnavailable,
)
from liuliangchuhai.domain.video import VideoGenerationInput
from liuliangchuhai.infrastructure.video.wan_i2v import WanImageToVideoAdapter

REQUEST = VideoGenerationInput(
    prompt="a bowl of rice with salted duck egg, warm kitchen light",
    image_url="https://cdn.example/still.png",
)
STILL_BASE = "https://still.example/compatible-mode/v1"


def _adapter(handler, tmp_path: Path, **kwargs) -> WanImageToVideoAdapter:
    return WanImageToVideoAdapter(
        api_key="sk-test",
        media_root=tmp_path,
        poll_interval_seconds=0,
        transport=httpx.MockTransport(handler),
        **kwargs,
    )


def _happy_path(seen: dict[str, object]):
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            seen["submit"] = json.loads(request.content)
            return httpx.Response(200, json={"output": {"task_id": "t1"}})
        if request.url.path.endswith("/tasks/t1"):
            return httpx.Response(
                200,
                json={
                    "output": {
                        "task_status": "SUCCEEDED",
                        "results": {"video_url": "https://cdn.example/out.mp4"},
                    }
                },
            )
        return httpx.Response(200, content=b"mp4-bytes")

    return handler


@pytest.mark.asyncio
async def test_it_animates_the_supplied_image(tmp_path: Path) -> None:
    seen: dict[str, object] = {}

    clip = await _adapter(_happy_path(seen), tmp_path).generate(REQUEST)

    assert clip.provider == "wan-i2v"
    assert (tmp_path / Path(clip.media_url).name).read_bytes() == b"mp4-bytes"
    body = seen["submit"]
    assert body["model"] == "wan2.5-i2v-preview"
    assert body["input"]["img_url"] == "https://cdn.example/still.png"
    assert body["parameters"] == {"resolution": "480P", "duration": 10}


@pytest.mark.asyncio
async def test_it_draws_a_public_still_when_only_a_prompt_is_given(
    tmp_path: Path,
) -> None:
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.host == "still.example":
            seen["still"] = json.loads(request.content)
            return httpx.Response(200, json={"data": [{"url": "https://public.example/drawn.png"}]})
        return _happy_path(seen)(request)

    clip = await _adapter(handler, tmp_path, still_base_url=STILL_BASE).generate(
        VideoGenerationInput(prompt=REQUEST.prompt)
    )

    assert clip.media_url.startswith("/media/clip-")
    assert seen["still"]["model"] == "qwen-image-3.0-pro"
    assert seen["submit"]["input"]["img_url"] == "https://public.example/drawn.png"


@pytest.mark.asyncio
async def test_a_prompt_without_a_still_endpoint_is_rejected(tmp_path: Path) -> None:
    with pytest.raises(VideoRejected, match="image_url"):
        await _adapter(_happy_path({}), tmp_path).generate(
            VideoGenerationInput(prompt=REQUEST.prompt)
        )


@pytest.mark.asyncio
async def test_a_failed_task_is_an_error(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"output": {"task_id": "t1"}})
        return httpx.Response(200, json={"output": {"task_status": "FAILED"}})

    with pytest.raises(VideoError, match="failed render"):
        await _adapter(handler, tmp_path).generate(REQUEST)


@pytest.mark.asyncio
async def test_a_succeeded_task_without_a_url_is_unreadable(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"output": {"task_id": "t1"}})
        return httpx.Response(200, json={"output": {"task_status": "SUCCEEDED"}})

    with pytest.raises(InvalidVideoResponse):
        await _adapter(handler, tmp_path).generate(REQUEST)


@pytest.mark.parametrize(
    ("status", "error"),
    [(400, VideoRejected), (401, VideoUnavailable), (500, VideoUnavailable)],
)
@pytest.mark.asyncio
async def test_submit_failures_map_onto_the_contract(
    tmp_path: Path, status: int, error: type[Exception]
) -> None:
    with pytest.raises(error):
        await _adapter(lambda request: httpx.Response(status), tmp_path).generate(REQUEST)


@pytest.mark.asyncio
async def test_status_is_false_when_the_transport_fails(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("offline")

    assert (await _adapter(handler, tmp_path).status()).available is False


def test_resolution_is_validated(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="resolution"):
        WanImageToVideoAdapter(api_key="k", media_root=tmp_path, resolution="1080P")


def _picture(tmp_path: Path) -> Path:
    from PIL import Image

    path = tmp_path / "portrait.png"
    Image.new("RGB", (60, 80), (200, 120, 80)).save(path)
    return path


@pytest.mark.asyncio
async def test_a_local_picture_is_inlined_as_a_data_uri(tmp_path: Path) -> None:
    seen: dict[str, object] = {}
    _picture(tmp_path)

    await _adapter(_happy_path(seen), tmp_path).generate(
        VideoGenerationInput(prompt="gentle breeze", image_path="portrait.png")
    )

    img = seen["submit"]["input"]["img_url"]
    assert img.startswith("data:image/jpeg;base64,")


@pytest.mark.asyncio
async def test_a_path_outside_the_media_directory_is_rejected(tmp_path: Path) -> None:
    outside = tmp_path.parent / "elsewhere.png"
    outside.write_bytes(b"x")

    with pytest.raises(VideoRejected, match="media directory"):
        await _adapter(_happy_path({}), tmp_path).generate(
            VideoGenerationInput(prompt="x", image_path=str(outside))
        )


@pytest.mark.asyncio
async def test_a_missing_local_picture_is_rejected(tmp_path: Path) -> None:
    with pytest.raises(VideoRejected, match="readable file"):
        await _adapter(_happy_path({}), tmp_path).generate(
            VideoGenerationInput(prompt="x", image_path="nope.png")
        )


def test_url_and_path_together_are_rejected() -> None:
    with pytest.raises(ValueError, match="either"):
        VideoGenerationInput(prompt="x", image_url="https://a/b.png", image_path="c.png")
