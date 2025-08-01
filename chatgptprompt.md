# Firebase Storage Bucket Initialization Problem - Debug Request

## Problem Description
I'm getting a persistent error when trying to use Firebase Storage in my Python FastAPI backend deployed on Railway:

```
ERROR:utils.firebase_storage:❌ Failed to initialize Firebase Storage: Storage bucket name not specified. Specify the bucket name via the "storageBucket" option when initializing the App, or specify the bucket name explicitly when calling the storage.bucket() function.
```

## Architecture Overview
- **Frontend**: React app deployed on Firebase Hosting
- **Backend**: Python FastAPI app deployed on Railway
- **Database**: Firebase Firestore
- **Storage**: Should be Firebase Storage (this is what's failing)
- **Authentication**: Firebase Auth

## Current File Structure and Code

### 1. Firebase Admin SDK Initialization (`utils/firestore_storage.py`)
```python
import os
import logging
import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger(__name__)

class FirestoreStorage:
    def __init__(self):
        # Initialize Firebase Admin SDK if not already initialized
        if not firebase_admin._apps:
            try:
                # Create service account config from environment variables
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
                    'projectId': firebase_config["project_id"],
                    'storageBucket': 'helferlain-a4178.firebasestorage.app'
                })
                logger.info(f"Firebase Admin SDK initialized for project: {firebase_config['project_id']}")
                
            except Exception as e:
                logger.error(f"Failed to initialize Firebase: {e}")
                # Initialize with minimal config for Railway
                try:
                    firebase_admin.initialize_app(credentials.ApplicationDefault(), {
                        'projectId': os.getenv("FIREBASE_PROJECT_ID", "helferlain-a4178"),
                        'storageBucket': 'helferlain-a4178.firebasestorage.app'
                    })
                    logger.warning("Initialized Firebase with minimal configuration")
                except Exception as fallback_error:
                    logger.error(f"Firebase initialization completely failed: {fallback_error}")
                    raise Exception(f"Cannot initialize Firebase: {fallback_error}")
        
        self.db = firestore.client()
        logger.info("Firestore client initialized successfully")
```

### 2. Firebase Storage Manager (`utils/firebase_storage.py`)
```python
import os
import json
import pickle
import tempfile
from pathlib import Path
from typing import Optional, Dict, Any
import logging
from firebase_admin import storage

logger = logging.getLogger(__name__)

class FirebaseStorageManager:
    """
    Verwaltet RAG-Dateien in Firebase Storage
    Ersetzt lokale Dateispeicherung für persistente Cloud-Storage
    """
    
    def __init__(self, bucket_name: Optional[str] = None):
        """
        Initialisiert Firebase Storage Manager
        
        Args:
            bucket_name: Name des Firebase Storage Buckets (optional)
        """
        try:
            # Firebase Storage Bucket initialisieren
            bucket_name = bucket_name or "helferlain-a4178.firebasestorage.app"
            
            # Einfacher direkter Ansatz: Forciere die Bucket-Erstellung
            import firebase_admin
            from firebase_admin import get_app
            
            try:
                # Hole die aktuelle Firebase App
                app = get_app()
                logger.info(f"Using existing Firebase app: {app.project_id}")
                
                # Erstelle Storage-Referenz mit explizitem Bucket-Namen
                self.bucket = storage.bucket(name=bucket_name, app=app)
                logger.info(f"✅ Firebase Storage initialized with bucket: {bucket_name}")
                
            except Exception as app_error:
                logger.error(f"Failed to get Firebase app: {app_error}")
                # Als letzter Ausweg: Versuche direkt mit storage.bucket()
                try:
                    self.bucket = storage.bucket(name=bucket_name)
                    logger.info(f"✅ Firebase Storage initialized directly with bucket: {bucket_name}")
                except Exception as direct_error:
                    logger.error(f"Direct storage initialization failed: {direct_error}")
                    raise Exception(f"Cannot initialize Firebase Storage. App error: {app_error}, Direct error: {direct_error}")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Firebase Storage: {e}")
            raise

# Global Storage Manager Instance
firebase_storage = None

def get_firebase_storage() -> FirebaseStorageManager:
    """
    Singleton Pattern für Firebase Storage Manager
    
    Returns:
        FirebaseStorageManager Instance
    """
    global firebase_storage
    if firebase_storage is None:
        firebase_storage = FirebaseStorageManager()
    return firebase_storage
```

### 3. How it's used in the main app (`react_app.py`)
```python
from utils.cloud_multi_source_rag import CloudMultiSourceRAG
from utils.firestore_storage import FirestoreStorage

# Initialize global instances
firestore_storage = FirestoreStorage()  # This initializes Firebase Admin SDK

# In chat endpoint:
@app.post("/api/chat/{chatbot_id}", response_model=ChatResponse)
async def chat_with_bot(chatbot_id: str, message: ChatMessage):
    try:
        if chatbot_id not in active_chats:
            # Try to load chatbot with Cloud Storage support
            rag_system = CloudMultiSourceRAG(chatbot_id=chatbot_id, use_cloud_storage=True)
            # This eventually calls FirebaseStorageManager which fails
```

### 4. CloudMultiSourceRAG class (`utils/cloud_multi_source_rag.py`)
```python
from .firebase_storage import get_firebase_storage

class CloudMultiSourceRAG(MultiSourceRAG):
    def __init__(self, chatbot_id: str, use_cloud_storage: bool = True):
        super().__init__(chatbot_id)
        
        self.use_cloud_storage = use_cloud_storage
        self.firebase_storage = get_firebase_storage() if use_cloud_storage else None  # THIS LINE FAILS
```

## Railway Environment Variables
All Firebase environment variables are set correctly in Railway:
```
FIREBASE_PROJECT_ID=helferlain-a4178
FIREBASE_PRIVATE_KEY_ID=f23fefad78dc4f522242eeb33d6ad5dc99f5e9b4
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n[FULL KEY]\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@helferlain-a4178.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=101523401545339518444
OPENROUTER_API_KEY=[API_KEY]
OPENAI_EMBED_API_KEY=[API_KEY]
```

## Firebase Project Configuration
- **Project ID**: helferlain-a4178
- **Storage Bucket**: helferlain-a4178.firebasestorage.app (confirmed in Firebase Console)
- **Firebase Admin SDK Service Account**: Created and downloaded JSON key

## Error Flow
1. User sends chat message to Railway backend
2. `CloudMultiSourceRAG` is instantiated 
3. `get_firebase_storage()` is called
4. `FirebaseStorageManager.__init__()` runs
5. `storage.bucket(name="helferlain-a4178.firebasestorage.app", app=app)` fails with "Storage bucket name not specified"

## What I've Tried
1. ✅ Added `storageBucket` parameter to `firebase_admin.initialize_app()`
2. ✅ Used explicit bucket name in `storage.bucket(name=bucket_name)`
3. ✅ Tried getting Firebase app reference first with `get_app()`
4. ✅ Added fallback initialization strategies
5. ✅ Verified all environment variables are set correctly in Railway
6. ✅ Confirmed bucket exists in Firebase Console

## Questions for Debugging
1. **Is there a specific way to initialize Firebase Storage when the Admin SDK is initialized with custom credentials rather than default credentials?**

2. **Should I initialize Firebase Admin SDK differently for Storage to work properly?**

3. **Is there an alternative way to access Firebase Storage that doesn't rely on the Admin SDK's app configuration?**

4. **Could this be a Railway-specific issue with how Firebase Admin SDK resolves the storage bucket?**

5. **Is there a way to debug what the Firebase Admin SDK thinks the storage bucket configuration is?**

## Requirements.txt
```
firebase-admin>=6.4.0
```

## Expected Behavior
Firebase Storage should initialize successfully and allow uploading/downloading of RAG files (embeddings, metadata, config files) for persistent chatbot data storage.

## Current Behavior  
Firebase Storage initialization fails with "Storage bucket name not specified" despite explicit bucket name being provided.

Please help me identify what's wrong with my Firebase Storage initialization and how to fix it. I need a working solution that allows me to store and retrieve files from Firebase Storage on Railway.