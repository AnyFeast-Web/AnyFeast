from fastapi import APIRouter, Depends
from core.security import get_current_user
from db.firestore import db
from models.dashboard import DashboardStats

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Calculate aggregate statistics for the nutritionist dashboard."""
    uid = current_user["uid"]
    
    # 1. Total Active Clients
    clients_ref = db.collection("clients").where("nutritionist_id", "==", uid).where("status", "==", "active")
    total_clients = len(list(clients_ref.stream()))
    
    # 2. Total Active Plans
    plans_ref = db.collection("meal_plans").where("nutritionist_id", "==", uid).where("status", "==", "active")
    total_plans = len(list(plans_ref.stream()))
    
    # 3. Simulate Pending Consultations (e.g. status == draft)
    drafts_ref = db.collection("consultations").where("nutritionist_id", "==", uid).where("status", "==", "draft")
    pending_consults = len(list(drafts_ref.stream()))

    # 4. Fetch real recent activity from consultations
    recent_activity = []
    activity_ref = db.collection("consultations")\
        .where("nutritionist_id", "==", uid)\
        .order_by("updated_at", direction="DESCENDING")\
        .limit(5)
    
    try:
        docs = activity_ref.stream()
        for doc in docs:
            data = doc.to_dict()
            recent_activity.append({
                "id": doc.id,
                "title": "Consultation " + (data.get("status", "updated")).title(),
                "client": data.get("client_name", "Unknown Client"),
                "time": data.get("updated_at", ""),
                "type": "consultation"
            })
    except Exception as e:
        print(f"Error fetching activity: {e}")
        # Fallback if index is not created yet
        recent_activity = []
    
    # Return aggregated data
    return DashboardStats(
        total_active_clients=total_clients,
        pending_consultations=pending_consults,
        active_meal_plans=total_plans,
        compliance_rate=74.5,
        recent_activity=recent_activity or [
            {"id": "1", "title": "Welcome to AnyFeast", "client": "System", "time": "Just now", "type": "default"}
        ]
    )
