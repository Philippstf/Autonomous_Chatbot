# 🚀 PDF-to-Chatbot Platform (Autonomous Chatbot)

Eine intelligente Platform zur automatischen Erstellung von KI-Chatbots aus PDFs und Websites mit modernster RAG-Technologie.

![Platform Screenshot](assets/VuWall_transparent.webp)

## ✨ Features

- **📄 Multi-Format Support**: PDF, DOCX, TXT und Markdown Dateien
- **🌐 Automatisches Website-Scraping**: Komplette Websites mit Sitemap-Erkennung
- **🤖 KI-Powered RAG**: OpenAI Embeddings + FAISS Vector Search
- **🎨 Custom Branding**: Individuelle Farben und Begrüßungsnachrichten
- **📊 Multi-Tenant**: Mehrere Chatbots mit eigenen Datenquellen
- **💬 Chat-Persistenz**: Supabase Integration mit lokaler Fallback-Option
- **🔍 Quellenangaben**: Transparente Nachverfolgung der Antwort-Quellen

## 🛠️ Technologie-Stack

- **Frontend**: Streamlit
- **AI/ML**: OpenAI API, FAISS Vector Database
- **Dokument-Processing**: PyPDF2, python-docx, pdfplumber
- **Web-Scraping**: Playwright, BeautifulSoup
- **Datenbank**: Supabase (PostgreSQL) + lokaler Fallback
- **LLM**: OpenRouter API (Mistral, GPT, etc.)

## 🚀 Schnellstart

### 1. Repository klonen
```bash
git clone https://github.com/Philippstf/Autonomous_Chatbot.git
cd Autonomous_Chatbot
```

### 2. Dependencies installieren
```bash
pip install -r requirements.txt
playwright install chromium
```

### 3. Umgebungsvariablen konfigurieren
Erstellen Sie eine `.env` Datei:
```env
OPENAI_EMBED_API_KEY=sk-proj-...
OPENROUTER_API_KEY=sk-or-v1-...
SUPABASE_URL=https://your-project.supabase.co (optional)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (optional)
```

### 4. Platform starten
```bash
streamlit run app.py
```

🌐 Öffnen Sie http://localhost:8501 in Ihrem Browser

## 📖 Anleitung

### Chatbot erstellen
1. **Datenquellen hinzufügen**:
   - PDF/DOCX/TXT Dateien hochladen
   - Website-URL eingeben (automatisches Scraping)
   
2. **Branding anpassen**:
   - Chatbot-Name und Beschreibung
   - Primär- und Sekundärfarben
   
3. **Erstellen klicken**: 
   - Automatische Textextraktion und Chunking
   - Embedding-Generierung mit OpenAI
   - FAISS-Index Erstellung

### Chatbot verwenden
- Über die Platform direkt nutzen
- Eindeutige Chatbot-URL teilen
- In Websites einbetten

## 🏗️ Projektstruktur

```
├── app.py                  # Hauptanwendung
├── pages/
│   └── chatbot.py         # Individuelle Chatbot-Seiten
├── utils/
│   ├── multi_source_rag.py    # RAG-Pipeline & Website-Scraping
│   ├── pdf_processor.py       # Dokument-Verarbeitung
│   └── chatbot_factory.py     # Chatbot-Management
├── data/
│   └── chatbots/          # Gespeicherte Chatbot-Daten
├── assets/                # UI-Assets
└── requirements.txt
```

## 🔧 Konfiguration

### API-Keys erforderlich
- **OpenAI API**: Für Embeddings (text-embedding-3-small)
- **OpenRouter API**: Für LLM-Antworten

### Optionale Features
- **Supabase**: Chat-Persistenz und Multi-User Support
- **Playwright**: Erweiterte Website-Scraping-Funktionen

## 🌐 Website-Scraping Features

- **Automatische Sitemap-Erkennung**: `/sitemap.xml`, `/sitemap_index.xml`
- **Intelligente URL-Filterung**: Ausschluss von Assets, Admin-Bereichen
- **Fallback-Crawling**: Wenn keine Sitemap verfügbar
- **Progress-Tracking**: Echtzeit-Updates während der Verarbeitung

## 💡 Anwendungsfälle

- **Kundenservice-Bots**: FAQ-Automatisierung
- **Interne Dokumentation**: Mitarbeiter-Assistenten
- **E-Learning**: Bildungsinhalte als Chatbot
- **Produktsupport**: Handbücher und Anleitungen
- **Website-Assistenten**: Besucherbetreuung

## 📊 RAG-Pipeline Details

1. **Textextraktion**: Intelligente Bereinigung und Strukturierung
2. **Chunking**: Optimale Segmentierung (500-50 Zeichen)
3. **Embeddings**: OpenAI text-embedding-3-small
4. **Speicherung**: FAISS L2-Index für schnelle Suche
5. **Retrieval**: Top-K ähnlichste Chunks für Kontext
6. **Generation**: LLM-gestützte Antworten mit Quellenangaben

## 🔒 Datenschutz & Sicherheit

- **Lokale Datenhaltung**: Alle Dokumente bleiben auf Ihrem Server
- **GDPR-konform**: Opt-in Chat-Persistenz
- **Sichere APIs**: Verschlüsselte Verbindungen zu AI-Services
- **Keine Datenweitergabe**: Inhalte werden nicht an Dritte übertragen

## 🐛 Troubleshooting

### Häufige Probleme

**Problem: Chatbot-Erstellung schlägt fehl**
```bash
# Prüfen Sie die API-Keys
echo $OPENAI_EMBED_API_KEY
echo $OPENROUTER_API_KEY
```

**Problem: Website-Scraping funktioniert nicht**
```bash
# Installieren Sie Playwright-Browser
playwright install chromium
```

**Problem: PDF-Verarbeitung schlägt fehl**
```bash
# Zusätzliche Dependencies installieren
pip install pdfplumber PyPDF2 python-docx
```

### Debug-Modus

Für detaillierte Logs:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📈 Performance-Tipps

- **PDF-Größe**: Max. 50MB pro Datei
- **Website-Größe**: Max. 1000 Seiten  
- **Chunks pro Chatbot**: Max. 5000 Chunks
- **Gleichzeitige Verarbeitung**: Max. 3 Chatbots

## 🤝 Contributing

1. Fork das Repository
2. Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request öffnen

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) Datei für Details.

## 🆘 Support

- **Issues**: Für Bugs und Feature-Requests
- **Diskussionen**: Für Fragen und Community-Austausch
- **Wiki**: Detaillierte Dokumentation und Tutorials

## 🔄 Changelog

### Version 1.0.0 (2025-01-14)
- ✅ Multi-Source RAG-Pipeline
- ✅ Automatisches Website-Scraping mit Sitemap-Erkennung
- ✅ Chatbot-Factory System
- ✅ Streamlit-basierte UI
- ✅ Supabase-Integration mit lokaler Fallback
- ✅ Custom Branding pro Chatbot
- ✅ Quellenangaben in Chat-Antworten

---

**Entwickelt auf Basis des VuBot-Projekts** 🤖

Von einem firmenspezifischen Bot zu einer universellen Chatbot-Platform transformiert.
