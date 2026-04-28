from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthUser(BaseModel):
    id: str
    email: str
    name: str
    role: str
    status: str
    emailVerifiedAt: str | None = None
    createdAt: str

class LoginResponse(BaseModel):
    accessToken: str
    refreshToken: str
    user: AuthUser

@router.post("/login", response_model=LoginResponse)
def login(creds: LoginRequest):
    # Mock login to bypass Firebase auth for local frontend development
    if not creds.email or not creds.password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    # Return mock token which security.py accepts
    return {
        "accessToken": "mock_token",
        "refreshToken": "mock_refresh_token",
        "user": {
            "id": "mock_uid",
            "email": creds.email,
            "name": "Nutritionist Admin",
            "role": "admin",
            "status": "active",
            "createdAt": "2024-01-01T00:00:00Z"
        }
    }

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=dict)
def get_me():
    return {
        "user": {
            "id": "mock_uid",
            "email": "mock@example.com",
            "name": "Nutritionist Admin",
            "role": "admin",
            "status": "active",
            "createdAt": "2024-01-01T00:00:00Z"
        }
    }

@router.post("/refresh")
def refresh():
    return {
        "accessToken": "mock_token",
        "refreshToken": "mock_refresh_token"
    }

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

@router.post("/register")
def register(req: RegisterRequest):
    return {
        "user": {
            "id": "mock_uid",
            "email": req.email,
            "name": req.name,
            "role": "admin",
            "status": "active",
            "createdAt": "2024-01-01T00:00:00Z"
        },
        "verificationToken": "mock_verification_token"
    }

class ForgotPasswordRequest(BaseModel):
    email: str

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    return {"message": "Mock reset link sent"}

class ResetPasswordRequest(BaseModel):
    token: str
    password: str

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    return {"message": "Mock password reset"}

class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str

@router.post("/change-password")
def change_password(req: ChangePasswordRequest):
    return {"message": "Mock password changed"}
