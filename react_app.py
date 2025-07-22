# React-based Chatbot Platform Backend
# FastAPI Server für React Frontend

import os
import sys
import json
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Union
from datetime import datetime
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Import existing utilities
from utils.chatbot_factory import ChatbotFactory, ChatbotConfig
from utils.multi_source_rag import MultiSourceRAG
from utils.pdf_processor import document_processor

# Import Supabase authentication and storage
from utils.supabase_auth import get_current_user
from utils.supabase_storage import SupabaseStorage

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Pydantic Models ─────────────────────────────────────────────────────────

class CreateChatbotRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="", max_length=1000)
    website_url: Optional[str] = None
    manual_text: Optional[str] = None
    branding: Optional[Dict] = None
    company_info: Optional[Dict] = None
    features: Optional[Dict] = None
    contact_persons: Optional[List[Dict]] = None
    behavior_settings: Optional[Dict] = None
    deployment_config: Optional[Dict] = None

class UpdateChatbotRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    branding: Optional[Dict] = None
    company_info: Optional[Dict] = None
    features: Optional[Dict] = None

class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[Dict] = []
    conversation_id: str
    timestamp: datetime

class ProgressUpdate(BaseModel):
    message: str
    progress: float
    status: str = "processing"

# ─── Global Variables ────────────────────────────────────────────────────────

chatbot_factory = None
supabase_storage = None
active_chats: Dict[str, MultiSourceRAG] = {}
creation_progress: Dict[str, Dict] = {}

# ─── Lifecycle Management ────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    global chatbot_factory, supabase_storage
    
    # Startup
    logger.info("🚀 Starting Chatbot Platform API...")
    
    # Initialize systems
    chatbot_factory = ChatbotFactory()
    supabase_storage = SupabaseStorage()
    
    # Initialize active chats dictionary (will be loaded per-user as needed)
    logger.info("✅ Supabase storage initialized - chatbots will be loaded per-user")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Chatbot Platform API...")
    active_chats.clear()

# ─── FastAPI App Initialization ──────────────────────────────────────────────

app = FastAPI(
    title="Chatbot Platform API",
    description="Professional Chatbot Platform with React Frontend",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://helferlain-project-ezxwunxlf-philipp-staufenbergers-projects.vercel.app",
        "https://helferlain-project-72nvtv6ib-philipp-staufenbergers-projects.vercel.app",
        "https://helferlain-project.vercel.app",  # Main Vercel domain
        "*"  # Allow all origins for now (remove in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for React build
static_path = Path("react-frontend/build")
if static_path.exists():
    app.mount("/static", StaticFiles(directory=static_path / "static"), name="static")

# ─── Utility Functions ───────────────────────────────────────────────────────

async def progress_callback_factory(creation_id: str):
    """Factory for progress callbacks"""
    def callback(message: str, progress: float):
        creation_progress[creation_id] = {
            "message": message,
            "progress": progress,
            "timestamp": datetime.now().isoformat(),
            "status": "processing" if progress < 1.0 else "completed"
        }
        logger.info(f"Progress {creation_id}: {progress:.1%} - {message}")
    return callback

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    import re
    return re.sub(r'[^\w\-_\.]', '_', filename)

# ─── Health Check ────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_chatbots": len(active_chats),
        "version": "2.0.0"
    }

# ─── Chatbot Management Endpoints ────────────────────────────────────────────

@app.get("/api/chatbots")
async def get_all_chatbots(current_user: dict = Depends(get_current_user)):
    """Get all chatbots for current user"""
    try:
        user_id = current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found")
        
        # Get user-specific chatbots from Supabase
        user_chatbots = supabase_storage.get_user_chatbots(user_id)
        
        # Add runtime status
        for chatbot in user_chatbots:
            config = chatbot["config"]
            chatbot["runtime_status"] = {
                "loaded": config.id in active_chats,
                "chat_url": f"/api/chat/{config.id}",
                "frontend_url": f"/chatbot/{config.id}"
            }
        
        # Count active chats for this user
        user_active_count = sum(1 for bot in user_chatbots if bot["config"].id in active_chats)
        
        return {
            "chatbots": user_chatbots,
            "total": len(user_chatbots),
            "active": user_active_count
        }
    except Exception as e:
        logger.error(f"Failed to get chatbots: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chatbots/{chatbot_id}")
async def get_chatbot(chatbot_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific chatbot for current user"""
    try:
        user_id = current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found")
        
        # Verify user owns this chatbot
        if not supabase_storage.user_owns_chatbot(user_id, chatbot_id):
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get chatbot from Supabase
        chatbot = supabase_storage.get_chatbot_config(user_id, chatbot_id)
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Add runtime information
        chatbot["runtime_status"] = {
            "loaded": chatbot_id in active_chats,
            "chat_url": f"/api/chat/{chatbot_id}",
            "frontend_url": f"/chatbot/{chatbot_id}"
        }
        
        return chatbot
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get chatbot {chatbot_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chatbots")
async def create_chatbot(
    background_tasks: BackgroundTasks,
    request: str = Form(...),
    files: Optional[List[UploadFile]] = File(None),
    current_user: dict = Depends(get_current_user)
):
    """Create new chatbot for current user"""
    try:
        # Parse and validate request data
        try:
            request_data = json.loads(request)
            chatbot_request = CreateChatbotRequest(**request_data)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=422, detail=f"Invalid JSON: {str(e)}")
        except ValidationError as e:
            raise HTTPException(status_code=422, detail=f"Validation error: {str(e)}")
        
        creation_id = str(uuid.uuid4())
        
        # Initialize progress tracking
        creation_progress[creation_id] = {
            "message": "Initializing chatbot creation...",
            "progress": 0.0,
            "timestamp": datetime.now().isoformat(),
            "status": "processing"
        }
        
        # Save uploaded files immediately
        uploaded_file_paths = []
        if files:
            upload_dir = Path("temp_uploads") / creation_id
            upload_dir.mkdir(parents=True, exist_ok=True)
            
            for file in files:
                if file.filename:
                    safe_filename = sanitize_filename(file.filename)
                    file_path = upload_dir / safe_filename
                    
                    content = await file.read()
                    with open(file_path, "wb") as f:
                        f.write(content)
                    
                    uploaded_file_paths.append({
                        "name": file.filename,
                        "path": str(file_path),
                        "size": len(content)
                    })
        
        # Start background creation task with user_id
        user_id = current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found")
            
        background_tasks.add_task(
            create_chatbot_background,
            creation_id,
            user_id,
            chatbot_request,
            uploaded_file_paths
        )
        
        return {
            "creation_id": creation_id,
            "status": "processing",
            "message": "Chatbot creation started",
            "progress_url": f"/api/chatbots/creation/{creation_id}/progress"
        }
        
    except Exception as e:
        logger.error(f"Failed to start chatbot creation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def create_chatbot_background(
    creation_id: str,
    user_id: str,
    request: CreateChatbotRequest,
    uploaded_file_paths: List[Dict]
):
    """Background task for user-specific chatbot creation"""
    try:
        progress_callback = await progress_callback_factory(creation_id)
        
        # Process uploaded files - create mock file objects for chatbot_factory
        uploaded_documents = []
        if uploaded_file_paths:
            progress_callback("Processing uploaded files...", 0.1)
            
            # Create mock file objects that chatbot_factory can process
            class MockUploadedFile:
                def __init__(self, name, path, size):
                    self.name = name
                    self.file_path = Path(path)
                    self.size = size
                    self._content = None
                
                def read(self):
                    """Read file content (for pdf_processor compatibility)"""
                    if self._content is None:
                        self._content = self.file_path.read_bytes()
                    return self._content
                
                def getbuffer(self):
                    """Get buffer (for legacy compatibility)"""
                    return self.read()
            
            for file_data in uploaded_file_paths:
                mock_file = MockUploadedFile(
                    file_data["name"],
                    file_data["path"], 
                    file_data["size"]
                )
                uploaded_documents.append(mock_file)
        
        # Prepare extended configuration
        extended_config = {
            "company_info": request.company_info or {},
            "features": request.features or {},
            "contact_persons": request.contact_persons or [],
            "behavior_settings": request.behavior_settings or {},
            "deployment_config": request.deployment_config or {},
            "manual_text": request.manual_text or ""
        }
        
        # Create chatbot using existing factory
        progress_callback("Creating chatbot...", 0.2)
        
        chatbot_id = chatbot_factory.create_chatbot(
            name=request.name,
            description=request.description,
            website_url=request.website_url,
            uploaded_documents=uploaded_documents,
            branding=request.branding or {},
            extended_config=extended_config,
            progress_callback=progress_callback
        )
        
        # Store chatbot config in Supabase for user
        if chatbot_id:
            progress_callback("Saving to user account...", 0.8)
            
            # Get the created chatbot config
            chatbot_config = chatbot_factory.load_chatbot_config(chatbot_id)
            if chatbot_config:
                # Store in Supabase with user_id
                supabase_storage.create_chatbot_config(user_id, chatbot_config)
                logger.info(f"✅ Stored chatbot {chatbot_id} for user {user_id}")
            
            progress_callback("Initializing chat system...", 0.9)
            
            rag_system = MultiSourceRAG(chatbot_id=chatbot_id)
            if rag_system.index_file.exists() and rag_system.metadata_file.exists():
                active_chats[chatbot_id] = rag_system
                logger.info(f"✅ Activated chatbot: {request.name} ({chatbot_id})")
            
            # Update progress with completion
            creation_progress[creation_id] = {
                "message": "Chatbot created successfully!",
                "progress": 1.0,
                "timestamp": datetime.now().isoformat(),
                "status": "completed",
                "chatbot_id": chatbot_id,
                "chatbot_url": f"/chatbot/{chatbot_id}",
                "user_id": user_id
            }
        
        # Cleanup temp files
        upload_dir = Path("temp_uploads") / creation_id
        if upload_dir.exists():
            import shutil
            shutil.rmtree(upload_dir, ignore_errors=True)
            
    except Exception as e:
        logger.error(f"Chatbot creation failed: {e}")
        creation_progress[creation_id] = {
            "message": f"Creation failed: {str(e)}",
            "progress": 0.0,
            "timestamp": datetime.now().isoformat(),
            "status": "error",
            "error": str(e)
        }

@app.get("/api/chatbots/creation/{creation_id}/progress")
async def get_creation_progress(creation_id: str):
    """Get chatbot creation progress"""
    if creation_id not in creation_progress:
        raise HTTPException(status_code=404, detail="Creation ID not found")
    
    return creation_progress[creation_id]

@app.put("/api/chatbots/{chatbot_id}")
async def update_chatbot(chatbot_id: str, request: UpdateChatbotRequest):
    """Update existing chatbot"""
    try:
        chatbot = chatbot_factory.get_chatbot(chatbot_id)
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Update chatbot configuration
        success = chatbot_factory.update_chatbot(chatbot_id, request.dict(exclude_unset=True))
        
        if success:
            return {"message": "Chatbot updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update chatbot")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update chatbot {chatbot_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/chatbots/{chatbot_id}")
async def delete_chatbot(chatbot_id: str):
    """Delete chatbot"""
    try:
        # Remove from active chats
        if chatbot_id in active_chats:
            del active_chats[chatbot_id]
        
        # Delete from storage
        success = chatbot_factory.delete_chatbot(chatbot_id)
        
        if success:
            return {"message": "Chatbot deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete chatbot")
            
    except Exception as e:
        logger.error(f"Failed to delete chatbot {chatbot_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── Chat Endpoints ──────────────────────────────────────────────────────────

@app.post("/api/chat/{chatbot_id}", response_model=ChatResponse)
async def chat_with_bot(chatbot_id: str, message: ChatMessage):
    """Send message to chatbot"""
    try:
        if chatbot_id not in active_chats:
            # Try to load chatbot
            rag_system = MultiSourceRAG(chatbot_id=chatbot_id)
            if not (rag_system.index_file.exists() and rag_system.metadata_file.exists()):
                raise HTTPException(status_code=404, detail="Chatbot not found or not initialized")
            active_chats[chatbot_id] = rag_system
        
        rag_system = active_chats[chatbot_id]
        
        # Generate response
        response_data = rag_system.get_response(
            query=message.message,
            conversation_id=message.conversation_id
        )
        
        return ChatResponse(
            response=response_data["response"],
            sources=response_data.get("sources", []),
            conversation_id=response_data.get("conversation_id", str(uuid.uuid4())),
            timestamp=datetime.now()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error for {chatbot_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/{chatbot_id}/config")
async def get_chat_config(chatbot_id: str):
    """Get chatbot configuration for frontend"""
    try:
        # Lade die Config direkt
        config = chatbot_factory.load_chatbot_config(chatbot_id)
        if not config:
            raise HTTPException(status_code=404, detail="Chatbot config not found")
        
        # Prüfe ob RAG-System verfügbar ist
        rag_system = chatbot_factory.get_chatbot(chatbot_id)
        is_active = rag_system is not None
        
        # Return frontend-friendly configuration
        return {
            "id": config.id,
            "name": config.name,
            "description": config.description,
            "branding": config.branding,
            "welcome_message": config.branding.get("welcome_message", f"Hallo! Ich bin {config.name}."),
            "features": {
                "email_capture": config.branding.get("email_capture_enabled", False) if config.branding else False,
                "contact_persons": config.branding.get("contact_persons_enabled", False) if config.branding else False
            },
            "company_info": config.branding.get("company_info", {}) if config.branding else {},
            "contact_persons": config.branding.get("contact_persons", []) if config.branding else [],
            "is_active": is_active
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get chat config for {chatbot_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── File Upload Endpoints ───────────────────────────────────────────────────

@app.post("/api/upload/documents")
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload documents for processing"""
    try:
        uploaded_files = []
        
        for file in files:
            if file.filename:
                # Validate file type
                allowed_extensions = {'.pdf', '.docx', '.txt', '.md'}
                file_ext = Path(file.filename).suffix.lower()
                
                if file_ext not in allowed_extensions:
                    continue
                
                content = await file.read()
                
                uploaded_files.append({
                    "name": file.filename,
                    "size": len(content),
                    "type": file_ext,
                    "content": content.hex()  # Store as hex for JSON serialization
                })
        
        return {
            "uploaded_files": uploaded_files,
            "count": len(uploaded_files)
        }
        
    except Exception as e:
        logger.error(f"File upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── Analytics Endpoints ─────────────────────────────────────────────────────

@app.get("/api/analytics/overview")
async def get_analytics_overview():
    """Get platform analytics overview - temporarily public"""
    try:
        all_chatbots = chatbot_factory.get_all_chatbots()
        
        analytics = {
            "total_chatbots": len(all_chatbots),
            "active_chatbots": len(active_chats),
            "total_conversations": 0,  # TODO: Implement conversation tracking
            "total_documents": sum(
                chatbot.get("rag_info", {}).get("total_chunks", 0) 
                for chatbot in all_chatbots
            ),
            "recent_activity": []  # TODO: Implement activity tracking
        }
        
        return analytics
        
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── Frontend Routes ─────────────────────────────────────────────────────────

@app.get("/")
async def serve_react_app():
    """Serve React app or API welcome page"""
    index_path = static_path / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    else:
        # Return HTML welcome page for API-only deployment
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>VuBot Chatbot Platform API</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                .header { text-align: center; margin-bottom: 40px; }
                .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .method { color: #007acc; font-weight: bold; }
                a { color: #007acc; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🤖 VuBot Chatbot Platform API</h1>
                <p>FastAPI Backend - Successfully deployed on Railway!</p>
            </div>
            
            <h2>📋 Available Endpoints:</h2>
            
            <div class="endpoint">
                <span class="method">GET</span> <a href="/docs">/docs</a> - Interactive API Documentation (Swagger)
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> <a href="/api/health">/api/health</a> - Health Check
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> <a href="/api/chatbots">/api/chatbots</a> - List All Chatbots
            </div>
            
            <div class="endpoint">
                <span class="method">POST</span> /api/chatbots - Create New Chatbot
            </div>
            
            <div class="endpoint">
                <span class="method">POST</span> /api/chat/{chatbot_id} - Chat with Chatbot
            </div>
            
            <h2>🚀 Next Steps:</h2>
            <ul>
                <li>Visit <a href="/docs">/docs</a> for full API documentation</li>
                <li>Use the API endpoints to create and manage chatbots</li>
                <li>Deploy React frontend separately (e.g., Vercel, Netlify) for full UI</li>
            </ul>
            
            <p style="text-align: center; margin-top: 40px; color: #666;">
                Backend deployed successfully on Railway 🎉
            </p>
        </body>
        </html>
        """
        from fastapi.responses import HTMLResponse
        return HTMLResponse(content=html_content)

@app.get("/chatbot/{chatbot_id}")
async def serve_chatbot_page(chatbot_id: str):
    """Serve chatbot page"""
    # For React app, all routes should serve index.html
    index_path = static_path / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    else:
        return {"message": f"Chatbot {chatbot_id} - React frontend not built"}

# ─── Development Server ──────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting React-based Chatbot Platform...")
    print("📋 API Documentation: http://localhost:8000/docs")
    print("🌐 React Frontend: http://localhost:3000 (if running)")
    print("🔗 Fallback UI: http://localhost:8000")
    
    uvicorn.run(
        "react_app:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000)),
        reload=True,
        log_level="info"
    )