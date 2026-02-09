# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    SUPABASE_URL: str
    SUPABASE_KEY: str
    GEMINI_API_KEY: str

    model_config = SettingsConfigDict(env_file=".env")

# Create a single instance of the settings to be used throughout the app
settings = Settings()