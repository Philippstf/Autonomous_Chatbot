# Firestore Storage System for Railway Backend
import os
import json
import uuid
from typing import List, Dict, Optional, Any
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from utils.chatbot_factory import ChatbotConfig
import logging

logger = logging.getLogger(__name__)

class FirestoreStorage:
    """Firestore-based storage for user-specific chatbots (Railway Backend)"""
    
    def __init__(self):
        self.db = None
        self.initialize_firebase()
    
    def initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        if not firebase_admin._apps:
            try:
                # Try environment variables first
                firebase_config = {
                    "type": "service_account",
                    "project_id": os.getenv("FIREBASE_PROJECT_ID", "helferlain-a4178"),
                    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                    "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
                    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
                }
                
                # Check if we have required credentials
                if all([firebase_config["private_key_id"], firebase_config["private_key"], firebase_config["client_email"]]):
                    cred = credentials.Certificate(firebase_config)
                    logger.info("Using Firebase service account from environment variables")
                else:
                    # Fall back to default credentials
                    logger.warning("Using Firebase default credentials (Application Default Credentials)")
                    cred = credentials.ApplicationDefault()
                
                firebase_admin.initialize_app(cred, {
                    'projectId': firebase_config["project_id"]
                })
                logger.info(f"Firebase Admin SDK initialized for project: {firebase_config['project_id']}")
                
            except Exception as e:
                logger.error(f"Failed to initialize Firebase: {e}")
                # Initialize with minimal config for Railway
                try:
                    firebase_admin.initialize_app(credentials.ApplicationDefault(), {
                        'projectId': os.getenv("FIREBASE_PROJECT_ID", "helferlain-a4178")
                    })
                    logger.warning("Initialized Firebase with minimal configuration")
                except Exception as fallback_error:
                    logger.error(f"Firebase initialization completely failed: {fallback_error}")
                    raise Exception(f"Cannot initialize Firebase: {fallback_error}")
        
        self.db = firestore.client()
        logger.info("Firestore client initialized successfully")
    
    # Collection names (consistent with frontend)
    COLLECTIONS = {
        'CHATBOT_CONFIGS': 'chatbot_configs',
        'CHATBOT_REGISTRY': 'chatbot_registry', 
        'CONVERSATIONS': 'conversations',
        'MESSAGES': 'messages',
        'LEADS': 'leads',
        'CAPTURED_LEADS': 'captured_leads',
        'CONTACT_PERSONS': 'contact_persons',
        'CHATBOT_ANALYTICS': 'chatbot_analytics',
        'PLATFORM_ANALYTICS': 'platform_analytics',
        'CHATBOT_SOURCES': 'chatbot_sources'
    }
    
    def safe_serialize(self, obj: Any) -> Any:
        """Safely convert objects to Firestore-compatible format"""
        if obj is None:
            return None
        elif isinstance(obj, (str, int, float, bool)):
            return obj
        elif isinstance(obj, datetime):
            return obj
        elif isinstance(obj, (list, tuple)):
            return [self.safe_serialize(item) for item in obj]
        elif isinstance(obj, dict):
            return {str(k): self.safe_serialize(v) for k, v in obj.items()}
        elif hasattr(obj, '__dict__'):
            return self.safe_serialize(obj.__dict__)
        else:
            return str(obj)
    
    # ─── Chatbot Configuration Methods ───────────────────────────────────────────
    
    def create_chatbot_config(self, user_id: str, config: ChatbotConfig) -> str:
        """Create new chatbot configuration for specific user"""
        try:
            config_data = {
                'id': config.id,
                'name': config.name,
                'description': config.description,
                'website_url': getattr(config, 'website_url', None),
                'branding': self.safe_serialize(getattr(config, 'branding', {})),
                'extended_config': self.safe_serialize(getattr(config, 'extended_config', {})),
                'status': 'active',
                'document_count': 0,
                'total_chunks': 0,
                'user_id': user_id,
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            }
            
            # Use the chatbot ID as document ID
            doc_ref = self.db.collection(self.COLLECTIONS['CHATBOT_CONFIGS']).document(config.id)
            doc_ref.set(config_data)
            
            logger.info(f"Created chatbot config: {config.id} for user: {user_id}")
            return config.id
            
        except Exception as e:
            logger.error(f"Failed to create chatbot config: {e}")
            raise
    
    def get_chatbot_config(self, user_id: str, chatbot_id: str) -> Optional[ChatbotConfig]:
        """Get chatbot configuration for specific user"""
        try:
            doc_ref = self.db.collection(self.COLLECTIONS['CHATBOT_CONFIGS']).document(chatbot_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            data = doc.to_dict()
            if data.get('user_id') != user_id:
                logger.warning(f"User {user_id} tried to access chatbot {chatbot_id} owned by {data.get('user_id')}")
                return None
            
            # Convert back to ChatbotConfig object
            return ChatbotConfig(
                id=data['id'],
                name=data['name'],
                description=data['description'],
                website_url=data.get('website_url'),
                branding=data.get('branding', {}),
                extended_config=data.get('extended_config', {})
            )
            
        except Exception as e:
            logger.error(f"Failed to get chatbot config {chatbot_id}: {e}")
            return None
    
    def get_user_chatbots(self, user_id: str) -> List[Dict]:
        """Get all chatbots for a specific user"""
        try:
            query = self.db.collection(self.COLLECTIONS['CHATBOT_CONFIGS']).where('user_id', '==', user_id)
            docs = query.stream()
            
            chatbots = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                chatbots.append(data)
            
            # Sort by creation date (newest first)
            chatbots.sort(key=lambda x: x.get('created_at', datetime.min), reverse=True)
            logger.info(f"Retrieved {len(chatbots)} chatbots for user {user_id}")
            return chatbots
            
        except Exception as e:
            logger.error(f"Failed to get user chatbots for {user_id}: {e}")
            return []
    
    def user_owns_chatbot(self, user_id: str, chatbot_id: str) -> bool:
        """Check if user owns the specified chatbot"""
        try:
            doc_ref = self.db.collection(self.COLLECTIONS['CHATBOT_CONFIGS']).document(chatbot_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return False
            
            return doc.to_dict().get('user_id') == user_id
            
        except Exception as e:
            logger.error(f"Failed to check ownership for chatbot {chatbot_id}: {e}")
            return False
    
    # ─── Conversation Methods ────────────────────────────────────────────────────
    
    def save_conversation_message(self, user_id: str, chatbot_id: str, conversation_id: str, 
                                  role: str, content: str, metadata: Optional[Dict] = None):
        """Save a message to conversation history"""
        try:
            message_data = {
                'user_id': user_id,
                'chatbot_id': chatbot_id,
                'conversation_id': conversation_id,
                'role': role,  # 'user' or 'assistant'
                'content': content,
                'metadata': self.safe_serialize(metadata or {}),
                'created_at': firestore.SERVER_TIMESTAMP
            }
            
            self.db.collection(self.COLLECTIONS['MESSAGES']).add(message_data)
            logger.debug(f"Saved message for conversation {conversation_id}")
            
        except Exception as e:
            logger.error(f"Failed to save conversation message: {e}")
            raise
    
    def get_conversation_history(self, user_id: str, chatbot_id: str, conversation_id: str) -> List[Dict]:
        """Get conversation history for a specific conversation"""
        try:
            query = (self.db.collection(self.COLLECTIONS['MESSAGES'])
                    .where('user_id', '==', user_id)
                    .where('chatbot_id', '==', chatbot_id)
                    .where('conversation_id', '==', conversation_id)
                    .order_by('created_at'))
            
            docs = query.stream()
            messages = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                messages.append(data)
            
            return messages
            
        except Exception as e:
            logger.error(f"Failed to get conversation history: {e}")
            return []
    
    def get_conversation_summary(self, user_id: str, chatbot_id: str, conversation_id: str) -> Dict:
        """Get conversation summary"""
        try:
            messages = self.get_conversation_history(user_id, chatbot_id, conversation_id)
            
            if not messages:
                return {'message_count': 0, 'first_message': None, 'last_message': None}
            
            return {
                'message_count': len(messages),
                'first_message': messages[0].get('created_at'),
                'last_message': messages[-1].get('created_at'),
                'conversation_id': conversation_id
            }
            
        except Exception as e:
            logger.error(f"Failed to get conversation summary: {e}")
            return {}
    
    def get_chatbot_conversations(self, user_id: str, chatbot_id: str, limit: int = 20, offset: int = 0) -> List[Dict]:
        """Get conversations for a specific chatbot"""
        try:
            # Get unique conversation IDs
            query = (self.db.collection(self.COLLECTIONS['MESSAGES'])
                    .where('user_id', '==', user_id)
                    .where('chatbot_id', '==', chatbot_id))
            
            docs = query.stream()
            conversation_ids = set()
            conversations_data = {}
            
            for doc in docs:
                data = doc.to_dict()
                conv_id = data['conversation_id']
                conversation_ids.add(conv_id)
                
                if conv_id not in conversations_data:
                    conversations_data[conv_id] = {
                        'conversation_id': conv_id,
                        'chatbot_id': chatbot_id,
                        'message_count': 0,
                        'first_message': data.get('created_at'),
                        'last_message': data.get('created_at')
                    }
                
                conversations_data[conv_id]['message_count'] += 1
                if data.get('created_at'):
                    if not conversations_data[conv_id]['first_message'] or data['created_at'] < conversations_data[conv_id]['first_message']:
                        conversations_data[conv_id]['first_message'] = data['created_at']
                    if not conversations_data[conv_id]['last_message'] or data['created_at'] > conversations_data[conv_id]['last_message']:
                        conversations_data[conv_id]['last_message'] = data['created_at']
            
            conversations = list(conversations_data.values())
            conversations.sort(key=lambda x: x.get('last_message', datetime.min), reverse=True)
            
            return conversations[offset:offset + limit]
            
        except Exception as e:
            logger.error(f"Failed to get chatbot conversations: {e}")
            return []
    
    # ─── Lead Management Methods ──────────────────────────────────────────────────
    
    def create_lead(self, user_id: str, chatbot_id: str, email: str, name: Optional[str] = None, 
                    phone: Optional[str] = None, message: Optional[str] = None, 
                    conversation_id: Optional[str] = None, metadata: Optional[Dict] = None) -> str:
        """Create a new lead"""
        try:
            lead_data = {
                'user_id': user_id,
                'chatbot_id': chatbot_id,
                'email': email,
                'name': name,
                'phone': phone,
                'message': message,
                'conversation_id': conversation_id,
                'status': 'new',
                'metadata': self.safe_serialize(metadata or {}),
                'created_at': firestore.SERVER_TIMESTAMP
            }
            
            doc_ref = self.db.collection(self.COLLECTIONS['LEADS']).add(lead_data)
            lead_id = doc_ref[1].id
            
            logger.info(f"Created lead {lead_id} for chatbot {chatbot_id}")
            return lead_id
            
        except Exception as e:
            logger.error(f"Failed to create lead: {e}")
            raise
    
    def get_user_leads(self, user_id: str, limit: int = 100, offset: int = 0) -> List[Dict]:
        """Get all leads for a user"""
        try:
            query = (self.db.collection(self.COLLECTIONS['LEADS'])
                    .where('user_id', '==', user_id)
                    .order_by('created_at', direction=firestore.Query.DESCENDING))
            
            docs = query.stream()
            leads = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                leads.append(data)
            
            return leads[offset:offset + limit]
            
        except Exception as e:
            logger.error(f"Failed to get user leads: {e}")
            return []
    
    def get_chatbot_leads(self, user_id: str, chatbot_id: str, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get leads for a specific chatbot"""
        try:
            query = (self.db.collection(self.COLLECTIONS['LEADS'])
                    .where('user_id', '==', user_id)
                    .where('chatbot_id', '==', chatbot_id)
                    .order_by('created_at', direction=firestore.Query.DESCENDING))
            
            docs = query.stream()
            leads = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                leads.append(data)
            
            return leads[offset:offset + limit]
            
        except Exception as e:
            logger.error(f"Failed to get chatbot leads: {e}")
            return []
    
    def update_lead_status(self, user_id: str, lead_id: str, status: str) -> bool:
        """Update lead status"""
        try:
            doc_ref = self.db.collection(self.COLLECTIONS['LEADS']).document(lead_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return False
            
            data = doc.to_dict()
            if data.get('user_id') != user_id:
                logger.warning(f"User {user_id} tried to update lead {lead_id} owned by {data.get('user_id')}")
                return False
            
            doc_ref.update({
                'status': status,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            
            logger.info(f"Updated lead {lead_id} status to {status}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update lead status: {e}")
            return False