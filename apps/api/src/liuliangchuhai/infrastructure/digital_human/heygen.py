import httpx

from liuliangchuhai.application.ports.status import ProviderStatus
from liuliangchuhai.domain.digital_human import DigitalHumanGenerationInput, GeneratedVideo


def _require_nonblank(value: object, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a nonblank string")
    return value.strip()


class HeyGenDigitalHumanAdapter:
    """Digital-human provider backed by the HeyGen video API.

    The application only needs a finished media URL, so this adapter owns the whole
    remote workflow: render the script through HeyGen's script-to-video endpoint,
    then poll until the render is terminal or the local deadline expires.
    """

    _BASE_URL = "https://api.heygen.com/v2"
    _POLL_INTERVAL_SECONDS = 5.0

    def __init__(
        self,
        *,
        api_key: str,
        avatar_id: str,
        voice_id: str,
        timeout_seconds: float,
        poll_interval_seconds: float = _POLL_INTERVAL_SECONDS,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        if not api_key.strip():
            raise ValueError("api_key must be a nonblank string")
        self._api_key = api_key.strip()
        self._avatar_id = _require_nonblank(avatar_id, "avatar_id")
        self._voice_id = _require_nonblank(voice_id, "voice_id")
        self._timeout_seconds = timeout_seconds
        self._poll_interval = poll_interval_seconds
        self._transport = transport

    async def status(self) -> ProviderStatus:
        try:
            async with httpx.AsyncClient(
                base_url=self._BASE_URL,
                headers={"X-Api-Key": self._api_key},
                timeout=httpx.Timeout(10.0),
                transport=self._transport,
            ) as client:
                response = await client.get("/avatars")
            return ProviderStatus(provider="heygen", available=response.is_success)
        except Exception:
            return ProviderStatus(provider="heygen", available=False)

    async def generate(self, generation: DigitalHumanGenerationInput) -> GeneratedVideo:
        import asyncio

        from liuliangchuhai.application.ports.digital_human_errors import (
            DigitalHumanDeadlineExceeded,
            DigitalHumanError,
            DigitalHumanRejected,
            DigitalHumanUnavailable,
            InvalidDigitalHumanResponse,
        )

        payload = {
            "video_inputs": [
                {
                    "character": {
                        "type": "avatar",
                        "avatar_id": self._avatar_id,
                        "avatar_style": "normal",
                    },
                    "voice": {
                        "type": "text",
                        "input_text": generation.script,
                        "voice_id": self._voice_id,
                    },
                }
            ],
            "dimension": {"width": 1920, "height": 1080},
            "caption": False,
        }

        async with httpx.AsyncClient(
            base_url=self._BASE_URL,
            headers={"X-Api-Key": self._api_key},
            timeout=httpx.Timeout(30.0),
            transport=self._transport,
        ) as client:
            try:
                created = await client.post("/video/generate", json=payload)
            except httpx.HTTPError:
                raise DigitalHumanUnavailable("HeyGen request failed") from None

            if created.status_code in {400, 422}:
                raise DigitalHumanRejected("HeyGen rejected the generation input")
            if not created.is_success:
                raise DigitalHumanUnavailable("HeyGen request failed")

            try:
                video_id = created.json()["data"]["video_id"]
            except (KeyError, TypeError, ValueError):
                raise InvalidDigitalHumanResponse("HeyGen returned no video id") from None
            if not isinstance(video_id, str) or not video_id.strip():
                raise InvalidDigitalHumanResponse("HeyGen returned no video id")

            try:
                async with asyncio.timeout(self._timeout_seconds):
                    while True:
                        status_response = await client.get(f"/video/{video_id}")
                        if not status_response.is_success:
                            raise DigitalHumanUnavailable("HeyGen request failed")
                        data = status_response.json().get("data", {})
                        state = data.get("status")
                        if state == "completed" and data.get("video_url"):
                            return GeneratedVideo(media_url=data["video_url"])
                        if state == "failed":
                            raise DigitalHumanError("HeyGen reported a failed generation")
                        await asyncio.sleep(self._poll_interval)
            except TimeoutError:
                raise DigitalHumanDeadlineExceeded(
                    "HeyGen generation exceeded the local deadline"
                ) from None
            except (httpx.HTTPError, ValueError, AttributeError):
                raise InvalidDigitalHumanResponse("HeyGen returned an unreadable status") from None
