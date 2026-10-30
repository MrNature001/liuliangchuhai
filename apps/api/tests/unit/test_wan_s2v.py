import json
from pathlib import Path

import httpx
import pytest
from liuliangchuhai.application.ports.digital_human_errors import (
    DigitalHumanRejected,
    DigitalHumanUnavailable,
    InvalidDigitalHumanResponse,
)
from liuliangchuhai.domain.digital_human import DigitalHumanGenerationInput
from liuliangchuhai.infrastructure.digital_human import dashscope_s2v
from PIL import Image

GENERATION = DigitalHumanGenerationInput(script="六堡茶来自梧州。", language="中文")
TTS_BASE = "https://ws.example/api/v1"


@pytest.fixture
def speech(monkeypatch: pytest.MonkeyPatch) -> list[str]:
    """Stand in for Qwen TTS: hand back a URL and write a small mp3."""
    calls: list[str] = []

    async def fake_synthesise_url(*, api_key, text, model, voice, base_url="", transport=None):
        calls.append(text)
        assert base_url == TTS_BASE
        return "https://bucket.example/narration.mp3"

    async def fake_download(url, destination, transport=None):
        Path(destination).parent.mkdir(parents=True, exist_ok=True)
        Path(destination).write_bytes(b"ID3-fake")
        return Path(destination)

    async def fake_probe(path: Path) -> float:
        return 8.0

    monkeypatch.setattr(dashscope_s2v.qwen_tts, "synthesise_url", fake_synthesise_url)
    monkeypatch.setattr(dashscope_s2v.qwen_tts, "download", fake_download)
    monkeypatch.setattr(dashscope_s2v.mux, "probe_duration", fake_probe)
    return calls


def _adapter(tmp_path: Path, handler, **kwargs) -> dashscope_s2v.WanSpeechToVideoAdapter:
    portrait = kwargs.pop("portrait", "https://cdn.example/me.jpg")
    return dashscope_s2v.WanSpeechToVideoAdapter(
        api_key="sk-test",
        portrait=portrait,
        timeout_seconds=10,
        media_root=tmp_path,
        resolution="480P",
        tts_base_url=TTS_BASE,
        poll_interval_seconds=0,
        transport=httpx.MockTransport(handler),
        **kwargs,
    )


def _happy(seen: dict[str, object]):
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            seen["submit"] = json.loads(request.content)
            return httpx.Response(200, json={"output": {"task_id": "t1"}})
        if request.url.path.endswith("/tasks/t1"):
            return httpx.Response(
                200,
                json={
                    "output": {"task_status": "SUCCEEDED", "video_url": "https://cdn.example/o.mp4"}
                },
            )
        return httpx.Response(200, content=b"mp4-bytes")

    return handler


@pytest.mark.asyncio
async def test_it_submits_the_narrated_url_and_saves_the_result(
    tmp_path: Path, speech: list[str]
) -> None:
    seen: dict[str, object] = {}

    video = await _adapter(tmp_path, _happy(seen)).generate(GENERATION)

    assert video.media_url.startswith("/media/presenter-")
    assert (tmp_path / Path(video.media_url).name).read_bytes() == b"mp4-bytes"
    body = seen["submit"]
    assert body["model"] == "wan2.2-s2v"
    assert body["input"]["audio_url"] == "https://bucket.example/narration.mp3"
    assert body["input"]["image_url"] == "https://cdn.example/me.jpg"
    assert speech == ["六堡茶来自梧州。"]


@pytest.mark.asyncio
async def test_a_local_portrait_is_inlined(tmp_path: Path, speech: list[str]) -> None:
    portrait = tmp_path / "me.png"
    Image.new("RGB", (40, 60), (200, 120, 80)).save(portrait)
    seen: dict[str, object] = {}

    await _adapter(tmp_path, _happy(seen), portrait=str(portrait)).generate(GENERATION)

    assert seen["submit"]["input"]["image_url"].startswith("data:image/jpeg;base64,")


@pytest.mark.asyncio
async def test_a_long_narration_is_rejected(
    tmp_path: Path, speech: list[str], monkeypatch: pytest.MonkeyPatch
) -> None:
    async def too_long(path: Path) -> float:
        return 25.0

    monkeypatch.setattr(dashscope_s2v.mux, "probe_duration", too_long)

    with pytest.raises(DigitalHumanRejected, match="20-second"):
        await _adapter(tmp_path, _happy({})).generate(GENERATION)


@pytest.mark.asyncio
async def test_a_missing_portrait_file_is_reported(tmp_path: Path, speech: list[str]) -> None:
    with pytest.raises(DigitalHumanUnavailable, match="portrait"):
        await _adapter(tmp_path, _happy({}), portrait=str(tmp_path / "nope.png")).generate(
            GENERATION
        )


@pytest.mark.asyncio
async def test_without_a_speech_endpoint_it_refuses(tmp_path: Path, speech: list[str]) -> None:
    adapter = dashscope_s2v.WanSpeechToVideoAdapter(
        api_key="sk-test",
        portrait="https://cdn.example/me.jpg",
        timeout_seconds=10,
        media_root=tmp_path,
        poll_interval_seconds=0,
        transport=httpx.MockTransport(_happy({})),
    )

    with pytest.raises(DigitalHumanUnavailable, match="speech endpoint"):
        await adapter.generate(GENERATION)


@pytest.mark.parametrize(
    ("status", "error"),
    [(400, DigitalHumanRejected), (401, DigitalHumanUnavailable), (500, DigitalHumanUnavailable)],
)
@pytest.mark.asyncio
async def test_submit_failures_map_onto_the_contract(
    tmp_path: Path, speech: list[str], status: int, error: type[Exception]
) -> None:
    with pytest.raises(error):
        await _adapter(tmp_path, lambda request: httpx.Response(status)).generate(GENERATION)


@pytest.mark.asyncio
async def test_a_failed_task_is_an_error(tmp_path: Path, speech: list[str]) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"output": {"task_id": "t1"}})
        return httpx.Response(200, json={"output": {"task_status": "FAILED"}})

    with pytest.raises(Exception, match="failed render"):
        await _adapter(tmp_path, handler).generate(GENERATION)


@pytest.mark.asyncio
async def test_an_unreadable_task_is_rejected(tmp_path: Path, speech: list[str]) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"output": {"task_id": "t1"}})
        return httpx.Response(200, json={"output": {"task_status": "SUCCEEDED"}})

    with pytest.raises(InvalidDigitalHumanResponse):
        await _adapter(tmp_path, handler).generate(GENERATION)


@pytest.mark.asyncio
async def test_status_is_false_when_the_transport_fails(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("offline")

    assert (await _adapter(tmp_path, handler).status()).available is False


def test_resolution_is_validated(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="resolution"):
        dashscope_s2v.WanSpeechToVideoAdapter(
            api_key="k",
            portrait="https://x/y.jpg",
            timeout_seconds=1,
            media_root=tmp_path,
            resolution="1080P",
        )
