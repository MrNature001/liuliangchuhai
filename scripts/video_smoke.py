# -*- coding: utf-8 -*-
"""Render one clip through the configured video provider.

    uv run --project apps/api python scripts/video_smoke.py --prompt "a basket of ripe mangoes, morning light"

    # Copy a catalog still into apps/api/media first; the adapters only read
    # pictures inside that directory (catalog photos live under apps/web/public).
    uv run --project apps/api python scripts/video_smoke.py --prompt "steam over a bowl of luosifen" --image liuzhou-luosifen-1.webp

The provider is whichever LIULIANGCHUHAI_VIDEO_PROVIDER names (grok, ark or
wan_i2v), with its own credentials in apps/api/.env. Rendering is billed per
generated second; output lands in the API media directory.
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "apps" / "api" / "src"))

from liuliangchuhai.application.ports.video_errors import VideoError  # noqa: E402
from liuliangchuhai.bootstrap.container import build_container  # noqa: E402
from liuliangchuhai.bootstrap.settings import Settings  # noqa: E402
from liuliangchuhai.domain.video import VideoGenerationInput  # noqa: E402
from pydantic import ValidationError  # noqa: E402

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

_DURATION_FIELDS = {
    "grok": "grok_video_duration_seconds",
    "ark": "ark_video_duration_seconds",
    "wan_i2v": "video_duration_seconds",
}
_RESOLUTION_FIELDS = {
    "grok": "grok_video_resolution",
    "ark": "ark_video_resolution",
    "wan_i2v": "video_resolution",
}
_SUPPORTED_PROVIDERS = frozenset(_DURATION_FIELDS)


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prompt", required=True, help="what the clip should show")
    source = parser.add_mutually_exclusive_group()
    source.add_argument(
        "--image",
        default="",
        help="a picture inside apps/api/media/ (absolute paths must stay inside it)",
    )
    source.add_argument("--image-url", default="", help="a publicly reachable still")
    parser.add_argument("--duration", type=int, default=None, help="seconds, 4-15")
    parser.add_argument("--resolution", default=None, help="480P, 720P or 1080P")
    return parser


def _adjusted(settings: Settings, args: argparse.Namespace) -> Settings:
    updates: dict[str, object] = {}
    duration_field = _DURATION_FIELDS.get(settings.video_provider)
    if args.duration is not None and duration_field:
        updates[duration_field] = args.duration
    resolution_field = _RESOLUTION_FIELDS.get(settings.video_provider)
    if args.resolution is not None and resolution_field:
        updates[resolution_field] = args.resolution
    return settings.model_copy(update=updates) if updates else settings


def _describe(settings: Settings) -> str:
    if settings.video_provider == "grok":
        return (
            f"{settings.grok_video_model} at {settings.grok_video_base_url} "
            f"({settings.grok_video_duration_seconds}s, {settings.grok_video_resolution})"
        )
    if settings.video_provider == "ark":
        return (
            f"{settings.ark_video_model} at {settings.ark_video_base_url} "
            f"({settings.ark_video_duration_seconds}s, {settings.ark_video_resolution})"
        )
    if settings.video_provider == "wan_i2v":
        return (
            f"{settings.video_model} at DashScope "
            f"({settings.video_duration_seconds}s, {settings.video_resolution})"
        )
    return settings.video_provider


async def _render(args: argparse.Namespace) -> int:
    try:
        settings = _adjusted(Settings(), args)
    except ValidationError as exc:
        print(f"invalid configuration: {exc}", file=sys.stderr)
        return 2
    if settings.video_provider not in _SUPPORTED_PROVIDERS:
        print(
            f"LIULIANGCHUHAI_VIDEO_PROVIDER is {settings.video_provider!r}; "
            "set it to grok, ark or wan_i2v.",
            file=sys.stderr,
        )
        return 2
    try:
        container = build_container(settings)
    except ValueError as exc:
        print(f"cannot build the {settings.video_provider} provider: {exc}", file=sys.stderr)
        return 2

    request = VideoGenerationInput(
        prompt=args.prompt,
        image_path=args.image or None,
        image_url=args.image_url or None,
    )
    print(f"rendering with {_describe(settings)}...", flush=True)
    try:
        clip = await container.videos.generate(request)
    except VideoError as exc:
        print(f"failed: {exc}", file=sys.stderr)
        if "group" in str(exc).lower():
            print(
                "The relay key is not allowed for this route: Seedance needs an OpenAI "
                "or composite group; a video-group key serves grok-imagine-video-1.5.",
                file=sys.stderr,
            )
        return 1

    path = settings.resolved_media_dir / Path(clip.media_url).name
    if not path.is_file() or path.stat().st_size == 0:
        print(f"failed: {clip.media_url} was reported but no file was written", file=sys.stderr)
        return 1
    print(f"provider: {clip.provider}")
    print(f"file:     {path}")
    print(f"url:      {settings.media_url_prefix}/{path.name}")
    return 0


def main() -> None:
    raise SystemExit(asyncio.run(_render(_parser().parse_args())))


if __name__ == "__main__":
    main()
