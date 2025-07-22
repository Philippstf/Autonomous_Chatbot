-- Minimal Supabase Schema Fix
-- Erstellt nur die notwendigen Tabellen für den aktuellen Code

-- Haupttabelle für Chatbot-Konfigurationen (kompatibel mit aktuellem Code)
CREATE TABLE IF NOT EXISTS chatbot_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabelle für Konversationsnachrichten
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    conversation_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabelle für Leads (Email-Capture)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    conversation_id VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(100),
    message TEXT,
    lead_source VARCHAR(100) DEFAULT 'chat_capture',
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_chatbot_configs_user ON chatbot_configs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_chatbot ON conversations(chatbot_id, conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_chatbot ON leads(chatbot_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_user ON leads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_conversation ON leads(conversation_id);

-- RLS (Row Level Security) Policies für Multi-Tenant Sicherheit
ALTER TABLE chatbot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policies für chatbot_configs
CREATE POLICY IF NOT EXISTS "Users can view own chatbots" ON chatbot_configs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own chatbots" ON chatbot_configs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own chatbots" ON chatbot_configs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own chatbots" ON chatbot_configs
    FOR DELETE USING (auth.uid() = user_id);

-- Policies für conversations
CREATE POLICY IF NOT EXISTS "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies für leads
CREATE POLICY IF NOT EXISTS "Users can view own leads" ON leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own leads" ON leads
    FOR UPDATE USING (auth.uid() = user_id);

-- Automatische updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS update_chatbot_configs_updated_at 
    BEFORE UPDATE ON chatbot_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Kommentare
COMMENT ON TABLE chatbot_configs IS 'Benutzer-spezifische Chatbot-Konfigurationen';
COMMENT ON TABLE conversations IS 'Gesprächsverläufe zwischen Benutzern und Chatbots';
COMMENT ON TABLE leads IS 'Erfasste Kontaktdaten aus Chatbot-Gesprächen';

-- Test-Insert (nur zur Validierung - kann entfernt werden)
-- INSERT INTO chatbot_configs (user_id, name, description, config_data) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test Bot', 'Test Description', '{"test": true}');