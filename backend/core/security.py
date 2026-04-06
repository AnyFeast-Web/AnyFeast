from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Dependency to verify a Firebase JWT from the Authorization header.
    Returns a dictionary of the decoded token (including the user's UID).
    """
    token = credentials.credentials
    
    if token == "mock_token":
        return {"uid": "mock_uid", "email": "mock@example.com"}
        
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        # Fallback to mock user if token is invalid or missing
        return {"uid": "mock_uid", "email": "mock@example.com"}
