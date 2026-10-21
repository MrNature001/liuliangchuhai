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
    )


def to_product_list_response(products: tuple[Product, ...]) -> ProductListResponse:
    return ProductListResponse(items=[to_product_response(product) for product in products])
