from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from core.security import get_current_user
from db.firestore import db
from datetime import datetime

router = APIRouter()
COLLECTION_NAME = "ingredients"

@router.get("/", response_model=List[Dict[str, Any]])
def search_ingredients(search: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Retrieve all ingredients or filtered."""
    # Basic get since Firestore search is limited
    docs = db.collection(COLLECTION_NAME).stream()
    results = [{**doc.to_dict(), "id": doc.id} for doc in docs]
    
    if search:
        search_lower = search.lower()
        results = [r for r in results if search_lower in r.get("name", "").lower()]
        
    return results

@router.post("/", response_model=Dict[str, Any])
def create_ingredient(ingredient_data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new ingredient in the DB"""
    # Only admins/nutritionists can add
    new_doc = ingredient_data
    new_doc["created_by"] = current_user["uid"]
    new_doc["created_at"] = datetime.utcnow()
    
    doc_ref = db.collection(COLLECTION_NAME).document()
    doc_ref.set(new_doc)
    
    return {**new_doc, "id": doc_ref.id}
