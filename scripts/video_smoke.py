# -*- coding: utf-8 -*-
"""Render one clip through the configured Ark-compatible video endpoint.

    uv run --project apps/api python scripts/video_smoke.py --prompt "a basket of ripe mangoes, morning light"

    # Copy a catalog still into apps/api/media first; the adapter only reads
    # pictures inside that directory (catalog photos live under apps/web/public).
    uv run --project apps/api python scripts/video_smoke.py --prompt "steam over a bowl of luosifen" --image liuzhou-luosifen-1.webp

The relay bills per generated second: five seconds at ¥0.6/s is about ¥3. It
needs a token from the relay's video group; a chat or image-group token comes
back 403 "not enabled for this group". Output lands in the API media directory.
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "apps" / "api" / "src"))

from liuliangchuhai.application.ports.video_errors import VideoError  # noqa: E402
from liuliangchuhai.bootstrap.settings import Settings  # noqa: E402
from liuliangchuhai.domain.video import VideoGenerationInput  # noqa: E402
from liuliangchuhai.infrastructure.video.ark_video import ArkVideoAdapter  # noqa: E402

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


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
    parser.add_argument("--duration", type=int, default=None, help="seconds, 4-15 on the relay")
    parser.add_argument("--resolution", default=None, help="480P, 720P or 1080P")
    return parser


async def _render(args: argparse.Namespace) -> int:
    settings = Settings()
    if settings.ark_video_api_key is None or not (
        settings.ark_video_api_key.get_secret_value().strip()
    ):
        print(
            "LIULIANGCHUHAI_ARK_VIDEO_API_KEY is empty. Create a token in the relay's "
            "video group (视频分组) and put it in apps/api/.env.",
            file=sys.stderr,
        )
        return 2

    adapter = ArkVideoAdapter(
        api_key=settings.ark_video_api_key.get_secret_value(),
        base_url=settings.ark_video_base_url,
        model=settings.ark_video_model,
        resolution=args.resolution or settings.ark_video_resolution,
        duration_seconds=args.duration or settings.ark_video_duration_seconds,
        ratio=settings.ark_video_ratio,
        generate_audio=settings.ark_video_generate_audio,
        watermark=settings.ark_video_watermark,
        media_root=settings.resolved_media_dir,
        public_prefix=settings.media_url_prefix,
        timeout_seconds=settings.video_timeout_seconds,
    )
    request = VideoGenerationInput(
        prompt=args.prompt,
        image_path=args.image or None,
        image_url=args.image_url or None,
    )
    print(
        f"rendering with {settings.ark_video_model} at {settings.ark_video_base_url} "
        f"({args.duration or settings.ark_video_duration_seconds}s, "
        f"{args.resolution or settings.ark_video_resolution})...",
        flush=True,
    )
    try:
        clip = await adapter.generate(request)
    except VideoError as exc:
        print(f"failed: {exc}", file=sys.stderr)
        if "group" in str(exc).lower():
            print(
                "The relay key is not in the video group. Create a token under "
                "视频分组 and update LIULIANGCHUHAI_ARK_VIDEO_API_KEY.",
                file=sys.stderr,
            )
        return 1

    path = settings.resolved_media_dir / Path(clip.media_url).name
    print(f"provider: {clip.provider}")
    print(f"file:     {path}")
    print(f"url:      {settings.media_url_prefix}/{path.name}")
    return 0


def main() -> None:
    raise SystemExit(asyncio.run(_render(_parser().parse_args())))


if __name__ == "__main__":
    main()
