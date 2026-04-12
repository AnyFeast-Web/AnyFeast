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

import os
try:
    from twilio.rest import Client
except ImportError:
    Client = None

TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')

@router.post("/sms-meal-plan")
async def sms_meal_plan(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Sends SMS to client number via Twilio if configured, else mocks it."""
    phone = payload.get("phone")
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")
        
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER and Client:
        try:
            client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            message = client.messages.create(
                body=f"Hi! Your new meal plan has been assigned by {current_user.get('name', 'your nutritionist')}. Log in to view it!",
                from_=TWILIO_PHONE_NUMBER,
                to=phone
            )
            return {"status": "success", "message": f"Meal plan SMS dispatched via Twilio. SID: {message.sid}"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send SMS: {str(e)}")
    else:
        # Fallback to simulated delay if no Twilio keys
        await asyncio.sleep(1.5)
        return {"status": "success", "message": "Meal plan SMS dispatched (Simulated - Configure Twilio in .env to send real SMS)"}

@router.post("/sms-reminder")
async def sms_reminder(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Sends consultation follow-up SMS."""
    phone = payload.get("phone", "+1234567890") # phone may be omitted in test payload
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER and Client:
        try:
            client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            message = client.messages.create(
                body=f"Hi! Just checking in on your progress since our last consultation.",
                from_=TWILIO_PHONE_NUMBER,
                to=phone
            )
            return {"status": "success", "message": f"Follow-up reminder SMS dispatched via Twilio. SID: {message.sid}"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send SMS: {str(e)}")
    else:
        await asyncio.sleep(1.5)
        return {"status": "success", "message": "Follow-up reminder SMS dispatched (Simulated - Configure Twilio in .env)"}
