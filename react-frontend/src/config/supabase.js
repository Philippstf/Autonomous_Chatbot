// Supabase configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dicbikbyavdkuqzbrbbs.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY2Jpa2J5YXZka3VxemJyYmJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MDg3MDksImV4cCI6MjA2Nzk4NDcwOX0.3LmciB79cNkvP0zi68QZtWSdQmPy_2_wqDEEZF4tsJ0'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})