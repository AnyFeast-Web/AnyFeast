from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from core.security import get_current_user
from db.firestore import db
from models.consultation import ConsultationCreate
from datetime import datetime

router = APIRouter()
COLLECTION_NAME = "consultations"

@router.get("/", response_model=List[Dict[str, Any]])
def get_consultations(client_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Retrieve consultation logs."""
    query = db.collection(COLLECTION_NAME).where("nutritionist_id", "==", current_user["uid"])
    if client_id:
        query = query.where("client_id", "==", client_id)
        
    docs = query.stream()
    return [{**doc.to_dict(), "id": doc.id} for doc in docs]

@router.post("/", response_model=Dict[str, Any])
def create_consultation(consult_data: ConsultationCreate, current_user: dict = Depends(get_current_user)):
    """Log a new consultation session."""
    new_doc = consult_data.dict()
    new_doc["nutritionist_id"] = current_user["uid"]
    new_doc["created_at"] = datetime.utcnow()
    new_doc["updated_at"] = datetime.utcnow()
    
    doc_ref = db.collection(COLLECTION_NAME).document()
    doc_ref.set(new_doc)
    
    return {**new_doc, "id": doc_ref.id}

@router.get("/{consultation_id}", response_model=Dict[str, Any])
def get_consultation(consultation_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific consultation details."""
    doc_ref = db.collection(COLLECTION_NAME).document(consultation_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Consultation not found")
        
    doc_data = doc.to_dict()
    if doc_data.get("nutritionist_id") != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return {**doc_data, "id": doc.id}

@router.put("/{consultation_id}", response_model=Dict[str, Any])
def update_consultation(consultation_id: str, consult_data: ConsultationCreate, current_user: dict = Depends(get_current_user)):
    """Update consultation draft or summary notes."""
    doc_ref = db.collection(COLLECTION_NAME).document(consultation_id)
    doc = doc_ref.get()
    
    if not doc.exists or doc.to_dict().get("nutritionist_id") != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    update_data = consult_data.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    doc_ref.update(update_data)
    return {**doc.to_dict(), **update_data, "id": doc.id}
