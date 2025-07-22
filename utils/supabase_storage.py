# Supabase Storage System for User-specific Chatbots
import os
import json
import uuid
from typing import List, Dict, Optional
from datetime import datetime
from supabase import create_client, Client
from utils.chatbot_factory import ChatbotConfig
import logging

logger = logging.getLogger(__name__)

class SupabaseStorage:
    """Supabase-based storage for user-specific chatbots"""
    
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
    
    def create_chatbot_config(self, user_id: str, config: ChatbotConfig) -> str:
        """Create new chatbot configuration for specific user"""
        try:
            # Prepare config data for storage
            config_data = {
                "id": config.id,
                "name": config.name,
                "description": config.description,
                "website_url": getattr(config, 'website_url', None),
                "branding": config.branding,
                "extended_config": getattr(config, 'extended_config', {}),
                "status": getattr(config, 'status', 'active'),
                "created_at": datetime.now().isoformat()
            }
            
            # Insert into Supabase
            result = self.supabase.table('chatbot_configs').insert({
                "id": config.id,
                "user_id": user_id,
                "name": config.name,
                "description": config.description,
                "config_data": config_data,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }).execute()
            
            if result.data:
                logger.info(f"✅ Created chatbot config {config.id} for user {user_id}")
                return config.id
            else:
                raise Exception("No data returned from Supabase insert")
                
        except Exception as e:
            logger.error(f"❌ Failed to create chatbot config: {e}")
            raise
    
    def get_user_chatbots(self, user_id: str) -> List[Dict]:
        """Get all chatbots for specific user"""
        try:
            result = self.supabase.table('chatbot_configs').select("*").eq('user_id', user_id).execute()
            
            chatbots = []
            for row in result.data:
                # Convert back to chatbot format
                config_data = row['config_data']
                chatbot = {
                    "config": ChatbotConfig(
                        id=row['id'],
                        name=row['name'],
                        description=row['description'],
                        branding=config_data.get('branding', {}),
                        website_url=config_data.get('website_url'),
                        extended_config=config_data.get('extended_config', {})
                    ),
                    "created_at": row['created_at'],
                    "updated_at": row['updated_at'],
                    "user_id": row['user_id']
                }
                chatbots.append(chatbot)
            
            logger.info(f"📋 Found {len(chatbots)} chatbots for user {user_id}")
            return chatbots
            
        except Exception as e:
            logger.error(f"❌ Failed to get user chatbots: {e}")
            return []
    
    def get_chatbot_config(self, user_id: str, chatbot_id: str) -> Optional[Dict]:
        """Get specific chatbot config for user"""
        try:
            result = self.supabase.table('chatbot_configs').select("*").eq('user_id', user_id).eq('id', chatbot_id).single().execute()
            
            if result.data:
                row = result.data
                config_data = row['config_data']
                
                return {
                    "config": ChatbotConfig(
                        id=row['id'],
                        name=row['name'],
                        description=row['description'],
                        branding=config_data.get('branding', {}),
                        website_url=config_data.get('website_url'),
                        extended_config=config_data.get('extended_config', {})
                    ),
                    "created_at": row['created_at'],
                    "updated_at": row['updated_at'],
                    "user_id": row['user_id']
                }
            else:
                return None
                
        except Exception as e:
            logger.error(f"❌ Failed to get chatbot config: {e}")
            return None
    
    def update_chatbot_config(self, user_id: str, chatbot_id: str, updates: Dict) -> bool:
        """Update chatbot configuration"""
        try:
            # Get current config
            current = self.supabase.table('chatbot_configs').select("config_data").eq('user_id', user_id).eq('id', chatbot_id).single().execute()
            
            if not current.data:
                return False
            
            # Merge updates with current config
            config_data = current.data['config_data']
            
            # Update specific fields
            if 'name' in updates:
                config_data['name'] = updates['name']
            if 'description' in updates:
                config_data['description'] = updates['description']
            if 'branding' in updates:
                config_data['branding'].update(updates['branding'])
            
            # Update in database
            result = self.supabase.table('chatbot_configs').update({
                "name": updates.get('name', config_data.get('name')),
                "description": updates.get('description', config_data.get('description')),
                "config_data": config_data,
                "updated_at": datetime.now().isoformat()
            }).eq('user_id', user_id).eq('id', chatbot_id).execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"❌ Failed to update chatbot config: {e}")
            return False
    
    def delete_chatbot_config(self, user_id: str, chatbot_id: str) -> bool:
        """Delete chatbot configuration"""
        try:
            result = self.supabase.table('chatbot_configs').delete().eq('user_id', user_id).eq('id', chatbot_id).execute()
            
            success = len(result.data) > 0
            if success:
                logger.info(f"🗑️ Deleted chatbot {chatbot_id} for user {user_id}")
            return success
            
        except Exception as e:
            logger.error(f"❌ Failed to delete chatbot config: {e}")
            return False
    
    def user_owns_chatbot(self, user_id: str, chatbot_id: str) -> bool:
        """Check if user owns specific chatbot"""
        try:
            result = self.supabase.table('chatbot_configs').select("id").eq('user_id', user_id).eq('id', chatbot_id).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"❌ Failed to check chatbot ownership: {e}")
            return False