"""Overlay remote product data onto the curated demo catalog.

The demo must keep working with no credentials, so the curated JSON stays the
source of truth for identity, story and translations. A remote provider may only
enrich a curated product with things it genuinely knows: price, purchase link and
photography. Anything the provider does not return keeps the curated value.

This is deliberately an overlay, not a merge of arbitrary records: a remote
purchase link pointing at a different product would misrepresent the catalog.
"""

from __future__ import annotations

import copy
from collections.abc import Awaitable, Callable
from dataclasses import replace
from decimal import Decimal

from liuliangchuhai.domain.product import Product

# Every remote value is optional; an overlay never invents data.
ProductOverlay = dict[str, object]

OverlaySource = Callable[[Product], Awaitable[ProductOverlay | None]]


def _clean_price(value: object) -> Decimal | None:
    if value is None:
        return None
    if isinstance(value, Decimal):
        candidate = value
    elif isinstance(value, str) and value.strip():
        try:
            candidate = Decimal(value.strip())
        except ArithmeticError:
            return None
    elif isinstance(value, (int, float)) and not isinstance(value, bool):
        candidate = Decimal(str(value))
    else:
        return None
    if not candidate.is_finite() or candidate < 0:
        return None
    # The domain rejects more than two decimals; round down rather than raise.
    return candidate.quantize(Decimal("0.01"))


def _clean_url(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    candidate = value.strip()
    if not candidate.lower().startswith(("https://", "http://")):
        return None
    return candidate


def _clean_images(value: object) -> tuple[str, ...] | None:
    if not isinstance(value, (list, tuple)):
        return None
    urls = [image for image in (_clean_url(item) for item in value) if image]
    return tuple(urls) if urls else None


def apply_overlay(product: Product, overlay: ProductOverlay | None) -> Product:
    """Return ``product`` with only the enrichable fields the overlay supplies."""
    if not overlay:
        return product
    price = _clean_price(overlay.get("price"))
    purchase_url = _clean_url(overlay.get("purchase_url"))
    # Curated artwork is never replaced: a provider photo only fills a gap, so a
    # mismatched remote match cannot degrade the demo's own illustrations.
    images = _clean_images(overlay.get("images"))
    fill_images = images if images is not None and not product.images else None
    if price is None and purchase_url is None and fill_images is None:
        return product
    return replace(
        product,
        price=price if price is not None else product.price,
        purchase_url=purchase_url if purchase_url is not None else product.purchase_url,
        images=fill_images if fill_images is not None else product.images,
    )


class EnrichedProductRepository:
    """Curated catalog first, optional remote enrichment second.

    Enrichment failures are not errors: a provider outage must degrade to the
    curated demo rather than break the catalog page, so every fetch is isolated
    and any exception simply leaves the curated product untouched.
    """

    def __init__(
        self,
        base: object,
        source: OverlaySource,
        *,
        cache: bool = True,
    ) -> None:
        if not hasattr(base, "list_products") or not hasattr(base, "get_by_id"):
            raise ValueError("base must provide list_products() and get_by_id()")
        self._base = base
        self._source = source
        self._cache_enabled = cache
        self._cache: dict[str, Product] = {}

    async def list_products(self) -> tuple[Product, ...]:
        curated = await self._base.list_products()
        enriched = [await self._enrich(product) for product in curated]
        return tuple(enriched)

    async def get_by_id(self, product_id: str) -> Product | None:
        curated = await self._base.get_by_id(product_id)
        if curated is None:
            return None
        return await self._enrich(curated)

    async def _enrich(self, product: Product) -> Product:
        if self._cache_enabled and product.id in self._cache:
            return self._cache[product.id]
        try:
            overlay = await self._source(product)
        except Exception:  # provider outage must never break the catalog
            overlay = None
        enriched = apply_overlay(product, overlay)
        if self._cache_enabled and enriched is not product:
            self._cache[product.id] = enriched
        return enriched


def snapshot(product: Product) -> dict[str, object]:
    """Debug helper: a JSON-safe projection of the fields an overlay may change."""
    record = copy.deepcopy(
        {
            "id": product.id,
            "price": None if product.price is None else str(product.price),
            "purchase_url": product.purchase_url,
            "images": list(product.images),
        }
    )
    return record  # type: ignore[return-value]
