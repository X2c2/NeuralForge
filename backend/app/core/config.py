try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings
from typing import List
import os
import json

class Settings(BaseSettings):
    # Application
    PROJECT_NAME: str = "NeuralForge"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./neuralforge.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI Provider API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GOOGLE_AI_KEY: str = os.getenv("GOOGLE_AI_KEY", "")
    STABILITY_API_KEY: str = os.getenv("STABILITY_API_KEY", "")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    
    # Payment
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = None
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Parse CORS origins from environment variable
        cors_origins_str = os.getenv("CORS_ORIGINS", '["http://localhost:3000"]')
        try:
            self.BACKEND_CORS_ORIGINS = json.loads(cors_origins_str)
        except json.JSONDecodeError:
            self.BACKEND_CORS_ORIGINS = [
                "http://localhost:3000",
                "https://neuralforge.to",
                "https://www.neuralforge.to",
                "chrome-extension://*"
            ]

    class Config:
        env_file = ".env"

settings = Settings()