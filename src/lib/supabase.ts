import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Handle missing environment variables gracefully during build
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === 'undefined') {
    // During build/server-side rendering, use placeholder values
    console.warn('Supabase environment variables not found. Using placeholder values for build.')
  } else {
    // In the browser, throw an error
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)
