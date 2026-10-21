from decimal import Decimal

from liuliangchuhai.domain.product import Product
from liuliangchuhai.infrastructure.products.enrichment import (
    apply_overlay,
    snapshot,
)


def _product(**overrides: object) -> Product:
    base: dict[str, object] = {
        "id": "luosifen",
        "name": "柳州螺蛳粉",
        "category": "地方食品",
        "description": "演示商品。",
        "origin": "广西柳州",
        "cultural_background": "地方饮食文化。",
        "images": ("/products/liuzhou-luosifen.svg",),
        "usage": "煮熟后食用。",
        "ingredients": ("米粉",),
    }
    base.update(overrides)
    return Product(**base)  # type: ignore[arg-type]


def test_overlay_sets_price_purchase_url_and_fills_missing_images() -> None:
    product = _product(images=())

    enriched = apply_overlay(
        product,
        {
            "price": "12.5",
            "purchase_url": "https://example.invalid/p/1",
            "images": ("https://example.invalid/a.jpg", "javascript:alert(1)"),
        },
    )

    assert enriched.price == Decimal("12.50")
    assert enriched.purchase_url == "https://example.invalid/p/1"
    assert enriched.images == ("https://example.invalid/a.jpg",)


def test_overlay_never_replaces_curated_images() -> None:
    product = _product()

    enriched = apply_overlay(product, {"images": ("https://example.invalid/other.jpg",)})

    assert enriched.images == product.images


def test_overlay_rejects_non_http_links_and_bad_prices() -> None:
    product = _product()

    enriched = apply_overlay(
        product,
        {
            "price": "not-a-number",
            "purchase_url": "javascript:alert(1)",
            "images": ("ftp://example.invalid/a.jpg",),
        },
    )

    assert enriched == product


def test_overlay_rounds_prices_to_two_places() -> None:
    enriched = apply_overlay(_product(), {"price": 12.4999})

    assert enriched.price == Decimal("12.50")


def test_overlay_ignores_negative_and_infinite_prices() -> None:
    for price in ("-1.00", "NaN", "Infinity"):
        assert apply_overlay(_product(), {"price": price}).price is None


def test_empty_overlay_is_a_no_op() -> None:
    product = _product()

    assert apply_overlay(product, None) is product
    assert apply_overlay(product, {}) is product


def test_snapshot_projects_only_enrichable_fields() -> None:
    assert snapshot(_product(price=Decimal("9.99"))) == {
        "id": "luosifen",
        "price": "9.99",
        "purchase_url": None,
        "images": ["/products/liuzhou-losifen.svg".replace("losifen", "luosifen")],
    }
