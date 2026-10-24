from pathlib import Path

import pytest
from liuliangchuhai.bootstrap.container import build_container
from liuliangchuhai.bootstrap.settings import Settings
from liuliangchuhai.domain.digital_human import DigitalHumanGenerationInput, GeneratedVideo
from liuliangchuhai.infrastructure.digital_human import mux, speech
from liuliangchuhai.infrastructure.digital_human.local_presenter import LocalPresenterAdapter
from liuliangchuhai.infrastructure.digital_human.timeline import Caption


@pytest.fixture
def offline_speech(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Replace the network TTS with a locally generated silent clip.

    These tests cover framing, caption burn-in and caching; none of that needs
    the Edge service, and a real request would make `make check` depend on an
    external network.
    """
    import subprocess

    audio = tmp_path / "silence.mp3"
    subprocess.run(
        [
            mux.ffmpeg_path(),
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-f",
            "lavfi",
            "-i",
            "anullsrc=r=24000:cl=mono",
            "-t",
            "1.2",
            str(audio),
        ],
        check=True,
        timeout=60,
    )
    payload = audio.read_bytes()

    async def fake_synthesise(script, language, voice, destination):
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(payload)
        return speech.Clip(
            audio_path=destination,
            cues=(Caption(start=0.0, end=1.2, text=script),),
            voice="test-voice",
        )

    monkeypatch.setattr(speech, "synthesise", fake_synthesise)


def test_local_provider_is_wired_from_settings(tmp_path: Path) -> None:
    settings = Settings(
        _env_file=None,
        digital_human_provider="local",
        media_dir=str(tmp_path),
    )

    container = build_container(settings)

    assert isinstance(container.digital_human, LocalPresenterAdapter)


def test_media_url_prefix_is_normalised() -> None:
    adapter = LocalPresenterAdapter(
        media_root=Path("media"),
        public_prefix="/media/",
        timeout_seconds=5,
    )

    assert adapter._public_prefix == "/media"


def test_blank_public_prefix_is_rejected() -> None:
    with pytest.raises(ValueError, match="public_prefix"):
        LocalPresenterAdapter(media_root=Path("media"), public_prefix="  ", timeout_seconds=5)


@pytest.mark.asyncio
async def test_status_reports_provider_name_and_local_availability() -> None:
    adapter = LocalPresenterAdapter(
        media_root=Path("media"), public_prefix="/media", timeout_seconds=5
    )

    status = await adapter.status()

    assert status.provider == "local-presenter"
    # ffmpeg and a Unicode font ship with the demo, so this host must be ready.
    assert status.available is True


@pytest.mark.asyncio
async def test_a_supplied_avatar_clip_replaces_the_middle_shot(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.delenv("LIULIANGCHUHAI_AVATAR_CLIP", raising=False)
    clip = tmp_path / "avatar.mp4"
    clip.write_bytes(b"pretend footage")
    captured: dict[str, object] = {}

    async def fake_probe_duration(path: Path) -> float:
        return 9.0

    async def fake_render(**kwargs: object) -> Path:
        captured.update(kwargs)
        destination = kwargs["destination"]
        assert isinstance(destination, Path)
        destination.write_bytes(b"video")
        return destination

    async def fake_synthesise(script, language, voice, destination):
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(b"audio")
        return speech.Clip(
            audio_path=destination, cues=(Caption(0.0, 9.0, script),), voice="test-voice"
        )

    monkeypatch.setattr(mux, "probe_duration", fake_probe_duration)
    monkeypatch.setattr(mux, "render", fake_render)
    monkeypatch.setattr(speech, "synthesise", fake_synthesise)

    adapter = LocalPresenterAdapter(media_root=tmp_path, public_prefix="/media", timeout_seconds=30)
    await adapter.generate(DigitalHumanGenerationInput(script="六堡茶来自梧州。", language="中文"))

    scenes = captured["scenes"]
    assert isinstance(scenes, list)
    assert len(scenes) == 3
    # Opening card, the footage, the end card.
    assert scenes[1] == clip
    assert scenes[0].suffix == ".png"
    assert scenes[2].suffix == ".png"


@pytest.mark.asyncio
async def test_generate_reuses_an_identical_script(tmp_path: Path, offline_speech: None) -> None:
    adapter = LocalPresenterAdapter(
        media_root=tmp_path, public_prefix="/media", timeout_seconds=180
    )
    generation = DigitalHumanGenerationInput(script="六堡茶来自梧州。", language="中文")

    first = await adapter.generate(generation)
    second = await adapter.generate(generation)

    assert isinstance(first, GeneratedVideo)
    assert first == second
    assert (tmp_path / Path(first.media_url).name).is_file()


@pytest.mark.asyncio
async def test_generate_produces_a_playable_mp4(tmp_path: Path, offline_speech: None) -> None:
    adapter = LocalPresenterAdapter(
        media_root=tmp_path, public_prefix="/media", timeout_seconds=180
    )

    video = await adapter.generate(
        DigitalHumanGenerationInput(script="百色芒果适合做饮品。", language="中文")
    )

    path = tmp_path / Path(video.media_url).name
    assert video.media_url.startswith("/media/presenter-")
    assert path.suffix == ".mp4"
    # An MP4 keeps its ftyp box in the first bytes; a truncated render would not.
    assert path.read_bytes()[:8].endswith(b"ftyp")
    assert path.stat().st_size > 10_000
