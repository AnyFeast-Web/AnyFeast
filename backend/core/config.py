import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AnyFeast APIs"
    API_V1_STR: str = "/api/v1"
    # Provide an absolute or relative path to the firebase credentials
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
    
    class Config:
        env_file = ".env"

settings = Settings()
