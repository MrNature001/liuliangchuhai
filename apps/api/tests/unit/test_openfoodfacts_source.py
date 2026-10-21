import pytest
from liuliangchuhai.domain.product import Product
from liuliangchuhai.infrastructure.products.openfoodfacts import (
    OpenFoodFactsSource,
    first_usable,
)


def make_product() -> Product:
    return Product(
        id="wuzhou-liubao-tea",
        name="梧州六堡茶",
        category="茶叶",
        description="演示商品。",
        origin="广西梧州",
        cultural_background="地方茶文化。",
        images=(),
        usage="冲泡饮用。",
        ingredients=("茶叶",),
    )


def test_source_resolves_the_first_product_with_a_photo_and_code() -> None:
    payload = {
        "products": [
            {"code": "123", "product_name": "No photo"},
            {"code": "456", "image_front_url": "https://images.example/f.jpg"},
        ]
    }
    overlay = first_usable(payload, make_product())

    assert overlay == {
        "purchase_url": "https://world.openfoodfacts.org/product/456",
        "images": ("https://images.example/f.jpg",),
    }


def test_source_returns_nothing_when_no_candidate_has_a_photo() -> None:
    assert first_usable({"products": [{"code": "1"}]}, make_product()) is None
    assert first_usable({"products": []}, make_product()) is None
    assert first_usable({}, make_product()) is None


def test_source_rejects_non_http_photo_urls() -> None:
    payload = {"products": [{"code": "1", "image_front_url": "data:image/png;base64,AA"}]}

    assert first_usable(payload, make_product()) is None


@pytest.mark.asyncio
async def test_disabled_source_never_contacts_the_network() -> None:
    calls: list[str] = []

    def handler(request: object) -> object:
        calls.append(str(request))
        raise AssertionError("disabled source must not issue a request")

    source = OpenFoodFactsSource(enabled=False)
    assert await source(make_product()) is None
    assert calls == []


@pytest.mark.asyncio
async def test_transport_errors_degrade_to_no_overlay() -> None:
    import httpx

    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("offline", request=request)

    source = OpenFoodFactsSource(transport=httpx.MockTransport(handler))

    assert await source(make_product()) is None


@pytest.mark.asyncio
async def test_non_success_status_degrades_to_no_overlay() -> None:
    import httpx

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(503)

    source = OpenFoodFactsSource(transport=httpx.MockTransport(handler))

    assert await source(make_product()) is None
