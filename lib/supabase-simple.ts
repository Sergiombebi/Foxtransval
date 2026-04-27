// Version simplifiée pour éviter les problèmes de build
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton pattern pour éviter les erreurs d'initialisation
class SupabaseManager {
  private client: SupabaseClient | null = null
  private adminClient: SupabaseClient | null = null

  getClient(): SupabaseClient | null {
    if (!this.client) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        console.warn('Variables Supabase manquantes')
        return null
      }
      
      this.client = createClient(url, key)
    }
    return this.client
  }

  getAdminClient(): SupabaseClient | null {
    if (!this.adminClient) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!url || !key) {
        console.warn('Variables Supabase manquantes')
        return null
      }
      
      this.adminClient = createClient(url, serviceKey || key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }
    return this.adminClient
  }
}

const supabaseManager = new SupabaseManager()

export const supabase = supabaseManager.getClient()
export const supabaseAdmin = supabaseManager.getAdminClient()
