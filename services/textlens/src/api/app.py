"""
FastAPI application factory with lifecycle management.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config.settings import get_settings
from src.queue.connection import get_rabbitmq_manager
from src.queue.exchanges import get_topology
from src.storage.result_store import get_result_store
from src.api.routes import ocr, tasks, health

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown of connections.
    """
    logger.info("Starting TextLens API...")

    # Startup
    try:
        # Connect to RabbitMQ
        manager = get_rabbitmq_manager()
        await manager.connect()

        # Setup queue topology
        async with manager.get_channel() as channel:
            topology = get_topology()
            await topology.setup(channel)

        # Connect to Redis
        result_store = get_result_store()
        await result_store.connect()

        logger.info("TextLens API started successfully")

    except Exception as e:
        logger.error(f"Failed to start TextLens API: {e}")
        raise

    yield

    # Shutdown
    logger.info("Shutting down TextLens API...")

    await manager.disconnect()
    await result_store.disconnect()

    logger.info("TextLens API shutdown complete")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="TextLens OCR Service",
        description="Distributed OCR service with RabbitMQ clustering",
        version="2.0.0",
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(health.router)
    app.include_router(ocr.router)
    app.include_router(tasks.router)

    return app


# Application instance
app = create_app()
