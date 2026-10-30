import asyncio
from dataclasses import dataclass

from liuliangchuhai.application.ports.digital_human import DigitalHumanPort
from liuliangchuhai.application.ports.image import ImagePort
from liuliangchuhai.application.ports.llm import LLMPort
from liuliangchuhai.application.ports.status import ProviderStatus


@dataclass(frozen=True, slots=True)
class SystemStatus:
    llm: ProviderStatus
    digital_human: ProviderStatus
    image: ProviderStatus


class GetSystemStatus:
    """Report wiring health; this intentionally contains no product behavior."""

    def __init__(self, llm: LLMPort, digital_human: DigitalHumanPort, images: ImagePort) -> None:
        self._llm = llm
        self._digital_human = digital_human
        self._images = images

    async def execute(self) -> SystemStatus:
        llm_status, digital_human_status, image_status = await asyncio.gather(
            self._llm.status(),
            self._digital_human.status(),
            self._images.status(),
        )
        return SystemStatus(llm=llm_status, digital_human=digital_human_status, image=image_status)
