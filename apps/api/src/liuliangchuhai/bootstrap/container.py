from dataclasses import dataclass
from importlib.resources import as_file, files

from liuliangchuhai.application.ports.assistant import AssistantPort
from liuliangchuhai.application.ports.content_planner import ContentPlannerPort
from liuliangchuhai.application.ports.digital_human import DigitalHumanPort
from liuliangchuhai.application.ports.image import ImagePort
from liuliangchuhai.application.ports.llm import LLMPort
from liuliangchuhai.application.ports.product_repository import ProductRepository
from liuliangchuhai.application.ports.video import VideoPort
from liuliangchuhai.application.use_cases.analyze_product import AnalyzeProductUseCase
from liuliangchuhai.application.use_cases.analyze_product_by_id import AnalyzeProductByIdUseCase
from liuliangchuhai.application.use_cases.create_content_plan import CreateContentPlanUseCase
from liuliangchuhai.application.use_cases.create_content_plan_by_id import (
    CreateContentPlanByIdUseCase,
)
from liuliangchuhai.application.use_cases.generate_digital_human import GenerateDigitalHumanUseCase
from liuliangchuhai.application.use_cases.generate_image import GenerateImageUseCase
from liuliangchuhai.application.use_cases.generate_video import GenerateVideoUseCase
from liuliangchuhai.application.use_cases.get_product import GetProduct
from liuliangchuhai.application.use_cases.get_system_status import GetSystemStatus
from liuliangchuhai.application.use_cases.list_products import ListProducts
from liuliangchuhai.application.use_cases.reply_to_customer import ReplyToCustomer
from liuliangchuhai.bootstrap.settings import Settings
from liuliangchuhai.infrastructure.assistant.deepseek import DeepSeekAssistantAdapter
from liuliangchuhai.infrastructure.assistant.mock import MockAssistantAdapter
from liuliangchuhai.infrastructure.content.deepseek import DeepSeekContentPlannerAdapter
from liuliangchuhai.infrastructure.content.mock import MockContentPlannerAdapter
from liuliangchuhai.infrastructure.digital_human.dashscope import (
    DashScopeDigitalHumanAdapter,
)
from liuliangchuhai.infrastructure.digital_human.dashscope_s2v import (
    WanSpeechToVideoAdapter,
)
from liuliangchuhai.infrastructure.digital_human.heygen import HeyGenDigitalHumanAdapter
from liuliangchuhai.infrastructure.digital_human.local_presenter import LocalPresenterAdapter
from liuliangchuhai.infrastructure.digital_human.mock import MockDigitalHumanAdapter
from liuliangchuhai.infrastructure.images.dashscope import DashScopeImageAdapter
from liuliangchuhai.infrastructure.images.drawn import DrawnImageAdapter
from liuliangchuhai.infrastructure.images.mock import MockImageAdapter
from liuliangchuhai.infrastructure.images.openai_compatible import (
    OpenAICompatibleImageAdapter,
)
from liuliangchuhai.infrastructure.llm.deepseek import DeepSeekLLMAdapter
from liuliangchuhai.infrastructure.llm.mock import MockLLMAdapter
from liuliangchuhai.infrastructure.products.enrichment import EnrichedProductRepository
from liuliangchuhai.infrastructure.products.json_repository import JsonProductRepository
from liuliangchuhai.infrastructure.products.openfoodfacts import OpenFoodFactsSource
from liuliangchuhai.infrastructure.video.mock import MockVideoAdapter
from liuliangchuhai.infrastructure.video.wan_i2v import WanImageToVideoAdapter


@dataclass(frozen=True, slots=True)
class Container:
    assistant: AssistantPort
    reply_to_customer: ReplyToCustomer
    llm: LLMPort
    content_planner: ContentPlannerPort
    create_content_plan: CreateContentPlanUseCase
    create_content_plan_by_id: CreateContentPlanByIdUseCase
    digital_human: DigitalHumanPort
    generate_digital_human: GenerateDigitalHumanUseCase
    images: ImagePort
    generate_image: GenerateImageUseCase
    videos: VideoPort
    generate_video: GenerateVideoUseCase
    get_system_status: GetSystemStatus
    product_repository: ProductRepository
    list_products: ListProducts
    get_product: GetProduct
    analyze_product: AnalyzeProductUseCase
    analyze_product_by_id: AnalyzeProductByIdUseCase


def _build_llm(settings: Settings) -> LLMPort:
    if settings.llm_provider == "mock":
        return MockLLMAdapter()
    if settings.llm_provider == "deepseek":
        assert settings.deepseek_api_key is not None
        return DeepSeekLLMAdapter(
            api_key=settings.deepseek_api_key.get_secret_value(),
            model=settings.deepseek_model,
            timeout_seconds=settings.deepseek_timeout_seconds,
        )
    raise ValueError(f"Unsupported LLM provider: {settings.llm_provider!r}")


def _build_assistant(settings: Settings) -> AssistantPort:
    if settings.assistant_provider == "mock":
        return MockAssistantAdapter()
    if settings.assistant_provider == "deepseek":
        assert settings.deepseek_api_key is not None
        return DeepSeekAssistantAdapter(
            api_key=settings.deepseek_api_key.get_secret_value(),
            model=settings.deepseek_model,
            timeout_seconds=settings.deepseek_timeout_seconds,
        )
    raise ValueError(f"Unsupported assistant provider: {settings.assistant_provider!r}")


def _build_content_planner(settings: Settings) -> ContentPlannerPort:
    if settings.llm_provider == "mock":
        return MockContentPlannerAdapter()
    if settings.llm_provider == "deepseek":
        assert settings.deepseek_api_key is not None
        return DeepSeekContentPlannerAdapter(
            api_key=settings.deepseek_api_key.get_secret_value(),
            model=settings.deepseek_model,
            timeout_seconds=settings.content_plan_timeout_seconds,
        )
    raise ValueError(f"Unsupported LLM provider: {settings.llm_provider!r}")


def _build_digital_human(settings: Settings) -> DigitalHumanPort:
    if settings.digital_human_provider == "mock":
        return MockDigitalHumanAdapter()
    if settings.digital_human_provider == "local":
        return LocalPresenterAdapter(
            media_root=settings.resolved_media_dir,
            public_prefix=settings.media_url_prefix,
            timeout_seconds=settings.digital_human_timeout_seconds,
        )
    if settings.digital_human_provider == "heygen":
        assert settings.heygen_api_key is not None
        return HeyGenDigitalHumanAdapter(
            api_key=settings.heygen_api_key.get_secret_value(),
            avatar_id=settings.heygen_avatar_id,
            voice_id=settings.heygen_voice_id,
            timeout_seconds=settings.digital_human_timeout_seconds,
        )
    if settings.digital_human_provider == "dashscope":
        assert settings.dashscope_api_key is not None
        return DashScopeDigitalHumanAdapter(
            api_key=settings.dashscope_api_key.get_secret_value(),
            source_video_url=settings.dashscope_source_video_url,
            timeout_seconds=settings.digital_human_timeout_seconds,
            media_root=settings.resolved_media_dir,
            media_url_prefix=settings.media_url_prefix,
        )
    if settings.digital_human_provider == "wan_s2v":
        assert settings.dashscope_api_key is not None
        return WanSpeechToVideoAdapter(
            api_key=settings.dashscope_api_key.get_secret_value(),
            portrait=settings.dashscope_avatar_portrait,
            resolution=settings.dashscope_s2v_resolution,
            tts_base_url=settings.dashscope_tts_base_url,
            tts_model=settings.dashscope_tts_model,
            tts_voice=settings.dashscope_tts_voice,
            timeout_seconds=settings.digital_human_timeout_seconds,
            media_root=settings.resolved_media_dir,
            media_url_prefix=settings.media_url_prefix,
        )
    raise ValueError(f"Unsupported digital-human provider: {settings.digital_human_provider!r}")


def _build_images(settings: Settings) -> ImagePort:
    if settings.image_provider == "mock":
        return MockImageAdapter()
    if settings.image_provider == "drawn":
        return DrawnImageAdapter(
            media_root=settings.resolved_media_dir,
            public_prefix=settings.media_url_prefix,
        )
    if settings.image_provider == "dashscope":
        assert settings.dashscope_api_key is not None
        return DashScopeImageAdapter(
            api_key=settings.dashscope_api_key.get_secret_value(),
            model=settings.dashscope_image_model,
            size=settings.dashscope_image_size,
            media_root=settings.resolved_media_dir,
            public_prefix=settings.media_url_prefix,
            timeout_seconds=settings.image_timeout_seconds,
        )
    if settings.image_provider == "openai":
        assert settings.image_api_key is not None
        return OpenAICompatibleImageAdapter(
            api_key=settings.image_api_key.get_secret_value(),
            model=settings.image_model,
            base_url=settings.image_base_url,
            size=settings.image_size,
            media_root=settings.resolved_media_dir,
            public_prefix=settings.media_url_prefix,
            timeout_seconds=settings.image_timeout_seconds,
        )
    raise ValueError(f"Unsupported image provider: {settings.image_provider!r}")


def _build_videos(settings: Settings) -> VideoPort:
    if settings.video_provider == "off" or settings.video_provider == "mock":
        return MockVideoAdapter()
    if settings.video_provider == "wan_i2v":
        assert settings.dashscope_api_key is not None
        return WanImageToVideoAdapter(
            api_key=settings.dashscope_api_key.get_secret_value(),
            media_root=settings.resolved_media_dir,
            public_prefix=settings.media_url_prefix,
            model=settings.video_model,
            resolution=settings.video_resolution,
            duration_seconds=settings.video_duration_seconds,
            still_base_url=settings.video_still_base_url,
            still_model=settings.video_still_model,
            timeout_seconds=settings.video_timeout_seconds,
        )
    raise ValueError(f"Unsupported video provider: {settings.video_provider!r}")


def _build_product_repository(settings: Settings, curated: ProductRepository) -> ProductRepository:
    if settings.product_source == "off":
        return curated
    if settings.product_source == "openfoodfacts":
        return EnrichedProductRepository(
            curated,
            OpenFoodFactsSource(timeout_seconds=settings.product_source_timeout_seconds),
        )
    raise ValueError(f"Unsupported product source: {settings.product_source!r}")


def build_container(settings: Settings) -> Container:
    llm = _build_llm(settings)
    digital_human = _build_digital_human(settings)
    images = _build_images(settings)
    videos = _build_videos(settings)
    catalog = files("liuliangchuhai.infrastructure.products").joinpath("demo_products.json")
    with as_file(catalog) as path:
        curated_repository = JsonProductRepository(path)
    product_repository: ProductRepository = _build_product_repository(settings, curated_repository)
    get_product = GetProduct(product_repository)
    analyze_product = AnalyzeProductUseCase(llm)
    content_planner = _build_content_planner(settings)
    create_content_plan = CreateContentPlanUseCase(content_planner)
    assistant = _build_assistant(settings)
    return Container(
        assistant=assistant,
        reply_to_customer=ReplyToCustomer(get_product, assistant),
        content_planner=content_planner,
        create_content_plan=create_content_plan,
        create_content_plan_by_id=CreateContentPlanByIdUseCase(get_product, create_content_plan),
        llm=llm,
        digital_human=digital_human,
        generate_digital_human=GenerateDigitalHumanUseCase(digital_human),
        images=images,
        generate_image=GenerateImageUseCase(images),
        videos=videos,
        generate_video=GenerateVideoUseCase(videos),
        get_system_status=GetSystemStatus(llm=llm, digital_human=digital_human, images=images),
        product_repository=product_repository,
        list_products=ListProducts(product_repository),
        get_product=get_product,
        analyze_product=analyze_product,
        analyze_product_by_id=AnalyzeProductByIdUseCase(get_product, analyze_product),
    )
