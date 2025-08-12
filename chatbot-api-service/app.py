# Separater Chatbot API Service
# Persistente, entkoppelte Chatbot-Engine für öffentliche Links und Website-Integration

import os
import sys
import json
import uuid
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Importiere bestehende Utils (von Haupt-App)
sys.path.append(str(Path(__file__).parent.parent))
from utils.firebase_storage import FirebaseStorageManager, get_firebase_storage
from utils.firestore_storage import FirestoreStorage
from utils.cloud_multi_source_rag import CloudMultiSourceRAG
from utils.chatbot_factory import ChatbotConfig

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ─── Pydantic Models ─────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[Dict] = []
    conversation_id: str
    timestamp: datetime
    metadata: Optional[Dict] = {}

class BotStatus(BaseModel):
    bot_id: str
    status: str  # "active", "inactive", "loading", "error"
    name: str
    description: str
    last_active: Optional[datetime] = None
    
class BotConfig(BaseModel):
    id: str
    name: str
    description: str
    branding: Dict = {}
    features: Dict = {}
    status: str = "active"

class AnalyticsEvent(BaseModel):
    bot_id: str
    event_type: str  # "chat_started", "message_sent", "chat_ended"
    session_id: str
    metadata: Optional[Dict] = {}

# ─── Global Services ─────────────────────────────────────────────────────────

class PersistentBotService:
    """Service für persistente, entkoppelte Chatbots"""
    
    def __init__(self):
        self.active_bots: Dict[str, Dict] = {}
        self.firestore_storage = None
        self.firebase_storage = None
        self.load_attempts: Dict[str, int] = {}
        
    async def initialize(self):
        """Initialisiere Firebase Services"""
        try:
            self.firestore_storage = FirestoreStorage()
            self.firebase_storage = get_firebase_storage()
            logger.info("✅ PersistentBotService initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize PersistentBotService: {e}")
            raise
    
    async def get_bot(self, bot_id: str) -> Optional[Dict]:
        """
        Lädt einen Bot persistent aus Firebase
        
        Returns:
            Bot-Dictionary mit 'config', 'rag_system', 'status', 'loaded_at'
            oder None wenn Bot nicht gefunden
        """
        try:
            # 1. Prüfe In-Memory Cache
            if bot_id in self.active_bots:
                bot = self.active_bots[bot_id]
                if bot['status'] == 'active':
                    logger.debug(f"✅ Bot {bot_id} from cache")
                    return bot
            
            # 2. Lade aus Firebase (max 3 Versuche)
            if self.load_attempts.get(bot_id, 0) >= 3:
                logger.warning(f"⚠️ Bot {bot_id} max load attempts reached")
                return None
                
            logger.info(f"🔄 Loading bot {bot_id} from Firebase...")
            bot = await self.load_from_firebase(bot_id)
            
            if bot:
                self.active_bots[bot_id] = bot
                self.load_attempts[bot_id] = 0
                logger.info(f"✅ Bot {bot_id} loaded successfully")
                return bot
            else:
                self.load_attempts[bot_id] = self.load_attempts.get(bot_id, 0) + 1
                logger.warning(f"❌ Bot {bot_id} not found (attempt {self.load_attempts[bot_id]})")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error loading bot {bot_id}: {e}")
            self.load_attempts[bot_id] = self.load_attempts.get(bot_id, 0) + 1
            return None
    
    async def load_from_firebase(self, bot_id: str) -> Optional[Dict]:
        """Lädt Bot-Config und RAG-System aus Firebase"""
        try:
            # 1. Lade Bot-Config aus Firestore (globale Suche - beide Collections)
            config_doc = None
            
            # Erste Suche: chatbot_registry (neue Frontend-Collection)
            registry_configs = self.firestore_storage.db.collection('chatbot_registry').where('railwayBotId', '==', bot_id).stream()
            for doc in registry_configs:
                config_doc = doc
                logger.info(f"🔍 Found bot {bot_id} in chatbot_registry by 'railwayBotId'")
                break
                
            # Zweite Suche: chatbot_registry mit config.id (alte Struktur in registry)
            if not config_doc:
                registry_configs_old = self.firestore_storage.db.collection('chatbot_registry').where('config.id', '==', bot_id).stream()
                for doc in registry_configs_old:
                    config_doc = doc
                    logger.info(f"🔍 Found bot {bot_id} in chatbot_registry by 'config.id'")
                    break
                    
            # Dritte Suche: chatbot_configs (alte Backend-Collection als Fallback)
            if not config_doc:
                old_configs = self.firestore_storage.db.collection(
                    self.firestore_storage.COLLECTIONS['CHATBOT_CONFIGS']
                ).where('id', '==', bot_id).stream()
                for doc in old_configs:
                    config_doc = doc
                    logger.info(f"🔍 Found bot {bot_id} in chatbot_configs by 'id' (legacy)")
                    break
                
            if not config_doc:
                logger.warning(f"⚠️ No config found for bot {bot_id} (searched chatbot_registry and chatbot_configs)")
                return None
                
            config_data = config_doc.to_dict()
            logger.info(f"🔍 Raw config data structure: {list(config_data.keys())}")
            
            # Status prüfen
            if config_data.get('status') != 'active':
                logger.warning(f"⚠️ Bot {bot_id} is not active (status: {config_data.get('status')})")
                return None
            
            # 2. Erstelle ChatbotConfig Objekt - handle both structures
            # chatbot_registry has nested config, chatbot_configs is flat
            if 'config' in config_data:
                # New chatbot_registry structure
                nested_config = config_data['config']
                chatbot_config = ChatbotConfig(
                    id=nested_config.get('id', bot_id),
                    name=nested_config.get('name', 'Unknown Bot'),
                    description=nested_config.get('description', ''),
                    branding=config_data.get('branding', {}),
                    website_url=nested_config.get('website_url'),
                    extended_config=config_data.get('extended_config', {})
                )
            else:
                # Old chatbot_configs structure (flat)
                chatbot_config = ChatbotConfig(
                    id=config_data.get('id', bot_id),
                    name=config_data.get('name', 'Unknown Bot'),
                    description=config_data.get('description', ''),
                    branding=config_data.get('branding', {}),
                    website_url=config_data.get('website_url'),
                    extended_config=config_data.get('extended_config', {})
                )
            
            # 3. Lade RAG-System aus Firebase Storage
            logger.info(f"🔄 Loading RAG system for {bot_id}...")
            rag_system = CloudMultiSourceRAG(bot_id, use_cloud_storage=True)
            
            try:
                # Versuche RAG-System zu laden
                success = rag_system.load_rag_system()
                if not success:
                    logger.warning(f"⚠️ RAG system not found for {bot_id}, creating minimal system...")
                    # Erstelle minimales RAG-System falls Dateien fehlen
                    rag_system.process_multiple_sources(
                        manual_text=f"Ich bin {chatbot_config.name}. {chatbot_config.description}",
                        progress_callback=lambda msg, progress: logger.debug(f"RAG Creation: {msg}")
                    )
                    
            except Exception as rag_error:
                logger.warning(f"⚠️ RAG loading failed for {bot_id}: {rag_error}")
                # Fallback: Erstelle einfaches Text-basiertes RAG-System
                rag_system.process_multiple_sources(
                    manual_text=f"Ich bin {chatbot_config.name}. {chatbot_config.description}",
                    progress_callback=lambda msg, progress: logger.debug(f"RAG Fallback: {msg}")
                )
            
            return {
                'config': chatbot_config,
                'rag_system': rag_system,
                'status': 'active',
                'loaded_at': datetime.now(),
                'owner_user_id': config_data.get('user_id')
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to load bot {bot_id} from Firebase: {e}")
            return None
    
    async def get_bot_public_info(self, bot_id: str) -> Optional[Dict]:
        """Öffentliche Bot-Informationen (ohne sensitive Daten)"""
        bot = await self.get_bot(bot_id)
        if not bot:
            return None
            
        config = bot['config']
        branding = config.branding if hasattr(config, 'branding') else {}
        return {
            'id': config.id,
            'name': config.name,
            'description': config.description,
            'branding': {
                'primary_color': branding.get('primary_color', '#1e3a8a'),
                'secondary_color': branding.get('secondary_color', '#34495e'),
                'logo_url': branding.get('logo_url'),
                'welcome_message': branding.get('welcome_message', f"Hallo! Ich bin {config.name}")
            },
            'features': {
                'email_capture': branding.get('email_capture_enabled', False),
                'contact_persons': branding.get('contact_persons_enabled', False)
            },
            'status': bot['status'],
            'last_active': bot['loaded_at']
        }
    
    def remove_bot(self, bot_id: str):
        """Entfernt Bot aus Cache (für Memory Management)"""
        if bot_id in self.active_bots:
            del self.active_bots[bot_id]
            logger.info(f"🗑️ Bot {bot_id} removed from cache")

# Global Service Instance
bot_service = PersistentBotService()

# ─── Lifecycle Management ────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("🚀 Starting Persistent Chatbot API Service...")
    
    try:
        await bot_service.initialize()
        logger.info("✅ All services initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Persistent Chatbot API Service...")
    bot_service.active_bots.clear()

# ─── FastAPI App Initialization ──────────────────────────────────────────────

app = FastAPI(
    title="Persistent Chatbot API Service",
    description="Entkoppelte, persistente Chatbot-Engine für öffentliche Links und Website-Integration",
    version="1.0.0",
    lifespan=lifespan
)

# CORS für öffentliche API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Öffentliche API - alle Origins erlaubt
    allow_credentials=False,  # Keine Credentials für öffentliche API
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ─── Public API Endpoints ────────────────────────────────────────────────────

@app.get("/")
async def root():
    """API Welcome Page"""
    return {
        "service": "Persistent Chatbot API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "public_bot_info": "/api/v1/public/bot/{bot_id}",
            "public_chat": "/api/v1/public/bot/{bot_id}/chat",
            "public_status": "/api/v1/public/bot/{bot_id}/status"
        },
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_bots": len(bot_service.active_bots),
        "service": "persistent-chatbot-api",
        "version": "1.0.0"
    }

# ─── Public Bot Endpoints ────────────────────────────────────────────────────

@app.get("/api/v1/public/bot/{bot_id}")
async def get_public_bot_info(bot_id: str):
    """
    Öffentliche Bot-Informationen abrufen
    Für Widget-Initialisierung und Chat-Interface
    """
    try:
        bot_info = await bot_service.get_bot_public_info(bot_id)
        if not bot_info:
            raise HTTPException(status_code=404, detail="Bot not found or inactive")
            
        return bot_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting bot info {bot_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/public/bot/{bot_id}/status")
async def get_bot_status(bot_id: str):
    """Bot-Status prüfen (lightweight endpoint)"""
    try:
        # Prüfe nur Cache, kein aufwändiges Laden
        if bot_id in bot_service.active_bots:
            bot = bot_service.active_bots[bot_id]
            return {
                "bot_id": bot_id,
                "status": bot['status'],
                "available": True,
                "last_check": datetime.now()
            }
        
        # Schnelle Firebase-Config-Prüfung
        all_configs = bot_service.firestore_storage.db.collection(
            bot_service.firestore_storage.COLLECTIONS['CHATBOT_CONFIGS']
        ).where('id', '==', bot_id).limit(1).stream()
        
        config_exists = False
        for doc in all_configs:
            config_data = doc.to_dict()
            config_exists = config_data.get('status') == 'active'
            break
            
        return {
            "bot_id": bot_id,
            "status": "available" if config_exists else "not_found",
            "available": config_exists,
            "last_check": datetime.now()
        }
        
    except Exception as e:
        logger.error(f"Error checking bot status {bot_id}: {e}")
        return {
            "bot_id": bot_id,
            "status": "error",
            "available": False,
            "last_check": datetime.now(),
            "error": str(e)
        }

@app.post("/api/v1/public/bot/{bot_id}/chat", response_model=ChatResponse)
async def chat_with_public_bot(bot_id: str, message: ChatMessage, request: Request):
    """
    Öffentlicher Chat-Endpoint
    Keine Authentication erforderlich - für Website-Widgets und öffentliche Links
    """
    try:
        logger.info(f"🔍 Public chat request for bot: {bot_id}")
        
        # Bot laden (mit automatischem Firebase-Loading)
        bot = await bot_service.get_bot(bot_id)
        if not bot:
            raise HTTPException(status_code=404, detail="Bot not found or inactive")
        
        rag_system = bot['rag_system']
        config = bot['config']
        owner_user_id = bot['owner_user_id']
        
        # Conversation ID generieren falls nicht vorhanden
        conversation_id = message.conversation_id or str(uuid.uuid4())
        
        # Client-IP für Analytics
        client_ip = request.headers.get("x-forwarded-for", request.client.host)
        
        # Chat-Response generieren
        response_data = rag_system.get_response(
            query=message.message,
            conversation_id=conversation_id
        )
        
        # Message in Firestore speichern (für Bot-Owner Analytics)
        if owner_user_id and bot_service.firestore_storage:
            try:
                # User message
                bot_service.firestore_storage.save_conversation_message(
                    user_id=owner_user_id,
                    chatbot_id=bot_id,
                    conversation_id=conversation_id,
                    role="user",
                    content=message.message,
                    metadata={
                        "timestamp": datetime.now().isoformat(),
                        "client_ip": client_ip,
                        "source": "public_api"
                    }
                )
                
                # Bot response
                bot_service.firestore_storage.save_conversation_message(
                    user_id=owner_user_id,
                    chatbot_id=bot_id,
                    conversation_id=conversation_id,
                    role="assistant",
                    content=response_data["response"],
                    metadata={
                        "timestamp": datetime.now().isoformat(),
                        "sources": response_data.get("sources", []),
                        "source": "public_api"
                    }
                )
                
            except Exception as storage_error:
                logger.warning(f"⚠️ Failed to save conversation for analytics: {storage_error}")
                # Nicht kritisch - Chat funktioniert trotzdem
        
        # Modal-Trigger-Logik (vereinfacht für öffentliche API)
        branding = config.branding or {}
        features = branding.get('features', {})
        
        metadata = {}
        
        # Email Capture (einfach basierend auf Keywords)
        if features.get('email_capture_enabled', False):
            email_keywords = ['email', 'kontakt', 'angebot', 'beratung', 'preise']
            if any(keyword in message.message.lower() for keyword in email_keywords):
                metadata['show_email_modal'] = True
                metadata['email_prompt'] = features.get('email_capture_config', {}).get('prompt', 
                    'Für detaillierte Informationen können Sie gerne Ihre Email-Adresse hinterlassen.')
        
        # Contact Persons
        if features.get('contact_persons_enabled', False):
            contact_keywords = ['ansprechpartner', 'kontakt', 'beratung', 'hilfe', 'support']
            if any(keyword in message.message.lower() for keyword in contact_keywords):
                metadata['show_contact_modal'] = True
                metadata['contact_persons'] = branding.get('contact_persons', [])
        
        return ChatResponse(
            response=response_data["response"],
            sources=response_data.get("sources", []),
            conversation_id=conversation_id,
            timestamp=datetime.now(),
            metadata=metadata
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error for bot {bot_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.post("/api/v1/public/bot/{bot_id}/analytics")
async def track_analytics_event(bot_id: str, event: AnalyticsEvent):
    """
    Analytics-Event tracking für öffentliche Chats
    Für Statistiken im Management Portal
    """
    try:
        # Event-Daten erweitern
        event_data = {
            "bot_id": bot_id,
            "event_type": event.event_type,
            "session_id": event.session_id,
            "timestamp": datetime.now(),
            "metadata": event.metadata or {}
        }
        
        # In Firestore speichern (für Analytics)
        # TODO: Implementiere Analytics-Collection in FirestoreStorage
        logger.info(f"📊 Analytics event: {event.event_type} for bot {bot_id}")
        
        return {"status": "success", "message": "Event tracked"}
        
    except Exception as e:
        logger.error(f"Analytics tracking error: {e}")
        # Nicht kritisch - sollte Chat nicht unterbrechen
        return {"status": "error", "message": str(e)}

# ─── Chat Interface Endpoints ─────────────────────────────────────────────────

@app.get("/chat/{bot_id}", response_class=HTMLResponse)
async def serve_public_chat_interface(bot_id: str, request: Request):
    """
    Öffentliche Chat-Interface
    https://api.helferlain.app/chat/{bot_id}
    """
    try:
        # Bot-Info laden für Template
        bot_info = await bot_service.get_bot_public_info(bot_id)
        if not bot_info:
            return HTMLResponse(
                content=f"<h1>Bot nicht gefunden</h1><p>Der Chatbot mit ID '{bot_id}' ist nicht verfügbar.</p>",
                status_code=404
            )
        
        # Theme aus Query-Parameter
        theme = request.query_params.get("theme", "light")
        
        # Einfache HTML-Template (später auslagern)
        html_content = f"""
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{bot_info['name']} - Chat</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: #f5f5f5;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }}
        .chat-container {{
            width: 100%;
            max-width: 800px;
            height: 600px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }}
        .chat-header {{
            background: {bot_info['branding']['primary_color']};
            color: white;
            padding: 20px;
            text-align: center;
        }}
        .chat-header h1 {{
            font-size: 24px;
            margin-bottom: 8px;
        }}
        .chat-messages {{
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }}
        .message {{
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 18px;
            word-wrap: break-word;
        }}
        .message.user {{
            background: {bot_info['branding']['primary_color']};
            color: white;
            align-self: flex-end;
            margin-left: auto;
        }}
        .message.assistant {{
            background: #f1f1f1;
            color: #333;
            align-self: flex-start;
        }}
        .chat-input {{
            border-top: 1px solid #eee;
            padding: 20px;
            display: flex;
            gap: 12px;
        }}
        .chat-input input {{
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #ddd;
            border-radius: 24px;
            outline: none;
            font-size: 16px;
        }}
        .chat-input button {{
            padding: 12px 24px;
            background: {bot_info['branding']['primary_color']};
            color: white;
            border: none;
            border-radius: 24px;
            cursor: pointer;
            font-size: 16px;
            transition: opacity 0.2s;
        }}
        .chat-input button:hover {{
            opacity: 0.9;
        }}
        .chat-input button:disabled {{
            opacity: 0.5;
            cursor: not-allowed;
        }}
        .typing {{
            padding: 12px 16px;
            background: #f1f1f1;
            border-radius: 18px;
            align-self: flex-start;
            font-style: italic;
            color: #666;
        }}
        .powered-by {{
            text-align: center;
            font-size: 12px;
            color: #888;
            margin-top: 10px;
        }}
        .powered-by a {{
            color: {bot_info['branding']['primary_color']};
            text-decoration: none;
        }}
        @media (max-width: 768px) {{
            .chat-container {{
                height: 100vh;
                border-radius: 0;
                max-width: 100%;
            }}
        }}
    </style>
</head>
<body>
    <div class="chat-container">
        <header class="chat-header">
            <h1>{bot_info['name']}</h1>
            <p>{bot_info['description']}</p>
        </header>
        
        <div class="chat-messages" id="messages">
            <div class="message assistant">
                {bot_info['branding']['welcome_message']}
            </div>
        </div>
        
        <div class="chat-input">
            <input 
                type="text" 
                id="messageInput" 
                placeholder="Nachricht eingeben..."
                maxlength="500"
            >
            <button onclick="sendMessage()">Senden</button>
        </div>
        
        <div class="powered-by">
            Powered by <a href="https://helferlain.app" target="_blank">HelferLain</a>
        </div>
    </div>
    
    <script>
        const API_BASE = window.location.origin + '/api/v1/public';
        const BOT_ID = '{bot_id}';
        let conversationId = null;
        
        const messagesContainer = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        
        // Enter-Taste Handler
        messageInput.addEventListener('keypress', function(e) {{
            if (e.key === 'Enter' && !e.shiftKey) {{
                e.preventDefault();
                sendMessage();
            }}
        }});
        
        function addMessage(content, isUser = false) {{
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${{isUser ? 'user' : 'assistant'}}`;
            messageDiv.textContent = content;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }}
        
        function showTyping() {{
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing';
            typingDiv.id = 'typing-indicator';
            typingDiv.textContent = 'Bot tippt...';
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }}
        
        function hideTyping() {{
            const typing = document.getElementById('typing-indicator');
            if (typing) typing.remove();
        }}
        
        async function sendMessage() {{
            const message = messageInput.value.trim();
            if (!message) return;
            
            // UI Updates
            addMessage(message, true);
            messageInput.value = '';
            messageInput.disabled = true;
            showTyping();
            
            try {{
                const response = await fetch(`${{API_BASE}}/bot/${{BOT_ID}}/chat`, {{
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/json',
                    }},
                    body: JSON.stringify({{
                        message: message,
                        conversation_id: conversationId
                    }})
                }});
                
                if (!response.ok) {{
                    throw new Error('Chat request failed');
                }}
                
                const data = await response.json();
                
                // Update conversation ID
                conversationId = data.conversation_id;
                
                // Add bot response
                addMessage(data.response);
                
                // Handle modals (vereinfacht)
                if (data.metadata?.show_email_modal) {{
                    setTimeout(() => {{
                        const email = prompt(data.metadata.email_prompt || 'Email-Adresse eingeben:');
                        if (email) {{
                            addMessage(`Email-Adresse erhalten: ${{email}}`, false);
                        }}
                    }}, 1000);
                }}
                
            }} catch (error) {{
                console.error('Chat error:', error);
                addMessage('Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.', false);
            }} finally {{
                hideTyping();
                messageInput.disabled = false;
                messageInput.focus();
            }}
        }}
        
        // Initial focus
        messageInput.focus();
    </script>
</body>
</html>
"""
        
        return HTMLResponse(content=html_content)
        
    except Exception as e:
        logger.error(f"Error serving chat interface for {bot_id}: {e}")
        return HTMLResponse(
            content=f"<h1>Fehler</h1><p>Chat-Interface konnte nicht geladen werden: {str(e)}</p>",
            status_code=500
        )

# ─── Development Server ──────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Persistent Chatbot API Service...")
    print("📋 API Documentation: http://localhost:8001/docs")
    print("💬 Public Chat Interface: http://localhost:8001/chat/{bot_id}")
    print("🔗 Public API Base: http://localhost:8001/api/v1/public")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8001)),
        reload=True,
        log_level="info"
    )