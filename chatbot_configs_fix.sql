-- CHATBOT_CONFIGS TABELLE FIX FÜR KURZE IDs
-- Führe diesen Code in Supabase SQL Editor aus

-- 1. Alte Tabelle löschen (falls vorhanden)
DROP TABLE IF EXISTS chatbot_configs CASCADE;

-- 2. Neue Tabelle mit TEXT ID (kompatibel mit bestehender Chatbot-ID Generation)
CREATE TABLE chatbot_configs (
    id TEXT PRIMARY KEY,  -- GEÄNDERT: TEXT statt UUID für kurze IDs wie "ef86c62e"
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    config_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. RLS Policy
ALTER TABLE chatbot_configs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Nutzer sehen nur ihre eigenen Chatbots
DROP POLICY IF EXISTS "chatbot_configs_owner" ON chatbot_configs;
CREATE POLICY "chatbot_configs_owner" ON chatbot_configs
    FOR ALL USING (user_id = auth.uid());

-- 5. Performance Index
CREATE INDEX IF NOT EXISTS idx_chatbot_configs_user_id ON chatbot_configs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_configs_active ON chatbot_configs(is_active, created_at DESC);

-- 6. Automatische updated_at Trigger
CREATE OR REPLACE FUNCTION update_chatbot_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_chatbot_configs_updated_at_trigger ON chatbot_configs;
CREATE TRIGGER update_chatbot_configs_updated_at_trigger
    BEFORE UPDATE ON chatbot_configs
    FOR EACH ROW EXECUTE FUNCTION update_chatbot_configs_updated_at();

-- 7. Kommentar
COMMENT ON TABLE chatbot_configs IS 'Benutzer-spezifische Chatbot-Konfigurationen mit kurzen IDs';

-- Hinweis: Leads-Tabelle muss auch angepasst werden, da sie auf chatbot_configs referenziert