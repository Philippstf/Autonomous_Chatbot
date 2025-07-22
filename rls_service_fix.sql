-- RLS FIX FÜR BACKEND-SERVICE OPERATIONEN
-- Führe diesen Code in Supabase SQL Editor aus

-- 1. Erweiterte RLS Policy für chatbot_configs (erlaubt Service-Role + User-Auth)
DROP POLICY IF EXISTS "chatbot_configs_owner" ON chatbot_configs;

-- Neue Policy: Erlaubt sowohl User-Auth als auch Service-Role
CREATE POLICY "chatbot_configs_access" ON chatbot_configs
    FOR ALL USING (
        -- Normale User können nur ihre eigenen Chatbots sehen
        user_id = auth.uid()
        OR
        -- Service Role (Backend) kann alle Operationen durchführen
        auth.role() = 'service_role'
        OR
        -- Anon Role kann lesen (für öffentliche Chatbot-Seiten)
        (auth.role() = 'anon' AND current_setting('request.method', true) = 'GET')
    );

-- 2. Erweiterte RLS Policy für leads
DROP POLICY IF EXISTS "leads_user_policy" ON leads;

CREATE POLICY "leads_access" ON leads
    FOR ALL USING (
        -- Normale User können nur ihre eigenen Leads sehen
        user_id = auth.uid()
        OR
        -- Service Role (Backend) kann alle Operationen durchführen
        auth.role() = 'service_role'
    );

-- 3. Erweiterte RLS Policy für conversations (falls relevant)
DROP POLICY IF EXISTS "conversations_user_policy" ON conversations;

CREATE POLICY "conversations_access" ON conversations
    FOR ALL USING (
        -- Normale User können nur ihre eigenen Conversations sehen
        user_id = auth.uid()
        OR
        -- Service Role (Backend) kann alle Operationen durchführen
        auth.role() = 'service_role'
        OR
        -- Device-basierte Policy (Fallback für alte Implementierung)
        device_id = current_setting('app.device_id', true)
    );

-- 4. Erweiterte RLS Policy für messages
DROP POLICY IF EXISTS "messages_user_conversations" ON messages;

CREATE POLICY "messages_access" ON messages
    FOR ALL USING (
        -- Messages von User-eigenen Conversations
        conversation_id IN (
            SELECT id FROM conversations
            WHERE user_id = auth.uid()
        )
        OR
        -- Service Role (Backend) kann alle Operationen durchführen
        auth.role() = 'service_role'
        OR
        -- Device-basierte Policy (Fallback)
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE device_id = current_setting('app.device_id', true)
        )
    );

-- 5. Erweiterte RLS Policy für profiles
DROP POLICY IF EXISTS "profiles_own_data" ON profiles;

CREATE POLICY "profiles_access" ON profiles
    FOR ALL USING (
        -- User kann nur eigene Profile sehen
        id = auth.uid()
        OR
        -- Service Role (Backend) kann alle Operationen durchführen
        auth.role() = 'service_role'
    );

-- Kommentare
COMMENT ON POLICY "chatbot_configs_access" ON chatbot_configs IS 'Erlaubt User-Auth und Service-Role Zugriff';
COMMENT ON POLICY "leads_access" ON leads IS 'Erlaubt User-Auth und Service-Role Zugriff';
COMMENT ON POLICY "conversations_access" ON conversations IS 'Erlaubt User-Auth, Service-Role und Device-basierte Zugriffe';
COMMENT ON POLICY "messages_access" ON messages IS 'Erlaubt User-Auth, Service-Role und Device-basierte Zugriffe';
COMMENT ON POLICY "profiles_access" ON profiles IS 'Erlaubt User-Auth und Service-Role Zugriff';