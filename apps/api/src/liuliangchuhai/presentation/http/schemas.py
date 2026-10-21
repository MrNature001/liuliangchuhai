from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from liuliangchuhai.domain.market_analysis import RecommendationLevel


class ProviderStatusResponse(BaseModel):
    provider: str
    available: bool


class ProvidersResponse(BaseModel):
    llm: ProviderStatusResponse
    digital_human: ProviderStatusResponse


class HealthResponse(BaseModel):
    status: Literal["ok"]
    providers: ProvidersResponse


NonBlankString = Annotated[str, StringConstraints(strict=True, min_length=1, pattern=r"\S")]


class ProductAnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    product_id: NonBlankString
    country: NonBlankString
    target_audience: NonBlankString | None = None
    market_notes: NonBlankString | None = None


class ProductMarketAnalysisResponse(BaseModel):
    recommendation: RecommendationLevel
    score: Annotated[
        int,
        Field(strict=True, ge=0, le=100, description="Heuristic assessment, not a sales forecast."),
    ]
    summary: NonBlankString
    target_audiences: list[NonBlankString]
    strengths: list[NonBlankString]
    risks: list[NonBlankString]
    cultural_advantages: list[NonBlankString]
    marketing_suggestions: list[NonBlankString]
    content_directions: list[NonBlankString]


class ProductAnalysisErrorResponse(BaseModel):
    code: Literal["product_not_found", "llm_unavailable", "invalid_llm_response"]
    message: str


class ProductResponse(BaseModel):
    id: str
    name: str
    category: str
    description: str
    origin: str
    cultural_background: str
    images: list[str]
    usage: str
    ingredients: list[str]
    price: str | None
    purchase_url: str | None
    name_en: str | None
    name_vi: str | None
    name_th: str | None
    name_ms: str | None
    name_id: str | None
    description_en: str | None
    description_vi: str | None
    description_th: str | None
    description_ms: str | None
    description_id: str | None
    category_en: str | None
    category_vi: str | None
    category_th: str | None
    category_ms: str | None
    category_id: str | None
    origin_en: str | None
    origin_vi: str | None
    origin_th: str | None
    origin_ms: str | None
    origin_id: str | None
    usage_en: str | None
    usage_vi: str | None
    usage_th: str | None
    usage_ms: str | None
    usage_id: str | None
    cultural_background_en: str | None
    cultural_background_vi: str | None
    cultural_background_th: str | None
    cultural_background_ms: str | None
    cultural_background_id: str | None


class ProductListResponse(BaseModel):
    items: list[ProductResponse]


class ProductNotFoundResponse(BaseModel):
    code: Literal["product_not_found"]
    message: Literal["Product not found"]
