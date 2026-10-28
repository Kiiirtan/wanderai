"""Core configuration for the Travel Planner backend with security hardening."""
import os
import secrets
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("wanderai.config")


class Settings:
    """Application settings loaded securely from environment variables."""

    APP_NAME: str = "WanderAI - Travel Itinerary Planner"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Database (passwords masked if logged)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./travel_planner.db")

    # Gemini AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    # JWT Authentication
    _env_secret = os.getenv("SECRET_KEY", "").strip()
    if not _env_secret or _env_secret == "dev-secret-key-change-in-production":
        if not DEBUG:
            # In production, require an explicit secure secret key
            raise RuntimeError("CRITICAL SECURITY ERROR: SECRET_KEY environment variable must be set in production mode!")
        # In development, generate a cryptographically random fallback
        SECRET_KEY: str = "dev-" + secrets.token_hex(32)
    else:
        SECRET_KEY: str = _env_secret

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Password Policy
    MIN_PASSWORD_LENGTH: int = 8
    MAX_PASSWORD_LENGTH: int = 72  # bcrypt safety limit

    # CORS Allowed Origins
    _raw_cors = os.getenv("CORS_ORIGINS", "")
    if _raw_cors:
        CORS_ORIGINS: list = [origin.strip() for origin in _raw_cors.split(",") if origin.strip()]
    else:
        CORS_ORIGINS: list = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]


settings = Settings()
