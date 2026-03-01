import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Service
    APP_NAME: str = "SEPMS AI Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:5000"

    # Google Gemini
    GEMINI_API_KEY: str = ""

    # Score thresholds
    CONFIDENCE_THRESHOLD: float = 0.75  # Below this, escalate to Gemini LLM

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
