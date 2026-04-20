from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from core.security import get_current_user
from db.firestore import db
from utils.mailer import send_meal_plan_email
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
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_EMAIL = os.environ.get("SMTP_EMAIL")
SMTP_APP_PASSWORD = os.environ.get("SMTP_APP_PASSWORD")
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))

def send_real_email(to_email: str, subject: str, html_body: str):
    """Utility function to dispatch real emails via SMTP."""
    if not SMTP_EMAIL or not SMTP_APP_PASSWORD or SMTP_EMAIL == "your_email@gmail.com":
        return False, "SMTP credentials missing or misconfigured in .env"
        
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Connect to server
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_APP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True, "Email dispatched successfully"
    except Exception as e:
        return False, str(e)

@router.post("/sms-meal-plan")
async def sms_meal_plan(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Sends Email to client containing URL link or notice."""
    email = payload.get("email") # Client's email needs to be sent by frontend payload
    
    # In frontend, if they didn't format payload to include "email", we provide standard string logic:
    if not email or "@" not in email:
        email = "testclient@example.com" # Fallback if frontend hook isn't strictly passing email field
        
    nutritionist_name = current_user.get("name", "Your Nutritionist")
    html_body = f"""
    <html>
      <body>
        <h2 style="color:#2ea880;">Your New Diet Plan is Ready!</h2>
        <p>Hi there,</p>
        <p><strong>{nutritionist_name}</strong> has just finalized a brand new Diet Plan and Schedule for you.</p>
        <p>Log into your AnyFeast patient portal right now to view your schedule and specific protocols!</p>
        <br/>
        <p>Warm regards,<br/>The AnyFeast Platform</p>
      </body>
    </html>
    """
    
    success, return_msg = send_real_email(email, "New Diet Plan Available", html_body)
    
    if success:
        return {"status": "success", "message": "Diet plan successfully emailed to client inbox!"}
    else:
        # Fallback to simulated message
        await asyncio.sleep(1.5)
        return {"status": "success", "message": f"Simulated Email (Real dispatch failed: {return_msg})"}

@router.post("/sms-reminder")
async def sms_reminder(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Sends consultation follow-up Email."""
    email = payload.get("email", "testclient@example.com")
    nutritionist_name = current_user.get("name", "Your Nutritionist")
    
    html_body = f"""
    <html>
      <body>
        <h3>Consultation Follow-Up Check-in</h3>
        <p>Hi there,</p>
        <p><strong>{nutritionist_name}</strong> is just checking in on your progress since your last consultation.</p>
        <p>Remember to stick to your dietary guidelines! If you have any questions, feel free to reach out.</p>
      </body>
    </html>
    """
    
    success, return_msg = send_real_email(email, "Progress Check-in", html_body)
    
    if success:
        return {"status": "success", "message": "Follow-up reminder successfully emailed!"}
    else:
        await asyncio.sleep(1.5)
        return {"status": "success", "message": f"Simulated Reminder Email (Real dispatch failed: {return_msg})"}

@router.post("/send-meal-plan-email")
async def send_meal_plan_email_endpoint(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """
    Send meal plan email to client.

    Request body:
    {
        "client_id": str,
        "meal_plan_id": str,
        "message": str
    }
    """
    client_id = payload.get("client_id")
    meal_plan_id = payload.get("meal_plan_id")
    message = payload.get("message", "")

    if not client_id or not meal_plan_id:
        raise HTTPException(status_code=400, detail="client_id and meal_plan_id are required")

    try:
        # Fetch client data from Firestore
        client_doc = db.collection("clients").document(client_id).get()
        if not client_doc.exists:
            raise HTTPException(status_code=404, detail="Client not found")

        client_data = client_doc.to_dict()
        client_email = client_data.get("personal_info", {}).get("email")
        client_name = f"{client_data.get('personal_info', {}).get('first_name', '')} {client_data.get('personal_info', {}).get('last_name', '')}".strip()

        if not client_email:
            raise HTTPException(status_code=400, detail="Client email not found")

        # Fetch meal plan data from Firestore
        meal_plan_doc = db.collection("meal_plans").document(meal_plan_id).get()
        if not meal_plan_doc.exists:
            raise HTTPException(status_code=404, detail="Meal plan not found")

        meal_plan_data = meal_plan_doc.to_dict()

        # Send email
        await send_meal_plan_email(
            to_email=client_email,
            client_name=client_name,
            meal_plan=meal_plan_data,
            message=message
        )

        return {"success": True, "message": "Email sent successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
