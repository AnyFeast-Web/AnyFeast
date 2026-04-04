from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from core.security import get_current_user
from db.firestore import db
from models.mealplan import MealPlanCreate
from datetime import datetime

router = APIRouter()
COLLECTION_NAME = "meal_plans"

@router.get("/", response_model=List[Dict[str, Any]])
def get_mealplans(client_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Retrieve meal plans. Filter by client if provided."""
    query = db.collection(COLLECTION_NAME).where("nutritionist_id", "==", current_user["uid"])
    if client_id:
        query = query.where("client_id", "==", client_id)
        
    docs = query.stream()
    return [{**doc.to_dict(), "id": doc.id} for doc in docs]

@router.post("/", response_model=Dict[str, Any])
def create_mealplan(plan_data: MealPlanCreate, current_user: dict = Depends(get_current_user)):
    """Create a new 7-day meal plan."""
    new_plan = plan_data.dict()
    new_plan["nutritionist_id"] = current_user["uid"]
    new_plan["created_at"] = datetime.utcnow()
    new_plan["updated_at"] = datetime.utcnow()
    
    doc_ref = db.collection(COLLECTION_NAME).document()
    doc_ref.set(new_plan)
    
    return {**new_plan, "id": doc_ref.id}

@router.get("/{plan_id}", response_model=Dict[str, Any])
def get_mealplan(plan_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific meal plan details."""
    doc_ref = db.collection(COLLECTION_NAME).document(plan_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Meal plan not found")
        
    plan = doc.to_dict()
    if plan.get("nutritionist_id") != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this plan")
        
    return {**plan, "id": doc.id}

@router.put("/{plan_id}", response_model=Dict[str, Any])
def update_mealplan(plan_id: str, plan_data: MealPlanCreate, current_user: dict = Depends(get_current_user)):
    """Update an existing meal plan (or save draft)."""
    doc_ref = db.collection(COLLECTION_NAME).document(plan_id)
    doc = doc_ref.get()
    
    if not doc.exists or doc.to_dict().get("nutritionist_id") != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    update_data = plan_data.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    doc_ref.update(update_data)
    return {**doc.to_dict(), **update_data, "id": doc.id}
