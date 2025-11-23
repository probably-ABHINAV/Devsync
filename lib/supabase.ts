import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Some features may not work.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for admin operations)
export function getServiceSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types (can be generated with: npx supabase gen types typescript)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          github_id: string
          username: string
          avatar_url: string
          name: string
          email: string | null
          github_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          github_id: string
          username: string
          avatar_url: string
          name: string
          email?: string | null
          github_token: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          github_id?: string
          username?: string
          avatar_url?: string
          name?: string
          email?: string | null
          github_token?: string
          created_at?: string
          updated_at?: string
        }
      }
      discord_configs: {
        Row: {
          id: string
          user_id: string
          webhook_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          webhook_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          webhook_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          user_id: string
          repo_name: string
          event_type: string
          payload: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          repo_name: string
          event_type: string
          payload: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          repo_name?: string
          event_type?: string
          payload?: any
          created_at?: string
        }
      }
    }
  }
}
