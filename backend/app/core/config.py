import os
from pydantic_settings import BaseSettings

class Settings:
    PROJECT_NAME: str = "Biometric Attendance & Management System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "b79f8d1c92a3e4560182f3a4b5c6d7e8f90123456789abcdef0123456789abcd")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # SQLite default, PostgreSQL ready
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./biometric_app.db")
    
    # Attendance validation settings
    DUPLICATE_PUNCH_COOLDOWN_SECONDS: int = int(os.getenv("DUPLICATE_PUNCH_COOLDOWN_SECONDS", "300")) # 5 mins

settings = Settings()
