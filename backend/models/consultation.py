from typing import List, Dict, Optional, Any
from pydantic import BaseModel
from datetime import datetime

class BloodMarker(BaseModel):
    marker_name: str
    value: str
    unit: str
    status: str = "normal"  # normal, low, high, critical
    reference_range: Optional[str] = None

class ConsultationBase(BaseModel):
    client_id: str
    client_name: Optional[str] = None
    nutritionist_id: str
    nutritionist_name: Optional[str] = None
    type: str = "structured" # "structured" or "chat"
    status: str = "draft"
    scheduled_at: Optional[datetime] = None
    
    # Structured form data
    medical_history: Optional[Dict[str, Any]] = None
    lifestyle: Optional[Dict[str, Any]] = None
    nutrition_history: Optional[Dict[str, Any]] = None
    supplements: Optional[Dict[str, Any]] = None
    blood_reports: Optional[Dict[str, Any]] = None
    goals: Optional[Dict[str, Any]] = None
    plan: Optional[Dict[str, Any]] = None
    
    # Meta
    consent_given: bool = False
    consent_timestamp: Optional[str] = None

class ConsultationCreate(ConsultationBase):
    pass

class ConsultationResponse(ConsultationBase):
    id: str
    created_at: datetime
    updated_at: datetime
