# 🚀 Persistent Chatbot API Service

Separater, entkoppelter API Service für persistente Chatbot-Funktionalität. Ermöglicht öffentliche Chat-Links und Website-Integration ohne Abhängigkeit zur Management-App.

## 🎯 Funktionen

- ✅ **Persistente Chatbots**: Unabhängig von Management-App Deployments
- ✅ **Öffentliche Chat-API**: Keine Authentication erforderlich
- ✅ **Firebase Integration**: Lädt RAG-Systeme aus Firebase Storage
- ✅ **Auto-Loading**: Chatbots werden bei Bedarf automatisch geladen
- ✅ **Caching**: In-Memory Cache für optimale Performance
- ✅ **Responsive Chat-UI**: Standalone Chat-Interface
- ✅ **Error Handling**: Graceful Degradation bei Fehlern

## 🏗️ Architektur

```
┌─────────────────────┐
│   Management App    │ (Firebase Hosting)
│  - Bot Creation     │
│  - User Management  │
│  - Analytics View   │
└─────────┬───────────┘
          │ Creates & Configures
          ▼
┌─────────────────────┐
│    Firestore DB     │ (Bot Configs)
│  + Firebase Storage │ (RAG Files)
└─────────┬───────────┘
          │ Loads from
          ▼
┌─────────────────────┐    ┌──────────────────────┐
│ Chatbot API Service │◄──►│   Public Chat UI     │
│  - Persistent Bots  │    │  - Widget Embedding  │
│  - Public Chat API  │    │  - Direct Chat Links │
│  - Auto-Loading     │    │  - Mobile Responsive │
└─────────────────────┘    └──────────────────────┘
```

## 🚀 Deployment

### Railway Deployment

1. **Repository vorbereiten**:
```bash
cd chatbot-api-service
git init
git add .
git commit -m "Initial commit"
```

2. **Railway-Projekt erstellen**:
- Gehe zu [railway.app](https://railway.app)
- "New Project" → "Deploy from GitHub repo"
- Wähle Repository und `/chatbot-api-service` Ordner

3. **Environment Variables setzen**:
```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=helferlain-a4178
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@helferlain-a4178.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Service Config
PORT=8001
ENVIRONMENT=production
LOG_LEVEL=INFO
```

4. **Custom Domain einrichten** (Optional):
```
api.helferlain.app → Railway Service
```

### Docker Deployment

```bash
# Build
docker build -t chatbot-api-service .

# Run
docker run -d \
  --name chatbot-api \
  -p 8001:8001 \
  --env-file .env \
  chatbot-api-service
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📋 API Endpoints

### Public Endpoints (Keine Auth)

```http
GET  /api/v1/public/bot/{bot_id}         # Bot-Konfiguration
POST /api/v1/public/bot/{bot_id}/chat    # Chat Message senden
GET  /api/v1/public/bot/{bot_id}/status  # Bot Status prüfen
POST /api/v1/public/bot/{bot_id}/analytics # Analytics Event
```

### Chat Interface

```http
GET  /chat/{bot_id}                      # Öffentliche Chat-UI
GET  /chat/{bot_id}?theme=dark           # Mit Theme-Parameter
```

### Health & Info

```http
GET  /                                   # API Info
GET  /health                             # Health Check
GET  /docs                               # API Dokumentation
```

## 🔧 Konfiguration

### Environment Variables

| Variable | Beschreibung | Erforderlich |
|----------|--------------|--------------|
| `FIREBASE_PROJECT_ID` | Firebase Projekt-ID | ✅ |
| `FIREBASE_PRIVATE_KEY` | Firebase Service Account Private Key | ✅ |
| `FIREBASE_CLIENT_EMAIL` | Firebase Service Account Email | ✅ |
| `OPENAI_API_KEY` | OpenAI API Key für RAG-System | ✅ |
| `PORT` | Service Port (Standard: 8001) | ❌ |
| `ENVIRONMENT` | Umgebung (development/production) | ❌ |
| `LOG_LEVEL` | Log-Level (DEBUG/INFO/WARNING/ERROR) | ❌ |

### Firebase Service Account

1. Gehe zur [Firebase Console](https://console.firebase.google.com)
2. Projekt auswählen → "Project Settings" → "Service accounts"
3. "Generate new private key" klicken
4. JSON-Datei herunterladen
5. Werte in Environment Variables kopieren

## 💬 Chat-Integration

### 1. JavaScript Widget

```html
<!-- Einfachste Integration -->
<div data-bot-id="your-bot-id"></div>
<script async src="https://cdn.helferlain.app/widget.js"></script>
```

### 2. Direkte API-Nutzung

```javascript
const API_BASE = 'https://api.helferlain.app/api/v1/public';
const BOT_ID = 'your-bot-id';

// Chat Message senden
const response = await fetch(`${API_BASE}/bot/${BOT_ID}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hallo!',
    conversation_id: 'optional-session-id'
  })
});

const data = await response.json();
console.log(data.response); // Bot-Antwort
```

### 3. iFrame-Embedding

```html
<iframe 
  src="https://api.helferlain.app/chat/your-bot-id"
  width="100%" 
  height="500"
  frameborder="0">
</iframe>
```

## 🔍 Monitoring & Debugging

### Health Check

```bash
curl https://api.helferlain.app/health
```

Erwartete Antwort:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "active_bots": 5,
  "service": "persistent-chatbot-api",
  "version": "1.0.0"
}
```

### Bot Status prüfen

```bash
curl https://api.helferlain.app/api/v1/public/bot/your-bot-id/status
```

### Logs überwachen

```bash
# Railway
railway logs

# Docker
docker logs chatbot-api

# Local
python app.py
```

## 🛠️ Entwicklung

### Local Setup

```bash
# Dependencies installieren
pip install -r requirements.txt

# Environment Variables setzen
cp .env.example .env
# .env editieren

# Service starten
python app.py
```

### API testen

```bash
# Health Check
curl http://localhost:8001/health

# Bot Info
curl http://localhost:8001/api/v1/public/bot/test-bot-id

# Chat Test
curl -X POST http://localhost:8001/api/v1/public/bot/test-bot-id/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hallo!"}'
```

### Debug-Modus

```python
# In app.py für lokale Entwicklung
import logging
logging.getLogger().setLevel(logging.DEBUG)
```

## 📊 Performance

### Optimierungen

- **In-Memory Caching**: Aktive Bots werden im RAM gecacht
- **Lazy Loading**: Bots werden nur bei Bedarf geladen
- **Connection Pooling**: Firebase-Verbindungen werden wiederverwendet
- **Request Timeouts**: Verhindert hängende Requests
- **Error Recovery**: Graceful Fallbacks bei Fehlern

### Skalierung

- **Horizontal**: Mehrere Service-Instanzen über Load Balancer
- **Vertikal**: CPU/RAM erhöhen für mehr gleichzeitige Chats
- **Caching**: Redis für verteilten Cache zwischen Instanzen
- **CDN**: Static Assets über CDN ausliefern

## 🚨 Troubleshooting

### Häufige Probleme

1. **Bot nicht gefunden**
   ```
   Fehler: 404 - Bot not found or inactive
   
   Lösungen:
   - Bot-ID prüfen
   - Bot-Status in Firestore prüfen
   - Firebase-Berechtigung prüfen
   ```

2. **Firebase-Verbindung fehlgeschlagen**
   ```
   Fehler: Failed to initialize Firebase
   
   Lösungen:
   - Service Account Credentials prüfen
   - Firebase-Projekt-ID korrekt?
   - Netzwerk-Connectivity testen
   ```

3. **RAG-System nicht ladbar**
   ```
   Fehler: RAG system files not found
   
   Lösungen:
   - Firebase Storage Dateien prüfen
   - Bot wurde vollständig erstellt?
   - Storage-Berechtigung prüfen
   ```

4. **Hohe Latenz**
   ```
   Problem: Langsame API-Antworten
   
   Optimierungen:
   - Bot-Cache warming
   - Nähere Service-Region
   - OpenAI API-Key Limits prüfen
   ```

### Debug-Kommandos

```bash
# Service-Status
curl -s https://api.helferlain.app/health | jq

# Bot-Details
curl -s https://api.helferlain.app/api/v1/public/bot/BOT_ID | jq

# Logs live verfolgen
railway logs --follow

# Performance-Test
ab -n 100 -c 10 https://api.helferlain.app/health
```

## 🔐 Sicherheit

### Implementiert

- ✅ **CORS-Policy**: Konfigurierbare Origins
- ✅ **Rate Limiting**: Schutz vor Abuse
- ✅ **Input Validation**: Pydantic Models
- ✅ **Error Sanitization**: Keine sensitive Daten in Responses
- ✅ **HTTPS-Only**: Encrypted Communication

### Best Practices

```python
# Rate Limiting konfigurieren
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/public/bot/{bot_id}/chat")
@limiter.limit("60/minute")
async def chat_endpoint(...):
    pass
```

## 📈 Roadmap

### Phase 1 (Aktuell)
- [x] Basic API Service
- [x] Firebase Integration
- [x] Public Chat Endpoints
- [x] Simple Chat UI

### Phase 2 (Nächste Woche)
- [ ] JavaScript Widget System
- [ ] Advanced Caching (Redis)
- [ ] Analytics Dashboard
- [ ] A/B Testing Framework

### Phase 3 (Später)
- [ ] WebSocket Support
- [ ] Multi-Language UI
- [ ] Voice Chat Integration
- [ ] Enterprise Features

## 📞 Support

- **Dokumentation**: [docs.helferlain.app](https://docs.helferlain.app)
- **Issues**: [GitHub Issues](https://github.com/helferlain/api-service/issues)
- **Email**: support@helferlain.app
- **Discord**: [Community Server](https://discord.gg/helferlain)

---

**HelferLain Chatbot API Service v1.0.0**  
Persistente, skalierbare Chatbot-Engine für öffentliche Integration