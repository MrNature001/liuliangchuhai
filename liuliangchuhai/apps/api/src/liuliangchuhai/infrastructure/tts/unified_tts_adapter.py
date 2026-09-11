"""Unified TTS adapter - self-hosted CosyVoice + MiniMax API fallback."""
import os
from typing import Optional
import httpx

from liuliangchuhai.domain.tts import TTSRequest, TTSResult


class UnifiedTTSAdapter:
    """Unified TTS adapter with self-hosted CosyVoice for 8 languages + MiniMax API for pt/ar."""

    COSYVOICE_LANGUAGES = {"zh", "en", "ja", "ko", "es", "fr", "de", "ru"}

    def __init__(
        self,
        cosyvoice_url: Optional[str] = None,
        minimax_api_key: Optional[str] = None
    ):
        self.cosyvoice_url = cosyvoice_url or os.getenv("COSYVOICE_URL", "http://localhost:8000")
        self.minimax_api_key = minimax_api_key or os.getenv("MINIMAX_API_KEY")
        self.client = httpx.AsyncClient(timeout=60.0)

    async def synthesize(self, request: TTSRequest) -> TTSResult:
        """Synthesize speech from text."""
        if request.language in self.COSYVOICE_LANGUAGES:
            return await self._synthesize_cosyvoice(request)
        elif request.language in {"pt", "ar"}:
            if not self.minimax_api_key:
                raise ValueError("MiniMax API key required for pt/ar languages")
            return await self._synthesize_minimax(request)
        else:
            raise ValueError(f"Unsupported language: {request.language}")

    async def _synthesize_cosyvoice(self, request: TTSRequest) -> TTSResult:
        """Synthesize via self-hosted CosyVoice."""
        payload = {
            "text": request.text,
            "language": request.language,
            "voice_id": request.voice_id or "default",
            "speed": request.speed or 1.0,
            "streaming": False
        }

        resp = await self.client.post(
            f"{self.cosyvoice_url}/v1/tts",
            json=payload
        )
        resp.raise_for_status()

        return TTSResult(
            audio_bytes=resp.content,
            duration_seconds=None,
            provider="cosyvoice",
            language=request.language
        )

    async def _synthesize_minimax(self, request: TTSRequest) -> TTSResult:
        """Synthesize via MiniMax API for pt/ar."""
        payload = {
            "text": request.text,
            "voice_id": request.voice_id or "default",
            "language": request.language,
            "speed": request.speed or 1.0
        }

        resp = await self.client.post(
            "https://api.minimax.chat/v1/text_to_speech",
            headers={
                "Authorization": f"Bearer {self.minimax_api_key}",
                "Content-Type": "application/json"
            },
            json=payload
        )
        resp.raise_for_status()

        return TTSResult(
            audio_bytes=resp.content,
            duration_seconds=None,
            provider="minimax",
            language=request.language
        )

    async def close(self):
        await self.client.aclose()
