from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from core.security import get_current_user
from db.firestore import db
from models.client import ClientCreate, ClientResponse
from datetime import datetime

router = APIRouter()
COLLECTION_NAME = "clients"

@router.get("/", response_model=List[Dict[str, Any]])
def get_clients(current_user: dict = Depends(get_current_user)):
    """Retrieve all clients assigned to the current nutritionist."""
    docs = db.collection(COLLECTION_NAME).where("nutritionist_id", "==", current_user["uid"]).stream()
    return [{**doc.to_dict(), "id": doc.id} for doc in docs]

@router.post("/", response_model=Dict[str, Any])
def create_client(client_data: ClientCreate, current_user: dict = Depends(get_current_user)):
    """Create a new client profile."""
    new_client = client_data.dict()
    new_client["nutritionist_id"] = current_user["uid"]
    new_client["created_at"] = datetime.utcnow()
    new_client["updated_at"] = datetime.utcnow()
    
    doc_ref = db.collection(COLLECTION_NAME).document()
    doc_ref.set(new_client)
    
    return {**new_client, "id": doc_ref.id}

@router.get("/{client_id}", response_model=Dict[str, Any])
def get_client(client_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific client details."""
    doc_ref = db.collection(COLLECTION_NAME).document(client_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Client not found")
        
    client = doc.to_dict()
    if client.get("nutritionist_id") != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this client")
        
    return {**client, "id": doc.id}

@router.put("/{client_id}", response_model=Dict[str, Any])
def update_client(client_id: str, client_data: ClientCreate, current_user: dict = Depends(get_current_user)):
    """Update a client profile."""
    doc_ref = db.collection(COLLECTION_NAME).document(client_id)
    doc = doc_ref.get()
    
    if not doc.exists or doc.to_dict().get("nutritionist_id") != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    update_data = client_data.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    doc_ref.update(update_data)
    return {**doc.to_dict(), **update_data, "id": doc.id}

@router.delete("/{client_id}", status_code=204)
def delete_client(client_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a client profile."""
    doc_ref = db.collection(COLLECTION_NAME).document(client_id)
    doc = doc_ref.get()
    if not doc.exists or doc.to_dict().get("nutritionist_id") != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    doc_ref.delete()
    return None
