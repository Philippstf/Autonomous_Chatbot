-- platform/supabase_schema.sql
-- Erweiterte Database Schema für Multi-Chatbot-Platform

-- Bestehende Tables bleiben erhalten (conversations, messages)
-- Neue Tables für Platform-spezifische Features

-- ─── Chatbot Registry Table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chatbot_registry (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    website_url TEXT,
    document_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'processing')),
    branding JSONB DEFAULT '{}',
    creator_device_id TEXT,
    total_chunks INTEGER DEFAULT 0,
    rag_info JSONB DEFAULT '{}'
);

-- ─── Platform Analytics Table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_analytics (
    id SERIAL PRIMARY KEY,
    chatbot_id TEXT REFERENCES chatbot_registry(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'message_sent', 'chatbot_created', 'chatbot_accessed'
    event_data JSONB DEFAULT '{}',
    device_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT
);

-- ─── Chatbot Sources Table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chatbot_sources (
    id SERIAL PRIMARY KEY,
    chatbot_id TEXT REFERENCES chatbot_registry(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL, -- 'website', 'document'
    source_name TEXT NOT NULL,
    source_metadata JSONB DEFAULT '{}',
    chunk_count INTEGER DEFAULT 0,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Multi-Chatbot Conversations Table ───────────────────────────────────────────
-- Erweitert bestehende conversations table für chatbot_id
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS chatbot_id TEXT DEFAULT NULL;

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_conversations_chatbot_id ON conversations(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_registry_creator ON chatbot_registry(creator_device_id);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_chatbot ON platform_analytics(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_sources_chatbot ON chatbot_sources(chatbot_id);

-- ─── Row Level Security (RLS) Policies ──────────────────────────────────────────

-- RLS für chatbot_registry (nur Creator kann eigene Chatbots sehen)
ALTER TABLE chatbot_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chatbots" ON chatbot_registry
    FOR SELECT USING (creator_device_id = current_setting('app.device_id', true));

CREATE POLICY "Users can create chatbots" ON chatbot_registry
    FOR INSERT WITH CHECK (creator_device_id = current_setting('app.device_id', true));

CREATE POLICY "Users can update their own chatbots" ON chatbot_registry
    FOR UPDATE USING (creator_device_id = current_setting('app.device_id', true));

CREATE POLICY "Users can delete their own chatbots" ON chatbot_registry
    FOR DELETE USING (creator_device_id = current_setting('app.device_id', true));

-- RLS für platform_analytics
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics for their chatbots" ON platform_analytics
    FOR SELECT USING (
        chatbot_id IN (
            SELECT id FROM chatbot_registry 
            WHERE creator_device_id = current_setting('app.device_id', true)
        )
    );

CREATE POLICY "Analytics can be inserted" ON platform_analytics
    FOR INSERT WITH CHECK (true);

-- RLS für chatbot_sources
ALTER TABLE chatbot_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sources for their chatbots" ON chatbot_sources
    FOR SELECT USING (
        chatbot_id IN (
            SELECT id FROM chatbot_registry 
            WHERE creator_device_id = current_setting('app.device_id', true)
        )
    );

CREATE POLICY "Sources can be managed for own chatbots" ON chatbot_sources
    FOR ALL USING (
        chatbot_id IN (
            SELECT id FROM chatbot_registry 
            WHERE creator_device_id = current_setting('app.device_id', true)
        )
    );

-- ─── Functions für erweiterte Funktionalität ─────────────────────────────────────

-- Funktion zum Abrufen von Chatbot-Statistiken
CREATE OR REPLACE FUNCTION get_chatbot_stats(chatbot_id_param TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_conversations', COUNT(DISTINCT c.id),
        'total_messages', COUNT(m.id),
        'last_activity', MAX(m.created_at),
        'avg_conversation_length', AVG(msg_count.count)
    ) INTO result
    FROM conversations c
    LEFT JOIN messages m ON c.id = m.conversation_id
    LEFT JOIN (
        SELECT conversation_id, COUNT(*) as count
        FROM messages
        GROUP BY conversation_id
    ) msg_count ON c.id = msg_count.conversation_id
    WHERE c.chatbot_id = chatbot_id_param;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion zum Bereinigen alter Analytics-Daten (älter als 90 Tage)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
    DELETE FROM platform_analytics 
    WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Views für einfacheren Zugriff ───────────────────────────────────────────────

-- View für Chatbot-Übersicht mit Statistiken
CREATE OR REPLACE VIEW chatbot_overview AS
SELECT 
    cr.*,
    COUNT(DISTINCT c.id) as conversation_count,
    COUNT(DISTINCT m.id) as message_count,
    MAX(m.created_at) as last_activity
FROM chatbot_registry cr
LEFT JOIN conversations c ON cr.id = c.chatbot_id
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY cr.id;

-- ─── Triggers für automatische Updates ──────────────────────────────────────────

-- Trigger für updated_at in chatbot_registry
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chatbot_registry_updated_at
    BEFORE UPDATE ON chatbot_registry
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ─── Initial Data ────────────────────────────────────────────────────────────────

-- Beispiel-Eintrag (optional, für Testing)
-- INSERT INTO chatbot_registry (id, name, description, creator_device_id)
-- VALUES ('demo-bot', 'Demo Chatbot', 'Ein Beispiel-Chatbot für Testing', 'demo-device-id')
-- ON CONFLICT (id) DO NOTHING;