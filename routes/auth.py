# Authentication routes
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import logging

from utils.auth import create_access_token, get_current_user
from utils.user_manager import UserManager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Initialize user manager
user_manager = UserManager()

# ─── Pydantic Models ─────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    name: Optional[str] = Field(None, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=100)

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    created_at: str
    is_active: bool

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ─── Authentication Endpoints ────────────────────────────────────────────────

@router.post("/register", response_model=LoginResponse)
async def register(user_data: UserRegister):
    """Register new user"""
    try:
        # Create user
        user = await user_manager.create_user(
            email=user_data.email,
            password=user_data.password,
            name=user_data.name
        )
        
        # Create access token
        token_data = {
            "sub": user["id"],
            "email": user["email"],
            "created_at": user["created_at"]
        }
        access_token = create_access_token(token_data)
        
        return LoginResponse(
            access_token=access_token,
            user=UserResponse(**user)
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=LoginResponse)
async def login(login_data: UserLogin):
    """Login user"""
    try:
        user = await user_manager.authenticate_user(
            email=login_data.email,
            password=login_data.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        token_data = {
            "sub": user["id"],
            "email": user["email"], 
            "created_at": user["created_at"]
        }
        access_token = create_access_token(token_data)
        
        return LoginResponse(
            access_token=access_token,
            user=UserResponse(**user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    try:
        user = await user_manager.get_user_by_id(current_user["id"])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(**user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )

@router.post("/password-reset-request")
async def request_password_reset(request: PasswordResetRequest):
    """Request password reset"""
    try:
        # Always return success to prevent email enumeration
        reset_token = await user_manager.initiate_password_reset(request.email)
        
        # In production, send email here
        # For now, just log the token (remove in production!)
        if reset_token:
            logger.info(f"Password reset token for {request.email}: {reset_token}")
        
        return {"message": "If an account with this email exists, a password reset link has been sent."}
        
    except Exception as e:
        logger.error(f"Password reset request error: {e}")
        return {"message": "If an account with this email exists, a password reset link has been sent."}

@router.post("/password-reset-confirm")
async def confirm_password_reset(request: PasswordResetConfirm):
    """Confirm password reset with token"""
    try:
        success = await user_manager.reset_password(request.token, request.new_password)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        return {"message": "Password has been reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset confirm error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )

@router.delete("/account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Delete user account (GDPR compliance)"""
    try:
        # This would delete all user data
        # Implementation depends on your data deletion policy
        
        return {"message": "Account deletion requested. This feature will be implemented based on your data retention policy."}
        
    except Exception as e:
        logger.error(f"Account deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account deletion failed"
        )

@router.get("/data-export")
async def export_user_data(current_user: dict = Depends(get_current_user)):
    """Export user data (GDPR compliance)"""
    try:
        user_data = {
            "user_info": await user_manager.get_user_by_id(current_user["id"]),
            "export_date": datetime.now().isoformat(),
            "note": "This includes all personal data we have stored about you."
        }
        
        return user_data
        
    except Exception as e:
        logger.error(f"Data export error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Data export failed"
        )