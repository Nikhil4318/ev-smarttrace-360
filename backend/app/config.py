import os
from pydantic_settings import BaseSettings
from typing import List

<<<<<<< HEAD
=======

>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
class Settings(BaseSettings):
    PROJECT_NAME: str = "EV SmartTrace 360"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
<<<<<<< HEAD

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
=======
    
    # Database Configuration (Defaults to SQLite for instant local dev, uses MySQL when DATABASE_URL is set)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./ev_smarttrace.db"
    )
    SQLITE_FALLBACK_URL: str = "sqlite:///./ev_smarttrace.db"
    
    # JWT & Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "ev_smarttrace_super_secure_jwt_secret_key_2026_x99")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # AI & Maps External APIs
>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPEN_CHARGE_MAP_API_KEY: str = os.getenv("OPEN_CHARGE_MAP_API_KEY", "")
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
<<<<<<< HEAD

    # CORS origins – read from env or use defaults for local dev
    CORS_ORIGINS: List[str] = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,*"
    ).split(",")

    # Demo‑seeding flag – true for local dev, false by default in production
    SEED_DEMO: bool = os.getenv("SEED_DEMO", "true").lower() == "true"
=======
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583

    class Config:
        env_file = ".env"
        extra = "allow"

<<<<<<< HEAD
=======

>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
settings = Settings()
