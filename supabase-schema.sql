-- HELFERLAIN Supabase Authentication Schema
-- Ausführen in Supabase SQL Editor

-- 1. Chatbot-Konfigurationen mit Supabase Auth verknüpfen
ALTER TABLE chatbot_configs 
  ADD COLUMN IF NOT EXISTS user_id UUID 
  REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Row Level Security für chatbot_configs aktivieren
ALTER TABLE chatbot_configs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: User sehen nur ihre eigenen Chatbots
DROP POLICY IF EXISTS "chatbot_configs_owner" ON chatbot_configs;
CREATE POLICY "chatbot_configs_owner" ON chatbot_configs
  FOR ALL USING (user_id = auth.uid());

-- 4. Conversations auch mit Auth verknüpfen (falls noch nicht vorhanden)
ALTER TABLE conversations 
  ADD COLUMN IF NOT EXISTS user_id UUID 
  REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. RLS Policy für conversations anpassen
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_device_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_user_policy" ON conversations;
CREATE POLICY "conversations_user_policy" ON conversations
  FOR ALL USING (user_id = auth.uid());

-- 6. Messages Policy anpassen für user-basierte conversations
DROP POLICY IF EXISTS "messages_conversation_policy" ON messages;
CREATE POLICY "messages_user_conversations" ON messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = auth.uid()
    )
  );

-- 7. Performance Indizes
CREATE INDEX IF NOT EXISTS idx_chatbot_configs_user_id ON chatbot_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- 8. Optional: Public profiles table für erweiterte User-Daten
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. RLS für profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own_data" ON profiles
  FOR ALL USING (id = auth.uid());

-- 10. Trigger für automatische Profil-Erstellung
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger erstellen
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 11. Index für profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);