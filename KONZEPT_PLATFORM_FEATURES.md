# 🚀 Chatbot-Platform: Erweiterte Features Konzept

## 📋 Fokus-Bereiche

1. **Erweiterte Chatbot-Konfiguration** - Umfassende Anpassungsmöglichkeiten
2. **Datenbankschema für Business-Features** - Technische Infrastruktur  
3. **Sichere URL-Deployment** - Professionelle Chatbot-URLs
4. **Detaillierte UI/UX-Konzepte** - Benutzerfreundliche Konfiguration

---

## 🎨 1. Erweiterte Chatbot-Konfiguration

### **Konfigurationskategorien**

#### **A) Grundkonfiguration**
```yaml
Basic_Settings:
  name: string (max 100 chars)
  description: text (max 500 chars)
  created_by: string
  tags: array[string] (für Kategorisierung)
```

#### **B) Branding & Design**
```yaml
Branding:
  logo:
    file_upload: [PNG, JPG, SVG]
    max_size: 2MB
    recommended_size: "400x400px"
    fallback: auto-generated initial
  
  colors:
    primary_color: color_picker (default: #1f3a93)
    secondary_color: color_picker (default: #34495e)
    accent_color: color_picker (default: #e74c3c)
    background_color: color_picker (default: #f8f9fa)
    text_color: color_picker (default: #2c3e50)
  
  typography:
    font_family: [Roboto, Open Sans, Lato, Montserrat, Custom]
    font_size: [small, medium, large, custom]
    
  layout:
    chat_width: [narrow, medium, wide, full]
    message_style: [bubbles, cards, minimal]
    avatar_style: [circle, square, none]
```

#### **C) Unternehmensinformationen**
```yaml
Company_Info:
  basic:
    company_name: string
    industry: dropdown [IT, Handel, Dienstleistung, Produktion, etc.]
    company_size: dropdown [1-10, 11-50, 51-200, 200+]
    
  contact:
    address:
      street: string
      zip_code: string
      city: string
      country: dropdown
    phone: string (mit Ländercode-Auswahl)
    email: email
    website: url
    
  business_hours:
    timezone: dropdown (automatisch aus Adresse vorschlagen)
    schedule:
      monday: {open: time, close: time, closed: boolean}
      tuesday: {open: time, close: time, closed: boolean}
      # ... für alle Wochentage
    holidays: array[{date: date, name: string, closed: boolean}]
    special_hours: array[{date_range: range, hours: custom, note: string}]
    
  social_media:
    linkedin: url (optional)
    facebook: url (optional)
    instagram: url (optional)
    twitter: url (optional)
    youtube: url (optional)
    xing: url (optional)
```

#### **D) Chatbot-Verhalten**
```yaml
Behavior_Settings:
  personality:
    tone: dropdown [Professionell, Freundlich, Technisch, Lässig, Enthusiastisch]
    formality: slider [Du/Sie, Automatisch erkennen]
    response_length: dropdown [Kurz, Mittel, Ausführlich, Kontextabhängig]
    
  language:
    primary_language: dropdown [Deutsch, Englisch, Französisch, etc.]
    fallback_language: dropdown
    auto_translate: boolean
    
  capabilities:
    can_request_email: boolean
    can_show_contacts: boolean
    can_schedule_appointments: boolean (future feature)
    can_transfer_to_human: boolean (future feature)
    
  custom_instructions:
    system_prompt_additions: textarea (max 1000 chars)
    forbidden_topics: array[string]
    required_disclaimers: textarea
    
  response_patterns:
    greeting_messages: array[string] (randomize)
    fallback_responses: array[string]
    goodbye_messages: array[string]
    offline_message: string
```

#### **E) Email-Capture Konfiguration**
```yaml
Email_Capture:
  enabled: boolean
  settings:
    trigger_conditions:
      after_messages: number (default: 3)
      keywords: array[string] (z.B. "preise", "angebot")
      session_duration: minutes (z.B. nach 2 Minuten)
      user_shows_interest: boolean (KI-Erkennung)
    
    prompts:
      initial_request: string
      follow_up_request: string (falls erste Anfrage abgelehnt)
      thank_you_message: string
      
    behavior:
      max_requests_per_session: number (default: 1)
      cooldown_between_requests: minutes
      show_privacy_note: boolean
      require_consent_checkbox: boolean
      
    data_handling:
      store_conversation_context: boolean
      estimate_lead_quality: boolean
      tag_lead_source: boolean
```

#### **F) Kontaktpersonen-System**
```yaml
Contact_Persons:
  enabled: boolean
  settings:
    max_contacts: number (default: 5)
    display_style: [cards, list, carousel]
    show_availability: boolean
    
  triggers:
    show_after_messages: number
    keyword_triggers: array[string]
    topic_based: boolean (KI erkennt passende Themen)
    fallback_contact: boolean (wenn Bot nicht helfen kann)
    
  person_fields:
    name: string (required)
    position: string (required)
    department: string (optional)
    specialization: text (optional)
    email: email (required)
    phone: string (optional)
    profile_image: file_upload
    availability_hours: schedule (optional)
    languages: array[string] (optional)
    
  interaction:
    contact_button_text: string (default: "Kontakt aufnehmen")
    contact_form_fields: array[custom_fields]
    auto_email_notification: boolean
    lead_qualification_questions: array[questions]
```

---

## 🗄️ 2. Erweiterte Datenbankschema

### **Haupttabellen**

```sql
-- Erweiterte Chatbot-Konfiguration
CREATE TABLE chatbot_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    tags TEXT[], -- PostgreSQL Array für Tags
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Deployment
    deployment_url VARCHAR(255) UNIQUE,
    url_token VARCHAR(64) UNIQUE,
    custom_domain VARCHAR(255), -- Für zukünftige Custom-Domain-Features
    
    -- Branding
    branding JSONB NOT NULL DEFAULT '{}', -- Alle Branding-Einstellungen als JSON
    
    -- Company Info
    company_info JSONB NOT NULL DEFAULT '{}',
    
    -- Behavior Settings
    behavior_settings JSONB NOT NULL DEFAULT '{}',
    
    -- Feature Flags
    email_capture_enabled BOOLEAN DEFAULT FALSE,
    contact_persons_enabled BOOLEAN DEFAULT FALSE,
    
    -- Analytics
    total_conversations INTEGER DEFAULT 0,
    total_leads_captured INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    
    -- Indizes für Performance
    CONSTRAINT valid_url_token CHECK (length(url_token) >= 32)
);

-- Branding Assets (separate für bessere Performance)
CREATE TABLE chatbot_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- 'logo', 'contact_image', 'background'
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(chatbot_id, asset_type) -- Ein Asset pro Typ pro Chatbot
);

-- Kontaktpersonen
CREATE TABLE contact_persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    specialization TEXT,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    languages VARCHAR(10)[], -- Array von Sprachcodes
    availability_hours JSONB, -- Verfügbarkeitszeiten als JSON
    profile_image_id UUID REFERENCES chatbot_assets(id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Email-Capture Konfiguration (separate Tabelle für Flexibilität)
CREATE TABLE email_capture_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE UNIQUE,
    trigger_conditions JSONB NOT NULL DEFAULT '{}',
    prompts JSONB NOT NULL DEFAULT '{}',
    behavior_settings JSONB NOT NULL DEFAULT '{}',
    data_handling_settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Captured Leads
CREATE TABLE captured_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    conversation_id VARCHAR(255), -- Session-ID des Chats
    
    -- Context Data
    capture_trigger VARCHAR(100), -- 'keyword', 'duration', 'manual', etc.
    conversation_context JSONB, -- Gesprächskontext zur Lead-Qualifikation
    user_location JSONB, -- IP-basierte Location (falls verfügbar)
    device_info JSONB, -- Browser/Device-Informationen
    
    -- Lead Qualification
    estimated_interest_level INTEGER CHECK (estimated_interest_level BETWEEN 1 AND 10),
    topics_discussed TEXT[],
    session_duration INTEGER, -- in Sekunden
    message_count INTEGER,
    
    -- Timestamps
    captured_at TIMESTAMP DEFAULT NOW(),
    last_interaction TIMESTAMP DEFAULT NOW(),
    
    -- Lead Status
    lead_status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
    notes TEXT,
    
    -- Privacy & Compliance
    consent_given BOOLEAN DEFAULT FALSE,
    gdpr_compliant BOOLEAN DEFAULT TRUE,
    data_retention_until TIMESTAMP, -- Automatische Löschung
    
    -- Indizes
    INDEX idx_chatbot_leads (chatbot_id, captured_at),
    INDEX idx_lead_status (lead_status, captured_at)
);

-- Analytics & Usage Tracking
CREATE TABLE chatbot_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Basic Metrics
    unique_visitors INTEGER DEFAULT 0,
    total_conversations INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    average_session_duration FLOAT DEFAULT 0, -- in Minuten
    bounce_rate FLOAT DEFAULT 0, -- Prozent
    
    -- Lead Metrics
    emails_captured INTEGER DEFAULT 0,
    contact_requests INTEGER DEFAULT 0,
    conversion_rate FLOAT DEFAULT 0,
    
    -- Performance Metrics
    average_response_time FLOAT DEFAULT 0, -- in Sekunden
    error_rate FLOAT DEFAULT 0,
    
    -- User Satisfaction (falls implementiert)
    satisfaction_score FLOAT,
    feedback_count INTEGER DEFAULT 0,
    
    -- Aggregated hourly data für detailliertere Analyse
    hourly_stats JSONB, -- {hour: {visitors, conversations, etc.}}
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(chatbot_id, date)
);

-- Conversation Logs (optional, für detaillierte Analyse)
CREATE TABLE conversation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    conversation_id VARCHAR(255) NOT NULL,
    message_index INTEGER NOT NULL,
    
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    
    -- Metadata
    response_time FLOAT, -- Zeit für Bot-Antwort
    sources_used JSONB, -- Verwendete Quellen für die Antwort
    user_feedback INTEGER, -- Optional: User-Rating für die Antwort
    
    -- Privacy: Automatische Löschung nach X Tagen
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days'),
    
    INDEX idx_conversation (chatbot_id, conversation_id, message_index),
    INDEX idx_expiry (expires_at) -- Für automatische Cleanup-Jobs
);

-- Custom Fields für erweiterte Konfiguration
CREATE TABLE custom_configuration_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    field_category VARCHAR(100) NOT NULL, -- 'branding', 'behavior', 'contact', etc.
    field_key VARCHAR(100) NOT NULL,
    field_value JSONB,
    field_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'json', 'file'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(chatbot_id, field_category, field_key)
);

-- Indizes für Performance
CREATE INDEX idx_chatbots_active ON chatbot_configs(is_active, created_at);
CREATE INDEX idx_chatbots_url ON chatbot_configs(deployment_url) WHERE deployment_url IS NOT NULL;
CREATE INDEX idx_analytics_date ON chatbot_analytics(chatbot_id, date DESC);
CREATE INDEX idx_leads_recent ON captured_leads(chatbot_id, captured_at DESC);

-- Views für häufige Abfragen
CREATE VIEW chatbot_summary AS
SELECT 
    c.id,
    c.name,
    c.description,
    c.created_at,
    c.is_active,
    c.deployment_url,
    c.total_conversations,
    c.total_leads_captured,
    COUNT(cp.id) as contact_persons_count,
    COUNT(cl.id) as total_leads,
    AVG(cl.estimated_interest_level) as avg_lead_quality
FROM chatbot_configs c
LEFT JOIN contact_persons cp ON c.id = cp.chatbot_id AND cp.is_active = TRUE
LEFT JOIN captured_leads cl ON c.id = cl.chatbot_id
GROUP BY c.id;
```

---

## 🔗 3. Sichere URL-Deployment System

### **URL-Architektur**

```yaml
URL_Structure:
  production: "https://chatbots.ihredomain.de/bot/{chatbot_id}"
  with_token: "https://chatbots.ihredomain.de/bot/{chatbot_id}?token={secure_token}"
  custom_domain: "https://chat.kundendomain.de" # Zukünftige Erweiterung
  
Security_Features:
  - Unique Chatbot-IDs (UUID)
  - Optional Security-Token für zusätzlichen Schutz
  - Rate Limiting pro IP und pro Chatbot
  - SSL/TLS Verschlüsselung
  - Access Logging für Monitoring
```

### **URL-Generierung & Management**

```python
import secrets
import hashlib
from urllib.parse import urljoin

class ChatbotURLManager:
    """Verwaltet sichere URLs für Chatbot-Deployment"""
    
    BASE_DOMAIN = "https://chatbots.ihredomain.de"
    
    def generate_chatbot_url(self, chatbot_id: str, use_token: bool = True) -> dict:
        """
        Generiert sichere URL für Chatbot-Deployment
        """
        base_url = f"{self.BASE_DOMAIN}/bot/{chatbot_id}"
        
        if use_token:
            # Sicherer Token für zusätzlichen Schutz
            token = self._generate_secure_token(chatbot_id)
            full_url = f"{base_url}?token={token}"
            
            # Token in Datenbank speichern
            self._store_url_token(chatbot_id, token)
        else:
            full_url = base_url
            token = None
        
        return {
            "full_url": full_url,
            "base_url": base_url,
            "token": token,
            "qr_code_url": self._generate_qr_code(full_url),
            "short_url": self._generate_short_url(full_url)  # Optional
        }
    
    def _generate_secure_token(self, chatbot_id: str) -> str:
        """Generiert kryptographisch sicheren Token"""
        # Kombination aus Random-Bytes und Chatbot-spezifischen Daten
        random_part = secrets.token_urlsafe(24)  # 32 Zeichen
        chatbot_hash = hashlib.sha256(f"{chatbot_id}{secrets.token_hex(8)}".encode()).hexdigest()[:16]
        return f"{random_part}_{chatbot_hash}"
    
    def validate_access(self, chatbot_id: str, token: str = None) -> dict:
        """Validiert Zugriff auf Chatbot"""
        chatbot = self._get_chatbot_config(chatbot_id)
        
        if not chatbot or not chatbot.is_active:
            return {"valid": False, "reason": "chatbot_not_found"}
        
        # Token-Validierung falls erforderlich
        if chatbot.url_token and not token:
            return {"valid": False, "reason": "token_required"}
        
        if chatbot.url_token and token != chatbot.url_token:
            return {"valid": False, "reason": "invalid_token"}
        
        # Rate Limiting prüfen
        if not self._check_rate_limit(chatbot_id):
            return {"valid": False, "reason": "rate_limit_exceeded"}
        
        return {
            "valid": True,
            "chatbot": chatbot,
            "access_logged": self._log_access(chatbot_id, token)
        }

class ChatbotRouter:
    """FastAPI/Flask Router für Chatbot-URLs"""
    
    def __init__(self):
        self.url_manager = ChatbotURLManager()
    
    async def serve_chatbot(self, chatbot_id: str, token: str = None, request=None):
        """
        Serviert Chatbot-Interface über sichere URL
        """
        # Zugriff validieren
        access_result = self.url_manager.validate_access(chatbot_id, token)
        
        if not access_result["valid"]:
            return self._render_error_page(access_result["reason"])
        
        chatbot_config = access_result["chatbot"]
        
        # Analytics-Tracking
        self._track_visit(chatbot_id, request)
        
        # Chatbot-Interface rendern
        return self._render_chatbot_interface(chatbot_config)
    
    def _render_chatbot_interface(self, config) -> str:
        """Rendert vollständiges Chatbot-Interface"""
        
        # HTML-Template mit eingebetteter Konfiguration
        template = f"""
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{config.name} - AI Assistant</title>
            <link rel="icon" href="{config.branding.get('logo_url', '/default-favicon.ico')}">
            
            <!-- Custom Styling -->
            <style>
                :root {{
                    --primary-color: {config.branding.get('primary_color', '#1f3a93')};
                    --secondary-color: {config.branding.get('secondary_color', '#34495e')};
                    --accent-color: {config.branding.get('accent_color', '#e74c3c')};
                    --background-color: {config.branding.get('background_color', '#f8f9fa')};
                    --text-color: {config.branding.get('text_color', '#2c3e50')};
                }}
                
                /* Responsive Design */
                .chat-container {{
                    max-width: {config.branding.get('chat_width', '800px')};
                    margin: 0 auto;
                    padding: 20px;
                    background: var(--background-color);
                    min-height: 100vh;
                }}
                
                /* Company Header */
                .company-header {{
                    text-align: center;
                    padding: 20px;
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    border-radius: 12px;
                    margin-bottom: 20px;
                    color: white;
                }}
                
                .company-logo {{
                    max-width: 120px;
                    max-height: 60px;
                    margin-bottom: 10px;
                }}
                
                /* Chat Interface Styling */
                .chat-messages {{
                    max-height: 60vh;
                    overflow-y: auto;
                    padding: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }}
                
                /* Business Hours Display */
                .business-hours {{
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 10px 0;
                    border-left: 4px solid var(--primary-color);
                }}
                
                /* Contact Cards */
                .contact-card {{
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 10px 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                }}
                
                .contact-card:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }}
            </style>
        </head>
        <body>
            <div class="chat-container">
                <!-- Company Header -->
                <div class="company-header">
                    {self._render_company_header(config)}
                </div>
                
                <!-- Business Hours (if enabled) -->
                {self._render_business_hours(config)}
                
                <!-- Chat Interface -->
                <div id="chat-interface">
                    <!-- Wird dynamisch geladen -->
                </div>
                
                <!-- Contact Persons (if enabled) -->
                {self._render_contact_section(config)}
            </div>
            
            <!-- Chat-Funktionalität -->
            <script>
                // Chatbot-Konfiguration für Frontend
                window.chatbotConfig = {json.dumps(config.to_dict())};
                
                // Chat-Interface initialisieren
                initializeChatInterface();
            </script>
            <script src="/static/js/chatbot-interface.js"></script>
        </body>
        </html>
        """
        
        return template
```

---

## 🎨 4. Detaillierte UI/UX-Konzepte

### **A) Erweiterte Konfigurationsseite**

#### **Multi-Step Wizard Design**

```python
def show_extended_chatbot_configuration():
    """
    Mehrstufiger Konfigurationswizard mit verbesserter UX
    """
    
    # Progress Indicator
    steps = [
        {"id": "basic", "title": "Grundeinstellungen", "icon": "📋"},
        {"id": "branding", "title": "Design & Branding", "icon": "🎨"},
        {"id": "company", "title": "Unternehmensdaten", "icon": "🏢"},
        {"id": "features", "title": "Features & Verhalten", "icon": "⚡"},
        {"id": "contacts", "title": "Kontaktpersonen", "icon": "👥"},
        {"id": "data", "title": "Datenquellen", "icon": "📊"},
        {"id": "preview", "title": "Vorschau & Deployment", "icon": "🚀"}
    ]
    
    # Session State für Wizard-Navigation
    if 'current_step' not in st.session_state:
        st.session_state.current_step = 0
    
    if 'chatbot_config' not in st.session_state:
        st.session_state.chatbot_config = initialize_default_config()
    
    # Progress Bar
    render_progress_indicator(steps, st.session_state.current_step)
    
    # Current Step Content
    current_step = steps[st.session_state.current_step]
    
    st.markdown(f"## {current_step['icon']} {current_step['title']}")
    
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
    
    # Navigation Buttons
    render_wizard_navigation(steps)

def render_progress_indicator(steps, current_step):
    """Visueller Progress Indicator"""
    
    # CSS für Progress Indicator
    st.markdown("""
    <style>
    .progress-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0;
        margin-bottom: 30px;
    }
    .progress-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;
    }
    .progress-step:not(:last-child)::after {
        content: '';
        position: absolute;
        top: 20px;
        right: -50%;
        width: 100%;
        height: 2px;
        background: #dee2e6;
        z-index: 1;
    }
    .progress-step.completed::after {
        background: #28a745;
    }
    .progress-step.active::after {
        background: linear-gradient(to right, #28a745 50%, #dee2e6 50%);
    }
    .step-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #dee2e6;
        color: #6c757d;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        z-index: 2;
        position: relative;
    }
    .step-circle.completed {
        background: #28a745;
        color: white;
    }
    .step-circle.active {
        background: #007bff;
        color: white;
    }
    .step-title {
        margin-top: 8px;
        font-size: 12px;
        text-align: center;
        color: #6c757d;
        font-weight: 500;
    }
    .step-title.active {
        color: #007bff;
        font-weight: 600;
    }
    .step-title.completed {
        color: #28a745;
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Progress HTML generieren
    progress_html = '<div class="progress-container">'
    
    for i, step in enumerate(steps):
        css_class = ""
        if i < current_step:
            css_class = "completed"
        elif i == current_step:
            css_class = "active"
        
        progress_html += f'''
        <div class="progress-step {css_class}">
            <div class="step-circle {css_class}">
                {step["icon"] if css_class == "active" else (i + 1)}
            </div>
            <div class="step-title {css_class}">{step["title"]}</div>
        </div>
        '''
    
    progress_html += '</div>'
    st.markdown(progress_html, unsafe_allow_html=True)

def render_branding_step():
    """Detaillierte Branding-Konfiguration"""
    
    st.markdown("### 🎨 Logo & Visuelles Design")
    
    # Logo Upload mit Preview
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Logo Upload")
        logo_file = st.file_uploader(
            "Firmenlogo hochladen",
            type=['png', 'jpg', 'jpeg', 'svg'],
            help="Empfohlene Größe: 400x400px, max. 2MB"
        )
        
        if logo_file:
            st.session_state.chatbot_config['branding']['logo'] = logo_file
            
    with col2:
        st.subheader("Logo Vorschau")
        if logo_file:
            st.image(logo_file, width=200, caption="Ihr Logo")
        else:
            # Fallback: Auto-generiertes Logo mit Initialen
            company_name = st.session_state.chatbot_config.get('name', 'CB')
            initials = ''.join([word[0].upper() for word in company_name.split()[:2]])
            st.markdown(f"""
            <div style="
                width: 200px; 
                height: 200px; 
                background: linear-gradient(135deg, #1f3a93, #34495e);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 48px;
                font-weight: bold;
                margin: 0 auto;
            ">{initials}</div>
            <p style="text-align: center; margin-top: 10px; color: #6c757d;">
                Auto-generiertes Logo (lädt ein eigenes Logo hoch)
            </p>
            """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Farbschema
    st.subheader("🎨 Farbschema")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        primary_color = st.color_picker(
            "Primärfarbe",
            value=st.session_state.chatbot_config['branding'].get('primary_color', '#1f3a93'),
            help="Hauptfarbe für Buttons, Header, etc."
        )
        st.session_state.chatbot_config['branding']['primary_color'] = primary_color
        
    with col2:
        secondary_color = st.color_picker(
            "Sekundärfarbe", 
            value=st.session_state.chatbot_config['branding'].get('secondary_color', '#34495e'),
            help="Zweite Farbe für Akzente und Verläufe"
        )
        st.session_state.chatbot_config['branding']['secondary_color'] = secondary_color
        
    with col3:
        accent_color = st.color_picker(
            "Akzentfarbe",
            value=st.session_state.chatbot_config['branding'].get('accent_color', '#e74c3c'),
            help="Farbe für wichtige Elemente und Benachrichtigungen"
        )
        st.session_state.chatbot_config['branding']['accent_color'] = accent_color
    
    # Live-Preview des Farbschemas
    st.subheader("Farb-Vorschau")
    render_color_preview(primary_color, secondary_color, accent_color)
    
    st.markdown("---")
    
    # Typography & Layout
    st.subheader("📝 Typografie & Layout")
    
    col1, col2 = st.columns(2)
    
    with col1:
        font_family = st.selectbox(
            "Schriftart",
            ["Roboto", "Open Sans", "Lato", "Montserrat", "Source Sans Pro"],
            index=0
        )
        
        font_size = st.select_slider(
            "Schriftgröße",
            options=["Klein", "Normal", "Groß"],
            value="Normal"
        )
        
    with col2:
        chat_width = st.selectbox(
            "Chat-Breite",
            ["Schmal (600px)", "Normal (800px)", "Breit (1000px)", "Vollbild"],
            index=1
        )
        
        message_style = st.selectbox(
            "Nachrichten-Stil",
            ["Sprechblasen", "Karten", "Minimal"],
            index=0
        )
    
    # Speichere Typography-Einstellungen
    st.session_state.chatbot_config['branding'].update({
        'font_family': font_family,
        'font_size': font_size,
        'chat_width': chat_width,
        'message_style': message_style
    })

def render_color_preview(primary, secondary, accent):
    """Live-Vorschau der Farbkombination"""
    
    preview_html = f"""
    <div style="
        background: linear-gradient(135deg, {primary}, {secondary});
        padding: 20px;
        border-radius: 12px;
        color: white;
        margin: 15px 0;
    ">
        <h3 style="margin: 0 0 10px 0;">Ihr Chatbot-Design</h3>
        <p style="margin: 0; opacity: 0.9;">So wird Ihr Chatbot aussehen</p>
        
        <div style="
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
        ">
            <div style="
                background: white;
                color: {primary};
                padding: 10px 15px;
                border-radius: 20px 20px 5px 20px;
                margin-bottom: 10px;
                display: inline-block;
                max-width: 70%;
            ">
                Hallo! Wie kann ich Ihnen helfen?
            </div>
            
            <div style="
                background: {accent};
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                display: inline-block;
                font-size: 14px;
                margin-left: 20px;
            ">
                Kontakt aufnehmen
            </div>
        </div>
    </div>
    """
    
    st.markdown(preview_html, unsafe_allow_html=True)

def render_company_info_step():
    """Unternehmensdaten-Formular"""
    
    st.markdown("### 🏢 Grunddaten")
    
    col1, col2 = st.columns(2)
    
    with col1:
        company_name = st.text_input(
            "Firmenname *",
            value=st.session_state.chatbot_config.get('company_name', ''),
            placeholder="Ihre Firma GmbH"
        )
        
        industry = st.selectbox(
            "Branche",
            [
                "Wählen Sie eine Branche",
                "IT & Software", "E-Commerce", "Beratung", "Gesundheitswesen",
                "Bildung", "Finanzdienstleistungen", "Immobilien", "Automotive",
                "Fertigung", "Handel", "Gastronomie", "Tourismus", "Sonstiges"
            ]
        )
        
        company_size = st.selectbox(
            "Unternehmensgröße",
            ["1-10 Mitarbeiter", "11-50 Mitarbeiter", "51-200 Mitarbeiter", "200+ Mitarbeiter"]
        )
        
    with col2:
        website = st.text_input(
            "Website",
            value=st.session_state.chatbot_config.get('website', ''),
            placeholder="https://www.ihre-firma.de"
        )
        
        email = st.text_input(
            "Hauptkontakt-Email *",
            placeholder="info@ihre-firma.de"
        )
        
        phone = st.text_input(
            "Telefon",
            placeholder="+49 123 456789"
        )
    
    # Speichere Grunddaten
    st.session_state.chatbot_config.update({
        'company_name': company_name,
        'industry': industry,
        'company_size': company_size,
        'website': website,
        'email': email,
        'phone': phone
    })
    
    st.markdown("---")
    st.markdown("### 📍 Adresse")
    
    col1, col2, col3 = st.columns([2, 1, 2])
    
    with col1:
        street = st.text_input("Straße & Hausnummer", placeholder="Musterstraße 123")
        
    with col2:
        zip_code = st.text_input("PLZ", placeholder="12345")
        
    with col3:
        city = st.text_input("Stadt", placeholder="Musterstadt")
    
    country = st.selectbox(
        "Land",
        ["Deutschland", "Österreich", "Schweiz", "Andere"]
    )
    
    st.markdown("---")
    st.markdown("### 🕒 Öffnungszeiten")
    
    render_business_hours_editor()
    
    st.markdown("---")
    st.markdown("### 🌐 Social Media (Optional)")
    
    social_col1, social_col2 = st.columns(2)
    
    with social_col1:
        linkedin = st.text_input("LinkedIn", placeholder="https://linkedin.com/company/...")
        facebook = st.text_input("Facebook", placeholder="https://facebook.com/...")
        instagram = st.text_input("Instagram", placeholder="https://instagram.com/...")
        
    with social_col2:
        twitter = st.text_input("Twitter/X", placeholder="https://twitter.com/...")
        youtube = st.text_input("YouTube", placeholder="https://youtube.com/@...")
        xing = st.text_input("Xing", placeholder="https://xing.com/companies/...")

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
    
    if 'business_hours' not in st.session_state.chatbot_config:
        st.session_state.chatbot_config['business_hours'] = {}
    
    # Quick-Setup Buttons
    st.markdown("**Schnellauswahl:**")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        if st.button("Mo-Fr 9-17"):
            set_business_hours_preset("weekdays_9_17")
    with col2:
        if st.button("Mo-Fr 8-18"):
            set_business_hours_preset("weekdays_8_18")
    with col3:
        if st.button("Mo-Sa 9-18"):
            set_business_hours_preset("weekdays_saturday_9_18")
    with col4:
        if st.button("24/7"):
            set_business_hours_preset("24_7")
    
    st.markdown("**Detailkonfiguration:**")
    
    for day_key, day_name in days:
        col1, col2, col3, col4 = st.columns([2, 2, 2, 1])
        
        with col1:
            st.markdown(f"**{day_name}**")
            
        with col2:
            is_closed = st.checkbox(
                "Geschlossen", 
                key=f"closed_{day_key}",
                value=st.session_state.chatbot_config['business_hours'].get(day_key, {}).get('closed', False)
            )
            
        if not is_closed:
            with col3:
                start_time = st.time_input(
                    "Von",
                    key=f"start_{day_key}",
                    value=datetime.time(9, 0)
                )
                
            with col4:
                end_time = st.time_input(
                    "Bis",
                    key=f"end_{day_key}",
                    value=datetime.time(17, 0)
                )
                
            # Speichere Zeiten
            st.session_state.chatbot_config['business_hours'][day_key] = {
                'closed': False,
                'start': start_time.strftime('%H:%M'),
                'end': end_time.strftime('%H:%M')
            }
        else:
            st.session_state.chatbot_config['business_hours'][day_key] = {'closed': True}

def render_features_step():
    """Erweiterte Features-Konfiguration"""
    
    st.markdown("### ⚡ Chatbot-Funktionen")
    
    # Email-Capture Konfiguration
    st.subheader("📧 Email-Erfassung")
    
    email_capture_enabled = st.checkbox(
        "Email-Erfassung aktivieren",
        help="Der Chatbot kann Besucher nach ihrer Email-Adresse fragen"
    )
    
    if email_capture_enabled:
        with st.expander("Email-Capture Einstellungen", expanded=True):
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("**Auslöser:**")
                
                after_messages = st.number_input(
                    "Nach X Nachrichten fragen",
                    min_value=1,
                    max_value=20,
                    value=3,
                    help="Nach wie vielen ausgetauschten Nachrichten soll nach der Email gefragt werden?"
                )
                
                after_duration = st.number_input(
                    "Nach X Minuten fragen",
                    min_value=1,
                    max_value=30,
                    value=2,
                    help="Nach wie vielen Minuten Gesprächsdauer soll nach der Email gefragt werden?"
                )
                
                trigger_keywords = st.text_area(
                    "Schlüsselwörter (eines pro Zeile)",
                    value="preise\nangebot\nkontakt\nberatung\ndemo",
                    help="Bei diesen Wörtern wird nach der Email gefragt"
                )
                
            with col2:
                st.markdown("**Nachrichten:**")
                
                email_prompt = st.text_area(
                    "Prompt für Email-Anfrage",
                    value="Für detaillierte Informationen können Sie gerne Ihre Email-Adresse hinterlassen. Ich sende Ihnen dann weitere Details zu.",
                    height=100
                )
                
                follow_up_prompt = st.text_area(
                    "Follow-up bei Ablehnung",
                    value="Kein Problem! Falls Sie später doch Interesse haben, können Sie jederzeit nach Kontaktmöglichkeiten fragen.",
                    height=100
                )
                
                thank_you_message = st.text_area(
                    "Dankesnachricht",
                    value="Vielen Dank! Wir werden uns zeitnah bei Ihnen melden.",
                    height=100
                )
            
            # Datenschutz-Einstellungen
            st.markdown("**Datenschutz:**")
            
            col1, col2 = st.columns(2)
            with col1:
                require_consent = st.checkbox(
                    "Einverständniserklärung erforderlich",
                    value=True,
                    help="GDPR-konforme Einverständniserklärung vor Email-Erfassung"
                )
                
            with col2:
                max_requests = st.number_input(
                    "Max. Anfragen pro Session",
                    min_value=1,
                    max_value=5,
                    value=1,
                    help="Wie oft darf pro Sitzung nach der Email gefragt werden?"
                )
    
    st.markdown("---")
    
    # Kontaktpersonen
    st.subheader("👥 Kontaktpersonen")
    
    contact_persons_enabled = st.checkbox(
        "Kontaktpersonen-System aktivieren",
        help="Zeigt Ansprechpartner als interaktive Karten im Chat"
    )
    
    if contact_persons_enabled:
        with st.expander("Kontaktpersonen Einstellungen", expanded=True):
            
            col1, col2 = st.columns(2)
            
            with col1:
                contact_display_style = st.selectbox(
                    "Darstellungsstil",
                    ["Karten", "Liste", "Karussell"],
                    help="Wie sollen die Kontaktpersonen angezeigt werden?"
                )
                
                max_contacts_shown = st.number_input(
                    "Max. angezeigte Kontakte",
                    min_value=1,
                    max_value=10,
                    value=3
                )
                
            with col2:
                contact_trigger_keywords = st.text_area(
                    "Auslöse-Schlüsselwörter",
                    value="ansprechpartner\nkontakt\nverkauf\nberatung\nmitarbeiter",
                    help="Bei diesen Wörtern werden Kontaktpersonen angezeigt"
                )
                
                show_after_messages = st.number_input(
                    "Nach X Nachrichten anzeigen",
                    min_value=1,
                    max_value=20,
                    value=5
                )
    
    st.markdown("---")
    
    # Chatbot-Verhalten
    st.subheader("🤖 Verhalten & Persönlichkeit")
    
    col1, col2 = st.columns(2)
    
    with col1:
        response_tone = st.selectbox(
            "Antwort-Stil",
            ["Professionell", "Freundlich", "Technisch", "Lässig", "Enthusiastisch"]
        )
        
        response_length = st.selectbox(
            "Antwort-Länge",
            ["Kurz & prägnant", "Mittel", "Ausführlich", "Kontextabhängig"]
        )
        
        formality_level = st.selectbox(
            "Anrede",
            ["Sie (förmlich)", "Du (informell)", "Automatisch erkennen"]
        )
        
    with col2:
        primary_language = st.selectbox(
            "Hauptsprache",
            ["Deutsch", "Englisch", "Französisch", "Spanisch", "Italienisch"]
        )
        
        fallback_language = st.selectbox(
            "Fallback-Sprache",
            ["Englisch", "Deutsch", "Automatisch"]
        )
        
        auto_translate = st.checkbox(
            "Automatische Übersetzung",
            help="Versucht Anfragen in anderen Sprachen zu verstehen"
        )
    
    # Custom System Prompt
    st.markdown("**Zusätzliche Anweisungen:**")
    
    custom_instructions = st.text_area(
        "Spezielle Anweisungen für den Chatbot",
        placeholder="z.B. 'Betone immer unsere 24/7-Verfügbarkeit und kostenlosen Support' oder 'Verwende eine lockere, jugendliche Sprache'",
        height=120,
        help="Diese Anweisungen werden in das System-Prompt des Chatbots integriert"
    )
    
    # Verbotene Themen
    forbidden_topics = st.text_area(
        "Verbotene/Ausgeschlossene Themen",
        placeholder="z.B. 'Politik', 'Religion', 'Konkurrenzprodukte'",
        help="Themen, die der Chatbot nicht besprechen soll"
    )
    
    # Speichere alle Feature-Einstellungen
    st.session_state.chatbot_config['features'] = {
        'email_capture': {
            'enabled': email_capture_enabled,
            'after_messages': after_messages if email_capture_enabled else None,
            'after_duration': after_duration if email_capture_enabled else None,
            'trigger_keywords': trigger_keywords.split('\n') if email_capture_enabled else [],
            'prompts': {
                'initial': email_prompt if email_capture_enabled else '',
                'follow_up': follow_up_prompt if email_capture_enabled else '',
                'thank_you': thank_you_message if email_capture_enabled else ''
            },
            'require_consent': require_consent if email_capture_enabled else True,
            'max_requests': max_requests if email_capture_enabled else 1
        },
        'contact_persons': {
            'enabled': contact_persons_enabled,
            'display_style': contact_display_style if contact_persons_enabled else 'Karten',
            'max_shown': max_contacts_shown if contact_persons_enabled else 3,
            'trigger_keywords': contact_trigger_keywords.split('\n') if contact_persons_enabled else [],
            'show_after_messages': show_after_messages if contact_persons_enabled else 5
        },
        'behavior': {
            'tone': response_tone,
            'length': response_length,
            'formality': formality_level,
            'language': primary_language,
            'fallback_language': fallback_language,
            'auto_translate': auto_translate,
            'custom_instructions': custom_instructions,
            'forbidden_topics': forbidden_topics.split('\n') if forbidden_topics else []
        }
    }

def render_wizard_navigation(steps):
    """Navigation für Multi-Step Wizard"""
    
    st.markdown("---")
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col1:
        if st.session_state.current_step > 0:
            if st.button("⬅️ Zurück", use_container_width=True):
                st.session_state.current_step -= 1
                st.rerun()
    
    with col3:
        if st.session_state.current_step < len(steps) - 1:
            # Validierung für aktuellen Step
            if validate_current_step(steps[st.session_state.current_step]["id"]):
                if st.button("Weiter ➡️", use_container_width=True, type="primary"):
                    st.session_state.current_step += 1
                    st.rerun()
            else:
                st.button("Weiter ➡️", use_container_width=True, disabled=True)
                st.caption("Bitte füllen Sie alle Pflichtfelder aus")
        else:
            # Letzter Step: Chatbot erstellen
            if st.button("🚀 Chatbot erstellen", use_container_width=True, type="primary"):
                create_chatbot_from_config()

def validate_current_step(step_id: str) -> bool:
    """Validiert ob der aktuelle Step vollständig ausgefüllt ist"""
    
    config = st.session_state.chatbot_config
    
    if step_id == "basic":
        return bool(config.get('name', '').strip())
    elif step_id == "company":
        return bool(config.get('company_name', '').strip() and config.get('email', '').strip())
    # Weitere Validierungen...
    
    return True
```

---

## 🎯 Implementierungsreihenfolge

### **Phase 1: Datenbankschema & Backend (1-2 Wochen)**
1. ✅ Erweiterte Datenbankschemas implementieren
2. ✅ API-Endpunkte für neue Features
3. ✅ File-Upload-System für Assets

### **Phase 2: UI-Erweiterungen (2-3 Wochen)**
1. ✅ Multi-Step Wizard für Konfiguration
2. ✅ Erweiterte Formular-Komponenten
3. ✅ Live-Previews und Validierung

### **Phase 3: Sichere URL-Deployment (1 Woche)**
1. ✅ URL-Generierung und Routing
2. ✅ Security-Features und Rate-Limiting
3. ✅ Custom Chatbot-Interface

### **Phase 4: Feature-Integration (1-2 Wochen)**
1. ✅ Email-Capture-System im Chat
2. ✅ Kontaktpersonen-Integration
3. ✅ Analytics und Tracking

---

**💡 Diese Konzeption bietet eine umfassende Grundlage für eine professionelle Chatbot-Konfigurationsplattform mit allen gewünschten Business-Features und einer intuitiven Benutzeroberfläche.**