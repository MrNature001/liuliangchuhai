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
from liuliangchuhai.infrastructure.video.grok_video import GrokVideoAdapter

REQUEST = VideoGenerationInput(
    prompt="a basket of golden mangoes, morning light",
    image_url="https://cdn.example/still.png",
)


def _adapter(handler, tmp_path: Path, **kwargs) -> GrokVideoAdapter:
    return GrokVideoAdapter(
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
            return httpx.Response(200, json={"request_id": "v1"})
        if request.url.path.endswith("/content"):
            seen["content_auth"] = request.headers.get("authorization")
            return httpx.Response(200, content=b"mp4-bytes")
        if request.url.path == "/v1/videos/v1":
            return httpx.Response(
                200,
                json={
                    "status": "done",
                    "progress": 100,
                    "video": {"url": "/v1/videos/v1/content"},
                },
            )
        return httpx.Response(404)

    return handler


@pytest.mark.asyncio
async def test_it_renders_a_clip_from_a_still(tmp_path: Path) -> None:
    seen: dict[str, object] = {}

    clip = await _adapter(_happy_path(seen), tmp_path).generate(REQUEST)

    assert clip.provider == "grok-video"
    assert (tmp_path / Path(clip.media_url).name).read_bytes() == b"mp4-bytes"
    body = seen["submit"]
    assert body == {
        "model": "grok-imagine-video-1.5",
        "prompt": REQUEST.prompt,
        "duration": 4,
        "resolution": "480p",
        "image": {"url": "https://cdn.example/still.png"},
    }
    assert seen["content_auth"] == "Bearer sk-test"


@pytest.mark.asyncio
async def test_a_prompt_only_render_uses_the_configured_ratio(tmp_path: Path) -> None:
    seen: dict[str, object] = {}

    await _adapter(_happy_path(seen), tmp_path).generate(
        VideoGenerationInput(prompt="salted duck eggs on a plate")
    )

    body = seen["submit"]
    assert "image" not in body
    assert body["aspect_ratio"] == "9:16"


@pytest.mark.asyncio
async def test_it_waits_through_pending_answers(tmp_path: Path) -> None:
    calls = {"poll": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"request_id": "v1"})
        if request.url.path.endswith("/content"):
            return httpx.Response(200, content=b"mp4-bytes")
        calls["poll"] += 1
        if calls["poll"] < 3:
            return httpx.Response(202, json={"status": "pending", "progress": 10})
        return httpx.Response(200, json={"status": "done", "video": {"url": "/content"}})

    clip = await _adapter(handler, tmp_path).generate(REQUEST)

    assert calls["poll"] == 3
    assert clip.media_url.startswith("/media/clip-")


@pytest.mark.asyncio
async def test_a_foreign_cdn_url_is_fetched_without_the_key(tmp_path: Path) -> None:
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"request_id": "v1"})
        if request.url.host == "cdn.example":
            seen["cdn_auth"] = request.headers.get("authorization")
            return httpx.Response(200, content=b"mp4-bytes")
        return httpx.Response(
            200,
            json={"status": "done", "video": {"url": "https://cdn.example/out.mp4"}},
        )

    await _adapter(handler, tmp_path).generate(REQUEST)

    assert seen["cdn_auth"] is None


@pytest.mark.asyncio
async def test_a_lookalike_origin_does_not_receive_the_key(tmp_path: Path) -> None:
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"request_id": "v1"})
        if request.url.host == "relay.example.evil.com":
            seen["evil_auth"] = request.headers.get("authorization")
            return httpx.Response(200, content=b"mp4-bytes")
        return httpx.Response(
            200,
            json={
                "status": "done",
                "video": {"url": "https://relay.example.evil.com/out.mp4"},
            },
        )

    await _adapter(handler, tmp_path).generate(REQUEST)

    assert seen["evil_auth"] is None


@pytest.mark.asyncio
async def test_a_local_picture_is_inlined_as_a_data_uri(tmp_path: Path) -> None:
    from PIL import Image

    Image.new("RGB", (60, 80), (200, 120, 80)).save(tmp_path / "still.png")
    seen: dict[str, object] = {}

    await _adapter(_happy_path(seen), tmp_path).generate(
        VideoGenerationInput(prompt="gentle breeze", image_path="still.png")
    )

    image = seen["submit"]["image"]["url"]
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
            return httpx.Response(200, json={"request_id": "v1"})
        return httpx.Response(200, json={"status": "failed"})

    with pytest.raises(VideoError, match="failed render"):
        await _adapter(handler, tmp_path).generate(REQUEST)


@pytest.mark.asyncio
async def test_a_done_task_without_a_url_is_unreadable(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"request_id": "v1"})
        return httpx.Response(200, json={"status": "done"})

    with pytest.raises(InvalidVideoResponse):
        await _adapter(handler, tmp_path).generate(REQUEST)


@pytest.mark.asyncio
async def test_an_unknown_status_is_unreadable(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"request_id": "v1"})
        return httpx.Response(200, json={"status": "mystery"})

    with pytest.raises(InvalidVideoResponse):
        await _adapter(handler, tmp_path).generate(REQUEST)


@pytest.mark.asyncio
async def test_a_refused_key_keeps_the_relay_message(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            403,
            json={"error": {"message": "This group cannot generate video"}},
        )

    with pytest.raises(VideoUnavailable, match="cannot generate video"):
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
            return httpx.Response(200, json={"request_id": "v1"})
        return httpx.Response(202, json={"status": "pending"})

    adapter = GrokVideoAdapter(
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
        if request.method == "POST":
            await asyncio.sleep(0.3)
            return httpx.Response(200, json={"request_id": "v1"})
        # A fast, terminal answer: without a bound on submission this poll would
        # raise InvalidVideoResponse instead of the deadline error.
        return httpx.Response(200, json={"status": "mystery"})


@pytest.mark.asyncio
async def test_the_deadline_covers_submission_too(tmp_path: Path) -> None:
    adapter = GrokVideoAdapter(
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
async def test_a_malformed_download_url_maps_to_unavailable(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"request_id": "v1"})
        return httpx.Response(
            200,
            json={"status": "done", "video": {"url": "https://cdn.example:abc/out.mp4"}},
        )

    with pytest.raises(VideoUnavailable):
        await _adapter(handler, tmp_path).generate(REQUEST)


@pytest.mark.asyncio
async def test_status_is_false_when_the_transport_fails(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("offline")

    assert (await _adapter(handler, tmp_path).status()).available is False


def test_resolution_is_validated(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="resolution"):
        GrokVideoAdapter(api_key="k", media_root=tmp_path, resolution="2K")


def test_duration_is_validated(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="duration"):
        GrokVideoAdapter(api_key="k", media_root=tmp_path, duration_seconds=16)


def test_base_url_and_model_are_validated(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="base_url"):
        GrokVideoAdapter(api_key="k", media_root=tmp_path, base_url=" ")
    with pytest.raises(ValueError, match="model"):
        GrokVideoAdapter(api_key="k", media_root=tmp_path, model=" ")
