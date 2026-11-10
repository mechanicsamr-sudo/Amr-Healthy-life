from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import close_pool, get_pool
from .routers import me, orgs


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    close_pool()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="MEP Intelligence Hub API",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.environment != "production" else None,
        redoc_url=None,
    )
    if settings.cors_origin_list:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origin_list,
            allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
            allow_headers=["Authorization", "Content-Type"],
        )

    @app.get("/health", tags=["health"])
    def health() -> dict:
        db_ok = False
        try:
            with get_pool().connection() as conn:
                conn.execute("select 1")
            db_ok = True
        except Exception:  # noqa: BLE001 - health must never raise
            db_ok = False
        return {"status": "ok" if db_ok else "degraded", "database": db_ok}

    app.include_router(me.router)
    app.include_router(orgs.router)
    return app


app = create_app()
