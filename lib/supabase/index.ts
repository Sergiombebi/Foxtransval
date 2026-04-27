// Point d'entrée principal pour l'architecture Supabase
export { createClientSupabase, useSupabase } from './client'
export { createServerSupabase, createAdminSupabase } from './server'

// Types réexportés pour faciliter l'utilisation
export type { SupabaseClient } from '@supabase/supabase-js'
