"""HeyGen API adapter for digital human video generation."""
import asyncio
import httpx
from typing import Optional

from liuliangchuhai.application.ports.digital_human import DigitalHumanPort
from liuliangchuhai.application.ports.digital_human_errors import (
    DigitalHumanError,
    DigitalHumanProviderUnavailable,
    DigitalHumanGenerationTimeout,
)
from liuliangchuhai.application.ports.status import ProviderStatus
from liuliangchuhai.domain.digital_human import DigitalHumanGenerationInput, GeneratedVideo


class HeyGenAdapter:
    """Adapter for HeyGen API - wraps third-party digital human service."""

    def __init__(self, api_key: str, base_url: str = "https://api.heygen.com/v2"):
        self.api_key = api_key
        self.base_url = base_url
        self.client = httpx.AsyncClient(
            headers={"X-Api-Key": api_key},
            timeout=httpx.Timeout(30.0, read=300.0)
        )

    async def status(self) -> ProviderStatus:
        """Check if HeyGen API is available."""
        try:
            resp = await self.client.get(f"{self.base_url}/avatars")
            return ProviderStatus(available=resp.status_code == 200)
        except Exception:
            return ProviderStatus(available=False)

    async def generate(self, generation: DigitalHumanGenerationInput) -> GeneratedVideo:
        """Generate digital human video via HeyGen API.

        Steps:
        1. Upload audio file to HeyGen
        2. Create video generation task
        3. Poll until completion (max 5 minutes)
        4. Return video URL
        """
        try:
            audio_url = await self._upload_audio(generation.audio_bytes)
            video_id = await self._create_video_task(generation, audio_url)
            video_url = await self._poll_video_ready(video_id, timeout_seconds=300)

            return GeneratedVideo(
                video_url=video_url,
                duration_seconds=generation.duration_seconds,
                avatar_id=generation.avatar_id or "default",
                language=generation.language,
                provider="heygen"
            )
        except httpx.TimeoutException as e:
            raise DigitalHumanGenerationTimeout(f"HeyGen request timeout: {e}")
        except httpx.HTTPStatusError as e:
            raise DigitalHumanProviderUnavailable(f"HeyGen API error: {e.response.status_code}")
        except Exception as e:
            raise DigitalHumanError(f"HeyGen generation failed: {e}")

    async def _upload_audio(self, audio_bytes: bytes) -> str:
        """Upload audio to HeyGen and return hosted URL."""
        files = {"file": ("audio.mp3", audio_bytes, "audio/mpeg")}
        resp = await self.client.post(
            f"{self.base_url}/assets/upload",
            files=files
        )
        resp.raise_for_status()
        return resp.json()["data"]["url"]

    async def _create_video_task(
        self,
        generation: DigitalHumanGenerationInput,
        audio_url: str
    ) -> str:
        """Create video generation task and return task ID."""
        payload = {
            "video_inputs": [{
                "character": {
                    "type": "avatar",
                    "avatar_id": generation.avatar_id or "default_avatar",
                    "avatar_style": "normal"
                },
                "voice": {
                    "type": "audio",
                    "audio_url": audio_url
                },
                "background": {
                    "type": "color",
                    "value": "#FFFFFF"
                }
            }],
            "dimension": {
                "width": 1920,
                "height": 1080
            },
            "test": False
        }

        resp = await self.client.post(
            f"{self.base_url}/video/generate",
            json=payload
        )
        resp.raise_for_status()
        return resp.json()["data"]["video_id"]

    async def _poll_video_ready(self, video_id: str, timeout_seconds: int = 300) -> str:
        """Poll video status until ready or timeout."""
        start_time = asyncio.get_event_loop().time()

        while True:
            elapsed = asyncio.get_event_loop().time() - start_time
            if elapsed > timeout_seconds:
                raise DigitalHumanGenerationTimeout(
                    f"Video generation timeout after {timeout_seconds}s"
                )

            resp = await self.client.get(f"{self.base_url}/video/{video_id}")
            resp.raise_for_status()
            data = resp.json()["data"]

            status = data.get("status")
            if status == "completed":
                return data["video_url"]
            elif status == "failed":
                error_msg = data.get("error", "Unknown error")
                raise DigitalHumanError(f"HeyGen generation failed: {error_msg}")

            await asyncio.sleep(5)

    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()
