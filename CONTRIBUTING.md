# Contributing to PDF-to-Chatbot Platform

Vielen Dank für Ihr Interesse an der Weiterentwicklung der PDF-to-Chatbot Platform! 🎉

## 🚀 Erste Schritte

### 1. Repository forken
Klicken Sie auf "Fork" oben rechts auf der GitHub-Seite.

### 2. Repository klonen
```bash
git clone https://github.com/IHR-USERNAME/pdf-to-chatbot-platform.git
cd pdf-to-chatbot-platform
```

### 3. Development Environment einrichten
```bash
# Virtual Environment erstellen
python -m venv venv
source venv/bin/activate  # Linux/Mac
# oder
venv\Scripts\activate     # Windows

# Dependencies installieren
pip install -r requirements.txt
playwright install chromium

# .env Datei für Development erstellen
cp .env.example .env
# API-Keys in .env eintragen
```

## 🔧 Development Guidelines

### Code Style
- **Python**: PEP 8 Standards befolgen
- **Kommentare**: Deutsche Kommentare für Business-Logik
- **Docstrings**: Deutsche Beschreibungen für Funktionen
- **Variablennamen**: Aussagekräftig und beschreibend

### Code Formatting
```bash
# Black für Code-Formatierung
pip install black
black .

# isort für Import-Sortierung
pip install isort
isort .
```

### Testing
```bash
# Tests ausführen
python -m pytest tests/

# Mit Coverage
python -m pytest --cov=utils tests/
```

## 📝 Pull Request Process

### 1. Feature Branch erstellen
```bash
git checkout -b feature/beschreibung-des-features
# oder
git checkout -b bugfix/beschreibung-des-bugs
```

### 2. Änderungen durchführen
- Kleine, fokussierte Commits
- Aussagekräftige Commit-Messages
- Tests für neue Features

### 3. Tests ausführen
```bash
# Sicherstellen, dass alle Tests bestehen
python -m pytest

# Streamlit App testen
streamlit run app.py
```

### 4. Pull Request erstellen
- **Titel**: Kurze, präzise Beschreibung
- **Beschreibung**: Detaillierte Erklärung der Änderungen
- **Screenshots**: Bei UI-Änderungen

### 5. Code Review
- Mindestens ein Reviewer erforderlich
- Alle Kommentare addressieren
- CI/CD Pipeline muss erfolgreich sein

## 🐛 Bug Reports

### Issue erstellen
```markdown
**Bug-Beschreibung**
Kurze und klare Beschreibung des Problems.

**Reproduzierbare Schritte**
1. Gehen Sie zu '...'
2. Klicken Sie auf '...'
3. Scrollen Sie nach unten zu '...'
4. Fehler wird angezeigt

**Erwartetes Verhalten**
Was sollte passieren.

**Screenshots**
Falls zutreffend, fügen Sie Screenshots hinzu.

**Environment (bitte vervollständigen):**
- OS: [z.B. macOS 12.0]
- Python Version: [z.B. 3.9.7]
- Browser: [z.B. Chrome 96.0]
- Streamlit Version: [z.B. 1.15.0]

**Zusätzlicher Kontext**
Weitere Informationen zum Problem.
```

## ✨ Feature Requests

### Neue Features vorschlagen
```markdown
**Feature-Beschreibung**
Klare und präzise Beschreibung des gewünschten Features.

**Problem/Motivation**
Welches Problem löst dieses Feature?

**Vorgeschlagene Lösung**
Detaillierte Beschreibung der gewünschten Implementierung.

**Alternativen**
Andere Lösungsansätze, die Sie in Betracht gezogen haben.

**Zusätzlicher Kontext**
Screenshots, Mockups, Links zu ähnlichen Implementierungen.
```

## 🏗️ Architektur & Code-Organisation

### Verzeichnisstruktur
```
├── app.py                 # Hauptanwendung
├── pages/                 # Streamlit-Seiten
├── utils/                 # Utility-Funktionen
│   ├── multi_source_rag.py   # RAG-Pipeline
│   ├── pdf_processor.py      # Dokument-Verarbeitung
│   └── chatbot_factory.py    # Chatbot-Management
├── tests/                 # Test-Dateien
├── assets/                # Statische Dateien
└── data/                  # Daten-Verzeichnisse
```

### Neue Module hinzufügen
1. **Utility-Funktionen** → `utils/`
2. **UI-Komponenten** → `components/`
3. **Tests** → `tests/`
4. **Dokumentation** → `docs/`

## 🧪 Testing Guidelines

### Test-Kategorien
```python
# Unit Tests
def test_chunk_text():
    """Testet Text-Chunking-Funktionalität"""
    pass

# Integration Tests  
def test_rag_pipeline():
    """Testet komplette RAG-Pipeline"""
    pass

# UI Tests
def test_streamlit_app():
    """Testet Streamlit-Interface"""
    pass
```

### Test-Daten
- **Testdateien** in `tests/fixtures/`
- **Mock-APIs** für externe Services
- **Kleine Datensets** für Performance-Tests

## 🔍 Code Review Checklist

### Vor dem Erstellen eines PR
- [ ] Code ist gut dokumentiert
- [ ] Tests bestehen alle
- [ ] Keine Hardcoded API-Keys
- [ ] Performance-Impact berücksichtigt
- [ ] Security-Aspekte beachtet
- [ ] UI ist responsive
- [ ] Error-Handling implementiert

### Review-Kriterien
- [ ] Code-Qualität und Lesbarkeit
- [ ] Test-Coverage ausreichend
- [ ] Dokumentation aktualisiert
- [ ] Breaking Changes dokumentiert
- [ ] Performance-Impact akzeptabel

## 🚀 Release Process

### Versioning
Wir verwenden [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking Changes
- **MINOR**: Neue Features (backwards-compatible)
- **PATCH**: Bug Fixes

### Release Branches
```bash
# Release vorbereiten
git checkout -b release/v1.1.0

# Version in allen relevanten Dateien aktualisieren
# CHANGELOG.md aktualisieren
# Tests ausführen

# Release-Commit
git commit -m "Release v1.1.0"

# Tag erstellen
git tag -a v1.1.0 -m "Release v1.1.0"
```

## 🤝 Community Guidelines

### Kommunikation
- **Respektvoll** und konstruktiv
- **Hilfsbereit** für neue Contributors
- **Geduldig** bei Code Reviews
- **Offen** für Feedback und Kritik

### Sprache
- **Issues/PRs**: Deutsch oder Englisch
- **Code-Kommentare**: Deutsch bevorzugt
- **Dokumentation**: Deutsch für User-Docs, Englisch für Dev-Docs

## 📚 Weitere Ressourcen

- **[GitHub Issues](../../issues)**: Bug Reports und Feature Requests
- **[Discussions](../../discussions)**: Community-Austausch
- **[Wiki](../../wiki)**: Detaillierte Dokumentation
- **[Streamlit Docs](https://docs.streamlit.io/)**: Streamlit-Dokumentation

## ❓ Fragen?

Bei Fragen können Sie:
- Ein **Issue** erstellen
- Eine **Discussion** starten
- Die **Dokumentation** konsultieren

Vielen Dank für Ihre Unterstützung! 🙏