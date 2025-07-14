@echo off
REM Startup-Script für Windows

echo 🚀 PDF-to-Chatbot Platform wird gestartet...
echo 📁 Arbeitsverzeichnis: %cd%

REM Prüfe ob .env existiert
if not exist ".env" (
    echo ⚠️  Keine .env Datei gefunden!
    echo 💡 Bitte erstellen Sie eine .env Datei mit Ihren API-Keys
    pause
    exit /b 1
)

REM Python-Script starten
python start_platform.py

echo 👋 Platform wurde beendet!
pause