// Supabase configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xlafzstdrtdcjrfvepge.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYWZ6c3RkcnRkY2pyZnZlcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNzMzMzcsImV4cCI6MjA2Nzg0OTMzN30.VAGmyZa0jv-6tGu0d5Wwgzkb5L1KrlzTWBcV1v4YuUo'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})