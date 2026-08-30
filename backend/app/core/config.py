from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DevPilot Backend API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "devpilot-super-secret-key-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    DATABASE_URL: str = "postgresql://postgres:devpilotpassword@localhost:5432/devpilot"
    ENGINE_URL: str = "http://localhost:3001"

    class Config:
        env_file = ".env"

settings = Settings()
