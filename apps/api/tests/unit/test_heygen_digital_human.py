import asyncio

import httpx
import pytest
from liuliangchuhai.application.ports.digital_human_errors import (
    DigitalHumanDeadlineExceeded,
    DigitalHumanRejected,
    DigitalHumanUnavailable,
    InvalidDigitalHumanResponse,
)
from liuliangchuhai.domain.digital_human import DigitalHumanGenerationInput, GeneratedVideo
from liuliangchuhai.infrastructure.digital_human.heygen import HeyGenDigitalHumanAdapter


def _adapter(handler: httpx.MockTransport, *, poll_interval: float = 0.0, timeout: float = 5.0):
    return HeyGenDigitalHumanAdapter(
        api_key="test-key",
        avatar_id="avatar-1",
        voice_id="voice-1",
        timeout_seconds=timeout,
        poll_interval_seconds=poll_interval,
        transport=httpx.MockTransport(handler),
    )


def _generation() -> DigitalHumanGenerationInput:
    return DigitalHumanGenerationInput(script="Demo script", language="English")


def test_status_reports_provider_name_and_reachability() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("/avatars")
        assert request.headers["X-Api-Key"] == "test-key"
        return httpx.Response(200, json={"data": []})

    status = asyncio.run(_adapter(handler).status())

    assert status.provider == "heygen"
    assert status.available is True


def test_status_treats_transport_errors_as_unavailable() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("offline", request=request)

    status = asyncio.run(_adapter(handler).status())

    assert status.available is False


def test_generate_submits_script_and_returns_the_finished_media_url() -> None:
    seen: list[dict[str, object]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/video/generate"):
            seen.append({"body": request.read()})
            return httpx.Response(200, json={"data": {"video_id": "vid-1"}})
        return httpx.Response(
            200,
            json={"data": {"status": "completed", "video_url": "https://cdn.example/v.mp4"}},
        )

    result = asyncio.run(_adapter(handler).generate(_generation()))

    assert result == GeneratedVideo(media_url="https://cdn.example/v.mp4")
    assert len(seen) == 1


def test_generate_polls_until_the_remote_render_is_terminal() -> None:
    calls = {"count": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/video/generate"):
            return httpx.Response(200, json={"data": {"video_id": "vid-1"}})
        calls["count"] += 1
        if calls["count"] < 3:
            return httpx.Response(200, json={"data": {"status": "processing"}})
        return httpx.Response(
            200, json={"data": {"status": "completed", "video_url": "https://cdn.example/v.mp4"}}
        )

    result = asyncio.run(_adapter(handler).generate(_generation()))

    assert result.media_url == "https://cdn.example/v.mp4"
    assert calls["count"] == 3


def test_generate_maps_provider_rejection_to_the_application_error() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(422, json={"error": {"message": "bad avatar"}})

    with pytest.raises(DigitalHumanRejected):
        asyncio.run(_adapter(handler).generate(_generation()))


def test_generate_maps_server_failure_to_unavailable() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, json={})

    with pytest.raises(DigitalHumanUnavailable):
        asyncio.run(_adapter(handler).generate(_generation()))


def test_generate_rejects_a_response_without_a_video_id() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"data": {}})

    with pytest.raises(InvalidDigitalHumanResponse):
        asyncio.run(_adapter(handler).generate(_generation()))


def test_generate_reports_a_failed_render_without_returning_a_url() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/video/generate"):
            return httpx.Response(200, json={"data": {"video_id": "vid-1"}})
        return httpx.Response(200, json={"data": {"status": "failed"}})

    with pytest.raises(Exception) as caught:
        asyncio.run(_adapter(handler).generate(_generation()))

    assert "failed" in str(caught.value)


def test_generate_stops_polling_at_the_local_deadline() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/video/generate"):
            return httpx.Response(200, json={"data": {"video_id": "vid-1"}})
        return httpx.Response(200, json={"data": {"status": "processing"}})

    with pytest.raises(DigitalHumanDeadlineExceeded):
        asyncio.run(_adapter(handler, poll_interval=0.01, timeout=0.05).generate(_generation()))
