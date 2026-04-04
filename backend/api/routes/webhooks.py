from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from core.security import get_current_user
import asyncio

router = APIRouter()

@router.post("/trigger-order")
async def trigger_order(current_user: dict = Depends(get_current_user)):
    """Mock endpoint simulating n8n webhook order automation."""
    # Simulate processing delay
    await asyncio.sleep(2)
    return {"status": "success", "message": "Order successfully dispatched to n8n webhook"}

@router.post("/dispatch-email")
async def dispatch_email(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Mock endpoint simulating SendGrid email PDF dispatch."""
    # Simulate processing delay
    await asyncio.sleep(2)
    return {"status": "success", "message": f"Meal plan emailed successfully via SendGrid"}
