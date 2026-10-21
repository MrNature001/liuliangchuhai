from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from liuliangchuhai.bootstrap.container import build_container
from liuliangchuhai.bootstrap.settings import Settings
from liuliangchuhai.presentation.http.assistant_router import create_assistant_router
from liuliangchuhai.presentation.http.content_plan_router import create_content_plan_router
from liuliangchuhai.presentation.http.digital_human_router import create_digital_human_router
from liuliangchuhai.presentation.http.product_analysis_router import create_product_analysis_router
from liuliangchuhai.presentation.http.products_router import create_products_router
from liuliangchuhai.presentation.http.router import create_router


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved_settings = settings or Settings()
    container = build_container(resolved_settings)
    app = FastAPI(title="liuliangchuhai API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved_settings.cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    media_dir = resolved_settings.resolved_media_dir
    media_dir.mkdir(parents=True, exist_ok=True)
    app.mount(
        resolved_settings.media_url_prefix,
        StaticFiles(directory=media_dir),
        name="media",
    )

    @app.get("/", include_in_schema=False)
    async def root():
        return RedirectResponse(url="/docs")

    app.include_router(create_assistant_router(container.reply_to_customer))
    app.include_router(create_content_plan_router(container.create_content_plan_by_id))
    app.include_router(create_digital_human_router(container.generate_digital_human))
    app.include_router(create_router(container.get_system_status))
    app.include_router(create_product_analysis_router(container.analyze_product_by_id))
    app.include_router(create_products_router(container.list_products, container.get_product))
    return app
