import codecs
import json
from typing import Any, Dict, Optional

from pydantic import ConfigDict
from pydantic_settings import BaseSettings


def _normalize_private_key(private_key: str) -> str:
    if not isinstance(private_key, str):
        raise ValueError("Firebase private_key must be a string")

    key = private_key
    # Normalize escaped line endings in PEM content.
    key = key.replace("\\r\\n", "\n").replace("\\n", "\n").replace("\\r", "\r")

    # If the value contains literal backslashes because the env string was double-escaped,
    # decode unicode-style escapes to real characters.
    if "\\n" in key or "\\r" in key:
        try:
            key = codecs.decode(key, "unicode_escape")
        except Exception:
            pass

    if "-----BEGIN PRIVATE KEY-----" not in key or "-----END PRIVATE KEY-----" not in key:
        raise ValueError(
            "Firebase private_key is malformed. Ensure FIREBASE_CREDENTIALS_JSON contains a valid PEM private_key."
        )

    return key.strip() + "\n"


def _normalize_firebase_key(service_account: Dict[str, Any]) -> Dict[str, Any]:
    private_key = service_account.get("private_key")
    if isinstance(private_key, str):
        service_account["private_key"] = _normalize_private_key(private_key)
    return service_account


class Settings(BaseSettings):
    PROJECT_NAME: str = "AnyFeast APIs"
    API_V1_STR: str = "/api/v1"

    # Store the entire Firebase service account key as JSON in one env variable.
    FIREBASE_CREDENTIALS_JSON: Optional[str] = None
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None

    @property
    def firebase_credentials(self) -> Dict[str, Any]:
        if self.FIREBASE_CREDENTIALS_JSON:
            try:
                credentials_json = json.loads(self.FIREBASE_CREDENTIALS_JSON)
            except json.JSONDecodeError as exc:
                raise ValueError("FIREBASE_CREDENTIALS_JSON must be valid JSON") from exc
            return _normalize_firebase_key(credentials_json)

        if self.FIREBASE_CREDENTIALS_PATH:
            with open(self.FIREBASE_CREDENTIALS_PATH, "r", encoding="utf-8") as file:
                return _normalize_firebase_key(json.load(file))

        raise ValueError(
            "Missing Firebase credentials. Set FIREBASE_CREDENTIALS_JSON in .env or environment."
        )

    model_config = ConfigDict(env_file=".env", extra="ignore")


settings = Settings()
