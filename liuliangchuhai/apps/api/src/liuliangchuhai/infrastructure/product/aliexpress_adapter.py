"""AliExpress Affiliate API adapter for product data."""
import hashlib
import hmac
import json
import time
from typing import Optional
import httpx

from liuliangchuhai.application.ports.product_repository import ProductRepositoryPort
from liuliangchuhai.domain.product import Product


class AliExpressAdapter:
    """Adapter for AliExpress Open Platform API - product data source."""

    def __init__(self, app_key: str, app_secret: str):
        self.app_key = app_key
        self.app_secret = app_secret
        self.base_url = "https://api-sg.aliexpress.com/sync"
        self.client = httpx.AsyncClient(timeout=30.0)
        self.cache = {}

    def _sign_request(self, params: dict) -> str:
        """Generate HMAC-SHA256 signature for API request."""
        sorted_params = sorted(params.items())
        param_string = "".join(f"{k}{v}" for k, v in sorted_params)
        sign_string = f"{self.app_secret}{param_string}{self.app_secret}"
        return hmac.new(
            self.app_secret.encode(),
            sign_string.encode(),
            hashlib.sha256
        ).hexdigest().upper()

    async def get_products(
        self,
        product_ids: list[str],
        target_language: str = "EN",
        target_currency: str = "USD"
    ) -> list[Product]:
        """Fetch product details from AliExpress Affiliate API."""
        cache_key = f"{','.join(product_ids)}:{target_language}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        params = {
            "app_key": self.app_key,
            "method": "aliexpress.affiliate.productdetail.get",
            "timestamp": str(int(time.time() * 1000)),
            "format": "json",
            "v": "2.0",
            "sign_method": "sha256",
            "product_ids": ",".join(product_ids[:50]),
            "target_currency": target_currency,
            "target_language": target_language,
            "fields": "product_id,product_title,product_main_image_url,target_sale_price,promotion_link"
        }
        params["sign"] = self._sign_request(params)

        resp = await self.client.post(self.base_url, data=params)
        resp.raise_for_status()
        data = resp.json()

        products = []
        if "aliexpress_affiliate_productdetail_get_response" in data:
            result = data["aliexpress_affiliate_productdetail_get_response"]["resp_result"]
            result_data = json.loads(result["resp_msg"]) if isinstance(result["resp_msg"], str) else result["resp_msg"]

            for item in result_data.get("result", {}).get("products", []):
                products.append(Product(
                    id=str(item["product_id"]),
                    name=item["product_title"],
                    image_url=item["product_main_image_url"],
                    price=float(item["target_sale_price"]["amount"]),
                    currency=target_currency,
                    purchase_url=item["promotion_link"],
                    language=target_language
                ))

        self.cache[cache_key] = products
        return products

    async def get_product_multilocale(
        self,
        product_id: str,
        languages: list[str]
    ) -> dict[str, Product]:
        """Fetch same product in multiple languages."""
        results = {}
        for lang in languages:
            products = await self.get_products([product_id], target_language=lang)
            if products:
                results[lang] = products[0]
        return results

    async def close(self):
        await self.client.aclose()
