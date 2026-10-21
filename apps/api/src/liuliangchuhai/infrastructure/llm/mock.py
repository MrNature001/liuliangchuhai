from liuliangchuhai.application.ports.status import ProviderStatus
from liuliangchuhai.domain.market_analysis import (
    MarketContext,
    ProductMarketAnalysis,
    RecommendationLevel,
)
from liuliangchuhai.domain.product import Product


class MockLLMAdapter:
    """Deterministic, key-free adapter used by development and tests."""

    async def status(self) -> ProviderStatus:
        return ProviderStatus(provider="mock", available=True)

    async def analyze_product_market(
        self, product: Product, market: MarketContext
    ) -> ProductMarketAnalysis:
        """Use fixed demo indicators without evaluating market fit."""
        return ProductMarketAnalysis(
            recommendation=RecommendationLevel.FIT,
            score=78,
            summary=(
                f"{product.name}在{market.country}市场展现出良好的出海潜力。该产品具有独特的地方文化特色，"
                f"契合当地消费者对东方传统食品/工艺品的兴趣，建议通过文化叙事与本地化营销策略切入市场。"
            ),
            target_audiences=(
                "对东方文化感兴趣的中产消费者",
                "追求健康生活方式的年轻家庭",
                "寻求特色礼品的商务人群",
            )
            if market.target_audience is None
            else (market.target_audience, "对东方文化感兴趣的中产消费者"),
            strengths=(
                "独特的广西地方文化标识，易于建立品牌认知",
                "天然健康属性符合当前市场趋势",
                "中国-东盟自由贸易区政策优势，降低贸易壁垒",
                "产品包装和呈现方式具有视觉吸引力",
            ),
            risks=(
                "本地口味偏好差异需通过试吃活动验证接受度",
                "需建立可靠的冷链物流以确保产品品质",
                "竞争对手可能已占据类似品类市场份额，需差异化定位",
            ),
            cultural_advantages=(
                f"{product.cultural_background}该文化背景在{market.country}具有较高认知度，"
                "可通过文化故事营销增强产品吸引力，借助当地华人社区影响力扩散口碑。",
            ),
            marketing_suggestions=(
                "在主要城市的大型超市设立试吃专区，配合文化展示提升体验",
                "与当地网红/美食博主合作，制作烹饪教学内容传播产品使用场景",
                "参加当地食品博览会及文化节庆活动，提升品牌曝光度",
                "通过电商平台推出小规格试用装，降低消费者首次购买门槛",
            ),
            content_directions=(
                "制作产品溯源视频：展示广西原产地风光、传统制作工艺，强调纯正性",
                "开发双语食谱内容：结合本地食材创新吃法，增强产品实用性",
                "设计节日礼盒包装方案：针对春节、中秋等传统节日推出文化主题礼盒",
                "创建用户生成内容激励计划：鼓励消费者分享使用体验，形成社交传播",
            ),
        )
