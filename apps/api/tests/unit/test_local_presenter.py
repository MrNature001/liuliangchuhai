from pathlib import Path

import pytest
from liuliangchuhai.bootstrap.container import build_container
from liuliangchuhai.bootstrap.settings import Settings
from liuliangchuhai.domain.digital_human import DigitalHumanGenerationInput, GeneratedVideo
from liuliangchuhai.infrastructure.digital_human.local_presenter import LocalPresenterAdapter


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
async def test_generate_reuses_an_identical_script(tmp_path: Path) -> None:
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
async def test_generate_produces_a_playable_mp4(tmp_path: Path) -> None:
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
