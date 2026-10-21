"""Open Food Facts overlay for the demo catalog.

Chosen because it needs no account, answers from anywhere (including mainland
China) and returns licensed product photographs and a canonical product code that
can serve as a stable purchase/deep link. It only knows packaged food, so it is
used strictly as an optional overlay: products it cannot match keep the curated
text and images already in the demo.

The API is public but rate-limited, so requests are per-product, sequential and
cached by the surrounding repository.
"""

from __future__ import annotations

import httpx

from liuliangchuhai.domain.product import Product

_BASE_URL = "https://world.openfoodfacts.org"
_SEARCH_PATH = "/api/v2/search"
_USER_AGENT = "liuliangchuhai-demo/0.1 (https://github.com/CaiusLuo/liuliangchuhai)"
_FIELDS = "code,product_name,image_front_url,image_url"
_PRODUCT_URL = "https://world.openfoodfacts.org/product/{code}"


class OpenFoodFactsSource:
    """Look up one catalog product by its category and origin keywords."""

    def __init__(
        self,
        *,
        timeout_seconds: float = 8.0,
        transport: httpx.AsyncBaseTransport | None = None,
        enabled: bool = True,
    ) -> None:
        self._timeout = timeout_seconds
        self._transport = transport
        self._enabled = enabled

    async def __call__(self, product: Product) -> dict[str, object] | None:
        if not self._enabled:
            return None
        match = await self._search(product)
        return match

    async def _search(self, product: Product) -> dict[str, object] | None:
        query = _query_for(product)
        if not query:
            return None
        params = {
            "search_terms": query,
            "page_size": "3",
            "fields": _FIELDS,
        }
        try:
            async with httpx.AsyncClient(
                base_url=_BASE_URL,
                timeout=httpx.Timeout(self._timeout),
                transport=self._transport,
                headers={"User-Agent": _USER_AGENT},
            ) as client:
                response = await client.get(_SEARCH_PATH, params=params)
        except httpx.HTTPError:
            return None
        if not response.is_success:
            return None
        return first_usable(response.json(), product)


def _query_for(product: Product) -> str:
    """Build a search phrase from canonical fields only, never translations."""
    words = [product.name, product.category, product.origin]
    joined = " ".join(word.strip() for word in words if word and word.strip())
    return joined[:120]


def first_usable(payload: object, product: Product) -> dict[str, object] | None:
    if not isinstance(payload, dict):
        return None
    candidates = payload.get("products")
    if not isinstance(candidates, list):
        return None
    for candidate in candidates:
        if not isinstance(candidate, dict):
            continue
        code = candidate.get("code")
        image = candidate.get("image_front_url") or candidate.get("image_url")
        if not isinstance(code, str) or not code.strip():
            continue
        if not isinstance(image, str) or not image.strip():
            continue
        if not image.lower().startswith(("https://", "http://")):
            continue
        return {
            # No price: Open Food Facts carries no retail price, and inventing one
            # would misrepresent the product. The demo keeps `price = null`.
            "purchase_url": _PRODUCT_URL.format(code=code.strip()),
            "images": (image.strip(),),
        }
    return None


__all__ = ["OpenFoodFactsSource", "first_usable"]
