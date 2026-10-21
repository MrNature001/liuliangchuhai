from liuliangchuhai.domain.product import Product
from liuliangchuhai.presentation.http.schemas import ProductListResponse, ProductResponse


def to_product_response(product: Product) -> ProductResponse:
    return ProductResponse(
        id=product.id,
        name=product.name,
        category=product.category,
        description=product.description,
        origin=product.origin,
        cultural_background=product.cultural_background,
        images=list(product.images),
        usage=product.usage,
        ingredients=list(product.ingredients),
        price=str(product.price) if product.price is not None else None,
        purchase_url=product.purchase_url,
        name_en=product.name_en,
        name_vi=product.name_vi,
        name_th=product.name_th,
        name_ms=product.name_ms,
        name_id=product.name_id,
        description_en=product.description_en,
        description_vi=product.description_vi,
        description_th=product.description_th,
        description_ms=product.description_ms,
        description_id=product.description_id,
        category_en=product.category_en,
        category_vi=product.category_vi,
        category_th=product.category_th,
        category_ms=product.category_ms,
        category_id=product.category_id,
        origin_en=product.origin_en,
        origin_vi=product.origin_vi,
        origin_th=product.origin_th,
        origin_ms=product.origin_ms,
        origin_id=product.origin_id,
        usage_en=product.usage_en,
        usage_vi=product.usage_vi,
        usage_th=product.usage_th,
        usage_ms=product.usage_ms,
        usage_id=product.usage_id,
        cultural_background_en=product.cultural_background_en,
        cultural_background_vi=product.cultural_background_vi,
        cultural_background_th=product.cultural_background_th,
        cultural_background_ms=product.cultural_background_ms,
        cultural_background_id=product.cultural_background_id,
    )


def to_product_list_response(products: tuple[Product, ...]) -> ProductListResponse:
    return ProductListResponse(items=[to_product_response(product) for product in products])
