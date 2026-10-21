from dataclasses import asdict, dataclass
from decimal import Decimal

# Optional localized copy for the demo markets plus English. Fields stay flat so
# the API contract remains a fixed shape; each is nonblank when present.
LOCALIZED_LANGUAGES = ("en", "vi", "th", "ms", "id")
LOCALIZED_KINDS = ("name", "description", "category", "origin", "usage", "cultural_background")
LOCALIZED_TEXT_FIELDS = tuple(
    f"{kind}_{language}" for kind in LOCALIZED_KINDS for language in LOCALIZED_LANGUAGES
)


@dataclass(frozen=True, slots=True)
class Product:
    """Canonical curated product value; optional prices are expressed in CNY."""

    id: str
    name: str
    category: str
    description: str
    origin: str
    cultural_background: str
    images: tuple[str, ...]
    usage: str
    ingredients: tuple[str, ...]
    price: Decimal | None = None
    purchase_url: str | None = None
    name_en: str | None = None
    name_vi: str | None = None
    name_th: str | None = None
    name_ms: str | None = None
    name_id: str | None = None
    description_en: str | None = None
    description_vi: str | None = None
    description_th: str | None = None
    description_ms: str | None = None
    description_id: str | None = None
    category_en: str | None = None
    category_vi: str | None = None
    category_th: str | None = None
    category_ms: str | None = None
    category_id: str | None = None
    origin_en: str | None = None
    origin_vi: str | None = None
    origin_th: str | None = None
    origin_ms: str | None = None
    origin_id: str | None = None
    usage_en: str | None = None
    usage_vi: str | None = None
    usage_th: str | None = None
    usage_ms: str | None = None
    usage_id: str | None = None
    cultural_background_en: str | None = None
    cultural_background_vi: str | None = None
    cultural_background_th: str | None = None
    cultural_background_ms: str | None = None
    cultural_background_id: str | None = None

    def __post_init__(self) -> None:
        for field in (
            "id",
            "name",
            "category",
            "description",
            "origin",
            "cultural_background",
            "usage",
        ):
            value = getattr(self, field)
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"{field} must be a nonblank string")
        for field in LOCALIZED_TEXT_FIELDS:
            value = getattr(self, field)
            if value is not None and (not isinstance(value, str) or not value.strip()):
                raise ValueError(f"{field} must be a nonblank string or None")
        if self.id != self.id.strip():
            raise ValueError("id must not contain surrounding whitespace")
        for field in ("images", "ingredients"):
            items = getattr(self, field)
            if not isinstance(items, tuple) or any(
                not isinstance(item, str) or not item.strip() for item in items
            ):
                raise ValueError(f"{field} must be a tuple of nonblank strings")
        if self.purchase_url is not None and (
            not isinstance(self.purchase_url, str) or not self.purchase_url.strip()
        ):
            raise ValueError("purchase_url must be a nonblank string or None")
        if self.price is not None:
            if not isinstance(self.price, Decimal) or not self.price.is_finite() or self.price < 0:
                raise ValueError("price must be a finite nonnegative Decimal or None")
            exponent = self.price.as_tuple().exponent
            if isinstance(exponent, int) and exponent < -2:
                raise ValueError("price must have at most two decimal places")


def canonical_product_fields(product: Product) -> dict[str, object]:
    """Return provider-facing product data, excluding the optional localized copy."""
    return {
        key: value for key, value in asdict(product).items() if key not in LOCALIZED_TEXT_FIELDS
    }
