from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Environment-based configuration. Secrets live only on the server."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    database_url: str = ""
    supabase_url: str = ""
    # Legacy HS256 shared secret. When empty, tokens are verified with the
    # project's asymmetric signing keys published at /auth/v1/.well-known/jwks.json.
    supabase_jwt_secret: str = ""
    jwt_audience: str = "authenticated"
    cron_secret: str = ""
    cors_origins: str = ""
    db_pool_max: int = Field(default=5, ge=1, le=50)

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
