import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Vérifier que les variables existent avant de créer le client
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variables Supabase manquantes. Le client Supabase ne sera pas initialisé.')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Client avec service role pour contourner RLS (admin operations)
export const supabaseAdmin = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null
