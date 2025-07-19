# platform/app.py - Hauptseite für Chatbot-Erstellung

import sys
import os
from pathlib import Path

# Working directory setup
current_dir = Path(__file__).parent

import streamlit as st
import uuid
from typing import List, Dict, Optional
import time
from datetime import datetime
from dotenv import load_dotenv

# Platform Imports
from utils.chatbot_factory import chatbot_factory, ChatbotConfig
from utils.pdf_processor import document_processor

load_dotenv()

# ─── Streamlit Konfiguration ────────────────────────────────────────────────────
st.set_page_config(
    page_title="🚀 PDF-to-Chatbot Platform",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─── Custom CSS für Platform ────────────────────────────────────────────────────
st.markdown("""
<style>
/* Dark Theme */
[data-testid="stAppViewContainer"] {
    background-color: #0e1117;
    color: #e1e1e1;
}
[data-testid="stSidebar"] {
    background-color: #171924;
    color: #e1e1e1;
}
[data-testid="stHeader"] {
    background-color: #0e1117;
}

/* Upload Box Styling */
.uploadedFile {
    background-color: #1e1f26 !important;
    border: 1px solid #333 !important;
    border-radius: 8px !important;
    color: #e1e1e1 !important;
}

/* Progress Bar */
.stProgress > div > div > div > div {
    background-color: #1f3a93;
}

/* Success/Error Messages */
.element-container div[data-testid="stSuccess"] {
    background-color: #1e4d3a !important;
    border: 1px solid #28a745 !important;
}
.element-container div[data-testid="stError"] {
    background-color: #4d1e1e !important;
    border: 1px solid #dc3545 !important;
}

/* Cards für Chatbot-Liste */
.chatbot-card {
    background: linear-gradient(135deg, #1e1f26, #2e303e);
    border: 1px solid #333;
    border-radius: 12px;
    padding: 20px;
    margin: 10px 0;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.chatbot-card h3 {
    color: #e1e1e1;
    margin: 0 0 10px 0;
}

.chatbot-card p {
    color: #b8b8b8;
    margin: 5px 0;
}

.header-container {
    background: linear-gradient(135deg, #1f3a93, #34495e);
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    text-align: center;
    color: white;
}

.header-container h1 {
    margin: 0;
    font-size: 2.5rem;
    font-weight: bold;
}

.header-container p {
    margin: 10px 0 0 0;
    font-size: 1.2rem;
    opacity: 0.9;
}
</style>
""", unsafe_allow_html=True)

# ─── Helper Functions ────────────────────────────────────────────────────────────

def get_base64_image(image_path):
    """Konvertiert Bild zu base64 für HTML-Einbettung"""
    try:
        import base64
        with open(str(current_dir / image_path), "rb") as img_file:
            return base64.b64encode(img_file.read()).decode()
    except:
        return ""

def show_progress_with_callback(message: str, progress: float):
    """Callback-Funktion für Progress Updates"""
    if 'progress_bar' in st.session_state:
        st.session_state.progress_bar.progress(progress)
    if 'progress_text' in st.session_state:
        st.session_state.progress_text.text(message)

def validate_inputs(name: str, website_url: str, uploaded_files: List) -> tuple[bool, str]:
    """Validiert Benutzereingaben"""
    if not name.strip():
        return False, "Bitte geben Sie einen Namen für den Chatbot ein."
    
    if not website_url.strip() and not uploaded_files:
        return False, "Bitte geben Sie entweder eine Website-URL ein oder laden Sie Dokumente hoch."
    
    if website_url.strip() and not website_url.startswith(('http://', 'https://')):
        return False, "Website-URL muss mit http:// oder https:// beginnen."
    
    return True, ""

# ─── Main Application ────────────────────────────────────────────────────────────

def main():
    # Header
    st.markdown(f"""
    <div class="header-container">
        <h1>🚀 PDF-to-Chatbot Platform</h1>
        <p>Erstellen Sie intelligente Chatbots aus Ihren Dokumenten und Websites</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Sidebar Navigation
    with st.sidebar:
        st.markdown(f"""
        <img src="data:image/webp;base64,{get_base64_image('assets/VuWall_transparent.webp')}"
             style="width: 200px; max-width: 100%; display: block; margin: 0 auto 20px auto;"/>
        """, unsafe_allow_html=True)
        
        page = st.radio(
            "Navigation",
            ["🆕 Neuen Chatbot erstellen", "📋 Meine Chatbots", "ℹ️ Über die Platform"],
            index=0
        )
    
    if page == "🆕 Neuen Chatbot erstellen":
        show_create_chatbot_page()
    elif page == "📋 Meine Chatbots":
        show_chatbot_list_page()
    else:
        show_about_page()

def show_create_chatbot_page():
    """Zeigt die Chatbot-Erstellungsseite"""
    st.header("🆕 Neuen Chatbot erstellen")
    
    # Reset success buttons wenn eine neue Seite geladen wird
    if 'form_submitted' not in st.session_state:
        st.session_state.show_success_buttons = False
    
    with st.form("create_chatbot_form"):
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Basis-Konfiguration
            st.subheader("📝 Grundeinstellungen")
            name = st.text_input(
                "Chatbot Name *",
                placeholder="z.B. Kundenservice Bot, FAQ Assistent..."
            )
            description = st.text_area(
                "Beschreibung",
                placeholder="Beschreiben Sie, wofür dieser Chatbot verwendet wird..."
            )
        
        with col2:
            # Branding (Optional)
            st.subheader("🎨 Branding (Optional)")
            primary_color = st.color_picker("Primärfarbe", "#1f3a93")
            secondary_color = st.color_picker("Sekundärfarbe", "#34495e")
        
        # Datenquellen
        st.subheader("📊 Datenquellen")
        
        # Website URL
        website_url = st.text_input(
            "Website URL (Optional)",
            placeholder="https://example.com"
        )
        
        if website_url:
            st.info("💡 Die gesamte Website wird automatisch gescrapte und in den Chatbot integriert.")
        
        # Dokument Upload
        st.markdown("**Dokumente hochladen (Optional)**")
        uploaded_files = st.file_uploader(
            "Wählen Sie PDF, DOCX oder TXT Dateien",
            accept_multiple_files=True,
            type=['pdf', 'docx', 'txt', 'md']
        )
        
        if uploaded_files:
            st.success(f"✅ {len(uploaded_files)} Datei(en) ausgewählt")
            for file in uploaded_files:
                st.text(f"📄 {file.name} ({file.size} Bytes)")
        
        # Submit Button
        submitted = st.form_submit_button(
            "🚀 Chatbot erstellen",
            use_container_width=True,
            type="primary"
        )
        
        if submitted:
            # Validierung
            is_valid, error_message = validate_inputs(name, website_url, uploaded_files)
            
            if not is_valid:
                st.error(f"❌ {error_message}")
                return
            
            # Progress Setup
            st.session_state.progress_bar = st.progress(0)
            st.session_state.progress_text = st.empty()
            
            # Branding-Konfiguration
            branding = {
                "primary_color": primary_color,
                "secondary_color": secondary_color,
                "welcome_message": f"Hallo! Ich bin {name}, dein persönlicher Assistent."
            }
            
            # Chatbot erstellen
            with st.spinner("Chatbot wird erstellt..."):
                chatbot_id = chatbot_factory.create_chatbot(
                    name=name,
                    description=description,
                    website_url=website_url if website_url.strip() else None,
                    uploaded_documents=uploaded_files,
                    branding=branding,
                    progress_callback=show_progress_with_callback
                )
            
            # Cleanup Progress
            if 'progress_bar' in st.session_state:
                del st.session_state.progress_bar
            if 'progress_text' in st.session_state:
                del st.session_state.progress_text
            
            if chatbot_id:
                st.success(f"✅ Chatbot '{name}' erfolgreich erstellt!")
                st.info(f"🔗 Chatbot-ID: `{chatbot_id}`")
                
                # Speichere Chatbot-ID für außerhalb des Forms
                st.session_state.newly_created_chatbot_id = chatbot_id
                st.session_state.show_success_buttons = True
            else:
                st.error("❌ Fehler beim Erstellen des Chatbots. Bitte versuchen Sie es erneut.")
    
    # Erfolgs-Buttons außerhalb des Forms anzeigen
    if st.session_state.get('show_success_buttons', False):
        chatbot_id = st.session_state.get('newly_created_chatbot_id')
        
        st.markdown("---")
        st.markdown("### 🎉 Chatbot erfolgreich erstellt!")
        
        col1, col2 = st.columns([1, 1])
        with col1:
            if st.button("🤖 Chatbot jetzt öffnen", type="primary", key="open_new_chatbot"):
                st.session_state.selected_chatbot_id = chatbot_id
                st.session_state.show_success_buttons = False
                st.switch_page("pages/chatbot.py")
        
        with col2:
            if st.button("📋 Zu meinen Chatbots", type="secondary", key="view_all_chatbots"):
                st.session_state.show_success_buttons = False
                st.rerun()
        
        st.info("💡 Sie finden Ihren Chatbot auch unter 'Meine Chatbots' in der Sidebar.")

def show_chatbot_list_page():
    """Zeigt die Liste aller erstellten Chatbots"""
    st.header("📋 Meine Chatbots")
    
    chatbots = chatbot_factory.get_all_chatbots()
    
    if not chatbots:
        st.info("🤖 Noch keine Chatbots erstellt. Erstellen Sie Ihren ersten Chatbot!")
        if st.button("🆕 Ersten Chatbot erstellen"):
            st.rerun()
        return
    
    st.write(f"**{len(chatbots)} Chatbot(s) gefunden**")
    
    for chatbot in chatbots:
        config = chatbot["config"]
        rag_info = chatbot["rag_info"]
        
        with st.container():
            st.markdown(f"""
            <div class="chatbot-card">
                <h3>🤖 {config.name}</h3>
                <p><strong>Beschreibung:</strong> {config.description or 'Keine Beschreibung'}</p>
                <p><strong>Erstellt:</strong> {config.created_at[:19].replace('T', ' ')}</p>
                <p><strong>Datenquellen:</strong> {rag_info.get('total_chunks', 0)} Chunks</p>
            </div>
            """, unsafe_allow_html=True)
            
            col1, col2, col3, col4 = st.columns([2, 2, 2, 1])
            
            with col1:
                if st.button(f"💬 Chatbot öffnen", key=f"open_{config.id}"):
                    st.session_state.selected_chatbot_id = config.id
                    st.switch_page("pages/chatbot.py")
            
            with col2:
                chatbot_url = chatbot_factory.get_chatbot_url(config.id)
                st.write(f"🔗 [Direktlink]({chatbot_url})")
            
            with col3:
                st.write(f"**ID:** `{config.id}`")
            
            with col4:
                if st.button("🗑️", key=f"delete_{config.id}", help="Chatbot löschen"):
                    if chatbot_factory.delete_chatbot(config.id):
                        st.success("✅ Chatbot gelöscht!")
                        st.rerun()
                    else:
                        st.error("❌ Fehler beim Löschen!")
            
            st.markdown("---")

def show_about_page():
    """Zeigt Informationen über die Platform"""
    st.header("ℹ️ Über die PDF-to-Chatbot Platform")
    
    st.markdown("""
    ## 🚀 Was ist diese Platform?
    
    Diese Platform ermöglicht es Ihnen, schnell und einfach intelligente Chatbots zu erstellen, 
    die auf Ihren eigenen Daten basieren.
    
    ## 🔧 Features
    
    - **📄 Multi-Format Support**: PDF, DOCX, TXT und Markdown Dateien
    - **🌐 Website Integration**: Automatisches Scraping kompletter Websites
    - **🤖 KI-Powered**: Verwendet OpenAI Embeddings und fortschrittliche RAG-Technologie
    - **🎨 Anpassbar**: Individuelle Branding-Optionen für jeden Chatbot
    - **📊 Analytics**: Detaillierte Informationen über Datenquellen und Performance
    
    ## 🛠️ Technologie
    
    - **Frontend**: Streamlit
    - **AI/ML**: OpenAI Embeddings, FAISS Vector Search
    - **Dokument-Processing**: PyPDF2, python-docx, pdfplumber
    - **Web-Scraping**: Playwright, BeautifulSoup
    - **Datenbank**: Supabase (PostgreSQL)
    
    ## 📝 So funktioniert's
    
    1. **Daten hochladen**: PDF-Dateien oder Website-URL angeben
    2. **Verarbeitung**: Automatische Textextraktion und Chunking
    3. **Embeddings**: KI-basierte Vektorisierung für semantische Suche
    4. **Chatbot-Erstellung**: Intelligenter Assistent ist sofort einsatzbereit
    5. **Sharing**: Link teilen oder in Website einbetten
    
    ## 🔒 Datenschutz
    
    - Alle Daten werden sicher verarbeitet
    - GDPR-konforme Datenhaltung
    - Keine langfristige Speicherung sensibler Inhalte
    
    ---
    
    **Entwickelt auf Basis des VuBot-Projekts** 🤖
    """)

if __name__ == "__main__":
    main()