# Extended Chatbot Platform - Multi-Step Configuration Wizard
# Version 2.0 - Business Features & Professional Setup

import sys
import os
from pathlib import Path
import streamlit as st
import uuid
import json
import time
from typing import List, Dict, Optional
from datetime import datetime, time as dt_time
from dotenv import load_dotenv
import re

# Platform Imports
from utils.chatbot_factory import chatbot_factory, ChatbotConfig
from utils.pdf_processor import document_processor

load_dotenv()

# ─── Page Configuration ─────────────────────────────────────────────────────
st.set_page_config(
    page_title="🚀 Chatbot Platform - Professional Setup",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─── Custom CSS für erweiterte Platform ─────────────────────────────────────
st.markdown("""
<style>
/* Dark Theme & Professional Design */
[data-testid="stAppViewContainer"] {
    background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
    color: #e1e1e1;
}
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #171924 0%, #1f2937 100%);
    color: #e1e1e1;
}
[data-testid="stHeader"] {
    background-color: transparent;
}

/* Progress Indicator Styling */
.progress-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 30px 20px;
    margin-bottom: 40px;
    background: linear-gradient(135deg, rgba(31, 58, 147, 0.1), rgba(52, 73, 94, 0.1));
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow-x: auto;
    min-height: 120px;
}
.progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
    min-width: 100px;
    margin: 0 5px;
}
.progress-step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 25px;
    left: calc(50% + 25px);
    width: calc(100% - 50px);
    height: 3px;
    background: linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
    z-index: 1;
    border-radius: 2px;
}
.progress-step.completed::after {
    background: linear-gradient(90deg, #28a745, #20c997);
}
.progress-step.active::after {
    background: linear-gradient(90deg, #28a745 50%, rgba(255,255,255,0.2) 50%);
}

/* Responsive progress bar for small screens */
@media (max-width: 768px) {
    .progress-container {
        padding: 20px 10px;
        flex-wrap: wrap;
        justify-content: center;
        gap: 20px;
    }
    .progress-step {
        min-width: 80px;
        margin: 10px;
    }
    .progress-step:not(:last-child)::after {
        display: none;
    }
}
.step-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    z-index: 2;
    position: relative;
    border: 2px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
}
.step-circle.completed {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    border-color: #28a745;
    box-shadow: 0 0 20px rgba(40, 167, 69, 0.4);
}
.step-circle.active {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    border-color: #007bff;
    box-shadow: 0 0 20px rgba(0, 123, 255, 0.4);
    animation: pulse 2s infinite;
}
@keyframes pulse {
    0% { box-shadow: 0 0 20px rgba(0, 123, 255, 0.4); }
    50% { box-shadow: 0 0 30px rgba(0, 123, 255, 0.6); }
    100% { box-shadow: 0 0 20px rgba(0, 123, 255, 0.4); }
}
.step-title {
    margin-top: 12px;
    font-size: 12px;
    text-align: center;
    color: #9ca3af;
    font-weight: 500;
    max-width: 100px;
    line-height: 1.3;
    word-wrap: break-word;
}
.step-title.active {
    color: #3b82f6;
    font-weight: 600;
}
.step-title.completed {
    color: #10b981;
    font-weight: 600;
}
.step-title strong {
    display: block;
    margin-bottom: 4px;
    font-size: 13px;
}
.step-title small {
    font-size: 10px;
    opacity: 0.8;
    line-height: 1.2;
}

/* Enhanced Cards */
.config-card {
    background: linear-gradient(135deg, rgba(31, 58, 147, 0.1), rgba(52, 73, 94, 0.1));
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    margin: 16px 0;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}
.config-card:hover {
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
    transform: translateY(-2px);
}

/* Form Enhancements */
.stSelectbox > div > div {
    background-color: rgba(31, 41, 55, 0.8) !important;
    border: 1px solid rgba(75, 85, 99, 0.5) !important;
    border-radius: 8px !important;
}
.stTextInput > div > div > input {
    background-color: rgba(31, 41, 55, 0.8) !important;
    border: 1px solid rgba(75, 85, 99, 0.5) !important;
    border-radius: 8px !important;
    color: #e1e1e1 !important;
}
.stTextArea > div > div > textarea {
    background-color: rgba(31, 41, 55, 0.8) !important;
    border: 1px solid rgba(75, 85, 99, 0.5) !important;
    border-radius: 8px !important;
    color: #e1e1e1 !important;
}

/* Color Preview */
.color-preview {
    background: linear-gradient(135deg, var(--primary-color, #1f3a93), var(--secondary-color, #34495e));
    padding: 20px;
    border-radius: 12px;
    color: white;
    margin: 15px 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Business Hours Grid */
.business-hours-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr 2fr;
    gap: 12px;
    align-items: center;
    padding: 12px;
    background: rgba(31, 41, 55, 0.3);
    border-radius: 8px;
    margin: 8px 0;
    border: 1px solid rgba(75, 85, 99, 0.3);
}

/* Navigation Buttons */
.nav-button-container {
    display: flex;
    justify-content: space-between;
    padding: 20px 0;
    margin-top: 40px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Success Message Styling */
.success-message {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    color: #10b981;
}

/* Contact Person Card */
.contact-card {
    background: rgba(31, 41, 55, 0.6);
    border: 1px solid rgba(75, 85, 99, 0.5);
    border-radius: 12px;
    padding: 16px;
    margin: 8px 0;
    transition: all 0.3s ease;
}
.contact-card:hover {
    border-color: rgba(59, 130, 246, 0.5);
    transform: translateY(-1px);
}

/* Header Gradient */
.platform-header {
    background: linear-gradient(135deg, #1f3a93, #34495e, #e74c3c);
    padding: 3rem 2rem;
    border-radius: 20px;
    margin-bottom: 3rem;
    text-align: center;
    color: white;
    position: relative;
    overflow: hidden;
}
.platform-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
}
.platform-header h1 {
    margin: 0;
    font-size: 3rem;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    position: relative;
    z-index: 1;
}
.platform-header p {
    margin: 15px 0 0 0;
    font-size: 1.3rem;
    opacity: 0.95;
    position: relative;
    z-index: 1;
}
</style>
""", unsafe_allow_html=True)

# ─── Session State Initialization ───────────────────────────────────────────
def initialize_session_state():
    """Initialisiert Session State für Multi-Step Wizard"""
    if 'current_step' not in st.session_state:
        st.session_state.current_step = 0
    
    if 'chatbot_config' not in st.session_state:
        st.session_state.chatbot_config = {
            # Basic Settings
            'name': '',
            'description': '',
            'tags': [],
            
            # Branding
            'branding': {
                'primary_color': '#1f3a93',
                'secondary_color': '#34495e',
                'accent_color': '#e74c3c',
                'background_color': '#f8f9fa',
                'text_color': '#2c3e50',
                'font_family': 'Roboto',
                'font_size': 'Normal',
                'chat_width': 'Normal (800px)',
                'message_style': 'Sprechblasen'
            },
            
            # Company Info
            'company_info': {
                'company_name': '',
                'industry': '',
                'company_size': '',
                'website': '',
                'email': '',
                'phone': '',
                'address': {
                    'street': '',
                    'zip_code': '',
                    'city': '',
                    'country': 'Deutschland'
                },
                'business_hours': {},
                'social_media': {
                    'linkedin': '',
                    'facebook': '',
                    'instagram': '',
                    'twitter': '',
                    'youtube': '',
                    'xing': ''
                }
            },
            
            # Features
            'features': {
                'email_capture': {
                    'enabled': False,
                    'after_messages': 3,
                    'after_duration': 2,
                    'trigger_keywords': ['preise', 'angebot', 'kontakt', 'beratung', 'demo'],
                    'prompts': {
                        'initial': 'Für detaillierte Informationen können Sie gerne Ihre Email-Adresse hinterlassen.',
                        'follow_up': 'Falls Sie später doch Interesse haben, können Sie jederzeit nach Kontaktmöglichkeiten fragen.',
                        'thank_you': 'Vielen Dank! Wir werden uns zeitnah bei Ihnen melden.'
                    },
                    'require_consent': True,
                    'max_requests': 1
                },
                'contact_persons': {
                    'enabled': False,
                    'display_style': 'Karten',
                    'max_shown': 3,
                    'trigger_keywords': ['ansprechpartner', 'kontakt', 'verkauf', 'beratung', 'mitarbeiter'],
                    'show_after_messages': 5
                },
                'behavior': {
                    'tone': 'Professionell',
                    'length': 'Mittel',
                    'formality': 'Sie (förmlich)',
                    'language': 'Deutsch',
                    'fallback_language': 'Englisch',
                    'auto_translate': False,
                    'custom_instructions': '',
                    'forbidden_topics': []
                }
            },
            
            # Contact Persons
            'contact_persons': [],
            
            # Data Sources
            'data_sources': {
                'website_url': '',
                'uploaded_files': [],
                'manual_text': ''
            }
        }
    
    if 'uploaded_logo' not in st.session_state:
        st.session_state.uploaded_logo = None

# ─── Wizard Steps Configuration ─────────────────────────────────────────────
WIZARD_STEPS = [
    {"id": "basic", "title": "Grundeinstellungen", "icon": "📋", "description": "Name und Beschreibung"},
    {"id": "branding", "title": "Design & Branding", "icon": "🎨", "description": "Logo, Farben, Stil"},
    {"id": "company", "title": "Unternehmensdaten", "icon": "🏢", "description": "Kontakt, Öffnungszeiten"},
    {"id": "features", "title": "Features & Verhalten", "icon": "⚡", "description": "Email-Capture, Verhalten"},
    {"id": "contacts", "title": "Kontaktpersonen", "icon": "👥", "description": "Ansprechpartner"},
    {"id": "data", "title": "Datenquellen", "icon": "📊", "description": "PDFs, Website, Text"},
    {"id": "preview", "title": "Vorschau & Deployment", "icon": "🚀", "description": "Testen und Erstellen"}
]

# ─── Progress Indicator ─────────────────────────────────────────────────────
def render_progress_indicator(steps: List[Dict], current_step: int):
    """Einfacher Progress Indicator ohne komplexes HTML"""
    
    # Hauptcontainer
    with st.container():
        st.markdown("---")
        
        # Progress Bar
        progress_percentage = current_step / (len(steps) - 1) if len(steps) > 1 else 0
        st.progress(progress_percentage)
        
        # Step-Übersicht in Spalten
        cols = st.columns(len(steps))
        
        for i, (col, step) in enumerate(zip(cols, steps)):
            with col:
                # Status-Icon bestimmen
                if i < current_step:
                    icon = "✅"
                    status_text = "Abgeschlossen"
                elif i == current_step:
                    icon = step["icon"]
                    status_text = "Aktiv"
                else:
                    icon = f"{i + 1}"
                    status_text = "Ausstehend"
                
                # Step in Spalte anzeigen
                st.markdown(f"### {icon}")
                st.caption(f"**{step['title']}**")
                st.caption(step['description'])
                
                # Status-Indikator
                if i < current_step:
                    st.success("✓ Fertig")
                elif i == current_step:
                    st.info("→ Aktiv")
                else:
                    st.empty()
        
        # Current Step Info
        current_step_info = steps[current_step] if current_step < len(steps) else steps[-1]
        st.markdown(f"**Aktueller Schritt:** {current_step + 1}/{len(steps)} - {current_step_info['title']}")
        
        st.markdown("---")

# ─── Step 1: Basic Settings ─────────────────────────────────────────────────
def render_basic_settings_step():
    """Grundeinstellungen für den Chatbot"""
    
    st.markdown('<div class="config-card">', unsafe_allow_html=True)
    
    st.markdown("### 📋 Chatbot-Grundkonfiguration")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        name = st.text_input(
            "Chatbot Name *",
            value=st.session_state.chatbot_config['name'],
            placeholder="z.B. Kundenservice Assistant, Support Bot, FAQ Helper",
            help="Wählen Sie einen aussagekräftigen Namen für Ihren Chatbot"
        )
        st.session_state.chatbot_config['name'] = name
        
        description = st.text_area(
            "Beschreibung",
            value=st.session_state.chatbot_config['description'],
            placeholder="Beschreiben Sie den Zweck und die Aufgaben Ihres Chatbots...",
            height=100,
            help="Diese Beschreibung hilft bei der Kategorisierung und wird internen Zwecken verwendet"
        )
        st.session_state.chatbot_config['description'] = description
        
    with col2:
        st.markdown("#### 📝 Erste Schritte")
        st.info("""
        **Tipps für den Namen:**
        - Verwenden Sie den Firmennamen
        - Beschreiben Sie den Zweck
        - Halten Sie es kurz und prägnant
        
        **Beispiele:**
        - "TechCorp Support"
        - "Medizin FAQ Bot"
        - "Immobilien Berater"
        """)
    
    # Tags für Kategorisierung
    st.markdown("#### 🏷️ Kategorien (Optional)")
    
    col1, col2 = st.columns(2)
    with col1:
        predefined_tags = st.multiselect(
            "Vordefinierte Kategorien",
            ["Kundenservice", "Vertrieb", "Support", "FAQ", "E-Commerce", "Gesundheit", "Bildung", "Immobilien", "Automotive"],
            help="Wählen Sie passende Kategorien für Ihren Chatbot"
        )
    
    with col2:
        custom_tags = st.text_input(
            "Eigene Tags (kommagetrennt)",
            placeholder="Beratung, Verkauf, Technik",
            help="Fügen Sie eigene Schlagwörter hinzu"
        )
    
    # Tags kombinieren
    all_tags = predefined_tags.copy()
    if custom_tags:
        all_tags.extend([tag.strip() for tag in custom_tags.split(',') if tag.strip()])
    
    st.session_state.chatbot_config['tags'] = all_tags
    
    if all_tags:
        st.markdown("**Gewählte Tags:**")
        tag_html = " ".join([f'<span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin: 2px;">{tag}</span>' for tag in all_tags])
        st.markdown(tag_html, unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)

# ─── Step 2: Branding ───────────────────────────────────────────────────────
def render_branding_step():
    """Design und Branding-Konfiguration"""
    
    st.markdown('<div class="config-card">', unsafe_allow_html=True)
    
    st.markdown("### 🎨 Design & Branding")
    
    # Logo Upload Section
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.markdown("#### 📷 Logo Upload")
        logo_file = st.file_uploader(
            "Firmenlogo hochladen",
            type=['png', 'jpg', 'jpeg', 'svg'],
            help="Empfohlene Größe: 400x400px, max. 2MB",
            key="logo_upload"
        )
        
        if logo_file:
            st.session_state.uploaded_logo = logo_file
            st.success(f"✅ Logo hochgeladen: {logo_file.name}")
    
    with col2:
        st.markdown("#### 👁️ Logo Vorschau")
        if st.session_state.uploaded_logo:
            st.image(st.session_state.uploaded_logo, width=200, caption="Ihr Logo")
        else:
            # Auto-generiertes Logo mit Initialen
            company_name = st.session_state.chatbot_config.get('name', 'CB')
            initials = ''.join([word[0].upper() for word in company_name.split()[:2]]) if company_name else 'CB'
            
            st.markdown(f"""
            <div style="
                width: 200px; 
                height: 200px; 
                background: linear-gradient(135deg, #1f3a93, #34495e);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 48px;
                font-weight: bold;
                margin: 0 auto;
                border: 3px solid rgba(255,255,255,0.2);
            ">{initials}</div>
            <p style="text-align: center; margin-top: 10px; color: #9ca3af; font-size: 12px;">
                Auto-generiertes Logo<br>
                <small>(Laden Sie ein eigenes Logo hoch)</small>
            </p>
            """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Farbschema
    st.markdown("#### 🎨 Farbschema")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        primary_color = st.color_picker(
            "Primärfarbe",
            value=st.session_state.chatbot_config['branding']['primary_color'],
            help="Hauptfarbe für Header, Buttons und wichtige Elemente"
        )
        st.session_state.chatbot_config['branding']['primary_color'] = primary_color
        
    with col2:
        secondary_color = st.color_picker(
            "Sekundärfarbe", 
            value=st.session_state.chatbot_config['branding']['secondary_color'],
            help="Zweite Farbe für Verläufe und Akzente"
        )
        st.session_state.chatbot_config['branding']['secondary_color'] = secondary_color
        
    with col3:
        accent_color = st.color_picker(
            "Akzentfarbe",
            value=st.session_state.chatbot_config['branding']['accent_color'],
            help="Farbe für Call-to-Action Buttons und Highlights"
        )
        st.session_state.chatbot_config['branding']['accent_color'] = accent_color
    
    # Live-Preview
    render_color_preview(primary_color, secondary_color, accent_color)
    
    st.markdown("---")
    
    # Typography & Layout
    st.markdown("#### ✍️ Typografie & Layout")
    
    col1, col2 = st.columns(2)
    
    with col1:
        font_family = st.selectbox(
            "Schriftart",
            ["Roboto", "Open Sans", "Lato", "Montserrat", "Source Sans Pro", "Inter"],
            index=["Roboto", "Open Sans", "Lato", "Montserrat", "Source Sans Pro", "Inter"].index(
                st.session_state.chatbot_config['branding']['font_family']
            )
        )
        st.session_state.chatbot_config['branding']['font_family'] = font_family
        
        font_size = st.select_slider(
            "Schriftgröße",
            options=["Klein", "Normal", "Groß"],
            value=st.session_state.chatbot_config['branding']['font_size']
        )
        st.session_state.chatbot_config['branding']['font_size'] = font_size
        
    with col2:
        chat_width = st.selectbox(
            "Chat-Breite",
            ["Schmal (600px)", "Normal (800px)", "Breit (1000px)", "Vollbild"],
            index=["Schmal (600px)", "Normal (800px)", "Breit (1000px)", "Vollbild"].index(
                st.session_state.chatbot_config['branding']['chat_width']
            )
        )
        st.session_state.chatbot_config['branding']['chat_width'] = chat_width
        
        message_style = st.selectbox(
            "Nachrichten-Stil",
            ["Sprechblasen", "Karten", "Minimal"],
            index=["Sprechblasen", "Karten", "Minimal"].index(
                st.session_state.chatbot_config['branding']['message_style']
            )
        )
        st.session_state.chatbot_config['branding']['message_style'] = message_style
    
    st.markdown('</div>', unsafe_allow_html=True)

def render_color_preview(primary: str, secondary: str, accent: str):
    """Live-Vorschau der Farbkombination - komplett ohne HTML"""
    
    st.subheader("🤖 Ihr Chatbot-Design")
    st.caption("So wird Ihr Chatbot mit den gewählten Farben aussehen")
    
    # Farbpalette als Text anzeigen
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("🎨 Primärfarbe", primary)
        
    with col2:
        st.metric("🎨 Sekundärfarbe", secondary)
        
    with col3:
        st.metric("🎨 Akzentfarbe", accent)
    
    # Chat-Vorschau mit nativen Streamlit-Komponenten
    st.markdown("**💬 Chat-Vorschau:**")
    
    # Bot Message
    st.info("🤖 **Bot:** Hallo! Wie kann ich Ihnen heute helfen? 😊")
    
    # User Message (simuliert)
    st.success("👤 **Sie:** Ich hätte gerne Informationen zu Ihren Produkten.")
    
    # Bot Response
    st.info("🤖 **Bot:** Gerne! Ich kann Ihnen dabei helfen. Welcher Produktbereich interessiert Sie am meisten?")
    
    # Action Button Vorschau
    st.markdown("**🔘 Button-Vorschau:**")
    
    col1, col2, col3 = st.columns([1, 1, 1])
    
    with col1:
        if st.button("📞 Kontakt aufnehmen", key="preview_contact"):
            st.success("Kontakt-Button gedrückt!")
    
    with col2:
        if st.button("📧 Email senden", key="preview_email"):
            st.success("Email-Button gedrückt!")
    
    with col3:
        if st.button("ℹ️ Mehr Infos", key="preview_info"):
            st.success("Info-Button gedrückt!")
    
    # Farbcode-Anzeige
    with st.expander("🎨 Gewählte Farbcodes anzeigen"):
        st.code(f"""
Primärfarbe:    {primary}
Sekundärfarbe:  {secondary}
Akzentfarbe:    {accent}
        """)
        
        st.caption("Diese Farben werden in Ihrem Chatbot verwendet.")

# ─── Step 3: Company Info ───────────────────────────────────────────────────
def render_company_info_step():
    """Unternehmensdaten-Formular"""
    
    st.markdown('<div class="config-card">', unsafe_allow_html=True)
    
    st.markdown("### 🏢 Unternehmensdaten")
    
    # Grunddaten
    st.markdown("#### 📋 Grundinformationen")
    
    col1, col2 = st.columns(2)
    
    with col1:
        company_name = st.text_input(
            "Firmenname *",
            value=st.session_state.chatbot_config['company_info']['company_name'],
            placeholder="Ihre Firma GmbH"
        )
        st.session_state.chatbot_config['company_info']['company_name'] = company_name
        
        industry = st.selectbox(
            "Branche",
            [
                "Wählen Sie eine Branche",
                "IT & Software", "E-Commerce", "Beratung", "Gesundheitswesen",
                "Bildung", "Finanzdienstleistungen", "Immobilien", "Automotive",
                "Fertigung", "Handel", "Gastronomie", "Tourismus", "Logistik",
                "Marketing & Werbung", "Rechtsberatung", "Architektur", "Sonstiges"
            ],
            index=0 if not st.session_state.chatbot_config['company_info']['industry'] 
                  else ["Wählen Sie eine Branche", "IT & Software", "E-Commerce", "Beratung", "Gesundheitswesen", "Bildung", "Finanzdienstleistungen", "Immobilien", "Automotive", "Fertigung", "Handel", "Gastronomie", "Tourismus", "Logistik", "Marketing & Werbung", "Rechtsberatung", "Architektur", "Sonstiges"].index(st.session_state.chatbot_config['company_info']['industry'])
        )
        if industry != "Wählen Sie eine Branche":
            st.session_state.chatbot_config['company_info']['industry'] = industry
        
        company_size = st.selectbox(
            "Unternehmensgröße",
            ["", "1-10 Mitarbeiter", "11-50 Mitarbeiter", "51-200 Mitarbeiter", "200+ Mitarbeiter"],
            index=0 if not st.session_state.chatbot_config['company_info']['company_size'] 
                  else ["", "1-10 Mitarbeiter", "11-50 Mitarbeiter", "51-200 Mitarbeiter", "200+ Mitarbeiter"].index(st.session_state.chatbot_config['company_info']['company_size'])
        )
        st.session_state.chatbot_config['company_info']['company_size'] = company_size
        
    with col2:
        website = st.text_input(
            "Website",
            value=st.session_state.chatbot_config['company_info']['website'],
            placeholder="https://www.ihre-firma.de"
        )
        st.session_state.chatbot_config['company_info']['website'] = website
        
        email = st.text_input(
            "Hauptkontakt-Email *",
            value=st.session_state.chatbot_config['company_info']['email'],
            placeholder="info@ihre-firma.de"
        )
        st.session_state.chatbot_config['company_info']['email'] = email
        
        phone = st.text_input(
            "Telefon",
            value=st.session_state.chatbot_config['company_info']['phone'],
            placeholder="+49 123 456789"
        )
        st.session_state.chatbot_config['company_info']['phone'] = phone
    
    st.markdown("---")
    
    # Adresse
    st.markdown("#### 📍 Firmenadresse")
    
    col1, col2, col3 = st.columns([2, 1, 2])
    
    with col1:
        street = st.text_input(
            "Straße & Hausnummer", 
            value=st.session_state.chatbot_config['company_info']['address']['street'],
            placeholder="Musterstraße 123"
        )
        st.session_state.chatbot_config['company_info']['address']['street'] = street
        
    with col2:
        zip_code = st.text_input(
            "PLZ", 
            value=st.session_state.chatbot_config['company_info']['address']['zip_code'],
            placeholder="12345"
        )
        st.session_state.chatbot_config['company_info']['address']['zip_code'] = zip_code
        
    with col3:
        city = st.text_input(
            "Stadt", 
            value=st.session_state.chatbot_config['company_info']['address']['city'],
            placeholder="Musterstadt"
        )
        st.session_state.chatbot_config['company_info']['address']['city'] = city
    
    country = st.selectbox(
        "Land",
        ["Deutschland", "Österreich", "Schweiz", "Andere"],
        index=["Deutschland", "Österreich", "Schweiz", "Andere"].index(
            st.session_state.chatbot_config['company_info']['address']['country']
        )
    )
    st.session_state.chatbot_config['company_info']['address']['country'] = country
    
    st.markdown("---")
    
    # Öffnungszeiten
    st.markdown("#### 🕒 Öffnungszeiten")
    render_business_hours_editor()
    
    st.markdown("---")
    
    # Social Media
    st.markdown("#### 🌐 Social Media (Optional)")
    
    col1, col2 = st.columns(2)
    
    with col1:
        linkedin = st.text_input(
            "LinkedIn", 
            value=st.session_state.chatbot_config['company_info']['social_media']['linkedin'],
            placeholder="https://linkedin.com/company/..."
        )
        st.session_state.chatbot_config['company_info']['social_media']['linkedin'] = linkedin
        
        facebook = st.text_input(
            "Facebook", 
            value=st.session_state.chatbot_config['company_info']['social_media']['facebook'],
            placeholder="https://facebook.com/..."
        )
        st.session_state.chatbot_config['company_info']['social_media']['facebook'] = facebook
        
        instagram = st.text_input(
            "Instagram", 
            value=st.session_state.chatbot_config['company_info']['social_media']['instagram'],
            placeholder="https://instagram.com/..."
        )
        st.session_state.chatbot_config['company_info']['social_media']['instagram'] = instagram
        
    with col2:
        twitter = st.text_input(
            "Twitter/X", 
            value=st.session_state.chatbot_config['company_info']['social_media']['twitter'],
            placeholder="https://twitter.com/..."
        )
        st.session_state.chatbot_config['company_info']['social_media']['twitter'] = twitter
        
        youtube = st.text_input(
            "YouTube", 
            value=st.session_state.chatbot_config['company_info']['social_media']['youtube'],
            placeholder="https://youtube.com/@..."
        )
        st.session_state.chatbot_config['company_info']['social_media']['youtube'] = youtube
        
        xing = st.text_input(
            "Xing", 
            value=st.session_state.chatbot_config['company_info']['social_media']['xing'],
            placeholder="https://xing.com/companies/..."
        )
        st.session_state.chatbot_config['company_info']['social_media']['xing'] = xing
    
    st.markdown('</div>', unsafe_allow_html=True)

def render_business_hours_editor():
    """Interaktiver Öffnungszeiten-Editor"""
    
    days = [
        ("monday", "Montag"),
        ("tuesday", "Dienstag"), 
        ("wednesday", "Mittwoch"),
        ("thursday", "Donnerstag"),
        ("friday", "Freitag"),
        ("saturday", "Samstag"),
        ("sunday", "Sonntag")
    ]
    
    # Quick-Setup Buttons
    st.markdown("**Schnellauswahl:**")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        if st.button("Mo-Fr 9-17", key="preset_9_17"):
            set_business_hours_preset("weekdays_9_17")
    with col2:
        if st.button("Mo-Fr 8-18", key="preset_8_18"):
            set_business_hours_preset("weekdays_8_18")
    with col3:
        if st.button("Mo-Sa 9-18", key="preset_mo_sa"):
            set_business_hours_preset("weekdays_saturday_9_18")
    with col4:
        if st.button("24/7", key="preset_24_7"):
            set_business_hours_preset("24_7")
    
    st.markdown("**Detailkonfiguration:**")
    
    for day_key, day_name in days:
        col1, col2, col3, col4 = st.columns([2, 1.5, 1.5, 1.5])
        
        with col1:
            st.markdown(f"**{day_name}**")
            
        current_day_data = st.session_state.chatbot_config['company_info']['business_hours'].get(day_key, {})
        
        with col2:
            is_closed = st.checkbox(
                "Geschlossen", 
                key=f"closed_{day_key}",
                value=current_day_data.get('closed', False)
            )
            
        if not is_closed:
            with col3:
                start_time = st.time_input(
                    "Von",
                    key=f"start_{day_key}",
                    value=dt_time(9, 0) if not current_day_data.get('start') else 
                          dt_time(*map(int, current_day_data['start'].split(':')))
                )
                
            with col4:
                end_time = st.time_input(
                    "Bis",
                    key=f"end_{day_key}",
                    value=dt_time(17, 0) if not current_day_data.get('end') else 
                          dt_time(*map(int, current_day_data['end'].split(':')))
                )
                
            # Speichere Zeiten
            st.session_state.chatbot_config['company_info']['business_hours'][day_key] = {
                'closed': False,
                'start': start_time.strftime('%H:%M'),
                'end': end_time.strftime('%H:%M')
            }
        else:
            st.session_state.chatbot_config['company_info']['business_hours'][day_key] = {'closed': True}

def set_business_hours_preset(preset_type: str):
    """Setzt vordefinierte Öffnungszeiten"""
    
    business_hours = {}
    
    if preset_type == "weekdays_9_17":
        for day in ["monday", "tuesday", "wednesday", "thursday", "friday"]:
            business_hours[day] = {'closed': False, 'start': '09:00', 'end': '17:00'}
        for day in ["saturday", "sunday"]:
            business_hours[day] = {'closed': True}
            
    elif preset_type == "weekdays_8_18":
        for day in ["monday", "tuesday", "wednesday", "thursday", "friday"]:
            business_hours[day] = {'closed': False, 'start': '08:00', 'end': '18:00'}
        for day in ["saturday", "sunday"]:
            business_hours[day] = {'closed': True}
            
    elif preset_type == "weekdays_saturday_9_18":
        for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]:
            business_hours[day] = {'closed': False, 'start': '09:00', 'end': '18:00'}
        business_hours["sunday"] = {'closed': True}
        
    elif preset_type == "24_7":
        for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]:
            business_hours[day] = {'closed': False, 'start': '00:00', 'end': '23:59'}
    
    st.session_state.chatbot_config['company_info']['business_hours'] = business_hours
    st.rerun()

# ─── Step 4: Features & Behavior ────────────────────────────────────────────
def render_features_step():
    """Features und Chatbot-Verhalten konfigurieren"""
    
    st.markdown('<div class="config-card">', unsafe_allow_html=True)
    
    st.markdown("### ⚡ Features & Verhalten")
    
    # Email-Capture Section
    st.markdown("#### 📧 Email-Erfassung")
    
    email_capture_enabled = st.checkbox(
        "Email-Erfassung aktivieren",
        value=st.session_state.chatbot_config.get('email_capture_enabled', False),
        help="Ermöglicht es dem Chatbot, Besucher-E-Mails für Lead-Generation zu erfassen"
    )
    st.session_state.chatbot_config['email_capture_enabled'] = email_capture_enabled
    
    if email_capture_enabled:
        col1, col2 = st.columns([2, 1])
        
        with col1:
            email_prompt = st.text_area(
                "Prompt für Email-Abfrage",
                value="Für detaillierte Informationen können Sie gerne Ihre Email-Adresse hinterlassen.",
                height=100,
                help="Dieser Text wird angezeigt, wenn der Chatbot eine Email-Adresse anfragt"
            )
            
            trigger_keywords = st.text_input(
                "Trigger-Keywords (kommagetrennt)",
                value="preise, angebot, kontakt, beratung, demo, information",
                help="Der Chatbot fragt nach der Email, wenn diese Wörter verwendet werden"
            )
            
        with col2:
            max_requests = st.number_input(
                "Max. Anfragen pro Session",
                min_value=1,
                max_value=5,
                value=1,
                help="Wie oft soll pro Gespräch maximal nach der Email gefragt werden?"
            )
            
            after_messages = st.number_input(
                "Nach X Nachrichten fragen",
                min_value=1,
                max_value=10,
                value=3,
                help="Nach wie vielen Nachrichten soll automatisch nach der Email gefragt werden?"
            )
        
        # Email capture settings speichern
        st.session_state.chatbot_config['email_capture_config'] = {
            'prompt': email_prompt,
            'trigger_keywords': [kw.strip() for kw in trigger_keywords.split(',')],
            'max_requests': max_requests,
            'after_messages': after_messages
        }
    
    st.markdown("---")
    
    # Chatbot-Verhalten
    st.markdown("#### 🤖 Chatbot-Verhalten")
    
    col1, col2 = st.columns(2)
    
    with col1:
        tone = st.selectbox(
            "Gesprächston",
            ["Professionell", "Freundlich", "Technisch", "Lässig", "Enthusiastisch"],
            index=0,
            help="Definiert den grundlegenden Kommunikationsstil des Chatbots"
        )
        
        response_length = st.selectbox(
            "Antwortlänge",
            ["Kurz", "Mittel", "Ausführlich", "Kontextabhängig"],
            index=1,
            help="Bevorzugte Länge der Chatbot-Antworten"
        )
        
        formality = st.selectbox(
            "Anrede",
            ["Sie (förmlich)", "Du (informell)", "Automatisch erkennen"],
            index=0,
            help="Wie soll der Chatbot die Benutzer ansprechen?"
        )
    
    with col2:
        language = st.selectbox(
            "Hauptsprache",
            ["Deutsch", "Englisch", "Französisch", "Spanisch", "Italienisch"],
            index=0,
            help="Primäre Sprache für die Chatbot-Kommunikation"
        )
        
        fallback_language = st.selectbox(
            "Fallback-Sprache",
            ["Englisch", "Deutsch", "Keine"],
            index=0,
            help="Sprache für den Fall, dass die Hauptsprache nicht funktioniert"
        )
        
        auto_translate = st.checkbox(
            "Automatische Übersetzung",
            help="Chatbot versucht automatisch Anfragen in andere Sprachen zu übersetzen"
        )
    
    # Verhalten speichern
    st.session_state.chatbot_config['behavior_settings'] = {
        'tone': tone,
        'response_length': response_length,
        'formality': formality,
        'language': language,
        'fallback_language': fallback_language,
        'auto_translate': auto_translate
    }
    
    st.markdown("---")
    
    # Custom Instructions
    st.markdown("#### 💬 Zusätzliche Anweisungen")
    
    custom_instructions = st.text_area(
        "Spezielle Anweisungen für den Chatbot",
        placeholder="z.B. 'Betone immer unsere 24/7-Verfügbarkeit', 'Erwähne unser kostenloses Beratungsgespräch', 'Sei besonders hilfsbereit bei technischen Fragen'",
        height=120,
        help="Diese Anweisungen werden dem Chatbot zusätzlich zu seinem Grundverhalten gegeben"
    )
    
    forbidden_topics = st.text_input(
        "Verbotene Themen (kommagetrennt)",
        placeholder="Politik, Religion, persönliche Daten",
        help="Themen, die der Chatbot nicht behandeln soll"
    )
    
    st.session_state.chatbot_config['behavior_settings']['custom_instructions'] = custom_instructions
    st.session_state.chatbot_config['behavior_settings']['forbidden_topics'] = [topic.strip() for topic in forbidden_topics.split(',') if topic.strip()]
    
    st.markdown('</div>', unsafe_allow_html=True)

# ─── Step 5: Contact Persons ────────────────────────────────────────────────
def render_contacts_step():
    """Kontaktpersonen-Management"""
    
    st.markdown('<div class="config-card">', unsafe_allow_html=True)
    
    st.markdown("### 👥 Kontaktpersonen")
    
    contact_persons_enabled = st.checkbox(
        "Kontaktpersonen-Feature aktivieren",
        value=st.session_state.chatbot_config.get('contact_persons_enabled', False),
        help="Ermöglicht es Besuchern, direkte Kontaktanfragen an spezifische Ansprechpartner zu stellen"
    )
    st.session_state.chatbot_config['contact_persons_enabled'] = contact_persons_enabled
    
    if contact_persons_enabled:
        # Initialize contact persons list if not exists
        if 'contact_persons' not in st.session_state.chatbot_config:
            st.session_state.chatbot_config['contact_persons'] = []
        
        # Bestehende Kontaktpersonen anzeigen
        if st.session_state.chatbot_config['contact_persons']:
            st.markdown("#### 📋 Aktuelle Kontaktpersonen")
            
            for i, contact in enumerate(st.session_state.chatbot_config['contact_persons']):
                with st.expander(f"👤 {contact['name']} - {contact['position']}", expanded=False):
                    col1, col2, col3 = st.columns([2, 2, 1])
                    
                    with col1:
                        st.write(f"**Email:** {contact['email']}")
                        if contact.get('phone'):
                            st.write(f"**Telefon:** {contact['phone']}")
                    
                    with col2:
                        if contact.get('department'):
                            st.write(f"**Abteilung:** {contact['department']}")
                        if contact.get('specialization'):
                            st.write(f"**Spezialisierung:** {contact['specialization']}")
                    
                    with col3:
                        if st.button("🗑️ Löschen", key=f"delete_contact_{i}"):
                            st.session_state.chatbot_config['contact_persons'].pop(i)
                            st.rerun()
        
        st.markdown("---")
        
        # Neue Kontaktperson hinzufügen
        st.markdown("#### ➕ Neue Kontaktperson hinzufügen")
        
        with st.form("add_contact_person"):
            col1, col2 = st.columns(2)
            
            with col1:
                name = st.text_input("Name *", placeholder="Max Mustermann")
                position = st.text_input("Position *", placeholder="Kundenberater")
                email = st.text_input("Email *", placeholder="max.mustermann@firma.de")
                
            with col2:
                department = st.text_input("Abteilung", placeholder="Vertrieb")
                phone = st.text_input("Telefon", placeholder="+49 123 456789")
                languages = st.multiselect(
                    "Sprachen",
                    ["Deutsch", "Englisch", "Französisch", "Spanisch", "Italienisch"],
                    default=["Deutsch"]
                )
            
            specialization = st.text_area(
                "Spezialisierung / Expertise",
                placeholder="z.B. Produktberatung, Technischer Support, Vertrieb...",
                height=100
            )
            
            # Profilbild Upload
            profile_image = st.file_uploader(
                "Profilbild (optional)",
                type=['png', 'jpg', 'jpeg'],
                help="Empfohlene Größe: 200x200px"
            )
            
            submitted = st.form_submit_button("👤 Kontaktperson hinzufügen", type="primary")
            
            if submitted:
                if name and position and email:
                    new_contact = {
                        'name': name,
                        'position': position,
                        'email': email,
                        'department': department,
                        'phone': phone,
                        'specialization': specialization,
                        'languages': languages,
                        'profile_image': profile_image.name if profile_image else None
                    }
                    
                    st.session_state.chatbot_config['contact_persons'].append(new_contact)
                    st.success(f"✅ {name} wurde hinzugefügt!")
                    st.rerun()
                else:
                    st.error("❌ Bitte füllen Sie alle Pflichtfelder (*) aus!")
        
        # Trigger-Konfiguration
        if st.session_state.chatbot_config['contact_persons']:
            st.markdown("---")
            st.markdown("#### ⚙️ Trigger-Konfiguration")
            
            col1, col2 = st.columns(2)
            
            with col1:
                trigger_keywords = st.text_input(
                    "Trigger-Keywords",
                    value="ansprechpartner, kontakt, verkauf, beratung, support",
                    help="Bei diesen Wörtern werden Kontaktpersonen angezeigt"
                )
                
            with col2:
                show_after_messages = st.number_input(
                    "Nach X Nachrichten zeigen",
                    min_value=1,
                    max_value=10,
                    value=5,
                    help="Nach wie vielen Nachrichten sollen Kontaktpersonen automatisch gezeigt werden?"
                )
            
            st.session_state.chatbot_config['contact_trigger_config'] = {
                'keywords': [kw.strip() for kw in trigger_keywords.split(',')],
                'show_after_messages': show_after_messages
            }
    else:
        st.info("💡 Das Kontaktpersonen-Feature ermöglicht es Ihren Website-Besuchern, direkt mit spezifischen Ansprechpartnern in Kontakt zu treten. Dies erhöht die Conversion-Rate und verbessert die Kundenerfahrung.")
    
    st.markdown('</div>', unsafe_allow_html=True)

# ─── Step 6: Data Sources ───────────────────────────────────────────────────
def render_data_sources_step():
    """Datenquellen-Konfiguration"""
    
    st.markdown('<div class="config-card">', unsafe_allow_html=True)
    
    st.markdown("### 📊 Datenquellen")
    
    st.info("💡 Ihr Chatbot benötigt Datenquellen, um Fragen beantworten zu können. Sie können eine Website crawlen, Dokumente hochladen oder beides kombinieren.")
    
    # Website URL
    st.markdown("#### 🌐 Website-Integration")
    
    website_url = st.text_input(
        "Website URL",
        placeholder="https://ihre-website.de",
        help="Die komplette Website wird automatisch gecrawlt und als Wissensbasis verwendet"
    )
    
    if website_url:
        col1, col2 = st.columns([2, 1])
        
        with col1:
            crawl_depth = st.slider(
                "Crawl-Tiefe",
                min_value=1,
                max_value=5,
                value=2,
                help="Wie tief sollen Unterseiten verfolgt werden?"
            )
            
            include_patterns = st.text_input(
                "Nur diese URLs crawlen (optional)",
                placeholder="/produkte/, /services/, /blog/",
                help="Kommagetrennte URL-Patterns. Leer lassen für komplette Website"
            )
            
        with col2:
            exclude_patterns = st.text_input(
                "Diese URLs ausschließen",
                placeholder="/admin/, /login/, /checkout/",
                help="URLs die nicht gecrawlt werden sollen"
            )
            
            max_pages = st.number_input(
                "Max. Seiten",
                min_value=10,
                max_value=1000,
                value=100,
                help="Maximale Anzahl Seiten zum Crawlen"
            )
    
    st.session_state.chatbot_config['website_config'] = {
        'url': website_url,
        'crawl_depth': crawl_depth if website_url else 1,
        'include_patterns': [p.strip() for p in include_patterns.split(',') if p.strip()] if website_url and include_patterns else [],
        'exclude_patterns': [p.strip() for p in exclude_patterns.split(',') if p.strip()] if website_url and exclude_patterns else [],
        'max_pages': max_pages if website_url else 100
    }
    
    st.markdown("---")
    
    # Dokument Upload
    st.markdown("#### 📄 Dokument-Upload")
    
    uploaded_files = st.file_uploader(
        "Dokumente hochladen",
        type=['pdf', 'docx', 'txt', 'md'],
        accept_multiple_files=True,
        help="PDF, DOCX, TXT oder Markdown-Dateien als zusätzliche Wissensbasis"
    )
    
    if uploaded_files:
        st.success(f"✅ {len(uploaded_files)} Datei(en) ausgewählt:")
        
        total_size = 0
        for file in uploaded_files:
            st.write(f"📄 {file.name} ({file.size:,} Bytes)")
            total_size += file.size
        
        st.write(f"**Gesamtgröße:** {total_size:,} Bytes ({total_size/1024/1024:.1f} MB)")
        
        # Verarbeitungsoptionen
        col1, col2 = st.columns(2)
        
        with col1:
            chunk_size = st.slider(
                "Chunk-Größe",
                min_value=500,
                max_value=3000,
                value=1000,
                step=100,
                help="Größe der Textabschnitte für bessere Suche"
            )
        
        with col2:
            overlap = st.slider(
                "Chunk-Überlappung",
                min_value=0,
                max_value=300,
                value=100,
                step=50,
                help="Überlappung zwischen Textabschnitten"
            )
    
    st.session_state.chatbot_config['document_config'] = {
        'files': uploaded_files,
        'chunk_size': chunk_size if uploaded_files else 1000,
        'overlap': overlap if uploaded_files else 100
    }
    
    st.markdown("---")
    
    # Manuelle Text-Eingabe
    st.markdown("#### ✍️ Manueller Text")
    
    manual_text = st.text_area(
        "Zusätzlicher Text / FAQ",
        placeholder="Geben Sie hier manuell Text ein, den der Chatbot kennen soll...\n\nZ.B.:\n- Häufige Fragen und Antworten\n- Spezielle Informationen\n- Unternehmensdaten",
        height=200,
        help="Dieser Text wird zusätzlich zu Website und Dokumenten als Wissensbasis verwendet"
    )
    
    st.session_state.chatbot_config['manual_text'] = manual_text
    
    # Validierung
    has_website = bool(website_url)
    has_documents = bool(uploaded_files)
    has_manual_text = bool(manual_text and manual_text.strip())
    
    if not (has_website or has_documents or has_manual_text):
        st.warning("⚠️ Bitte geben Sie mindestens eine Datenquelle an (Website, Dokumente oder manueller Text).")
    else:
        st.success("✅ Datenquellen konfiguriert!")
    
    st.markdown('</div>', unsafe_allow_html=True)

# ─── Step 7: Preview & Deployment ───────────────────────────────────────────
def render_preview_step():
    """Vorschau und Deployment-Konfiguration"""
    
    st.markdown('<div class="config-card">', unsafe_allow_html=True)
    
    st.markdown("### 🔍 Vorschau & Deployment")
    
    config = st.session_state.chatbot_config
    
    # Konfigurationszusammenfassung
    st.markdown("#### 📋 Konfigurationszusammenfassung")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**Grundeinstellungen:**")
        st.write(f"• Name: {config.get('name', 'Nicht festgelegt')}")
        st.write(f"• Beschreibung: {config.get('description', 'Keine Beschreibung')[:50]}...")
        if config.get('tags'):
            st.write(f"• Tags: {', '.join(config['tags'][:3])}{'...' if len(config['tags']) > 3 else ''}")
        
        st.markdown("**Features:**")
        st.write(f"• Email-Erfassung: {'✅ Aktiviert' if config.get('email_capture_enabled') else '❌ Deaktiviert'}")
        st.write(f"• Kontaktpersonen: {'✅ Aktiviert' if config.get('contact_persons_enabled') else '❌ Deaktiviert'}")
        if config.get('contact_persons_enabled') and config.get('contact_persons'):
            st.write(f"• Anzahl Kontakte: {len(config['contact_persons'])}")
    
    with col2:
        st.markdown("**Unternehmen:**")
        company = config.get('company_info', {})
        st.write(f"• Firma: {company.get('company_name', 'Nicht festgelegt')}")
        st.write(f"• Email: {company.get('email', 'Nicht festgelegt')}")
        st.write(f"• Öffnungszeiten: {'✅ Konfiguriert' if company.get('business_hours') else '❌ Nicht konfiguriert'}")
        
        st.markdown("**Datenquellen:**")
        website = config.get('website_config', {}).get('url', '')
        documents = config.get('document_config', {}).get('files', [])
        manual = config.get('manual_text', '')
        
        st.write(f"• Website: {'✅ ' + website[:30] + '...' if website else '❌ Keine Website'}")
        st.write(f"• Dokumente: {'✅ ' + str(len(documents)) + ' Dateien' if documents else '❌ Keine Dokumente'}")
        st.write(f"• Manueller Text: {'✅ Vorhanden' if manual else '❌ Kein Text'}")
    
    st.markdown("---")
    
    # Branding-Vorschau
    st.markdown("#### 🎨 Design-Vorschau")
    
    branding = config.get('branding', {})
    primary_color = branding.get('primary_color', '#1f3a93')
    secondary_color = branding.get('secondary_color', '#34495e')
    accent_color = branding.get('accent_color', '#e74c3c')
    
    # Mock Chat Interface
    st.markdown(f"""
    <div style="
        border: 2px solid {primary_color};
        border-radius: 16px;
        padding: 20px;
        background: linear-gradient(135deg, #f8f9fa, #ffffff);
        margin: 20px 0;
    ">
        <div style="
            background: linear-gradient(135deg, {primary_color}, {secondary_color});
            color: white;
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 15px;
            text-align: center;
        ">
            <h3 style="margin: 0; font-size: 18px;">🤖 {config.get('name', 'Ihr Chatbot')}</h3>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">
                {company.get('company_name', 'Ihr Unternehmen')}
            </p>
        </div>
        
        <div style="background: #f1f3f4; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
            <strong>Bot:</strong> Hallo! Ich bin {config.get('name', 'Ihr Chatbot')} und helfe Ihnen gerne weiter. Wie kann ich Ihnen behilflich sein?
        </div>
        
        <div style="background: {primary_color}; color: white; padding: 12px; border-radius: 8px; margin-bottom: 10px; text-align: right;">
            <strong>Besucher:</strong> Ich hätte gerne Informationen über Ihre Produkte.
        </div>
        
        <div style="background: #f1f3f4; padding: 12px; border-radius: 8px;">
            <strong>Bot:</strong> Gerne informiere ich Sie über unsere Produkte! Basierend auf unserer Website kann ich Ihnen detaillierte Informationen geben...
        </div>
        
        <div style="
            display: flex;
            gap: 10px;
            margin-top: 15px;
            justify-content: center;
        ">
            <button style="
                background: {accent_color};
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
            ">💬 Nachricht senden</button>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Deployment-Optionen
    st.markdown("#### 🚀 Deployment-Optionen")
    
    col1, col2 = st.columns(2)
    
    with col1:
        deployment_name = st.text_input(
            "URL-Name (optional)",
            placeholder="mein-chatbot",
            help="Wählen Sie einen Namen für die Chatbot-URL. Lassen Sie leer für automatische Generierung."
        )
        
        is_public = st.checkbox(
            "Öffentlich zugänglich",
            value=True,
            help="Chatbot über öffentliche URL erreichbar machen"
        )
    
    with col2:
        custom_domain = st.text_input(
            "Custom Domain (optional)",
            placeholder="chat.ihre-domain.de",
            help="Für fortgeschrittene Nutzer: Eigene Domain verwenden"
        )
        
        ssl_enabled = st.checkbox(
            "SSL/HTTPS aktivieren",
            value=True,
            disabled=True,
            help="Sichere Verbindung (automatisch aktiviert)"
        )
    
    # URL-Vorschau
    if deployment_name:
        preview_url = f"https://chatbots.vubot.de/bot/{deployment_name}"
    else:
        preview_url = f"https://chatbots.vubot.de/bot/{config.get('name', 'chatbot').lower().replace(' ', '-')}"
    
    st.info(f"🔗 **Vorschau-URL:** {preview_url}")
    
    st.session_state.chatbot_config['deployment_config'] = {
        'url_name': deployment_name,
        'is_public': is_public,
        'custom_domain': custom_domain,
        'ssl_enabled': ssl_enabled,
        'preview_url': preview_url
    }
    
    st.markdown("---")
    
    # Finale Validierung
    st.markdown("#### ✅ Finale Überprüfung")
    
    validation_results = []
    
    # Prüfe Grundkonfiguration
    if config.get('name'):
        validation_results.append("✅ Chatbot-Name festgelegt")
    else:
        validation_results.append("❌ Chatbot-Name fehlt")
    
    # Prüfe Datenquellen
    has_data_source = (
        config.get('website_config', {}).get('url') or
        config.get('document_config', {}).get('files') or
        config.get('manual_text', '').strip()
    )
    
    if has_data_source:
        validation_results.append("✅ Mindestens eine Datenquelle konfiguriert")
    else:
        validation_results.append("❌ Keine Datenquelle konfiguriert")
    
    # Prüfe Unternehmensdaten
    company_info = config.get('company_info', {})
    if company_info.get('company_name') and company_info.get('email'):
        validation_results.append("✅ Grundlegende Unternehmensdaten vorhanden")
    else:
        validation_results.append("⚠️ Unternehmensdaten unvollständig")
    
    # Zeige Ergebnisse
    for result in validation_results:
        st.write(result)
    
    # Prüfe ob Erstellung möglich ist
    can_create = all('✅' in result for result in validation_results[:2])  # Name und Datenquelle sind Pflicht
    
    if can_create:
        st.success("🎉 Ihr Chatbot ist bereit zur Erstellung!")
    else:
        st.warning("⚠️ Bitte korrigieren Sie die markierten Punkte vor der Erstellung.")
    
    st.markdown('</div>', unsafe_allow_html=True)

# ─── Navigation & Validation ─────────────────────────────────────────────────
def render_wizard_navigation(steps: List[Dict]):
    """Navigation für Multi-Step Wizard"""
    
    st.markdown('<div class="nav-button-container">', unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col1:
        if st.session_state.current_step > 0:
            if st.button("⬅️ Zurück", use_container_width=True, key="nav_back"):
                st.session_state.current_step -= 1
                st.rerun()
    
    with col2:
        # Step Info
        current_step_info = steps[st.session_state.current_step]
        st.markdown(f"""
        <div style="text-align: center; color: #9ca3af;">
            Schritt {st.session_state.current_step + 1} von {len(steps)}: {current_step_info['title']}
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        if st.session_state.current_step < len(steps) - 1:
            # Validierung für aktuellen Step
            if validate_current_step(steps[st.session_state.current_step]["id"]):
                if st.button("Weiter ➡️", use_container_width=True, type="primary", key="nav_next"):
                    st.session_state.current_step += 1
                    st.rerun()
            else:
                st.button("Weiter ➡️", use_container_width=True, disabled=True, key="nav_next_disabled")
                st.caption("Bitte füllen Sie alle Pflichtfelder aus")
        else:
            # Letzter Step: Chatbot erstellen
            if st.button("🚀 Chatbot erstellen", use_container_width=True, type="primary", key="create_chatbot"):
                create_chatbot_from_config()
    
    st.markdown('</div>', unsafe_allow_html=True)

def validate_current_step(step_id: str) -> bool:
    """Validiert ob der aktuelle Step vollständig ausgefüllt ist"""
    
    config = st.session_state.chatbot_config
    
    if step_id == "basic":
        return bool(config.get('name', '').strip())
    elif step_id == "company":
        return bool(
            config['company_info'].get('company_name', '').strip() and 
            config['company_info'].get('email', '').strip()
        )
    elif step_id == "data":
        # Prüfe ob mindestens eine Datenquelle vorhanden ist
        return bool(
            config.get('website_config', {}).get('url') or
            config.get('document_config', {}).get('files') or
            config.get('manual_text', '').strip()
        )
    # Weitere Steps sind optional
    return True

def create_chatbot_from_config():
    """Erstellt Chatbot aus der gesammelten Konfiguration"""
    
    # Starte Erstellungsprozess
    st.session_state.chatbot_creation_in_progress = True
    st.session_state.creation_error = None
    st.rerun()

# ─── Main Application ───────────────────────────────────────────────────────
def main():
    """Hauptanwendung"""
    
    initialize_session_state()
    
    # Prüfe URL Parameter für öffentliche Chatbot-Links
    query_params = st.experimental_get_query_params()
    if "public_id" in query_params:
        show_public_chatbot(query_params["public_id"][0])
        return
    
    # Platform Header
    st.markdown(f"""
    <div class="platform-header">
        <h1>🚀 Chatbot Platform</h1>
        <p>Erstellen Sie professionelle KI-Assistenten mit erweiterten Business-Features</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Navigation in Sidebar
    with st.sidebar:
        st.markdown("### 🧭 Navigation")
        
        page = st.radio(
            "Bereich wählen:",
            ["🆕 Neuen Chatbot erstellen", "📋 Meine Chatbots"],
            index=0 if not st.session_state.get('show_chatbot_list', False) else 1
        )
        
        if page == "📋 Meine Chatbots":
            st.session_state.show_chatbot_list = True
        else:
            st.session_state.show_chatbot_list = False
    
    # Check if chatbot creation is in progress
    if st.session_state.get('chatbot_creation_in_progress', False):
        show_chatbot_creation_process()
        return
    
    # Check if showing chatbot list
    if st.session_state.get('show_chatbot_list', False):
        show_chatbot_list()
        return
    
    # Default: Chatbot Creation Wizard
    # Progress Indicator
    render_progress_indicator(WIZARD_STEPS, st.session_state.current_step)
    
    # Current Step Content
    current_step = WIZARD_STEPS[st.session_state.current_step]
    
    # Step-spezifischer Content
    if current_step["id"] == "basic":
        render_basic_settings_step()
    elif current_step["id"] == "branding":
        render_branding_step()
    elif current_step["id"] == "company":
        render_company_info_step()
    elif current_step["id"] == "features":
        render_features_step()
    elif current_step["id"] == "contacts":
        render_contacts_step()
    elif current_step["id"] == "data":
        render_data_sources_step()
    elif current_step["id"] == "preview":
        render_preview_step()
    
    # Navigation
    render_wizard_navigation(WIZARD_STEPS)

def show_chatbot_list():
    """Zeigt die Liste aller erstellten Chatbots"""
    
    st.markdown("## 📋 Meine Chatbots")
    
    # Lade alle Chatbots
    chatbots = chatbot_factory.get_all_chatbots()
    
    if not chatbots:
        st.info("🤖 Noch keine Chatbots erstellt.")
        
        if st.button("🆕 Ersten Chatbot erstellen", type="primary"):
            st.session_state.show_chatbot_list = False
            st.rerun()
        return
    
    st.write(f"**{len(chatbots)} Chatbot(s) gefunden**")
    
    # Zeige Chatbots in Cards
    for chatbot in chatbots:
        config = chatbot["config"]
        rag_info = chatbot.get("rag_info", {})
        
        with st.container():
            # Erstelle Card mit Columns
            col1, col2, col3, col4 = st.columns([3, 2, 2, 1])
            
            with col1:
                st.markdown(f"### 🤖 {config.name}")
                st.caption(f"**Beschreibung:** {config.description or 'Keine Beschreibung'}")
                st.caption(f"**Erstellt:** {config.created_at[:19].replace('T', ' ')}")
                
            with col2:
                st.metric("📊 Datenquellen", f"{rag_info.get('total_chunks', 0)} Chunks")
                if config.website_url:
                    st.caption(f"🌐 Website: {config.website_url[:30]}...")
                
            with col3:
                chatbot_url = chatbot_factory.get_chatbot_url(config.id)
                st.markdown(f"🔗 **[Direktlink]({chatbot_url})**")
                st.code(f"ID: {config.id[:8]}...", language=None)
                
            with col4:
                if st.button("💬 Öffnen", key=f"open_{config.id}"):
                    st.session_state.selected_chatbot_id = config.id
                    st.switch_page("pages/chatbot.py")
                
                if st.button("🔗 Teilen", key=f"share_{config.id}"):
                    st.session_state.selected_chatbot_for_sharing = config.id
                    st.session_state.show_sharing_modal = True
                    st.rerun()
                
                if st.button("🗑️", key=f"delete_{config.id}", help="Chatbot löschen"):
                    if chatbot_factory.delete_chatbot(config.id):
                        st.success("✅ Chatbot gelöscht!")
                        st.rerun()
                    else:
                        st.error("❌ Fehler beim Löschen!")
            
            st.markdown("---")
    
    # Teilen-Modal anzeigen falls aktiviert
    if st.session_state.get('show_sharing_modal', False):
        show_sharing_modal()

def show_chatbot_creation_process():
    """Zeigt den echten Chatbot-Erstellungsprozess"""
    
    st.markdown("### 🚀 Chatbot wird erstellt...")
    
    # Hole Konfiguration aus Session State
    config = st.session_state.chatbot_config
    
    # Zeige Progress
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    try:
        def progress_callback(message: str, progress: float):
            """Callback für Progress Updates"""
            progress_bar.progress(progress)
            status_text.text(message)
        
        # Bereite Daten für chatbot_factory vor
        website_url = config.get('website_config', {}).get('url')
        uploaded_files = config.get('document_config', {}).get('files', [])
        
        # Stelle sicher, dass uploaded_files eine Liste ist und nicht None
        if uploaded_files is None:
            uploaded_files = []
        
        # Erweiterte Branding-Konfiguration
        branding = config.get('branding', {}).copy()
        
        # Erweiterte Konfiguration zusammenstellen
        extended_config = {
            # Company Info
            'company_info': config.get('company_info', {}),
            
            # Features
            'email_capture_enabled': config.get('email_capture_enabled', False),
            'email_capture_config': config.get('email_capture_config', {}),
            'contact_persons_enabled': config.get('contact_persons_enabled', False),
            'contact_persons': config.get('contact_persons', []),
            'contact_trigger_config': config.get('contact_trigger_config', {}),
            
            # Behavior
            'behavior_settings': config.get('behavior_settings', {}),
            
            # Website & Documents
            'website_config': config.get('website_config', {}),
            'document_config': config.get('document_config', {}),
            'manual_text': config.get('manual_text', ''),
            
            # Logo Upload (nur wenn vorhanden)
            'uploaded_logo': st.session_state.get('uploaded_logo') if st.session_state.get('uploaded_logo') is not None else None,
            
            # Deployment
            'deployment_config': config.get('deployment_config', {})
        }
        
        # Erstelle Chatbot mit dem echten Factory
        progress_callback("Initialisiere Chatbot-Erstellung...", 0.1)
        
        chatbot_id = chatbot_factory.create_chatbot(
            name=config.get('name', 'Unbenannter Chatbot'),
            description=config.get('description', ''),
            website_url=website_url,
            uploaded_documents=uploaded_files,
            branding=branding,
            extended_config=extended_config,
            progress_callback=progress_callback
        )
        
        progress_callback("Finalisierung...", 0.95)
        time.sleep(0.5)
        progress_bar.progress(1.0)
        
        if chatbot_id:
            st.success("✅ Chatbot erfolgreich erstellt!")
            
            # Zeige Details
            st.info(f"🆔 **Chatbot-ID:** `{chatbot_id}`")
            
            # URL anzeigen
            chatbot_url = chatbot_factory.get_chatbot_url(chatbot_id)
            st.info(f"🔗 **URL:** {chatbot_url}")
            
            # Speichere in Session für Navigation
            st.session_state.newly_created_chatbot_id = chatbot_id
            st.session_state.newly_created_chatbot_url = chatbot_url
            
            # Navigation Buttons
            col1, col2, col3 = st.columns(3)
            
            with col1:
                if st.button("🤖 Chatbot öffnen", type="primary"):
                    st.session_state.selected_chatbot_id = chatbot_id
                    st.switch_page("pages/chatbot.py")
            
            with col2:
                if st.button("📋 Alle Chatbots anzeigen"):
                    # Reset und gehe zur Liste
                    st.session_state.chatbot_creation_in_progress = False
                    st.session_state.current_step = 0
                    st.session_state.show_chatbot_list = True
                    st.rerun()
            
            with col3:
                if st.button("🆕 Neuen Chatbot erstellen"):
                    # Reset für neuen Chatbot
                    st.session_state.chatbot_creation_in_progress = False
                    st.session_state.current_step = 0
                    initialize_session_state()
                    st.rerun()
            
        else:
            st.error("❌ Fehler beim Erstellen des Chatbots!")
            if st.button("🔄 Zurück zur Konfiguration"):
                st.session_state.chatbot_creation_in_progress = False
                st.rerun()
    
    except Exception as e:
        st.error(f"❌ Fehler beim Erstellen des Chatbots: {str(e)}")
        st.exception(e)
        
        if st.button("🔄 Zurück zur Konfiguration"):
            st.session_state.chatbot_creation_in_progress = False
            st.rerun()

def show_sharing_modal():
    """Zeigt das Teilen-Modal mit den verschiedenen Sharing-Optionen"""
    
    chatbot_id = st.session_state.get('selected_chatbot_for_sharing')
    if not chatbot_id:
        return
    
    config = chatbot_factory.load_chatbot_config(chatbot_id)
    if not config:
        st.error("Chatbot nicht gefunden!")
        return
    
    # Modal Header
    st.markdown(f"## 🔗 {config.name} teilen")
    
    # Tabs für verschiedene Sharing-Optionen
    tab1, tab2, tab3 = st.tabs(["🌐 Öffentlicher Link", "📎 Website Widget", "🔑 API-Key"])
    
    with tab1:
        st.markdown("### 🌐 Öffentlicher Link")
        st.write("Teilen Sie Ihren Chatbot über einen direkten Link:")
        
        # Generiere Public ID falls noch nicht vorhanden
        public_id = chatbot_factory.generate_public_id(chatbot_id)
        if public_id:
            base_url = "http://localhost:8501"  # In Production: echte Domain
            public_url = f"{base_url}?public_id={public_id}"
            
            st.code(public_url, language=None)
            st.write("📋 Teilen Sie diesen Link mit Ihren Kunden für direkten Zugang zum Chatbot.")
        else:
            st.error("Fehler beim Generieren des öffentlichen Links.")
    
    with tab2:
        st.markdown("### 📎 Website Widget")
        st.write("Betten Sie den Chatbot in Ihre Website ein:")
        
        public_id = config.public_id or chatbot_factory.generate_public_id(chatbot_id)
        if public_id:
            base_url = "http://localhost:8501"
            iframe_code = f'''<iframe 
    src="{base_url}?public_id={public_id}&embed=true" 
    width="400" 
    height="600" 
    frameborder="0"
    title="{config.name} Chatbot">
</iframe>'''
            
            st.code(iframe_code, language="html")
            st.write("📋 Kopieren Sie diesen Code und fügen Sie ihn in Ihre Website ein.")
    
    with tab3:
        st.markdown("### 🔑 API-Key")
        st.write("Generieren Sie einen API-Key für WordPress Plugin oder andere Integrationen:")
        
        if st.button("🔑 Neuen API-Key generieren"):
            api_key = chatbot_factory.generate_api_key(chatbot_id)
            if api_key:
                st.code(api_key, language=None)
                st.success("✅ API-Key erfolgreich generiert!")
                st.write("📋 Verwenden Sie diesen Key für WordPress Plugin oder andere Integrationen.")
            else:
                st.error("Fehler beim Generieren des API-Keys.")
        
        # Zeige bestehende API-Keys
        if config.api_keys:
            st.markdown("#### Bestehende API-Keys:")
            for i, key in enumerate(config.api_keys):
                col1, col2 = st.columns([4, 1])
                with col1:
                    st.code(key, language=None)
                with col2:
                    if st.button("🗑️", key=f"delete_api_key_{i}"):
                        config.api_keys.remove(key)
                        chatbot_factory._save_chatbot_config(config)
                        st.rerun()
    
    # Modal schließen
    if st.button("✖️ Schließen"):
        st.session_state.show_sharing_modal = False
        st.session_state.selected_chatbot_for_sharing = None
        st.rerun()

def show_public_chatbot(public_id: str):
    """Zeigt öffentlichen Chatbot ohne Authentifizierung"""
    
    # Lade Chatbot-Konfiguration über public_id
    config = chatbot_factory.get_chatbot_by_public_id(public_id)
    if not config:
        st.error("🤖 Chatbot nicht gefunden!")
        st.write("Der angeforderte Chatbot ist nicht verfügbar oder wurde entfernt.")
        return
    
    # Prüfe ob es ein Embed-Request ist
    query_params = st.experimental_get_query_params()
    is_embed = "embed" in query_params and query_params["embed"][0] == "true"
    
    if is_embed:
        # Minimales Styling für Embed
        st.markdown("""
        <style>
        [data-testid="stAppViewContainer"] {
            padding: 0;
        }
        [data-testid="stHeader"] {
            display: none;
        }
        .main {
            padding: 10px;
        }
        </style>
        """, unsafe_allow_html=True)
    else:
        # Vollständiges Styling für Standalone-Seite
        st.set_page_config(
            page_title=f"{config.name} - Chatbot",
            page_icon="🤖",
            layout="centered"
        )
    
    # Public Chatbot Interface
    st.markdown(f"# 🤖 {config.name}")
    if not is_embed:
        st.write(config.description)
        st.markdown("---")
    
    # Session State für Public Chat
    if f"public_messages_{public_id}" not in st.session_state:
        st.session_state[f"public_messages_{public_id}"] = [
            {
                "role": "assistant",
                "content": config.branding.get("welcome_message", f"Hallo! Ich bin {config.name}. Wie kann ich Ihnen helfen?"),
                "sources": []
            }
        ]
    
    # Chat Interface laden
    from pages.chatbot import ask_chatbot, display_chat_message_with_sources
    
    # Chat History anzeigen
    for msg in st.session_state[f"public_messages_{public_id}"]:
        display_chat_message_with_sources(
            msg["role"], 
            msg["content"], 
            msg.get("sources", []), 
            config
        )
    
    # Chat Input
    if user_input := st.chat_input(f"Nachricht an {config.name}..."):
        # User-Nachricht hinzufügen
        st.session_state[f"public_messages_{public_id}"].append({
            "role": "user", 
            "content": user_input,
            "sources": []
        })
        display_chat_message_with_sources("user", user_input, config=config)
        
        # Bot-Antwort generieren
        with st.spinner("Antwort wird generiert..."):
            try:
                answer, sources = ask_chatbot(config.id, user_input)
                
                st.session_state[f"public_messages_{public_id}"].append({
                    "role": "assistant", 
                    "content": answer,
                    "sources": sources
                })
                display_chat_message_with_sources("assistant", answer, sources, config)
                
            except Exception as e:
                error_msg = f"Entschuldigung, ein Fehler ist aufgetreten: {e}"
                st.error(error_msg)
                st.session_state[f"public_messages_{public_id}"].append({
                    "role": "assistant", 
                    "content": error_msg,
                    "sources": []
                })

if __name__ == "__main__":
    main()