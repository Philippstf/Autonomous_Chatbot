# VuBot Chatbot Architecture Documentation

## Overview
VuBot unterstützt zwei verschiedene Chat-Modi: **Private Chats** (authentifizierte Benutzer) und **Public Chats** (öffentliche Links). Beide verwenden unterschiedliche Architekturen und Datenflüsse.

## 1. Private Chat Architecture

### 1.1 Frontend Flow (Private Chat)
**URL Pattern:** `https://helferlain-a4178.web.app/chatbot/{chatbot_id}`

**Frontend Components:**
- **Page:** `react-frontend/src/pages/ChatbotPage.js`
- **API Service:** `react-frontend/src/services/api.js`
- **Method:** `sendChatMessage(chatbotId, message, conversationId)`

**Request Flow:**
```
ChatbotPage.js:136 → sendChatMessage() → POST /api/chat/{chatbot_id}
```

### 1.2 Backend Flow (Private Chat)
**Backend Endpoint:** `POST /api/chat/{chatbot_id}` (FastAPI in `react_app.py:491`)

**Processing Steps:**
1. **Authentication:** User must be authenticated
2. **Bot Loading:** `CloudMultiSourceRAG(chatbot_id, use_cloud_storage=True)`
3. **RAG System Init:** 
   - Try local load: `rag_system.load_rag_system()`
   - Firebase download if needed
   - On-demand initialization if missing
4. **Config Loading:** Creates `ChatbotConfig` from Firestore
5. **Chat Processing:** NEW - Uses `build_system_prompt_for_chatbot()`
6. **Response Generation:** OpenRouter API with professional system prompt
7. **Modal Triggers:** Email capture & contact person logic
8. **Conversation Saving:** Stores messages in Firestore

**Data Sources:**
- **RAG Files:** Firebase Storage `chatbots/{chatbot_id}/`
- **Config:** Firestore `CHATBOT_CONFIGS` collection
- **Conversations:** Firestore conversation history

## 2. Public Chat Architecture

### 2.1 Frontend Flow (Public Chat)
**URL Pattern:** `https://helferlain-a4178.web.app/public/{public_id}`

**Frontend Components:**
- **Page:** `react-frontend/src/pages/PublicChatbotPage.js`
- **API Service:** `react-frontend/src/services/api.js`
- **Method:** `sendPublicChatMessage(publicId, message, conversationId)`

**Request Flow:**
```
PublicChatbotPage.js:89 → sendPublicChatMessage() → POST /api/v1/public/bot/{public_id}/chat
```

### 2.2 Backend Flow (Public Chat)
**Backend Endpoint:** `POST /api/v1/public/bot/{public_id}/chat` (FastAPI in `react_app.py:1229`)

**Processing Steps:**
1. **No Authentication:** Public access
2. **ID Resolution:** 
   - Query `CHATBOT_REGISTRY` where `publicId == public_id`
   - Extract `railwayBotId` from registry data
   - **Critical Fix:** Uses `registry_data.get('railwayBotId')` not `registry_doc.id`
3. **Bot Loading:** `CloudMultiSourceRAG(chatbot_id=bot_id, use_cloud_storage=True)`
4. **RAG System Init:** Same as private chat
5. **Config Loading:** Creates `ChatbotConfig` from Firestore
6. **Chat Processing:** NEW - Uses `build_system_prompt_for_chatbot()`
7. **Response Generation:** OpenRouter API with professional system prompt
8. **No Modal Triggers:** No email capture or contact logic for public
9. **No Conversation Saving:** Stateless public chats

**Data Sources:**
- **ID Mapping:** Firestore `CHATBOT_REGISTRY` collection
- **RAG Files:** Firebase Storage `chatbots/{actual_bot_id}/`
- **Config:** Firestore `CHATBOT_CONFIGS` collection

## 3. Key Architectural Differences

### 3.1 ID Resolution
| Aspect | Private Chat | Public Chat |
|--------|-------------|-------------|
| **Input ID** | Direct `chatbot_id` | `public_id` |
| **Resolution** | Direct use | `public_id` → `railwayBotId` |
| **Registry Lookup** | Not needed | `CHATBOT_REGISTRY` query |

### 3.2 Authentication
| Aspect | Private Chat | Public Chat |
|--------|-------------|-------------|
| **Auth Required** | Yes (Firebase Auth) | No |
| **User Context** | Available | Not available |
| **Conversation History** | Saved to Firestore | Stateless |

### 3.3 System Prompt (RECENTLY FIXED)
**Before Fix:**
- **Private Chat:** Generic RAG system prompt
- **Public Chat:** Generic RAG system prompt

**After Fix:**
- **Both:** Professional `build_system_prompt_for_chatbot()` from `pages/chatbot.py`

### 3.4 Modal Features
| Feature | Private Chat | Public Chat |
|---------|-------------|-------------|
| **Email Capture** | ✅ Available | ❌ Disabled |
| **Contact Persons** | ✅ Available | ❌ Disabled |
| **Lead Generation** | ✅ Available | ❌ Disabled |

## 4. Data Flow Comparison

### 4.1 Private Chat Data Flow
```
User Input → ChatbotPage.js → sendChatMessage() 
→ POST /api/chat/{chatbot_id} → CloudMultiSourceRAG.load() 
→ build_system_prompt_for_chatbot() → OpenRouter API 
→ Modal Logic → Conversation Save → Response
```

### 4.2 Public Chat Data Flow
```
User Input → PublicChatbotPage.js → sendPublicChatMessage() 
→ POST /api/v1/public/bot/{public_id}/chat → Registry Lookup 
→ ID Resolution → CloudMultiSourceRAG.load() 
→ build_system_prompt_for_chatbot() → OpenRouter API → Response
```

## 5. Critical Implementation Details

### 5.1 RAG System Initialization
Both architectures use identical RAG initialization:
```python
rag_system = CloudMultiSourceRAG(chatbot_id=bot_id, use_cloud_storage=True)
rag_system.load_rag_system()  # Downloads from Firebase if needed
```

### 5.2 System Prompt Integration (NEW)
Both now use the professional system prompt:
```python
messages = build_system_prompt_for_chatbot(
    config=chatbot_config,
    context=relevant_chunks,
    user_question=message.message,
    chat_history=[]
)
```

### 5.3 Public ID to Bot ID Mapping (CRITICAL FIX)
```python
# WRONG (old implementation):
bot_id = registry_doc.id  # Firestore document ID

# CORRECT (fixed implementation):
bot_id = registry_data.get('railwayBotId')  # Actual bot ID
```

## 6. Recent Fixes Applied

### 6.1 ID Resolution Fix
- **Problem:** Public chat used Firestore doc ID instead of actual bot ID
- **Solution:** Extract `railwayBotId` from registry data
- **Impact:** RAG files now found correctly in Firebase Storage

### 6.2 System Prompt Enhancement
- **Problem:** Both chats used generic RAG system prompt
- **Solution:** Import and use `build_system_prompt_for_chatbot()` 
- **Impact:** Professional, bot-specific responses with personality

### 6.3 API Endpoint Alignment
- **Problem:** Frontend sent to wrong endpoints
- **Solution:** Corrected API paths to match backend routes
- **Impact:** Public chat requests now reach correct handlers

## 7. Current Status

### 7.1 Functionality Status
| Feature | Private Chat | Public Chat | Status |
|---------|-------------|-------------|---------|
| **Basic Chat** | ✅ Working | ✅ Working | Fixed |
| **RAG System** | ✅ Working | ✅ Working | Fixed |
| **Professional Prompt** | ✅ Working | ✅ Working | New |
| **ID Resolution** | ✅ Working | ✅ Working | Fixed |
| **Modal Features** | ✅ Working | ❌ Disabled | By Design |

### 7.2 Next Improvements
1. **Chat History:** Add conversation history to public chats
2. **Analytics:** Track public chat usage
3. **Rate Limiting:** Prevent abuse of public endpoints
4. **Caching:** Cache public bot configs for performance

## 8. Troubleshooting Guide

### 8.1 Common Issues
1. **"Bot not found"** → Check ID resolution and registry mapping
2. **"RAG files not found"** → Verify Firebase Storage paths match bot ID
3. **Generic responses** → Ensure system prompt is being used
4. **404 errors** → Check API endpoint paths and deployment status

### 8.2 Debug Steps
1. Check Railway logs for ID resolution
2. Verify Firebase Storage file existence
3. Test both private and public endpoints
4. Compare response quality between modes

---

**Last Updated:** 2025-08-03  
**Architecture Version:** 3.0 (Post System Prompt Integration)