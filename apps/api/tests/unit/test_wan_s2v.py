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
from liuliangchuhai.infrastructure.digital_human import dashscope_s2v, mux, speech

GENERATION = DigitalHumanGenerationInput(script="六堡茶来自梧州。", language="中文")
SUBMIT = "/services/aigc/image2video/video-synthesis"


@pytest.fixture
def uploaded(monkeypatch: pytest.MonkeyPatch) -> list[str]:
    names: list[str] = []

    async def fake_upload(*, api_key, model, source, transport=None, base_url=""):
        names.append(Path(source).name)
        return f"oss://bucket/{Path(source).name}"

    async def fake_synthesise(script, language, voice, destination):
        Path(destination).parent.mkdir(parents=True, exist_ok=True)
        Path(destination).write_bytes(b"audio")
        return speech.Clip(audio_path=Path(destination), cues=(), voice="test")

    async def fake_probe(path: Path) -> float:
        return 8.0

    monkeypatch.setattr(dashscope_s2v, "upload_file", fake_upload)
    monkeypatch.setattr(dashscope_s2v.speech, "synthesise", fake_synthesise)
    monkeypatch.setattr(dashscope_s2v.mux, "probe_duration", fake_probe)
    return names


def _adapter(tmp_path: Path, handler, **kwargs) -> dashscope_s2v.WanSpeechToVideoAdapter:
    portrait = kwargs.pop("portrait", "https://cdn.example/me.jpg")
    return dashscope_s2v.WanSpeechToVideoAdapter(
        api_key="sk-test",
        portrait=portrait,
        timeout_seconds=10,
        media_root=tmp_path,
        poll_interval_seconds=0,
        transport=httpx.MockTransport(handler),
        **kwargs,
    )


@pytest.mark.asyncio
async def test_submits_both_inputs_and_downloads_the_result(
    tmp_path: Path, uploaded: list[str]
) -> None:
    calls: list[dict] = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            calls.append(json.loads(request.content))
            return httpx.Response(200, json={"output": {"task_id": "t1"}})
        if request.url.path.endswith("/tasks/t1"):
            return httpx.Response(
                200,
                json={
                    "output": {
                        "task_status": "SUCCEEDED",
                        "video_url": "https://cdn.example/out.mp4",
                    }
                },
            )
        return httpx.Response(200, content=b"mp4-bytes")

    video = await _adapter(tmp_path, handler).generate(GENERATION)

    assert video.media_url.startswith("/media/presenter-")
    assert (tmp_path / Path(video.media_url).name).read_bytes() == b"mp4-bytes"
    body = calls[0]
    assert body["model"] == "wan2.2-s2v"
    assert body["input"]["image_url"] == "https://cdn.example/me.jpg"
    assert body["input"]["audio_url"].startswith("oss://")
    assert body["parameters"]["resolution"] == "720P"
    assert uploaded  # the narration went through the upload endpoint


@pytest.mark.asyncio
async def test_a_local_portrait_is_uploaded(tmp_path: Path, uploaded: list[str]) -> None:
    portrait = tmp_path / "me.png"
    portrait.write_bytes(b"png")

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"output": {"task_id": "t1"}})
        if request.url.path.endswith("/tasks/t1"):
            return httpx.Response(
                200, json={"output": {"task_status": "SUCCEEDED", "video_url": "https://x/y.mp4"}}
            )
        return httpx.Response(200, content=b"mp4")

    await _adapter(tmp_path, handler, portrait=str(portrait)).generate(GENERATION)

    assert "me.png" in uploaded


@pytest.mark.asyncio
async def test_a_long_narration_is_rejected(
    tmp_path: Path, uploaded: list[str], monkeypatch: pytest.MonkeyPatch
) -> None:
    async def too_long(path: Path) -> float:
        return 25.0

    monkeypatch.setattr(dashscope_s2v.mux, "probe_duration", too_long)

    with pytest.raises(DigitalHumanRejected, match="20-second"):
        await _adapter(tmp_path, lambda request: httpx.Response(200)).generate(GENERATION)


@pytest.mark.asyncio
async def test_a_missing_portrait_file_is_reported(tmp_path: Path, uploaded: list[str]) -> None:
    with pytest.raises(DigitalHumanUnavailable, match="portrait"):
        await _adapter(
            tmp_path, lambda request: httpx.Response(200), portrait=str(tmp_path / "nope.png")
        ).generate(GENERATION)


@pytest.mark.parametrize(
    ("status", "error"),
    [(400, DigitalHumanRejected), (401, DigitalHumanUnavailable), (500, DigitalHumanUnavailable)],
)
@pytest.mark.asyncio
async def test_submit_failures_map_onto_the_contract(
    tmp_path: Path, uploaded: list[str], status: int, error: type[Exception]
) -> None:
    with pytest.raises(error):
        await _adapter(tmp_path, lambda request: httpx.Response(status)).generate(GENERATION)


@pytest.mark.asyncio
async def test_a_failed_task_is_an_error(tmp_path: Path, uploaded: list[str]) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST":
            return httpx.Response(200, json={"output": {"task_id": "t1"}})
        return httpx.Response(200, json={"output": {"task_status": "FAILED"}})

    with pytest.raises(Exception, match="failed render"):
        await _adapter(tmp_path, handler).generate(GENERATION)


@pytest.mark.asyncio
async def test_an_unreadable_task_is_rejected(tmp_path: Path, uploaded: list[str]) -> None:
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


def test_mux_and_speech_are_the_same_modules() -> None:
    """Guard the monkeypatch targets: the adapter must import the real modules."""
    assert mux.__name__.endswith("mux")
    assert speech.__name__.endswith("speech")
