from pathlib import Path

from pydantic_settings import BaseSettings


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):

    APP_NAME: str
    APP_ENV: str

    DATABASE_URL: str
    GROQ_API_KEY: str

    class Config:
        env_file = BASE_DIR / ".env"


settings = Settings()