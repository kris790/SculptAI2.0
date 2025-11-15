import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// --- IMPORTANT ---
// These credentials have been configured with the values you provided.
const supabaseUrl = 'https://xroychwirkrskoryrvph.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyb3ljaHdpcmtyc2tvcnlydnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNTQyMTksImV4cCI6MjA3ODczMDIxOX0.PM3LZOhxX2_Fd8fLNzoQ6jjbCrujieLX6knRLAVhgB8';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})