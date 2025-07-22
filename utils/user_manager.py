# User Management with Supabase
import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, List
from supabase import create_client, Client
from .auth import hash_password, verify_password, generate_reset_token
import logging

logger = logging.getLogger(__name__)

class UserManager:
    """User management with Supabase backend"""
    
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        self._ensure_tables()
    
    def _ensure_tables(self):
        """Ensure user table exists"""
        try:
            # Check if users table exists by querying it
            result = self.supabase.table('users').select("id").limit(1).execute()
            logger.info("Users table exists")
        except Exception as e:
            logger.warning(f"Users table might not exist: {e}")
            # Table will be created manually in Supabase dashboard
    
    async def create_user(self, email: str, password: str, name: str = None) -> Dict:
        """Create new user"""
        try:
            # Check if user already exists
            existing = self.supabase.table('users').select("id").eq('email', email).execute()
            if existing.data:
                raise ValueError("User with this email already exists")
            
            # Create user
            user_id = str(uuid.uuid4())
            hashed_password = hash_password(password)
            
            user_data = {
                'id': user_id,
                'email': email,
                'password_hash': hashed_password,
                'name': name or email.split('@')[0],
                'created_at': datetime.now(timezone.utc).isoformat(),
                'is_active': True
            }
            
            result = self.supabase.table('users').insert(user_data).execute()
            
            if result.data:
                user = result.data[0]
                # Remove password hash from response
                user.pop('password_hash', None)
                return user
            else:
                raise Exception("Failed to create user")
                
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    async def authenticate_user(self, email: str, password: str) -> Optional[Dict]:
        """Authenticate user with email and password"""
        try:
            result = self.supabase.table('users').select("*").eq('email', email).eq('is_active', True).execute()
            
            if not result.data:
                return None
            
            user = result.data[0]
            if verify_password(password, user['password_hash']):
                # Remove password hash from response
                user.pop('password_hash', None)
                return user
            
            return None
            
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        try:
            result = self.supabase.table('users').select("id, email, name, created_at, is_active").eq('id', user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        try:
            result = self.supabase.table('users').select("id, email, name, created_at, is_active").eq('email', email).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    async def initiate_password_reset(self, email: str) -> Optional[str]:
        """Initiate password reset process"""
        try:
            user = await self.get_user_by_email(email)
            if not user:
                return None
            
            reset_token = generate_reset_token()
            expires_at = datetime.now(timezone.utc) + timedelta(hours=1)  # 1 hour expiry
            
            # Store reset token
            reset_data = {
                'user_id': user['id'],
                'token': reset_token,
                'expires_at': expires_at.isoformat(),
                'used': False
            }
            
            # Upsert reset token (replace existing if any)
            self.supabase.table('password_resets').upsert(reset_data, on_conflict='user_id').execute()
            
            return reset_token
            
        except Exception as e:
            logger.error(f"Error initiating password reset: {e}")
            return None
    
    async def reset_password(self, token: str, new_password: str) -> bool:
        """Reset password using token"""
        try:
            # Find valid reset token
            result = self.supabase.table('password_resets').select("*").eq('token', token).eq('used', False).execute()
            
            if not result.data:
                return False
            
            reset_record = result.data[0]
            
            # Check if token is expired
            expires_at = datetime.fromisoformat(reset_record['expires_at'].replace('Z', '+00:00'))
            if datetime.now(timezone.utc) > expires_at:
                return False
            
            # Update user password
            hashed_password = hash_password(new_password)
            self.supabase.table('users').update({'password_hash': hashed_password}).eq('id', reset_record['user_id']).execute()
            
            # Mark token as used
            self.supabase.table('password_resets').update({'used': True}).eq('token', token).execute()
            
            return True
            
        except Exception as e:
            logger.error(f"Error resetting password: {e}")
            return False