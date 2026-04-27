// Client Supabase pour le backend (côté serveur)
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton pattern pour le client serveur
let supabaseServerClient: SupabaseClient | null = null

export const createServerSupabase = (): SupabaseClient => {
  if (!supabaseServerClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables Supabase manquantes: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY')
    }

    supabaseServerClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return supabaseServerClient
}

// Client admin pour les opérations privilégiées
export const createAdminSupabase = (): SupabaseClient => {
  return createServerSupabase()
}
