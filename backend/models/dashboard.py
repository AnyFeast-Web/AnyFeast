from pydantic import BaseModel
from typing import List, Dict, Any

class DashboardStats(BaseModel):
    total_active_clients: int
    pending_consultations: int
    active_meal_plans: int
    compliance_rate: float
    urgent_alerts: List[Dict[str, Any]] = []
    recent_activity: List[Dict[str, Any]] = []
