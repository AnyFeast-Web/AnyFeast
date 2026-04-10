from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from core.security import get_current_user
from models.message import Message, MessageCreate
from datetime import datetime
import asyncio

router = APIRouter()

# Mock storage for development (in production this would be Firestore)
mock_messages: List[Dict[str, Any]] = [
    {
        "id": "msg_1",
        "client_id": "client_1",
        "direction": "in",
        "body": "Hi, I have a question about my breakfast plan.",
        "timestamp": datetime.now(),
        "read": False
    },
    {
        "id": "msg_2",
        "client_id": "client_1",
        "direction": "out",
        "body": "Sure, happy to help! What's the question?",
        "timestamp": datetime.now(),
        "read": True
    }
]

@router.get("/clients/{client_id}", response_model=List[Message])
async def get_client_messages(client_id: str, current_user: dict = Depends(get_current_user)):
    """Fetch all SMS messages for a specific client."""
    client_msgs = [m for m in mock_messages if m["client_id"] == client_id]
    return sorted(client_msgs, key=lambda x: x["timestamp"])

@router.post("/send")
async def send_sms(payload: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Trigger n8n webhook to send SMS via Twilio and save to DB."""
    # 1. Trigger n8n (Mocked)
    await asyncio.sleep(1) # Simulate network hit to n8n
    
    # 2. Save outbound message to DB
    new_msg = {
        "id": f"msg_{len(mock_messages) + 1}",
        "client_id": payload.client_id,
        "direction": "out",
        "body": payload.body,
        "timestamp": datetime.now(),
        "read": True
    }
    mock_messages.append(new_msg)
    
    return {"status": "success", "message": "SMS dispatched to n8n", "data": new_msg}

@router.patch("/clients/{client_id}/read")
async def mark_messages_as_read(client_id: str, current_user: dict = Depends(get_current_user)):
    """Mark all messages from a client as read."""
    for m in mock_messages:
        if m["client_id"] == client_id:
            m["read"] = True
    return {"status": "success"}

@router.get("/threads")
async def get_message_threads(current_user: dict = Depends(get_current_user)):
    """Get list of recent message threads with unread counts."""
    threads = {}
    for m in mock_messages:
        cid = m["client_id"]
        if cid not in threads or m["timestamp"] > threads[cid]["last_message"]["timestamp"]:
            # Count unread for this client
            unread_count = sum(1 for msg in mock_messages if msg["client_id"] == cid and not msg["read"])
            threads[cid] = {
                "client_id": cid,
                "last_message": m,
                "unread_count": unread_count
            }
    return list(threads.values())
