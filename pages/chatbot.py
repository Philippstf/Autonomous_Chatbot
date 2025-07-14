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
LLM_MODEL = "mistralai/mistral-small-3.2-24b-instruct:free"

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
    """Generiert Custom CSS basierend auf Branding"""
    primary_color = config.branding.get("primary_color", "#1f3a93")
    secondary_color = config.branding.get("secondary_color", "#34495e")
    
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

def display_chat_message_with_sources(role: str, content: str, sources: List[Dict] = None, avatar_path: str = None):
    """Zeigt Chat-Nachricht mit Quellenangaben"""
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
        avatar_img = ""
        if avatar_path:
            avatar_img = f'<img src="data:image/png;base64,{get_base64_image(avatar_path)}" style="width: 30px; height: 30px; object-fit: contain;">'
        else:
            avatar_img = "🤖"

        sources_html = _render_sources(sources) if sources else ""
        st.markdown(f"""
        <div style="display: flex; justify-content: flex-start; margin: 10px 0; align-items: flex-start;">
            <div style="width: 40px; height: 40px; background-color: #1e1f26; border-radius: 50%; 
                        display: flex; align-items: center; justify-content: center; 
                        border: 1px solid #333; flex-shrink: 0; margin-right: 8px;">
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
    
    system_prompt = f"""Du bist {config.name}, ein freundlicher und hilfreicher KI-Assistent.

Deine Aufgabe:
• Beantworte Fragen basierend auf den bereitgestellten Informationen
• Antworte stets präzise, empathisch und serviceorientiert
• Gib klare, knapp formulierte Antworten in Deutsch
• Wenn Details fehlen, bitte proaktiv um genauere Angaben
• Bewahre stets einen professionellen, aber sympathischen Ton
• Berücksichtige den Gesprächsverlauf und beziehe dich auf vorherige Nachrichten wenn relevant

Über dich:
• Name: {config.name}
• Beschreibung: {config.description}
• Begrüßung: {config.branding.get('welcome_message', f'Hallo! Ich bin {config.name}.')}

Nutze nur die folgenden kontextuellen Informationen. 
Wenn Du die Antwort nicht findest, entschuldige Dich kurz und erkläre deine Grenzen."""

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
            return f"Entschuldigung, ich konnte keine relevanten Informationen zu Ihrer Frage finden. Können Sie Ihre Frage anders formulieren?", []
        
        # Build messages für LLM
        messages = build_system_prompt_for_chatbot(config, relevant_chunks, question, chat_history)
        
        # LLM-Call
        response = router_client.chat.completions.create(
            model=LLM_MODEL,
            messages=messages,
            temperature=0.2,
            max_tokens=512,
        )
        
        answer = response.choices[0].message.content.strip()
        
        return answer, relevant_chunks
        
    except Exception as e:
        return f"❌ Entschuldigung, ein Fehler ist aufgetreten: {str(e)}", []

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
    
    # Header
    st.markdown(f"""
    <div class="chatbot-header">
        <h1>🤖 {config.name}</h1>
        <p>{config.description}</p>
    </div>
    """, unsafe_allow_html=True)
    
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
        avatar = "assets/W_transparent.png" if msg["role"] == "assistant" else None
        display_chat_message_with_sources(
            msg["role"], 
            msg["content"], 
            msg.get("sources", []), 
            avatar
        )
    
    # Chat Input
    if user_input := st.chat_input(f"Stellen Sie Ihre Frage an {config.name}..."):
        # User-Nachricht hinzufügen
        st.session_state[f"messages_{chatbot_id}"].append({
            "role": "user", 
            "content": user_input,
            "sources": []
        })
        display_chat_message_with_sources("user", user_input)
        
        # Bot-Antwort generieren
        with st.spinner("Antwort wird generiert..."):
            try:
                answer, sources = ask_chatbot(chatbot_id, user_input, conversation_id)
                
                st.session_state[f"messages_{chatbot_id}"].append({
                    "role": "assistant", 
                    "content": answer,
                    "sources": sources
                })
                display_chat_message_with_sources("assistant", answer, sources, "assets/W_transparent.png")
                
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