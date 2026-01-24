"""
Centralized configuration using Pydantic settings.
Supports environment variables, .env files, and defaults.
"""
from functools import lru_cache
from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict


class RabbitMQSettings(BaseSettings):
    """RabbitMQ connection settings."""
    model_config = SettingsConfigDict(env_prefix="RABBITMQ_")

    host: str = "localhost"
    port: int = 5672
    username: str = "guest"
    password: str = "guest"
    vhost: str = "/"
    heartbeat: int = 60
    connection_timeout: int = 10

    # Connection pool settings
    pool_size: int = 5
    pool_recycle: int = 3600

    # Queue settings
    prefetch_count: int = 1  # Fair dispatch for workers

    @property
    def url(self) -> str:
        return f"amqp://{self.username}:{self.password}@{self.host}:{self.port}/{self.vhost}"


class RedisSettings(BaseSettings):
    """Redis connection settings."""
    model_config = SettingsConfigDict(env_prefix="REDIS_")

    host: str = "localhost"
    port: int = 6379
    password: Optional[str] = None
    db: int = 0

    # Result storage
    result_ttl: int = 3600  # 1 hour
    task_status_ttl: int = 86400  # 24 hours

    @property
    def url(self) -> str:
        auth = f":{self.password}@" if self.password else ""
        return f"redis://{auth}{self.host}:{self.port}/{self.db}"


class WorkerSettings(BaseSettings):
    """OCR Worker settings."""
    model_config = SettingsConfigDict(env_prefix="WORKER_")

    node_id: str = "worker-1"
    concurrency: int = 1  # OCR is CPU-intensive, usually 1 per core
    languages: str = "fr,en"  # Comma-separated list of languages to pre-load
    use_gpu: bool = False

    # Health reporting
    heartbeat_interval: int = 30
    task_timeout: int = 300  # 5 minutes max per task

    # Retry settings
    max_retries: int = 3
    retry_delay: int = 5

    @property
    def language_list(self) -> List[str]:
        return [lang.strip() for lang in self.languages.split(",")]


class APISettings(BaseSettings):
    """API Gateway settings."""
    model_config = SettingsConfigDict(env_prefix="API_")

    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4

    # Request handling
    sync_timeout: int = 60  # Max wait time for sync requests
    async_default: bool = False  # Default to sync mode

    # Rate limiting
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 100
    rate_limit_window: int = 60


class Settings(BaseSettings):
    """Main application settings."""
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Environment
    environment: str = "development"
    debug: bool = False
    log_level: str = "INFO"

    # Nested settings
    rabbitmq: RabbitMQSettings = RabbitMQSettings()
    redis: RedisSettings = RedisSettings()
    worker: WorkerSettings = WorkerSettings()
    api: APISettings = APISettings()


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
