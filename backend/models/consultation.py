from typing import List, Dict, Optional, Any
from pydantic import BaseModel
from datetime import datetime

class BloodMarker(BaseModel):
    name: str
    value: float
    unit: str
    status: str = "normal"  # normal, low, high

class ConsultationBase(BaseModel):
    client_id: str
    type: str = "structured" # "structured" or "chat"
    status: str = "draft"
    form_data: Optional[Dict[str, Any]] = None
    blood_markers: List[BloodMarker] = []
    summary_notes: Optional[str] = None

class ConsultationCreate(ConsultationBase):
    pass

class ConsultationResponse(ConsultationBase):
    id: str
    nutritionist_id: str
    created_at: datetime
    updated_at: datetime
