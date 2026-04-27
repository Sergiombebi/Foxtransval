import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

// Initialisation paresseuse du client Supabase
export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Variables Supabase manquantes. Le client Supabase ne sera pas initialisé.')
    return null
  }
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// Initialisation paresseuse du client admin Supabase
export const getSupabaseAdmin = (): SupabaseClient | null => {
  if (supabaseAdminInstance) return supabaseAdminInstance
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Variables Supabase manquantes. Le client admin Supabase ne sera pas initialisé.')
    return null
  }
  
  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  return supabaseAdminInstance
}

// Pour la rétrocompatibilité
export const supabase = getSupabase()
export const supabaseAdmin = getSupabaseAdmin()
