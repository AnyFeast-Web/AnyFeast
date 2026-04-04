from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

class PersonalInfo(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    dob: Optional[datetime] = None

class Measurements(BaseModel):
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    activity_multiplier: Optional[float] = 1.2

class ClientBase(BaseModel):
    status: str = "active"
    personal_info: PersonalInfo
    goals: List[str] = []
    measurements: Measurements = Measurements()
    
class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: str
    nutritionist_id: str
    created_at: datetime
    updated_at: datetime
