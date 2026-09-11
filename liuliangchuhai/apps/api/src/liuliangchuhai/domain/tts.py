"""Domain models for TTS."""
from dataclasses import dataclass
from typing import Optional


@dataclass
class TTSRequest:
    """TTS synthesis request."""
    text: str
    language: str
    voice_id: Optional[str] = None
    speed: Optional[float] = 1.0


@dataclass
class TTSResult:
    """TTS synthesis result."""
    audio_bytes: bytes
    duration_seconds: Optional[float]
    provider: str
    language: str
