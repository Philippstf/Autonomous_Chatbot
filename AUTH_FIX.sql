-- 🚨 AUTH FIX - Supabase Authentication Reparatur
-- Führe dies SOFORT in Supabase SQL Editor aus!

-- 1. Lösche problematische Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Stelle sicher dass profiles Tabelle korrekt ist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    name TEXT,
    company TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS für profiles richtig setzen
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Lösche alte problematische Policies
DROP POLICY IF EXISTS "profiles_user_policy" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users" ON profiles;

-- 5. Erstelle einfache, sichere Policies
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_delete_own" ON profiles
    FOR DELETE USING (id = auth.uid());

-- 6. Erstelle neuen, einfachen Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'name', '')
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Wenn Profile-Insert fehlschlägt, ignoriere es
        -- Wichtig: User wird trotzdem erstellt
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger wieder aktivieren (aber fehlerresistent)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Stelle sicher dass andere Tabellen korrekte RLS haben
-- Chatbot Configs
ALTER TABLE chatbot_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chatbot_configs_owner" ON chatbot_configs;
CREATE POLICY "chatbot_configs_owner" ON chatbot_configs
    FOR ALL USING (user_id = auth.uid());

-- Conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conversations_user_policy" ON conversations;
CREATE POLICY "conversations_user_policy" ON conversations
    FOR ALL USING (user_id = auth.uid());

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_user_conversations" ON messages;
CREATE POLICY "messages_user_conversations" ON messages
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE user_id = auth.uid()
        )
    );

-- 9. Leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    chatbot_id TEXT REFERENCES chatbot_configs(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    message TEXT,
    lead_source VARCHAR(100) DEFAULT 'chat_capture',
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "leads_user_policy" ON leads;
CREATE POLICY "leads_user_policy" ON leads
    FOR ALL USING (user_id = auth.uid());

-- ✅ FERTIG! Auth sollte jetzt funktionieren.