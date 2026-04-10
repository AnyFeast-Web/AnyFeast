from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Message(BaseModel):
    id: Optional[str] = None
    client_id: str
    direction: str  # "in" or "out"
    body: str
    timestamp: datetime
    read: bool = False

class MessageCreate(BaseModel):
    client_id: str
    body: str
