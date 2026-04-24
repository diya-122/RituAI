from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str
    DIRECT_URL: str = ""  # used by Prisma only, not app code
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_STORAGE_BUCKET: str = "skin-scans"
    GEMINI_API_KEY: str
    MAX_IMAGE_SIZE_MB: int = 10
    ALLOWED_MIME_TYPES: str = "image/jpeg,image/png,image/webp"

    @property
    def allowed_mimes_list(self) -> list[str]:
        return self.ALLOWED_MIME_TYPES.split(",")

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
