-- LEADS TABELLE FIX FÜR TEXT-basierte CHATBOT_ID
-- Führe diesen Code NACH dem chatbot_configs_fix.sql aus

-- 1. Alte Leads Tabelle löschen (falls vorhanden)
DROP TABLE IF EXISTS leads CASCADE;

-- 2. Neue Leads Tabelle mit TEXT chatbot_id (kompatibel mit neuer chatbot_configs Struktur)
CREATE TABLE leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    chatbot_id TEXT REFERENCES chatbot_configs(id) ON DELETE CASCADE,  -- GEÄNDERT: TEXT statt UUID
    conversation_id TEXT,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    message TEXT,
    lead_source TEXT DEFAULT 'chat_capture',
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Verhindern von Duplikaten pro Konversation
    UNIQUE(conversation_id)
);

-- 3. RLS für leads aktivieren
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Nutzer sehen nur ihre eigenen Leads
DROP POLICY IF EXISTS "leads_user_policy" ON leads;
CREATE POLICY "leads_user_policy" ON leads
    FOR ALL USING (user_id = auth.uid());

-- 5. Performance Indizes
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_chatbot_id ON leads(chatbot_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_conversation_id ON leads(conversation_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status, created_at DESC);

-- 6. Automatische updated_at Trigger
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leads_updated_at_trigger ON leads;
CREATE TRIGGER update_leads_updated_at_trigger
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_leads_updated_at();

-- 7. Email Validierung
ALTER TABLE leads ADD CONSTRAINT valid_email 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 8. Kommentar
COMMENT ON TABLE leads IS 'Erfasste Email-Kontakte aus Chatbot-Gesprächen mit Lead-Management';