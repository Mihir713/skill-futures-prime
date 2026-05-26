// Supabase client — server-side (uses service key for admin operations)
import { createClient } from "@supabase/supabase-js"

export type Database = {
  public: {
    Tables: {
      talentmkt_users: { Row: any; Insert: any; Update: any }
      buckets: { Row: any; Insert: any; Update: any }
      wallet_txs: { Row: any; Insert: any; Update: any }
      positions: { Row: any; Insert: any; Update: any }
      credentials: { Row: any; Insert: any; Update: any }
    }
  }
}

let serviceClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (serviceClient) return serviceClient

  const url = process.env.VITE_SUPABASE_URL || ""
  const key = process.env.SUPABASE_SERVICE_KEY || ""

  serviceClient = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return serviceClient
}

export function getSupabaseClient() {
  return getSupabaseAdmin()
}
