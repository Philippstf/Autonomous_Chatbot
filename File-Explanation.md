# VuBot Project - File Structure & Functionality Overview

## 🏗️ Core Architecture

Das VuBot-Projekt ist ein vollständiger **Chatbot-as-a-Service** mit React Frontend, FastAPI Backend und Firebase/Railway Cloud-Infrastructure.

---

## 📁 Hauptfunktionalitäts-Dateien

### **1. `utils/chatbot_factory.py` - Chatbot-Orchestrator**
**Rolle:** Zentrale Factory-Klasse für Chatbot-Erstellung und -Verwaltung

**Funktionalität:**
- **ChatbotConfig** Dataclass: Speichert alle Chatbot-Metadaten (Name, Beschreibung, Branding, etc.)
- **ChatbotFactory** Klasse: Hauptorchestrator für Chatbot-Erstellung
- **Datenquellen-Support:** Website URL + PDF/DOCX-Upload + Manueller Text (alle kombinierbar)
- **Branding & Features:** Logo-Upload, Email-Capture, Kontaktpersonen, Verhalten-Settings
- **Registry-Management:** Lokale JSON-Registry für alle erstellten Chatbots
- **Cloud-Integration:** Verwendet CloudMultiSourceRAG für persistente Speicherung

**Workflow:**
1. Erstelle ChatbotConfig mit Metadaten
2. Verarbeite hochgeladene Dokumente (via pdf_processor)
3. Initialisiere CloudMultiSourceRAG System
4. Verarbeite alle Datenquellen (Website, Dokumente, Text)
5. Speichere Konfiguration lokal und in Firestore

---

### **2. `utils/multi_source_rag.py` - RAG-Engine Core**
**Rolle:** Basis-RAG-System für Datenverarbeitung und Chat-Funktionalität

**Funktionalität:**
- **Multi-Source Processing:** Kombiniert Website-Scraping, Dokument-Upload und manuellen Text
- **Website-Scraping:** Simple HTTP requests + BeautifulSoup für Textextraktion
- **Text-Chunking:** Intelligente Aufteilung in sinnvolle Textblöcke (200-500 Zeichen)
- **OpenAI Embeddings:** text-embedding-3-small für semantische Suche
- **FAISS-Index:** Lokaler Vektor-Index für schnelle Ähnlichkeitssuche
- **Chat-Response:** OpenRouter API für LLM-Antworten mit RAG-Kontext

**Unterstützte Datenquellen:**
- A) **Nur Website:** Scraping einer URL
- B) **Nur Dokumente:** PDF, DOCX, TXT, MD-Dateien
- C) **Website + Dokumente + Manueller Text:** Alle kombiniert

**Dateien-Struktur:**
```
data/chatbots/{chatbot_id}/
├── config.json           # Chatbot-Konfiguration
├── chunks/
│   └── all_chunks.json   # Alle Textchunks mit Metadaten
└── embeddings/
    ├── index.faiss       # FAISS-Vektor-Index
    └── meta.pkl          # Chunk-Metadaten für Index
```

---

### **3. `utils/cloud_multi_source_rag.py` - Cloud-Enabled RAG**
**Rolle:** Erweitert MultiSourceRAG um Firebase Storage Persistenz

**Funktionalität:**
- **Erbt von MultiSourceRAG:** Alle Basis-Funktionalitäten verfügbar
- **Firebase Storage Integration:** Automatischer Upload/Download aller RAG-Dateien
- **Intelligent Fallback:** Lädt erst lokal, dann von Firebase Storage
- **On-Demand Initialization:** Lädt Chatbot-Dateien bei Bedarf von Cloud
- **Production-Ready:** Überlebt Railway Container-Restarts

**Cloud-Workflow:**
1. Lokale RAG-Verarbeitung (wie MultiSourceRAG)
2. **Automatischer Upload:** Alle Dateien nach Firebase Storage
3. **Chat-Zeit:** Download von Firebase Storage falls lokal nicht verfügbar
4. **Debugging:** Umfassende Debug-Informationen für Troubleshooting

---

### **4. `utils/pdf_processor.py` - Dokument-Processor**
**Rolle:** Universeller Dokumenten-Parser für alle unterstützten Dateiformate

**Funktionalität:**
- **PDF-Processing:** PyPDF2 + pdfplumber für robuste PDF-Textextraktion
- **DOCX-Processing:** python-docx für Word-Dokumente
- **Text-Processing:** TXT, MD-Dateien direkt
- **Chunking-Integration:** Automatische Aufteilung in RAG-kompatible Chunks
- **Metadaten-Erhaltung:** Dateiname, Seitenzahl, Quelle werden gespeichert

**Unterstützte Formate:**
- ✅ PDF (mit PyPDF2 + pdfplumber Fallback)
- ✅ DOCX (Microsoft Word)
- ✅ TXT (Plain Text)
- ✅ MD (Markdown)

**Output:** Liste von Chunk-Dictionaries mit Text und Metadaten

---

### **5. `utils/firebase_storage.py` - Cloud Storage Manager**
**Rolle:** Firebase Storage Abstraction für RAG-Dateien Persistenz

**Funktionalität:**
- **File Upload/Download:** Bidirektionaler Transfer zwischen lokal und Firebase Storage
- **Chatbot-Management:** Upload/Download kompletter Chatbot-Ordner
- **Bucket-Management:** Automatische Bucket-Initialisierung (helferlain-a4178.appspot.com)
- **Error-Handling:** Robuste Fehlerbehandlung mit Logging
- **Singleton Pattern:** Globaler FirebaseStorageManager für Effizienz

**File-Operations:**
- `upload_chatbot_files()`: Alle RAG-Dateien eines Chatbots hochladen
- `download_chatbot_files()`: Alle RAG-Dateien eines Chatbots herunterladen
- `chatbot_exists_in_storage()`: Prüfung ob Chatbot in Cloud existiert
- `delete_chatbot_files()`: Komplette Chatbot-Löschung

**Cloud-Pfade:**
```
Firebase Storage:
├── chatbots/{chatbot_id}/
│   ├── config.json
│   ├── chunks/all_chunks.json
│   └── embeddings/
│       ├── index.faiss
│       └── meta.pkl
```

---

### **6. `utils/firestore_storage.py` - Database Manager**
**Rolle:** Firebase Firestore Integration für Metadaten und User-Management

**Funktionalität:**
- **Firebase Admin SDK:** Initialisierung mit Service Account Credentials
- **User-Management:** Chatbot-Zuordnung zu Firebase Auth Usern
- **Metadata-Storage:** Chatbot-Configs, Konversationen, Nachrichten, Leads
- **Collections:** Strukturierte Firestore-Collections für alle Datentypen
- **Railway-Compatible:** Environment-Variables basierte Konfiguration

**Collections-Struktur:**
- `chatbot_configs`: User-spezifische Chatbot-Konfigurationen
- `conversations`: Chat-Konversationen mit User-Zuordnung
- `messages`: Einzelne Chat-Nachrichten
- `leads`: Erfasste Leads via Email-Capture
- `chatbot_analytics`: Usage-Statistiken

---

### **7. `utils/scrape_to_chunks.py` - Legacy Website Scraper**
**Rolle:** Standalone Website-Scraper (nicht mehr aktiv genutzt)

**Funktionalität:**
- **Playwright-based:** Browser-Automation für JavaScript-heavy Sites
- **Batch-Processing:** Mehrere URLs aus sitemap_links.txt
- **HTML-Cleaning:** Entfernung von Navigation, Footer, Scripts
- **Chunking:** Text-Aufteilung ähnlich MultiSourceRAG

**Status:** Legacy - wird durch `_process_website()` in MultiSourceRAG ersetzt

---

## 🔗 Workflow-Integration

### **Chatbot-Erstellung (Option A: Nur Website)**
```
1. User gibt Website-URL ein
2. ChatbotFactory.create_chatbot() 
3. CloudMultiSourceRAG.process_multiple_sources(website_url=url)
4. MultiSourceRAG._process_website() → HTTP-Request + BeautifulSoup
5. Text-Chunking + OpenAI Embeddings + FAISS-Index
6. FirebaseStorageManager.upload_chatbot_files() → Cloud-Persistenz
7. FirestoreStorage.create_chatbot_config() → User-Zuordnung
```

### **Chatbot-Erstellung (Option B: Nur Dokumente)**
```
1. User lädt PDF/DOCX-Dateien hoch
2. ChatbotFactory.create_chatbot(uploaded_documents=[files])
3. DocumentProcessor.process_uploaded_file() für jede Datei
4. CloudMultiSourceRAG.process_multiple_sources(document_chunks=chunks)
5. Text-Chunking + OpenAI Embeddings + FAISS-Index
6. Cloud-Upload + User-Zuordnung (wie Option A)
```

### **Chatbot-Erstellung (Option C: Website + Dokumente + Text)**
```
1. User gibt Website-URL + lädt Dateien hoch + fügt manuellen Text hinzu
2. Alle 3 Datenquellen werden parallel verarbeitet
3. Chunks werden kombiniert zu einheitlichem RAG-System
4. Single FAISS-Index für alle Quellen
5. Cloud-Upload + User-Zuordnung
```

### **Chat-Runtime**
```
1. User sendet Nachricht an Chatbot
2. CloudMultiSourceRAG.load_rag_system() 
3. Falls lokal nicht verfügbar: FirebaseStorageManager.download_chatbot_files()
4. FAISS-Ähnlichkeitssuche für relevante Chunks
5. OpenRouter LLM-Call mit RAG-Kontext
6. Antwort mit Quellen-Referenzen
```

---

## 🏗️ Architektur-Dependencies

```
react_app.py (FastAPI Backend)
├── ChatbotFactory (Orchestration)
├── CloudMultiSourceRAG (RAG-Engine)
│   ├── MultiSourceRAG (Base RAG)
│   ├── DocumentProcessor (File-Parsing)
│   └── FirebaseStorageManager (Cloud-Persistenz)
├── FirestoreStorage (Database)
└── Firebase Auth (User-Management)
```

---

## 🔧 Environment & Configuration

**Railway Environment Variables:**
```
FIREBASE_PROJECT_ID=helferlain-a4178
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@helferlain-a4178.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=...
OPENROUTER_API_KEY=...
OPENAI_EMBED_API_KEY=...
```

**Firebase Storage Bucket:** `helferlain-a4178.appspot.com`

**Supported File Types:** PDF, DOCX, TXT, MD (via DocumentProcessor)

---

## 📊 Current Status

✅ **Funktionell:**
- Multi-Source RAG (Website + Dokumente + Text)
- Firebase Storage Integration 
- User-Management mit Firebase Auth
- Firestore Metadata-Storage

❓ **Debug-Bedarf:**
- RAG-Dateien Upload zu Firebase Storage (CloudMultiSourceRAG)
- On-Demand Download im Chat-Workflow
- Error-Handling bei Cloud-Storage Fehlern

Das System ist vollständig implementiert und sollte alle 3 Datenquellen-Optionen (A, B, C) unterstützen.