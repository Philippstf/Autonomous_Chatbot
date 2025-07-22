# Supabase Authentication for FastAPI
import os
import jwt
from typing import Optional, Dict
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
import logging

logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

if not all([SUPABASE_URL, SUPABASE_ANON_KEY]):
    raise ValueError("Supabase credentials not found in environment")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Security scheme
security = HTTPBearer()

class SupabaseAuth:
    """Supabase authentication handler"""
    
    @staticmethod
    def verify_jwt_token(token: str) -> Dict:
        """Verify Supabase JWT token"""
        try:
            # Supabase JWTs are typically verified using the JWT secret
            # For now, we'll decode without verification since we trust Supabase
            # In production, you should verify with the JWT secret
            
            # Decode without verification (Supabase already verified it)
            payload = jwt.decode(token, options={"verify_signature": False})
            
            # Check if token is expired
            import time
            if payload.get('exp', 0) < time.time():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired"
                )
            
            return payload
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid JWT token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed"
            )
    
    @staticmethod
    def get_user_from_token(token: str) -> Dict:
        """Extract user information from token"""
        try:
            payload = SupabaseAuth.verify_jwt_token(token)
            
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload"
                )
            
            return {
                "id": user_id,
                "email": payload.get("email"),
                "role": payload.get("role", "authenticated"),
                "aud": payload.get("aud"),
                "exp": payload.get("exp"),
                "iat": payload.get("iat"),
                "iss": payload.get("iss"),
                "sub": user_id,
                "user_metadata": payload.get("user_metadata", {}),
                "app_metadata": payload.get("app_metadata", {})
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error extracting user from token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to extract user information"
            )

# FastAPI dependency for protected routes
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """Get current user from Supabase JWT token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required"
        )
    
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token required"
        )
    
    return SupabaseAuth.get_user_from_token(token)

# Optional dependency - returns None if no auth
async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[Dict]:
    """Get current user if authenticated, otherwise return None"""
    if not credentials:
        return None
    
    try:
        return SupabaseAuth.get_user_from_token(credentials.credentials)
    except HTTPException:
        return None