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
            # Helper function to safely serialize objects to JSON
            def safe_serialize(obj):
                """Safely convert objects to JSON-serializable format"""
                if obj is None:
                    return None
                elif isinstance(obj, (str, int, float, bool)):
                    return obj
                elif isinstance(obj, (list, tuple)):
                    return [safe_serialize(item) for item in obj]
                elif isinstance(obj, dict):
                    return {str(k): safe_serialize(v) for k, v in obj.items()}
                elif hasattr(obj, '__dict__'):
                    # Convert objects with __dict__ to dict
                    return safe_serialize(obj.__dict__)
                else:
                    # Convert to string as fallback
                    return str(obj)
            
            # Prepare config data for storage with safe serialization
            config_data = {
                "id": config.id,
                "name": config.name,
                "description": config.description or "",
                "website_url": getattr(config, 'website_url', None),
                "branding": safe_serialize(getattr(config, 'branding', {})),
                "extended_config": safe_serialize(getattr(config, 'extended_config', {})),
                "documents": safe_serialize(getattr(config, 'documents', [])),
                "status": getattr(config, 'status', 'active'),
                "created_at": datetime.now().isoformat()
            }
            
            # Insert into Supabase with clean data
            insert_data = {
                "id": config.id,
                "user_id": user_id,
                "name": config.name,
                "description": config.description or "",
                "config_data": config_data
            }
            
            # Log the data being inserted for debugging
            logger.info(f"Inserting chatbot config: {config.name} (ID: {config.id})")
            
            result = self.supabase.table('chatbot_configs').insert(insert_data).execute()
            
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
    
    # ─── Lead Management ─────────────────────────────────────────────────────────
    
    def create_lead(self, user_id: str, chatbot_id: str, lead_data: Dict) -> str:
        """Create new lead for chatbot"""
        try:
            lead_id = str(uuid.uuid4())
            
            result = self.supabase.table('leads').insert({
                "id": lead_id,
                "user_id": user_id,
                "chatbot_id": chatbot_id,
                "email": lead_data.get('email'),
                "name": lead_data.get('name'),
                "phone": lead_data.get('phone'),
                "message": lead_data.get('message'),
                "conversation_id": lead_data.get('conversation_id'),
                "lead_source": lead_data.get('lead_source', 'chat_capture'),
                "status": "new",
                "created_at": datetime.now().isoformat(),
                "metadata": lead_data.get('metadata', {})
            }).execute()
            
            if result.data:
                logger.info(f"📧 Created lead {lead_id} for chatbot {chatbot_id}")
                return lead_id
            else:
                raise Exception("No data returned from Supabase insert")
                
        except Exception as e:
            logger.error(f"❌ Failed to create lead: {e}")
            raise
    
    def get_chatbot_leads(self, user_id: str, chatbot_id: str, limit: int = 100, offset: int = 0) -> List[Dict]:
        """Get leads for specific chatbot"""
        try:
            result = self.supabase.table('leads').select("*").eq('user_id', user_id).eq('chatbot_id', chatbot_id).order('created_at', desc=True).limit(limit).offset(offset).execute()
            
            logger.info(f"📧 Found {len(result.data)} leads for chatbot {chatbot_id}")
            return result.data
            
        except Exception as e:
            logger.error(f"❌ Failed to get chatbot leads: {e}")
            return []
    
    def get_user_leads(self, user_id: str, limit: int = 100, offset: int = 0) -> List[Dict]:
        """Get all leads for user across all chatbots"""
        try:
            result = self.supabase.table('leads').select("*").eq('user_id', user_id).order('created_at', desc=True).limit(limit).offset(offset).execute()
            
            logger.info(f"📧 Found {len(result.data)} total leads for user {user_id}")
            return result.data
            
        except Exception as e:
            logger.error(f"❌ Failed to get user leads: {e}")
            return []
    
    def update_lead_status(self, user_id: str, lead_id: str, status: str) -> bool:
        """Update lead status (new, contacted, converted, etc.)"""
        try:
            result = self.supabase.table('leads').update({
                "status": status,
                "updated_at": datetime.now().isoformat()
            }).eq('user_id', user_id).eq('id', lead_id).execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"❌ Failed to update lead status: {e}")
            return False
    
    # ─── Conversation Management ────────────────────────────────────────────────
    
    def save_conversation_message(self, user_id: str, chatbot_id: str, conversation_id: str, 
                                role: str, content: str, metadata: Dict = None) -> str:
        """Save conversation message"""
        try:
            message_id = str(uuid.uuid4())
            
            result = self.supabase.table('conversation_messages').insert({
                "id": message_id,
                "user_id": user_id,
                "chatbot_id": chatbot_id,
                "conversation_id": conversation_id,
                "role": role,  # "user" or "assistant"
                "content": content,
                "metadata": metadata or {},
                "created_at": datetime.now().isoformat()
            }).execute()
            
            if result.data:
                return message_id
            else:
                raise Exception("No data returned from Supabase insert")
                
        except Exception as e:
            logger.error(f"❌ Failed to save conversation message: {e}")
            raise
    
    def get_conversation_history(self, user_id: str, chatbot_id: str, conversation_id: str) -> List[Dict]:
        """Get conversation history"""
        try:
            result = self.supabase.table('conversation_messages').select("*").eq('user_id', user_id).eq('chatbot_id', chatbot_id).eq('conversation_id', conversation_id).order('created_at', desc=False).execute()
            
            return result.data
            
        except Exception as e:
            logger.error(f"❌ Failed to get conversation history: {e}")
            return []
    
    def get_chatbot_conversations(self, user_id: str, chatbot_id: str, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get all conversations for specific chatbot with summary info"""
        try:
            # Get unique conversations with latest message info
            result = self.supabase.table('conversation_messages').select("conversation_id, created_at").eq('user_id', user_id).eq('chatbot_id', chatbot_id).order('created_at', desc=True).execute()
            
            # Group by conversation_id and get summary
            conversations = {}
            for message in result.data:
                conv_id = message['conversation_id']
                if conv_id not in conversations:
                    conversations[conv_id] = {
                        'conversation_id': conv_id,
                        'last_message_at': message['created_at'],
                        'message_count': 1
                    }
                else:
                    conversations[conv_id]['message_count'] += 1
            
            # Convert to list and sort by last message
            conv_list = list(conversations.values())
            conv_list.sort(key=lambda x: x['last_message_at'], reverse=True)
            
            return conv_list[offset:offset + limit]
            
        except Exception as e:
            logger.error(f"❌ Failed to get chatbot conversations: {e}")
            return []
    
    def get_conversation_summary(self, user_id: str, chatbot_id: str, conversation_id: str) -> Dict:
        """Get conversation summary with first and last message"""
        try:
            messages = self.get_conversation_history(user_id, chatbot_id, conversation_id)
            
            if not messages:
                return {}
            
            first_message = messages[0]
            last_message = messages[-1]
            
            # Check if conversation has a lead
            lead_result = self.supabase.table('leads').select("*").eq('user_id', user_id).eq('conversation_id', conversation_id).execute()
            has_lead = len(lead_result.data) > 0
            lead_info = lead_result.data[0] if has_lead else None
            
            return {
                'conversation_id': conversation_id,
                'message_count': len(messages),
                'started_at': first_message['created_at'],
                'last_message_at': last_message['created_at'],
                'first_user_message': first_message.get('content', '') if first_message['role'] == 'user' else '',
                'has_lead': has_lead,
                'lead_info': lead_info,
                'duration_minutes': self._calculate_conversation_duration(messages)
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get conversation summary: {e}")
            return {}
    
    def _calculate_conversation_duration(self, messages: List[Dict]) -> int:
        """Calculate conversation duration in minutes"""
        if len(messages) < 2:
            return 0
        
        try:
            from datetime import datetime
            start = datetime.fromisoformat(messages[0]['created_at'].replace('Z', '+00:00'))
            end = datetime.fromisoformat(messages[-1]['created_at'].replace('Z', '+00:00'))
            duration = (end - start).total_seconds() / 60
            return max(1, int(duration))
        except:
            return 0