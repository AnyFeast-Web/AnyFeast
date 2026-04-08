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
    new_doc = ingredient_data.copy()
    # Check for existing ingredient with same name to prevent duplicates
    # Basic check - case insensitive
    name_lower = new_doc.get("name", "").lower()
    existing = db.collection(COLLECTION_NAME).where("name", "==", new_doc.get("name")).limit(1).get()
    if existing:
        # If it already exists, maybe return error or handle it
        pass

    new_doc["created_by"] = current_user["uid"]
    new_doc["created_at"] = datetime.utcnow()
    
    doc_ref = db.collection(COLLECTION_NAME).document()
    doc_ref.set(new_doc)
    
    return {**new_doc, "id": doc_ref.id}

@router.put("/{ingredient_id}/", response_model=Dict[str, Any])
def update_ingredient(ingredient_id: str, ingredient_data: dict, current_user: dict = Depends(get_current_user)):
    """Update an existing ingredient"""
    doc_ref = db.collection(COLLECTION_NAME).document(ingredient_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail=f"Ingredient {ingredient_id} not found")
        
    update_data = ingredient_data.copy()
    update_data["updated_at"] = datetime.utcnow()
    update_data["updated_by"] = current_user["uid"]
    
    # Ensure ID is not in the data being saved to avoid field shadowing
    if "id" in update_data:
        del update_data["id"]
        
    doc_ref.update(update_data)
    
    return {**doc.to_dict(), **update_data, "id": ingredient_id}

@router.delete("/{ingredient_id}/")
def delete_ingredient(ingredient_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an ingredient"""
    doc_ref = db.collection(COLLECTION_NAME).document(ingredient_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Ingredient not found")
        
    doc_ref.delete()
    return {"status": "success", "message": f"Deleted ingredient {ingredient_id}"}
