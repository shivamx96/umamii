import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// // Auth helpers
// export const auth = supabase.auth
//
// // Database helpers for common operations
// export const db = supabase.from
//
// // Storage helpers
// export const storage = supabase.storage
//
// // Real-time helpers
// export const channel = supabase.channel