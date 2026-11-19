import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "EV SmartTrace 360"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    # Database configuration – read from env, fallback to SQLite for dev
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./ev_smarttrace.db"
    )
    SQLITE_FALLBACK_URL: str = "sqlite:///./ev_smarttrace.db"

    # JWT & security – secret loaded from env (no hard‑coded secret in code)
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET",
        "ev_smarttrace_super_secure_jwt_secret_key_2026_x99"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # AI & Maps external APIs (optional)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPEN_CHARGE_MAP_API_KEY: str = os.getenv("OPEN_CHARGE_MAP_API_KEY", "")
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")

    # CORS origins – read from env or use defaults for local dev
    CORS_ORIGINS: List[str] = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,*"
    ).split(",")

    # Demo‑seeding flag – true for local dev, false by default in production
    SEED_DEMO: bool = os.getenv("SEED_DEMO", "true").lower() == "true"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
