-- KOMPLETTE TABELLEN-ERSTELLUNG FÜR HELFERLAIN
-- Führe diesen Code in der RICHTIGEN Supabase-Instanz aus (die Railway verwendet)

-- 1. Chatbot Configs Tabelle
CREATE TABLE IF NOT EXISTS chatbot_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Conversations Tabelle (falls nicht existiert)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT,
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    conversation_id TEXT NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Messages Tabelle (falls nicht existiert)
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Leads Tabelle
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    chatbot_id UUID REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    conversation_id TEXT,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    message TEXT,
    lead_source TEXT DEFAULT 'chat_capture',
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id)
);

-- 5. Profiles Tabelle (falls nicht existiert)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    name TEXT,
    company TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS AKTIVIEREN
ALTER TABLE chatbot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- POLICIES ERSTELLEN
-- Chatbot Configs
DROP POLICY IF EXISTS "chatbot_configs_owner" ON chatbot_configs;
CREATE POLICY "chatbot_configs_owner" ON chatbot_configs
    FOR ALL USING (user_id = auth.uid());

-- Conversations
DROP POLICY IF EXISTS "conversations_user_policy" ON conversations;
CREATE POLICY "conversations_user_policy" ON conversations
    FOR ALL USING (user_id = auth.uid());

-- Messages  
DROP POLICY IF EXISTS "messages_user_conversations" ON messages;
CREATE POLICY "messages_user_conversations" ON messages
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE user_id = auth.uid()
        )
    );

-- Leads
DROP POLICY IF EXISTS "leads_user_policy" ON leads;
CREATE POLICY "leads_user_policy" ON leads
    FOR ALL USING (user_id = auth.uid());

-- Profiles
DROP POLICY IF EXISTS "profiles_own_data" ON profiles;
CREATE POLICY "profiles_own_data" ON profiles
    FOR ALL USING (id = auth.uid());

-- INDIZES
CREATE INDEX IF NOT EXISTS idx_chatbot_configs_user_id ON chatbot_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_device_id ON conversations(device_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_chatbot_id ON leads(chatbot_id, created_at DESC);

-- AUTOMATISCHE TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_chatbot_configs_updated_at_trigger ON chatbot_configs;
CREATE TRIGGER update_chatbot_configs_updated_at_trigger
    BEFORE UPDATE ON chatbot_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at_trigger ON leads;
CREATE TRIGGER update_leads_updated_at_trigger
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PROFIL-ERSTELLUNG TRIGGER
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS trigger AS $$
BEGIN
    INSERT INTO profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();