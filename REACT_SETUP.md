# 🚀 React-based Chatbot Platform Setup

Eine moderne React-Frontend + FastAPI-Backend Implementierung der Chatbot-Platform mit denselben Funktionalitäten wie die Streamlit-Version.

## 📁 Projektstruktur

```
Autonomous_Chatbot/
├── react_app.py                    # FastAPI Backend Server
├── react-frontend/                 # React Frontend
│   ├── package.json
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   └── src/
│       ├── index.js                # App Entry Point
│       ├── App.js                  # Main App Component
│       ├── components/             # Reusable Components
│       │   ├── Navigation.js       # Sidebar Navigation
│       │   ├── Header.js          # Top Header
│       │   └── wizard/            # Wizard Step Components
│       ├── pages/                 # Page Components
│       │   ├── HomePage.js        # Dashboard
│       │   ├── CreateChatbotPage.js # Chatbot Creation Wizard
│       │   ├── ChatbotListPage.js # Chatbot Management
│       │   ├── ChatbotPage.js     # Chat Interface
│       │   └── AnalyticsPage.js   # Analytics Dashboard
│       ├── services/
│       │   └── api.js             # API Service Layer
│       └── styles/
│           └── global.css         # Global Styles
└── utils/                         # Shared Backend Utils
    ├── chatbot_factory.py
    ├── multi_source_rag.py
    └── pdf_processor.py
```

## 🔧 Installation & Setup

### 1. Backend Dependencies

```bash
# In Projektverzeichnis
cd ~/Autonomous_Chatbot

# Aktiviere Virtual Environment (falls noch nicht aktiviert)
source venv/bin/activate

# Installiere zusätzliche Backend-Dependencies
pip install fastapi uvicorn python-multipart
```

### 2. Frontend Dependencies

```bash
# Wechsle in Frontend-Verzeichnis
cd react-frontend

# Installiere Node.js Dependencies
npm install

# Alternative mit Yarn:
# yarn install
```

### 3. Environment Setup

Die React-App nutzt dieselbe `.env` Datei wie die Streamlit-Version:

```env
# OpenAI API Key für Embeddings (erforderlich)
OPENAI_EMBED_API_KEY=sk-proj-your-openai-api-key-here

# OpenRouter API Key für LLM (erforderlich)  
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key-here

# Supabase (optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🚀 Starten der Anwendung

### Option 1: Entwicklungsmodus (Empfohlen)

**Terminal 1 - Backend starten:**
```bash
cd ~/Autonomous_Chatbot
source venv/bin/activate
python react_app.py
```
→ Backend läuft auf: http://localhost:8000

**Terminal 2 - Frontend starten:**
```bash
cd ~/Autonomous_Chatbot/react-frontend
npm start
```
→ Frontend läuft auf: http://localhost:3000

### Option 2: Production Build

```bash
# Frontend builden
cd react-frontend
npm run build

# Backend mit Frontend starten
cd ..
python react_app.py
```
→ Komplette App läuft auf: http://localhost:8000

## 🎯 Funktionalitäten

### ✅ Implementierte Features

1. **Dashboard** (`/`)
   - Plattform-Übersicht
   - Chatbot-Statistiken
   - Quick Actions
   - System-Status

2. **Chatbot-Erstellung** (`/create`)
   - 7-stufiger Wizard
   - Alle Streamlit-Features portiert
   - Fortschritts-Tracking
   - File-Upload
   - Live-Vorschau

3. **Chatbot-Verwaltung** (`/chatbots`)
   - Liste aller Chatbots
   - Status-Anzeige
   - CRUD-Operationen
   - Bulk-Actions

4. **Chat-Interface** (`/chatbot/:id`)
   - Moderne Chat-UI
   - Real-time Messaging
   - Quellenangaben
   - Quick Actions

5. **Analytics** (`/analytics`)
   - Performance-Metriken
   - System-Übersicht
   - Resource-Usage
   - Chatbot-Performance

### 🔄 API-Endpunkte

```
GET    /api/health                           # Health Check
GET    /api/chatbots                         # Alle Chatbots
POST   /api/chatbots                         # Neuen Chatbot erstellen
GET    /api/chatbots/{id}                    # Chatbot Details
PUT    /api/chatbots/{id}                    # Chatbot aktualisieren
DELETE /api/chatbots/{id}                    # Chatbot löschen
POST   /api/chat/{id}                        # Chat-Nachricht senden
GET    /api/chat/{id}/config                 # Chat-Konfiguration
POST   /api/upload/documents                 # Dokumente hochladen
GET    /api/analytics/overview               # Analytics-Daten
```

## 🎨 Design & Styling

### Material-UI Theme
- **Dark Mode** mit Corporate Colors
- **Primary**: #1f3a93 (Blau)
- **Secondary**: #34495e (Grau)
- **Accent**: #e74c3c (Rot)

### Animations
- **Framer Motion** für smooth Transitions
- **Loading States** für bessere UX
- **Hover Effects** für Interaktivität

### Responsive Design
- **Mobile-first** Approach
- **Adaptive Layout** für alle Bildschirmgrößen
- **Touch-friendly** Controls

## 🔄 Entwicklung

### Hot Reload
- **Backend**: Automatisches Reload bei Code-Änderungen
- **Frontend**: React Dev Server mit Hot Module Replacement

### State Management
- **React Query** für Server State
- **React Hooks** für Component State
- **Context API** für Global State (falls benötigt)

### Error Handling
- **API Error Boundaries**
- **User-friendly Error Messages**
- **Retry Mechanisms**

## 🚢 Deployment

### Development
```bash
# Backend
python react_app.py

# Frontend (separates Terminal)
cd react-frontend && npm start
```

### Production
```bash
# Build Frontend
cd react-frontend
npm run build

# Start Production Server
cd ..
python react_app.py
```

### Docker (Optional)
```dockerfile
# Dockerfile für Production
FROM node:18 AS frontend-build
WORKDIR /app/react-frontend
COPY react-frontend/package*.json ./
RUN npm install
COPY react-frontend/ ./
RUN npm run build

FROM python:3.12
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .
COPY --from=frontend-build /app/react-frontend/build ./react-frontend/build
EXPOSE 8000
CMD ["python", "react_app.py"]
```

## 🔧 Troubleshooting

### Backend Issues
```bash
# Port bereits belegt
lsof -ti:8000 | xargs kill -9

# Dependencies fehlen
pip install -r requirements.txt
pip install fastapi uvicorn python-multipart
```

### Frontend Issues
```bash
# Node Modules Probleme
rm -rf node_modules package-lock.json
npm install

# Port Konflikt
npm start -- --port 3001
```

### CORS Issues
Das Backend ist für `localhost:3000` konfiguriert. Bei anderen Ports:
```python
# In react_app.py anpassen:
allow_origins=["http://localhost:3001"]
```

## 📱 Unterschiede zur Streamlit-Version

### Vorteile React-Version
✅ **Performance**: Schnelleres UI und bessere Responsivität  
✅ **Skalierbarkeit**: Modulare Architektur  
✅ **Moderne UX**: Material-UI Design System  
✅ **Real-time**: WebSocket-Unterstützung  
✅ **Mobile**: Touch-optimierte Bedienung  
✅ **SEO**: Bessere Suchmaschinenoptimierung  

### Gemeinsame Features
🔄 **Alle Streamlit-Features** sind vollständig portiert  
🔄 **Dieselben Utils** werden wiederverwendet  
🔄 **Gleiche API-Keys** und Konfiguration  
🔄 **Kompatible Datenstrukturen**  

## 🎯 Nächste Schritte

1. **Wizard-Komponenten** erstellen (BasicSettingsStep.js, etc.)
2. **WebSocket Integration** für Real-time Updates
3. **PWA Features** für Mobile App Experience
4. **Advanced Analytics** mit Charts/Graphs
5. **Internationalization** (i18n) Support

## 📚 Weitere Dokumentation

- **FastAPI Docs**: http://localhost:8000/docs (automatisch generiert)
- **React Router**: Client-side Navigation
- **Material-UI**: https://mui.com/
- **Framer Motion**: https://framer.com/motion/

Die React-Version bietet dieselben Funktionalitäten wie die Streamlit-Version, aber mit moderner Web-Architektur und besserer User Experience.