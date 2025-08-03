# pages/chatbot.py - Individual Chatbot Page

import sys
import os
from pathlib import Path

# Working directory setup
current_dir = Path(__file__).parent
parent_dir = current_dir.parent

import streamlit as st
from typing import List, Dict, Optional
import re
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

# Platform imports
from utils.chatbot_factory import chatbot_factory, ChatbotConfig
from utils.multi_source_rag import MultiSourceRAG
from supabase_service import supabase_chat_service
from device_id import get_device_id

load_dotenv()

# ─── LLM Configuration ──────────────────────────────────────────────────────────
ROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
ROUTER_API_BASE = "https://openrouter.ai/api/v1"
LLM_MODEL = "tngtech/deepseek-r1t2-chimera:free"

router_client = OpenAI(
    api_key=ROUTER_API_KEY,
    base_url=ROUTER_API_BASE,
)

def setup_page_config():
    """Konfiguriert die Streamlit-Seite"""
    st.set_page_config(
        page_title="🤖 Chatbot",
        page_icon="🤖",
        layout="centered"
    )

def get_custom_css(config: ChatbotConfig) -> str:
    """Generiert Custom CSS basierend auf erweiterter Branding-Konfiguration"""
    primary_color = config.branding.get("primary_color", "#1f3a93")
    secondary_color = config.branding.get("secondary_color", "#34495e")
    accent_color = config.branding.get("accent_color", "#e74c3c")
    
    return f"""
    <style>
    /* Dark Theme */
    [data-testid="stAppViewContainer"] {{
        background-color: #0e1117;
        color: #e1e1e1;
    }}
    [data-testid="stSidebar"] {{
        background-color: #171924;
        color: #e1e1e1;
    }}
    [data-testid="stHeader"] {{
        background-color: #0e1117;
    }}

    /* Chat Input Styling */
    [data-testid="stChatInput"] > div:first-child {{
        box-shadow: inset 0 0 0 1px #ffffff !important;
        border-radius: 24px !important;
    }}

    textarea[data-testid="stChatInputTextArea"] {{
        color: #ffffff !important;
        background-color: transparent !important;
    }}

    textarea[data-testid="stChatInputTextArea"]::placeholder {{
        color: #aaaaaa !important;
    }}

    /* User Message Bubble */
    .user-message {{
        background: linear-gradient(135deg, {primary_color}, {secondary_color});
        color: white;
        padding: 12px 16px;
        border-radius: 20px 20px 5px 20px;
        max-width: 70%;
        margin-left: auto;
        margin-right: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        font-size: 14px;
        line-height: 1.4;
    }}

    /* Assistant Message Bubble */
    .assistant-message {{
        background: #2e303e;
        color: #e1e1e1;
        padding: 12px 16px;
        border-radius: 20px 20px 20px 5px;
        max-width: 70%;
        border: 1px solid #333;
        box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        font-size: 14px;
        line-height: 1.4;
    }}

    /* Header Styling */
    .chatbot-header {{
        background: linear-gradient(135deg, {primary_color}, {secondary_color});
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        text-align: center;
        color: white;
    }}

    .chatbot-header h1 {{
        margin: 0;
        font-size: 2.5rem;
        font-weight: bold;
    }}

    .chatbot-header p {{
        margin: 10px 0 0 0;
        font-size: 1.2rem;
        opacity: 0.9;
    }}

    /* Source Attribution */
    .source-attribution {{
        background: #1e1f26;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 8px 12px;
        margin-top: 8px;
        font-size: 12px;
        color: #b8b8b8;
    }}

    .source-attribution strong {{
        color: #e1e1e1;
    }}
    </style>
    """

def get_base64_image(image_path):
    """Konvertiert Bild zu base64 für HTML-Einbettung"""
    try:
        import base64
        with open(str(parent_dir / image_path), "rb") as img_file:
            return base64.b64encode(img_file.read()).decode()
    except:
        return ""

def display_chat_message_with_sources(role: str, content: str, sources: List[Dict] = None, config: ChatbotConfig = None):
    """Zeigt Chat-Nachricht mit Quellenangaben und Logo als Avatar"""
    if role == "user":
        st.markdown(f"""
        <div style="display: flex; justify-content: flex-end; margin: 10px 0; align-items: flex-end;">
            <div class="user-message">
                {content}
            </div>
            <div style="width: 40px; height: 40px; background-color: #e67e22; border-radius: 50%; 
                        display: flex; align-items: center; justify-content: center; 
                        font-size: 18px; color: white; flex-shrink: 0;">
                👤
            </div>
        </div>
        """, unsafe_allow_html=True)
    else:
        # Bot Avatar - verwende Logo falls vorhanden
        avatar_img = ""
        logo_url = None
        
        if config and config.branding:
            logo_url = config.branding.get('logo_url')
        
        if logo_url and Path(logo_url).exists():
            # Verwende hochgeladenes Logo
            try:
                import base64
                with open(logo_url, "rb") as img_file:
                    logo_base64 = base64.b64encode(img_file.read()).decode()
                    avatar_img = f'<img src="data:image/png;base64,{logo_base64}" style="width: 35px; height: 35px; object-fit: cover; border-radius: 50%;">'
            except:
                avatar_img = "🤖"
        else:
            # Fallback: Auto-generierte Initialen oder Standard-Icon
            if config:
                company_name = config.branding.get('company_name', config.name)
                initials = ''.join([word[0].upper() for word in company_name.split()[:2]])
                primary_color = config.branding.get('primary_color', '#1f3a93')
                avatar_img = f'<div style="font-size: 14px; font-weight: bold; color: white;">{initials}</div>'
            else:
                avatar_img = "🤖"

        sources_html = _render_sources(sources) if sources else ""
        
        # Verwende Primärfarbe für Avatar-Hintergrund
        bg_color = "#1e1f26"
        if config and config.branding:
            bg_color = config.branding.get('primary_color', '#1e1f26')
        
        st.markdown(f"""
        <div style="display: flex; justify-content: flex-start; margin: 10px 0; align-items: flex-start;">
            <div style="width: 40px; height: 40px; background: {bg_color}; border-radius: 50%; 
                        display: flex; align-items: center; justify-content: center; 
                        border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0; margin-right: 8px;">
                {avatar_img}
            </div>
            <div>
                <div class="assistant-message">
                    {content}
                </div>
                {sources_html}
            </div>
        </div>
        """, unsafe_allow_html=True)

def _render_sources(sources: List[Dict]) -> str:
    """Rendert Quellenangaben als HTML"""
    if not sources:
        return ""
    
    source_html = '<div class="source-attribution"><strong>Quellen:</strong><br>'
    
    for source in sources[:3]:  # Maximal 3 Quellen anzeigen
        source_type = source.get("source_type", "unknown")
        source_name = source.get("source_name", "unknown")
        
        if source_type == "document":
            file_type = source.get("file_type", "")
            source_html += f"📄 {source_name} ({file_type.upper()})<br>"
        elif source_type == "website":
            source_html += f"🌐 {source_name}<br>"
        else:
            source_html += f"📋 {source_name}<br>"
    
    source_html += "</div>"
    return source_html

def build_system_prompt_for_chatbot(config: ChatbotConfig, context: List[Dict], user_question: str, chat_history: List[Dict] = None) -> List[Dict]:
    """Baut System-Prompt für spezifischen Chatbot"""
    
    # Lade erweiterte Konfiguration für Kontaktpersonen
    extended_config = load_extended_config(config)
    contact_persons = extended_config.get('contact_persons', [])
    
    system_prompt = f"""Du bist {config.name}, ein professioneller KI-Kundenberater.

WICHTIGE VERHALTENSREGELN:
• Antworte SOFORT und DIREKT auf die Frage - keine internen Gedankenprozesse!
• Verwende AUSSCHLIESSLICH die bereitgestellten Informationen
• Antworte in höflichem, professionellem Deutsch
• Gib konkrete, hilfreiche Antworten ohne Wiederholungen
• Bei Tests oder "test"-Eingaben: Bestätige kurz deine Funktionsfähigkeit

DEINE ROLLE:
• Name: {config.name}
• Beschreibung: {config.description}
• Mission: Exzellenter Kundenservice und kompetente Beratung

WAS DU TUN SOLLST:
✅ Direkt auf Fragen antworten ohne Umwege
✅ Konkrete Informationen aus dem Kontext verwenden
✅ Bei fehlenden Infos: Alternative Hilfe anbieten
✅ Freundlich und serviceorientiert bleiben
✅ Kurze, präzise Antworten geben

WAS DU NICHT TUN DARFST:
❌ Interne Denkprozesse zeigen ("Ich muss...", "Basierend auf...")
❌ Informationen erfinden oder spekulieren
❌ Lange Erklärungen über deine Grenzen
❌ Antworten verweigern ohne Alternative zu bieten

BEI FEHLENDEN INFORMATIONEN:
Sage höflich: "Diese spezifische Information habe ich nicht verfügbar. Gerne kann ich Ihnen jedoch bei [verwandte Themen] helfen, oder Sie kontaktieren uns direkt für detaillierte Beratung."

ANTWORTE IMMER DIREKT UND PROFESSIONELL!"""

    ctx_text = "\n\n---\n\n".join(c["text"] for c in context)
    
    # Build messages array
    messages = [{"role": "system", "content": system_prompt}]
    
    # Chat-Historie hinzufügen (letzte 8 Nachrichten)
    if chat_history:
        messages.extend(chat_history[-8:])
    
    # Aktueller RAG-Kontext
    user_content = (
        f"Frage:\n{user_question}\n\n"
        "Verfügbare Informationen:\n"
        f"{ctx_text}\n\n"
        "Antwort:"
    )
    messages.append({"role": "user", "content": user_content})
    
    return messages

def load_extended_config(config: ChatbotConfig) -> dict:
    """Lädt erweiterte Konfiguration aus den gespeicherten Branding-Daten"""
    
    if not config.branding:
        return {}
    
    # Lade alle erweiterten Daten aus dem Branding-Feld
    extended_config = {
        'email_capture_enabled': config.branding.get('email_capture_enabled', False),
        'email_capture_config': config.branding.get('email_capture_config', {}),
        'contact_persons_enabled': config.branding.get('contact_persons_enabled', False),
        'contact_persons': config.branding.get('contact_persons', []),
        'contact_trigger_config': config.branding.get('contact_trigger_config', {}),
        'company_info': config.branding.get('company_info', {}),
        'business_hours': config.branding.get('business_hours', {}),
        'behavior_settings': config.branding.get('behavior_settings', {}),
        'logo_url': config.branding.get('logo_url')
    }
    
    return extended_config

def ask_chatbot(chatbot_id: str, question: str, conversation_id: str = None) -> tuple[str, List[Dict]]:
    """Stellt Frage an spezifischen Chatbot"""
    try:
        # Lade Chatbot-Konfiguration
        config = chatbot_factory.load_chatbot_config(chatbot_id)
        if not config:
            return "❌ Chatbot nicht gefunden.", []
        
        # Lade RAG-System
        rag_system = MultiSourceRAG(chatbot_id)
        
        # Chat-Historie abrufen
        chat_history = []
        if conversation_id:
            recent_messages = supabase_chat_service.get_recent_messages(conversation_id, limit=8)
            chat_history = [
                {"role": msg["role"], "content": msg["content"]} 
                for msg in recent_messages
            ]
        
        # Relevante Chunks abrufen
        relevant_chunks = rag_system.retrieve_chunks(question, top_k=5)
        
        if not relevant_chunks:
            # Bessere Fallback-Strategie
            fallback_msg = f"Diese spezifische Information habe ich nicht verfügbar. "
            
            # Kontaktpersonen aus Config laden falls vorhanden
            extended_config = load_extended_config(config)
            contact_persons = extended_config.get('contact_persons', [])
            
            if contact_persons:
                fallback_msg += f"Gerne können Sie sich direkt an unsere Fachberater wenden oder "
            
            fallback_msg += "versuchen Sie eine andere Formulierung Ihrer Frage. Ich helfe gerne weiter!"
            
            return fallback_msg, []
        
        # Build messages für LLM
        messages = build_system_prompt_for_chatbot(config, relevant_chunks, question, chat_history)
        
        # LLM-Call mit optimierten Parametern
        response = router_client.chat.completions.create(
            model=LLM_MODEL,
            messages=messages,
            temperature=0.1,  # Niedrigere Temperature für konsistentere Antworten
            max_tokens=800,   # Mehr Tokens für vollständige Antworten
        )
        
        answer = response.choices[0].message.content.strip()
        
        return answer, relevant_chunks
        
    except Exception as e:
        return f"❌ Entschuldigung, ein Fehler ist aufgetreten: {str(e)}", []

def render_company_header(config: ChatbotConfig):
    """Rendert erweiterten Company Header mit Unternehmensdaten"""
    
    # Lade erweiterte Konfiguration
    extended_config = load_extended_config(config)
    company_info = extended_config.get('company_info', {})
    
    # Extrahiere Unternehmensdaten
    company_name = company_info.get('company_name', config.name)
    primary_color = config.branding.get("primary_color", "#1f3a93")
    secondary_color = config.branding.get("secondary_color", "#34495e")
    logo_url = extended_config.get('logo_url')
    
    # Header mit Logo-Bereich
    col1, col2, col3 = st.columns([1, 3, 1])
    
    with col1:
        # Logo-Bereich
        if logo_url and Path(logo_url).exists():
            st.image(logo_url, width=80)
        else:
            # Auto-generierte Initialen als Fallback
            initials = ''.join([word[0].upper() for word in company_name.split()[:2]])
            st.markdown(f"""
            <div style="
                width: 80px; 
                height: 80px; 
                background: linear-gradient(135deg, {primary_color}, {secondary_color});
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
                margin: 0 auto;
                border: 3px solid rgba(255,255,255,0.2);
            ">{initials}</div>
            """, unsafe_allow_html=True)
    
    with col2:
        # Unternehmensinfo
        st.markdown(f"""
        <div class="chatbot-header">
            <h1>🤖 {config.name}</h1>
            <p>{company_name}</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        # Zurück-Button
        if st.button("🏠 Zurück"):
            st.switch_page("app.py")

def render_contact_persons_sidebar(config: ChatbotConfig):
    """Rendert Kontaktpersonen in der Sidebar (falls aktiviert)"""
    
    # Lade erweiterte Konfiguration
    extended_config = load_extended_config(config)
    contact_persons_enabled = extended_config.get('contact_persons_enabled', False)
    contact_persons = extended_config.get('contact_persons', [])
    
    if contact_persons_enabled:
        with st.sidebar:
            st.markdown("### 👥 Ansprechpartner")
            
            # Verwende echte Kontaktpersonen oder Beispieldaten
            if contact_persons:
                contacts_to_show = contact_persons
            else:
                # Fallback: Beispiel-Kontaktpersonen
                contacts_to_show = [
                    {
                        "name": "Max Mustermann",
                        "position": "Kundenberater", 
                        "email": "max@beispiel.de",
                        "specialization": "Produktberatung"
                    },
                    {
                        "name": "Anna Schmidt",
                        "position": "Support",
                        "email": "anna@beispiel.de", 
                        "specialization": "Technischer Support"
                    }
                ]
            
            for contact in contacts_to_show:
                with st.expander(f"👤 {contact['name']}"):
                    st.write(f"**Position:** {contact['position']}")
                    st.write(f"**Spezialisierung:** {contact['specialization']}")
                    
                    if st.button(f"📧 Kontakt aufnehmen", key=f"contact_{contact['name']}"):
                        st.success(f"Kontaktanfrage an {contact['name']} gesendet!")
                        # Hier würde die Email-Funktion implementiert werden

def render_email_capture_prompt(config: ChatbotConfig, chatbot_id: str):
    """Rendert Email-Capture-Prompt (falls aktiviert und Bedingungen erfüllt)"""
    
    # Lade erweiterte Konfiguration
    extended_config = load_extended_config(config)
    email_capture_enabled = extended_config.get('email_capture_enabled', False)
    
    if email_capture_enabled:
        # Prüfe Trigger-Bedingungen (z.B. Anzahl Nachrichten)
        message_count = len(st.session_state.get(f"messages_{chatbot_id}", []))
        
        # Zeige Email-Capture nach 3 Nachrichten
        if message_count >= 3 and not st.session_state.get(f"email_captured_{chatbot_id}", False):
            st.markdown("---")
            st.markdown("### 📧 Bleiben wir in Kontakt")
            
            email_prompt = "Für detaillierte Informationen können Sie gerne Ihre Email-Adresse hinterlassen."
            st.info(email_prompt)
            
            col1, col2 = st.columns([2, 1])
            
            with col1:
                email = st.text_input(
                    "Email-Adresse", 
                    placeholder="ihre.email@beispiel.de",
                    key=f"email_capture_{chatbot_id}"
                )
            
            with col2:
                if st.button("📧 Absenden", key=f"submit_email_{chatbot_id}"):
                    if email and "@" in email:
                        # Hier würde die Email in die Datenbank gespeichert werden
                        st.session_state[f"email_captured_{chatbot_id}"] = True
                        st.success("Vielen Dank! Wir werden uns bei Ihnen melden.")
                        st.rerun()
                    else:
                        st.error("Bitte geben Sie eine gültige Email-Adresse ein.")

def render_business_hours_info(config: ChatbotConfig):
    """Rendert Öffnungszeiten-Info (falls konfiguriert)"""
    
    # Lade erweiterte Konfiguration
    extended_config = load_extended_config(config)
    business_hours = extended_config.get('business_hours', {})
    
    if business_hours and any(business_hours.values()):
        with st.sidebar:
            st.markdown("### 🕒 Öffnungszeiten")
            
            # Zeige echte Öffnungszeiten
            days_german = {
                'monday': 'Montag',
                'tuesday': 'Dienstag', 
                'wednesday': 'Mittwoch',
                'thursday': 'Donnerstag',
                'friday': 'Freitag',
                'saturday': 'Samstag',
                'sunday': 'Sonntag'
            }
            
            hours_text = ""
            for day_en, day_de in days_german.items():
                if day_en in business_hours:
                    day_info = business_hours[day_en]
                    if day_info.get('closed', False):
                        hours_text += f"**{day_de}:** Geschlossen\n"
                    else:
                        start = day_info.get('start', '09:00')
                        end = day_info.get('end', '17:00')
                        hours_text += f"**{day_de}:** {start} - {end}\n"
            
            if hours_text:
                st.info(hours_text)
            else:
                # Fallback
                st.info("**Mo-Fr:** 09:00 - 17:00\n**Sa-So:** Geschlossen")

def main():
    # Chatbot-ID aus Session State oder URL Parameter
    if "selected_chatbot_id" not in st.session_state:
        st.error("❌ Kein Chatbot ausgewählt!")
        if st.button("🏠 Zurück zur Hauptseite"):
            st.switch_page("app.py")
        return
    
    chatbot_id = st.session_state.selected_chatbot_id
    
    # Lade Chatbot-Konfiguration
    config = chatbot_factory.load_chatbot_config(chatbot_id)
    if not config:
        st.error(f"❌ Chatbot mit ID '{chatbot_id}' nicht gefunden!")
        if st.button("🏠 Zurück zur Hauptseite"):
            st.switch_page("app.py")
        return
    
    # Page Setup
    setup_page_config()
    st.markdown(get_custom_css(config), unsafe_allow_html=True)
    
    # Erweiterte UI-Komponenten
    render_company_header(config)
    render_contact_persons_sidebar(config)
    render_business_hours_info(config)
    
    # Session State Initialisierung
    if "device_id" not in st.session_state:
        st.session_state.device_id = get_device_id()
    
    if f"messages_{chatbot_id}" not in st.session_state:
        st.session_state[f"messages_{chatbot_id}"] = []
    
    if f"current_conversation_{chatbot_id}" not in st.session_state:
        st.session_state[f"current_conversation_{chatbot_id}"] = None
    
    # Supabase-Verbindung für Chat-Persistenz (Optional)
    if f"supabase_initialized_{chatbot_id}" not in st.session_state:
        try:
            with st.spinner("Verbindung zur Datenbank..."):
                if supabase_chat_service.ensure_connection():
                    conversation = supabase_chat_service.get_or_create_conversation(
                        device_id=st.session_state.device_id,
                        title=f"Chat mit {config.name}"
                    )
                    if conversation:
                        st.session_state[f"current_conversation_{chatbot_id}"] = conversation
                        messages = supabase_chat_service.get_conversation_messages(conversation['id'])
                        st.session_state[f"messages_{chatbot_id}"] = [
                            {"role": msg["role"], "content": msg["content"], "sources": []}
                            for msg in messages
                        ]
                        st.session_state[f"supabase_initialized_{chatbot_id}"] = True
                    else:
                        st.session_state[f"supabase_initialized_{chatbot_id}"] = False
                else:
                    st.session_state[f"supabase_initialized_{chatbot_id}"] = False
        except Exception as e:
            # Supabase-Fehler abfangen und lokalen Modus verwenden
            st.session_state[f"supabase_initialized_{chatbot_id}"] = False
    
    # Begrüßungsnachricht (nur beim ersten Besuch)
    if not st.session_state[f"messages_{chatbot_id}"]:
        welcome_message = config.branding.get("welcome_message", f"Hallo! Ich bin {config.name}, dein persönlicher Assistent.")
        st.session_state[f"messages_{chatbot_id}"].append({
            "role": "assistant", 
            "content": welcome_message,
            "sources": []
        })
    
    # Chat Interface
    conversation_id = None
    if st.session_state[f"current_conversation_{chatbot_id}"]:
        conversation_id = st.session_state[f"current_conversation_{chatbot_id}"]["id"]
    
    # Chat History anzeigen
    for msg in st.session_state[f"messages_{chatbot_id}"]:
        display_chat_message_with_sources(
            msg["role"], 
            msg["content"], 
            msg.get("sources", []), 
            config
        )
    
    # Chat Input
    if user_input := st.chat_input(f"Stellen Sie Ihre Frage an {config.name}..."):
        # User-Nachricht hinzufügen
        st.session_state[f"messages_{chatbot_id}"].append({
            "role": "user", 
            "content": user_input,
            "sources": []
        })
        display_chat_message_with_sources("user", user_input, config=config)
        
        # Bot-Antwort generieren
        with st.spinner("Antwort wird generiert..."):
            try:
                answer, sources = ask_chatbot(chatbot_id, user_input, conversation_id)
                
                st.session_state[f"messages_{chatbot_id}"].append({
                    "role": "assistant", 
                    "content": answer,
                    "sources": sources
                })
                display_chat_message_with_sources("assistant", answer, sources, config)
                
                # In Supabase speichern (falls verfügbar)
                if conversation_id and st.session_state.get(f"supabase_initialized_{chatbot_id}", False):
                    try:
                        supabase_chat_service.add_message(conversation_id, "user", user_input)
                        source_context = "; ".join(s.get("source_name", "unknown") for s in sources)
                        supabase_chat_service.add_message(conversation_id, "assistant", answer, source_context)
                    except Exception as e:
                        # Supabase-Fehler ignorieren, Chat funktioniert trotzdem
                        pass
                
            except Exception as e:
                error_msg = f"Entschuldigung, ein Fehler ist aufgetreten: {e}"
                st.error(error_msg)
                st.session_state[f"messages_{chatbot_id}"].append({
                    "role": "assistant", 
                    "content": error_msg,
                    "sources": []
                })
    
    # Email-Capture (falls aktiviert und Bedingungen erfüllt)
    render_email_capture_prompt(config, chatbot_id)
    
    # Sidebar mit Chatbot-Info
    with st.sidebar:
        st.markdown("### ℹ️ Chatbot-Info")
        st.write(f"**Name:** {config.name}")
        st.write(f"**ID:** `{config.id}`")
        st.write(f"**Erstellt:** {config.created_at[:10]}")
        
        # RAG-Info
        try:
            rag_system = MultiSourceRAG(chatbot_id)
            rag_info = rag_system.get_chatbot_info()
            
            st.markdown("### 📊 Datenquellen")
            st.write(f"**Gesamt Chunks:** {rag_info.get('total_chunks', 0)}")
            
            sources = rag_info.get('sources', {})
            for source_type, source_data in sources.items():
                st.write(f"**{source_type.title()}:**")
                for name, count in source_data.items():
                    st.write(f"  • {name}: {count} Chunks")
                    
        except Exception as e:
            st.write("⚠️ Datenquellen-Info nicht verfügbar")
        
        st.markdown("---")
        if st.button("🏠 Zurück zur Hauptseite"):
            if "selected_chatbot_id" in st.session_state:
                del st.session_state.selected_chatbot_id
            st.switch_page("app.py")
        
        if st.button("🗑️ Chat-Verlauf löschen"):
            st.session_state[f"messages_{chatbot_id}"] = []
            st.rerun()

if __name__ == "__main__":
    main()