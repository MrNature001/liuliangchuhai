import asyncio
import json
from pathlib import Path

import httpx
import pytest
from liuliangchuhai.application.ports.video_errors import (
    InvalidVideoResponse,
    VideoDeadlineExceeded,
    VideoError,
    VideoRejected,
    VideoUnavailable,
)
from liuliangchuhai.domain.video import VideoGenerationInput
from liuliangchuhai.infrastructure.video.ark_video import ArkVideoAdapter

REQUEST = VideoGenerationInput(
    prompt="a basket of golden mangoes, morning light",
    image_url="https://cdn.example/still.png",
)


def _adapter(handler, tmp_path: Path, **kwargs) -> ArkVideoAdapter:
    return ArkVideoAdapter(
        api_key="sk-test",
        media_root=tmp_path,
        base_url="https://relay.example",
        poll_interval_seconds=0,
        transport=httpx.MockTransport(handler),
        **kwargs,
    )


def _happy_path(seen: dict[str, object]):
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            seen["submit"] = json.loads(request.content)
            return httpx.Response(200, json={"id": "t1"})
        if request.url.path.endswith("/tasks/t1"):
            return httpx.Response(
                200,
                json={
                    "id": "t1",
                    "status": "succeeded",
                    "content": {"video_url": "https://cdn.example/out.mp4"},
                },
            )
        return httpx.Response(200, content=b"mp4-bytes")

    return handler


@pytest.mark.asyncio
async def test_it_renders_a_clip_from_a_still(tmp_path: Path) -> None:
    seen: dict[str, object] = {}

    clip = await _adapter(_happy_path(seen), tmp_path).generate(REQUEST)

    assert clip.provider == "ark-video"
    assert (tmp_path / Path(clip.media_url).name).read_bytes() == b"mp4-bytes"
    body = seen["submit"]
    assert body["model"] == "seedance2.5-A"
    assert body["content"] == [
        {"type": "text", "text": REQUEST.prompt},
        {"type": "image_url", "image_url": {"url": "https://cdn.example/still.png"}},
    ]
    assert body["resolution"] == "480p"
    assert body["duration"] == 5
    assert body["ratio"] == "adaptive"


@pytest.mark.asyncio
async def test_a_prompt_only_render_uses_the_configured_ratio(tmp_path: Path) -> None:
    seen: dict[str, object] = {}

    await _adapter(_happy_path(seen), tmp_path).generate(
        VideoGenerationInput(prompt="salted duck eggs on a plate")
    )

    body = seen["submit"]
    assert body["content"] == [
        {"type": "text", "text": "salted duck eggs on a plate"},
    ]
    assert body["ratio"] == "9:16"


@pytest.mark.asyncio
async def test_it_waits_through_queued_and_running(tmp_path: Path) -> None:
    states = iter(["queued", "running", "succeeded"])

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"id": "t1"})
        if request.url.path.endswith("/tasks/t1"):
            state = next(states)
            payload: dict[str, object] = {"id": "t1", "status": state}
            if state == "succeeded":
                payload["content"] = {"video_url": "https://cdn.example/out.mp4"}
            return httpx.Response(200, json=payload)
        return httpx.Response(200, content=b"mp4-bytes")

    clip = await _adapter(handler, tmp_path).generate(REQUEST)

    assert clip.media_url.startswith("/media/clip-")


@pytest.mark.asyncio
async def test_audio_and_watermark_are_omitted_unless_configured(tmp_path: Path) -> None:
    seen: dict[str, object] = {}

    await _adapter(_happy_path(seen), tmp_path).generate(REQUEST)
    assert "generate_audio" not in seen["submit"]
    assert "watermark" not in seen["submit"]

    await _adapter(_happy_path(seen), tmp_path, generate_audio=False, watermark=False).generate(
        REQUEST
    )
    assert seen["submit"]["generate_audio"] is False
    assert seen["submit"]["watermark"] is False


@pytest.mark.asyncio
async def test_a_local_picture_is_inlined_as_a_data_uri(tmp_path: Path) -> None:
    from PIL import Image

    Image.new("RGB", (60, 80), (200, 120, 80)).save(tmp_path / "still.png")
    seen: dict[str, object] = {}

    await _adapter(_happy_path(seen), tmp_path).generate(
        VideoGenerationInput(prompt="gentle breeze", image_path="still.png")
    )

    image = seen["submit"]["content"][1]["image_url"]["url"]
    assert image.startswith("data:image/jpeg;base64,")


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


@pytest.mark.asyncio
async def test_a_failed_render_is_an_error(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"id": "t1"})
        return httpx.Response(200, json={"id": "t1", "status": "failed"})

    with pytest.raises(VideoError, match="failed render"):
        await _adapter(handler, tmp_path).generate(REQUEST)


@pytest.mark.asyncio
async def test_an_expired_render_is_an_error(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"id": "t1"})
        return httpx.Response(200, json={"id": "t1", "status": "expired"})

    with pytest.raises(VideoError, match="expired render"):
        await _adapter(handler, tmp_path).generate(REQUEST)


@pytest.mark.asyncio
async def test_a_succeeded_task_without_a_url_is_unreadable(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"id": "t1"})
        return httpx.Response(200, json={"id": "t1", "status": "succeeded"})

    with pytest.raises(InvalidVideoResponse):
        await _adapter(handler, tmp_path).generate(REQUEST)


@pytest.mark.asyncio
async def test_an_unknown_status_is_unreadable(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"id": "t1"})
        return httpx.Response(200, json={"id": "t1", "status": "mystery"})

    with pytest.raises(InvalidVideoResponse):
        await _adapter(handler, tmp_path).generate(REQUEST)


@pytest.mark.asyncio
async def test_a_group_permission_error_keeps_the_relay_message(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            403,
            json={"error": {"message": "Image generation is not enabled for this group"}},
        )

    with pytest.raises(VideoUnavailable, match="not enabled for this group"):
        await _adapter(handler, tmp_path).generate(REQUEST)


@pytest.mark.parametrize(
    ("status", "error"),
    [(400, VideoRejected), (500, VideoUnavailable)],
)
@pytest.mark.asyncio
async def test_submit_failures_map_onto_the_contract(
    tmp_path: Path, status: int, error: type[Exception]
) -> None:
    with pytest.raises(error):
        await _adapter(lambda request: httpx.Response(status), tmp_path).generate(REQUEST)


@pytest.mark.asyncio
async def test_a_stuck_render_hits_the_local_deadline(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"id": "t1"})
        return httpx.Response(200, json={"id": "t1", "status": "running"})

    adapter = ArkVideoAdapter(
        api_key="sk-test",
        media_root=tmp_path,
        base_url="https://relay.example",
        poll_interval_seconds=0.01,
        timeout_seconds=0.05,
        transport=httpx.MockTransport(handler),
    )

    with pytest.raises(VideoDeadlineExceeded):
        await adapter.generate(REQUEST)


class _SlowSubmit(httpx.AsyncBaseTransport):
    async def handle_async_request(self, request: httpx.Request) -> httpx.Response:
        await asyncio.sleep(0.3)
        return httpx.Response(200, json={"id": "t1"})


@pytest.mark.asyncio
async def test_the_deadline_covers_submission_too(tmp_path: Path) -> None:
    adapter = ArkVideoAdapter(
        api_key="sk-test",
        media_root=tmp_path,
        base_url="https://relay.example",
        poll_interval_seconds=0.01,
        timeout_seconds=0.05,
        transport=_SlowSubmit(),
    )

    with pytest.raises(VideoDeadlineExceeded):
        await adapter.generate(REQUEST)


@pytest.mark.asyncio
async def test_status_is_false_when_the_transport_fails(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("offline")

    assert (await _adapter(handler, tmp_path).status()).available is False


def test_resolution_is_validated(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="resolution"):
        ArkVideoAdapter(api_key="k", media_root=tmp_path, resolution="2K")


def test_duration_is_validated(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="duration"):
        ArkVideoAdapter(api_key="k", media_root=tmp_path, duration_seconds=3)


def test_base_url_and_model_are_validated(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="base_url"):
        ArkVideoAdapter(api_key="k", media_root=tmp_path, base_url=" ")
    with pytest.raises(ValueError, match="model"):
        ArkVideoAdapter(api_key="k", media_root=tmp_path, model=" ")
