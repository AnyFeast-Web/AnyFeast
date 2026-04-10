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
    return {"status": "success", "message": "Meal plan emailed successfully via SendGrid"}

@router.post("/sms-meal-plan")
async def sms_meal_plan(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Simulates n8n webhook → formats plan → dispatches SMS to client number."""
    await asyncio.sleep(1.5)
    return {"status": "success", "message": "Meal plan SMS dispatched via n8n"}

@router.post("/sms-reminder")
async def sms_reminder(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Simulates n8n webhook → sends consultation follow-up SMS."""
    await asyncio.sleep(1.5)
    return {"status": "success", "message": "Follow-up reminder SMS dispatched via n8n"}
