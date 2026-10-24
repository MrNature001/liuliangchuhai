import tempfile
from pathlib import Path

import httpx
import pytest
from liuliangchuhai.application.ports.digital_human_errors import (
    DigitalHumanDeadlineExceeded,
    DigitalHumanError,
    DigitalHumanRejected,
    DigitalHumanUnavailable,
    InvalidDigitalHumanResponse,
)
from liuliangchuhai.domain.digital_human import DigitalHumanGenerationInput
from liuliangchuhai.infrastructure.digital_human.dashscope import (
    DashScopeDigitalHumanAdapter,
)

SOURCE = "https://cdn.example/source.mp4"
AUDIO = "oss://dashscope/narration.mp3"
RESULT = "https://cdn.example/out.mp4"
VIDEO_BYTES = b"\x00\x00\x00\x18ftypmp42-fake-video"


def adapter(handler, *, timeout: float = 5.0, media_root=None) -> DashScopeDigitalHumanAdapter:
    return DashScopeDigitalHumanAdapter(
        api_key="sk-test",
        source_video_url=SOURCE,
        timeout_seconds=timeout,
        media_root=media_root or Path(tempfile.mkdtemp()),
        poll_interval_seconds=0,
        transport=httpx.MockTransport(handler),
    )


def render_handler(states=("SUCCEEDED",), *, result_url=RESULT):
    """Serve submit, poll and download from one transport."""
    pending = list(states)

    def handler(request: httpx.Request) -> httpx.Response:
        if str(request.url) == RESULT:
            return httpx.Response(200, content=VIDEO_BYTES)
        if request.method == "POST":
            return httpx.Response(200, json={"output": {"task_id": "t-1"}})
        state = pending.pop(0) if len(pending) > 1 else pending[0]
        output: dict[str, object] = {"task_status": state}
        if state == "SUCCEEDED":
            output["results"] = {"video_url": result_url}
        return httpx.Response(200, json={"output": output})

    return handler


def test_blank_api_key_is_rejected() -> None:
    with pytest.raises(ValueError, match="api_key"):
        DashScopeDigitalHumanAdapter(
            api_key="  ",
            source_video_url=SOURCE,
            timeout_seconds=5,
            media_root=Path(tempfile.gettempdir()),
        )


def test_blank_source_video_is_rejected() -> None:
    with pytest.raises(ValueError, match="source_video_url"):
        DashScopeDigitalHumanAdapter(
            api_key="sk",
            source_video_url=" ",
            timeout_seconds=5,
            media_root=Path(tempfile.gettempdir()),
        )


@pytest.mark.asyncio
async def test_generate_speaks_then_uploads_then_renders(tmp_path, monkeypatch) -> None:
    """The port is text-shaped, so generate() must own the whole chain."""
    uploaded: list[str] = []

    async def fake_synthesise(script, language, voice, destination):
        destination.write_bytes(b"audio")
        return type("Clip", (), {"audio_path": destination, "cues": ()})()

    async def fake_upload(*, api_key, model, source, transport=None):
        uploaded.append(model)
        return AUDIO

    monkeypatch.setattr(
        "liuliangchuhai.infrastructure.digital_human.dashscope.speech.synthesise",
        fake_synthesise,
    )
    monkeypatch.setattr(
        "liuliangchuhai.infrastructure.digital_human.dashscope.upload_file",
        fake_upload,
    )

    adapter_ = DashScopeDigitalHumanAdapter(
        api_key="sk-test",
        source_video_url=SOURCE,
        timeout_seconds=5,
        media_root=tmp_path,
        poll_interval_seconds=0,
        transport=httpx.MockTransport(render_handler()),
    )
    result = await adapter_.generate(DigitalHumanGenerationInput(script="稿子", language="中文"))

    assert uploaded == ["videoretalk"]
    assert result.media_url.startswith("/media/presenter-")
    stored = tmp_path / result.media_url.rsplit("/", 1)[-1]
    assert stored.read_bytes() == VIDEO_BYTES


@pytest.mark.asyncio
async def test_successful_render_downloads_the_clip_locally(tmp_path) -> None:
    result = await adapter(render_handler(), media_root=tmp_path).generate_from_audio(AUDIO)

    assert result.media_url.startswith("/media/presenter-")
    assert (tmp_path / result.media_url.rsplit("/", 1)[-1]).read_bytes() == VIDEO_BYTES


@pytest.mark.asyncio
async def test_the_same_render_is_not_downloaded_twice(tmp_path) -> None:
    calls: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        if str(request.url) == RESULT:
            calls.append("download")
            return httpx.Response(200, content=VIDEO_BYTES)
        if request.method == "POST":
            return httpx.Response(200, json={"output": {"task_id": "t-1"}})
        return httpx.Response(
            200, json={"output": {"task_status": "SUCCEEDED", "results": {"video_url": RESULT}}}
        )

    adapter_ = adapter(handler, media_root=tmp_path)
    first = await adapter_.generate_from_audio(AUDIO)
    second = await adapter_.generate_from_audio(AUDIO)

    assert first == second
    assert calls == ["download"]


@pytest.mark.asyncio
async def test_submit_payload_carries_model_source_and_audio() -> None:
    seen: dict[str, bytes] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        if str(request.url) == RESULT:
            return httpx.Response(200, content=VIDEO_BYTES)
        if request.method == "POST":
            seen["body"] = request.content
            return httpx.Response(200, json={"output": {"task_id": "t-1"}})
        return httpx.Response(
            200, json={"output": {"task_status": "SUCCEEDED", "results": {"video_url": RESULT}}}
        )

    await adapter(handler).generate_from_audio(AUDIO)

    assert b"videoretalk" in seen["body"]
    assert AUDIO.encode() in seen["body"]
    assert SOURCE.encode() in seen["body"]


@pytest.mark.asyncio
async def test_polling_survives_running_states() -> None:
    result = await adapter(render_handler(("PENDING", "RUNNING", "SUCCEEDED"))).generate_from_audio(
        AUDIO
    )

    assert result.media_url.startswith("/media/")


@pytest.mark.asyncio
async def test_missing_task_id_is_an_invalid_response() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"output": {}})

    with pytest.raises(InvalidDigitalHumanResponse, match="task id"):
        await adapter(handler).generate_from_audio(AUDIO)


@pytest.mark.asyncio
async def test_rejected_input_is_not_retried() -> None:
    with pytest.raises(DigitalHumanRejected):
        await adapter(
            lambda request: httpx.Response(400, json={"code": "BadRequest"})
        ).generate_from_audio(AUDIO)


@pytest.mark.asyncio
async def test_bad_api_key_maps_to_unavailable() -> None:
    with pytest.raises(DigitalHumanUnavailable, match="API key"):
        await adapter(lambda request: httpx.Response(401)).generate_from_audio(AUDIO)


@pytest.mark.asyncio
async def test_failed_task_raises_a_provider_error() -> None:
    with pytest.raises(DigitalHumanError, match="failed"):
        await adapter(render_handler(("FAILED",))).generate_from_audio(AUDIO)


@pytest.mark.asyncio
async def test_unknown_task_state_is_an_invalid_response() -> None:
    with pytest.raises(InvalidDigitalHumanResponse, match="unknown"):
        await adapter(render_handler(("WAT",))).generate_from_audio(AUDIO)


@pytest.mark.asyncio
async def test_success_without_a_video_url_is_an_invalid_response() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"output": {"task_id": "t-1"}})
        return httpx.Response(200, json={"output": {"task_status": "SUCCEEDED", "results": {}}})

    with pytest.raises(InvalidDigitalHumanResponse, match="finished video"):
        await adapter(handler).generate_from_audio(AUDIO)


@pytest.mark.asyncio
async def test_deadline_is_enforced() -> None:
    with pytest.raises(DigitalHumanDeadlineExceeded):
        await adapter(render_handler(("RUNNING",)), timeout=0.05).generate_from_audio(AUDIO)


@pytest.mark.asyncio
async def test_blank_audio_url_is_rejected() -> None:
    with pytest.raises(DigitalHumanRejected, match="audio"):
        await adapter(lambda request: httpx.Response(500)).generate_from_audio("  ")


@pytest.mark.asyncio
async def test_network_failure_maps_to_unavailable() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("boom", request=request)

    with pytest.raises(DigitalHumanUnavailable):
        await adapter(handler).generate_from_audio(AUDIO)


@pytest.mark.asyncio
async def test_a_failed_download_maps_to_unavailable() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if str(request.url) == RESULT:
            return httpx.Response(403)
        if request.method == "POST":
            return httpx.Response(200, json={"output": {"task_id": "t-1"}})
        return httpx.Response(
            200, json={"output": {"task_status": "SUCCEEDED", "results": {"video_url": RESULT}}}
        )

    with pytest.raises(DigitalHumanUnavailable, match="downloaded"):
        await adapter(handler).generate_from_audio(AUDIO)


@pytest.mark.asyncio
async def test_status_reports_availability_from_a_live_endpoint() -> None:
    status = await adapter(lambda request: httpx.Response(404)).status()

    assert status.provider == "dashscope"
    assert status.available is True


@pytest.mark.asyncio
async def test_status_reports_unavailable_on_transport_failure() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("boom", request=request)

    status = await adapter(handler).status()

    assert status.available is False
