#!/bin/bash
# Einfaches Startup-Script für Unix/Linux/macOS

echo "🚀 PDF-to-Chatbot Platform wird gestartet..."
echo "📁 Arbeitsverzeichnis: $(pwd)"
echo "📂 Root-Verzeichnis: VuBot/"

# Prüfe ob .env existiert
if [ ! -f ".env" ]; then
    echo "⚠️  Keine .env Datei gefunden!"
    echo "💡 Bitte erstellen Sie eine .env Datei mit Ihren API-Keys"
    exit 1
fi

# Python-Script starten
python3 start_platform.py

echo "👋 Platform wurde beendet!"