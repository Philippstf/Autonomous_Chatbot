-- Erweiterte Chatbot-Platform Schema
-- Version 2.0 - Business Features & Multi-Tenant Support

-- Erweiterte Chatbot-Konfiguration (Haupttabelle)
CREATE TABLE chatbot_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    tags TEXT[], -- PostgreSQL Array für Kategorisierung
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Deployment
    deployment_url VARCHAR(255) UNIQUE,
    url_token VARCHAR(64) UNIQUE,
    custom_domain VARCHAR(255), -- Für zukünftige Custom-Domain-Features
    
    -- Branding (als JSONB für Flexibilität)
    branding JSONB NOT NULL DEFAULT '{
        "primary_color": "#1f3a93",
        "secondary_color": "#34495e", 
        "accent_color": "#e74c3c",
        "background_color": "#f8f9fa",
        "text_color": "#2c3e50",
        "font_family": "Roboto",
        "font_size": "Normal",
        "chat_width": "Normal (800px)",
        "message_style": "Sprechblasen"
    }',
    
    -- Unternehmensdaten
    company_info JSONB NOT NULL DEFAULT '{
        "company_name": "",
        "industry": "",
        "company_size": "",
        "website": "",
        "email": "",
        "phone": "",
        "address": {
            "street": "",
            "zip_code": "",
            "city": "",
            "country": "Deutschland"
        },
        "business_hours": {},
        "social_media": {
            "linkedin": "",
            "facebook": "",
            "instagram": "",
            "twitter": "",
            "youtube": "",
            "xing": ""
        }
    }',
    
    -- Chatbot-Verhalten
    behavior_settings JSONB NOT NULL DEFAULT '{
        "tone": "Professionell",
        "length": "Mittel",
        "formality": "Sie (förmlich)",
        "language": "Deutsch",
        "fallback_language": "Englisch",
        "auto_translate": false,
        "custom_instructions": "",
        "forbidden_topics": []
    }',
    
    -- Feature Flags
    email_capture_enabled BOOLEAN DEFAULT FALSE,
    contact_persons_enabled BOOLEAN DEFAULT FALSE,
    
    -- Analytics-Cache für Performance
    total_conversations INTEGER DEFAULT 0,
    total_leads_captured INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_name CHECK (length(name) >= 3),
    CONSTRAINT valid_url_token CHECK (length(url_token) >= 32 OR url_token IS NULL)
);

-- Assets-Tabelle für Dateien (Logo, Profilbilder, etc.)
CREATE TABLE chatbot_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- 'logo', 'contact_image', 'background'
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT NOW(),
    
    -- Ein Asset pro Typ pro Chatbot (außer contact_images)
    UNIQUE(chatbot_id, asset_type, file_name)
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
    languages VARCHAR(10)[] DEFAULT ARRAY['de'], -- Array von Sprachcodes
    availability_hours JSONB, -- Verfügbarkeitszeiten als JSON
    profile_image_id UUID REFERENCES chatbot_assets(id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT valid_name_length CHECK (length(name) >= 2)
);

-- Email-Capture Konfiguration
CREATE TABLE email_capture_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE UNIQUE,
    
    -- Trigger-Bedingungen
    trigger_conditions JSONB NOT NULL DEFAULT '{
        "after_messages": 3,
        "after_duration": 2,
        "trigger_keywords": ["preise", "angebot", "kontakt", "beratung", "demo"],
        "ai_interest_detection": true
    }',
    
    -- Nachrichten-Templates
    prompts JSONB NOT NULL DEFAULT '{
        "initial": "Für detaillierte Informationen können Sie gerne Ihre Email-Adresse hinterlassen.",
        "follow_up": "Falls Sie später doch Interesse haben, können Sie jederzeit nach Kontaktmöglichkeiten fragen.",
        "thank_you": "Vielen Dank! Wir werden uns zeitnah bei Ihnen melden."
    }',
    
    -- Verhalten
    behavior_settings JSONB NOT NULL DEFAULT '{
        "max_requests_per_session": 1,
        "cooldown_minutes": 10,
        "require_consent": true,
        "show_privacy_note": true
    }',
    
    -- Datenschutz & Compliance
    data_handling_settings JSONB NOT NULL DEFAULT '{
        "store_conversation_context": true,
        "estimate_lead_quality": true,
        "tag_lead_source": true,
        "data_retention_days": 365
    }',
    
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
    capture_trigger VARCHAR(100), -- 'keyword', 'duration', 'manual', 'ai_interest'
    conversation_context JSONB DEFAULT '{}', -- Gesprächskontext zur Lead-Qualifikation
    user_location JSONB, -- IP-basierte Location (falls verfügbar)
    device_info JSONB DEFAULT '{}', -- Browser/Device-Informationen
    
    -- Lead Qualification (automatisch berechnet)
    estimated_interest_level INTEGER CHECK (estimated_interest_level BETWEEN 1 AND 10),
    topics_discussed TEXT[] DEFAULT ARRAY[]::TEXT[],
    session_duration INTEGER DEFAULT 0, -- in Sekunden
    message_count INTEGER DEFAULT 0,
    pages_visited INTEGER DEFAULT 1,
    
    -- Timestamps
    captured_at TIMESTAMP DEFAULT NOW(),
    last_interaction TIMESTAMP DEFAULT NOW(),
    
    -- Lead Management
    lead_status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
    lead_quality_score FLOAT DEFAULT 0.0, -- 0.0 - 1.0
    sales_notes TEXT,
    assigned_to VARCHAR(255), -- Sales Rep
    follow_up_date DATE,
    
    -- Privacy & Compliance
    consent_given BOOLEAN DEFAULT FALSE,
    consent_timestamp TIMESTAMP,
    gdpr_compliant BOOLEAN DEFAULT TRUE,
    data_retention_until TIMESTAMP DEFAULT (NOW() + INTERVAL '365 days'),
    
    -- Additional Contact Info (optional, user-provided)
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    phone VARCHAR(50),
    
    CONSTRAINT valid_lead_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Contact Requests (wenn User auf Kontaktperson klickt)
CREATE TABLE contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    contact_person_id UUID REFERENCES contact_persons(id) ON DELETE CASCADE,
    
    -- Request Details
    requester_email VARCHAR(255),
    requester_name VARCHAR(255),
    message TEXT,
    conversation_id VARCHAR(255),
    
    -- Context
    request_context JSONB DEFAULT '{}',
    urgency_level VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'contacted', 'resolved', 'spam'
    response_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP
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
    bounce_rate FLOAT DEFAULT 0, -- Prozent (Besucher mit nur 1 Message)
    
    -- Engagement Metrics
    messages_per_conversation FLOAT DEFAULT 0,
    return_visitor_rate FLOAT DEFAULT 0,
    conversation_completion_rate FLOAT DEFAULT 0,
    
    -- Lead Metrics
    emails_captured INTEGER DEFAULT 0,
    contact_requests INTEGER DEFAULT 0,
    email_capture_rate FLOAT DEFAULT 0, -- emails / conversations
    lead_conversion_rate FLOAT DEFAULT 0,
    
    -- Performance Metrics
    average_response_time FLOAT DEFAULT 0, -- in Sekunden
    error_rate FLOAT DEFAULT 0,
    uptime_percentage FLOAT DEFAULT 100,
    
    -- User Satisfaction (falls implementiert)
    satisfaction_score FLOAT,
    feedback_count INTEGER DEFAULT 0,
    positive_feedback_ratio FLOAT DEFAULT 0,
    
    -- Traffic Sources
    traffic_sources JSONB DEFAULT '{}', -- {direct: 50, social: 20, search: 30}
    referrer_domains JSONB DEFAULT '{}',
    
    -- Device & Browser Stats
    device_stats JSONB DEFAULT '{}', -- {mobile: 60, desktop: 40}
    browser_stats JSONB DEFAULT '{}',
    
    -- Aggregated hourly data für detailliertere Analyse
    hourly_stats JSONB DEFAULT '{}', -- {hour: {visitors, conversations, etc.}}
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
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
    response_time FLOAT, -- Zeit für Bot-Antwort in Sekunden
    sources_used JSONB DEFAULT '[]', -- Verwendete Quellen für die Antwort
    user_feedback INTEGER, -- Optional: User-Rating 1-5 für die Antwort
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'email_request', 'contact_card'
    
    -- Context & Analytics
    user_ip_hash VARCHAR(64), -- Gehashte IP für Analytics (GDPR-konform)
    user_agent_hash VARCHAR(64), -- Gehashter User-Agent
    session_data JSONB DEFAULT '{}',
    
    -- Privacy: Automatische Löschung nach X Tagen
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days'),
    
    CONSTRAINT valid_role CHECK (role IN ('user', 'assistant', 'system')),
    CONSTRAINT valid_message_content CHECK (length(content) > 0)
);

-- Custom Configuration Fields (für zukünftige Erweiterungen)
CREATE TABLE custom_configuration_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    field_category VARCHAR(100) NOT NULL, -- 'branding', 'behavior', 'contact', etc.
    field_key VARCHAR(100) NOT NULL,
    field_value JSONB,
    field_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'json', 'file'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(chatbot_id, field_category, field_key)
);

-- A/B Testing (für zukünftige Features)
CREATE TABLE ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_description TEXT,
    
    -- Test Configuration
    variant_a_config JSONB NOT NULL, -- Original-Konfiguration
    variant_b_config JSONB NOT NULL, -- Test-Konfiguration
    traffic_split FLOAT DEFAULT 0.5, -- 0.0 - 1.0 (Anteil für Variant B)
    
    -- Test Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'running', 'paused', 'completed'
    start_date DATE,
    end_date DATE,
    
    -- Results
    results JSONB DEFAULT '{}',
    winner VARCHAR(10), -- 'a', 'b', 'inconclusive'
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Performance-Indizes
CREATE INDEX idx_chatbots_active ON chatbot_configs(is_active, created_at DESC);
CREATE INDEX idx_chatbots_url ON chatbot_configs(deployment_url) WHERE deployment_url IS NOT NULL;
CREATE INDEX idx_chatbots_last_activity ON chatbot_configs(last_activity DESC) WHERE is_active = TRUE;

CREATE INDEX idx_assets_chatbot_type ON chatbot_assets(chatbot_id, asset_type);

CREATE INDEX idx_contacts_chatbot_active ON contact_persons(chatbot_id, is_active, display_order);

CREATE INDEX idx_leads_chatbot_date ON captured_leads(chatbot_id, captured_at DESC);
CREATE INDEX idx_leads_status ON captured_leads(lead_status, captured_at DESC);
CREATE INDEX idx_leads_quality ON captured_leads(lead_quality_score DESC) WHERE lead_quality_score > 0;
CREATE INDEX idx_leads_retention ON captured_leads(data_retention_until) WHERE data_retention_until IS NOT NULL;

CREATE INDEX idx_contact_requests_chatbot ON contact_requests(chatbot_id, created_at DESC);
CREATE INDEX idx_contact_requests_status ON contact_requests(status, created_at DESC);

CREATE INDEX idx_analytics_date ON chatbot_analytics(chatbot_id, date DESC);
CREATE INDEX idx_analytics_metrics ON chatbot_analytics(date DESC, total_conversations DESC);

CREATE INDEX idx_conversations_chatbot_session ON conversation_logs(chatbot_id, conversation_id, message_index);
CREATE INDEX idx_conversations_expiry ON conversation_logs(expires_at) WHERE expires_at IS NOT NULL;

-- Nützliche Views für häufige Abfragen
CREATE VIEW chatbot_summary AS
SELECT 
    c.id,
    c.name,
    c.description,
    c.created_at,
    c.updated_at,
    c.is_active,
    c.deployment_url,
    c.total_conversations,
    c.total_leads_captured,
    c.last_activity,
    
    -- Company Info aus JSONB extrahieren
    c.company_info->>'company_name' as company_name,
    c.company_info->>'industry' as industry,
    c.company_info->>'email' as company_email,
    
    -- Feature Flags
    c.email_capture_enabled,
    c.contact_persons_enabled,
    
    -- Aggregierte Statistiken
    COUNT(DISTINCT cp.id) as contact_persons_count,
    COUNT(DISTINCT cl.id) as total_leads,
    AVG(cl.estimated_interest_level) as avg_lead_quality,
    COUNT(DISTINCT cr.id) as total_contact_requests,
    
    -- Letzte Analytics
    (
        SELECT SUM(ca.unique_visitors) 
        FROM chatbot_analytics ca 
        WHERE ca.chatbot_id = c.id 
        AND ca.date >= CURRENT_DATE - INTERVAL '30 days'
    ) as visitors_last_30_days,
    
    (
        SELECT AVG(ca.satisfaction_score) 
        FROM chatbot_analytics ca 
        WHERE ca.chatbot_id = c.id 
        AND ca.satisfaction_score IS NOT NULL
        AND ca.date >= CURRENT_DATE - INTERVAL '30 days'
    ) as avg_satisfaction_last_30_days

FROM chatbot_configs c
LEFT JOIN contact_persons cp ON c.id = cp.chatbot_id AND cp.is_active = TRUE
LEFT JOIN captured_leads cl ON c.id = cl.chatbot_id
LEFT JOIN contact_requests cr ON c.id = cr.chatbot_id
GROUP BY c.id;

-- View für Lead-Management
CREATE VIEW lead_management AS
SELECT 
    cl.*,
    c.name as chatbot_name,
    c.company_info->>'company_name' as chatbot_company,
    cp.name as contact_person_name,
    cp.email as contact_person_email,
    
    -- Lead-Score basierend auf verschiedenen Faktoren
    (
        COALESCE(cl.estimated_interest_level, 5) * 0.3 +
        LEAST(cl.session_duration / 60.0, 10) * 0.2 +
        LEAST(cl.message_count, 20) * 0.2 +
        CASE WHEN cl.capture_trigger = 'keyword' THEN 8 
             WHEN cl.capture_trigger = 'ai_interest' THEN 9
             ELSE 5 END * 0.3
    ) as calculated_lead_score,
    
    -- Days since capture
    EXTRACT(days FROM NOW() - cl.captured_at) as days_since_capture,
    
    -- Needs follow-up flag
    CASE 
        WHEN cl.lead_status = 'new' AND EXTRACT(days FROM NOW() - cl.captured_at) > 2 THEN TRUE
        WHEN cl.follow_up_date IS NOT NULL AND cl.follow_up_date <= CURRENT_DATE THEN TRUE
        ELSE FALSE
    END as needs_follow_up

FROM captured_leads cl
JOIN chatbot_configs c ON cl.chatbot_id = c.id
LEFT JOIN contact_requests cr ON cl.conversation_id = cr.conversation_id
LEFT JOIN contact_persons cp ON cr.contact_person_id = cp.id
WHERE cl.gdpr_compliant = TRUE 
AND (cl.data_retention_until IS NULL OR cl.data_retention_until > NOW());

-- Automatische Cleanup-Jobs (als Funktionen)
CREATE OR REPLACE FUNCTION cleanup_expired_conversation_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM conversation_logs WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_lead_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM captured_leads 
    WHERE data_retention_until IS NOT NULL 
    AND data_retention_until < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatische Updates
CREATE OR REPLACE FUNCTION update_chatbot_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'captured_leads' THEN
            UPDATE chatbot_configs 
            SET total_leads_captured = total_leads_captured + 1,
                last_activity = NOW()
            WHERE id = NEW.chatbot_id;
        ELSIF TG_TABLE_NAME = 'conversation_logs' AND NEW.role = 'user' THEN
            UPDATE chatbot_configs 
            SET total_conversations = (
                SELECT COUNT(DISTINCT conversation_id) 
                FROM conversation_logs 
                WHERE chatbot_id = NEW.chatbot_id
            ),
            last_activity = NOW()
            WHERE id = NEW.chatbot_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger erstellen
CREATE TRIGGER trigger_update_chatbot_stats_leads
    AFTER INSERT ON captured_leads
    FOR EACH ROW EXECUTE FUNCTION update_chatbot_stats();

CREATE TRIGGER trigger_update_chatbot_stats_conversations  
    AFTER INSERT ON conversation_logs
    FOR EACH ROW EXECUTE FUNCTION update_chatbot_stats();

-- Automatische Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chatbot_configs_updated_at 
    BEFORE UPDATE ON chatbot_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_capture_configs_updated_at
    BEFORE UPDATE ON email_capture_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Kommentare für Dokumentation
COMMENT ON TABLE chatbot_configs IS 'Hauptkonfiguration für erweiterte Chatbots mit Business-Features';
COMMENT ON TABLE chatbot_assets IS 'Datei-Assets wie Logos und Profilbilder für Chatbots';
COMMENT ON TABLE contact_persons IS 'Ansprechpartner die im Chatbot angezeigt werden können';
COMMENT ON TABLE email_capture_configs IS 'Konfiguration für automatische Email-Erfassung';
COMMENT ON TABLE captured_leads IS 'Erfasste Email-Adressen und Lead-Informationen';
COMMENT ON TABLE contact_requests IS 'Kontaktanfragen an spezifische Ansprechpartner';
COMMENT ON TABLE chatbot_analytics IS 'Tägliche Analytics und Performance-Metriken';
COMMENT ON TABLE conversation_logs IS 'Detaillierte Gesprächsprotokolle (automatisch gelöscht nach 90 Tagen)';

-- Initialdaten (für Development)
INSERT INTO chatbot_configs (name, description) VALUES 
('Demo Chatbot', 'Beispiel-Chatbot für Testzwecke');

-- Performance-Monitoring View
CREATE VIEW performance_overview AS
SELECT 
    DATE_TRUNC('day', created_at) as day,
    COUNT(*) as chatbots_created,
    SUM(total_conversations) as total_conversations,
    SUM(total_leads_captured) as total_leads,
    AVG(
        CASE WHEN total_conversations > 0 
        THEN total_leads_captured::FLOAT / total_conversations 
        ELSE 0 END
    ) as avg_conversion_rate
FROM chatbot_configs 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;