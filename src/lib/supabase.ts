import { createClient } from '@supabase/supabase-js'

// Supabase configuration - Environment variables kullanarak
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ffeisjizngxvrpaencph.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZWlzaml6bmd4dnJwYWVuY3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mjc1NTMsImV4cCI6MjA2NzUwMzU1M30.YUCx47onp10u7Lopl5Yki98h9zNKkyMkXogWJQecXPc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

// Helper function for sign up with email confirmation
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    console.error('Error signing up:', error.message)
    throw error
  }

  return data
}

// Helper function for sign in
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  })
  
  if (error) {
    console.error('Error signing in:', error.message)
    throw error
  }
  
  return data
}

// Helper function for sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error.message)
    throw error
  }
}

// Helper function to check if user is admin
export function isAdmin(user: any): boolean {
  if (!user?.email) return false
  
  const adminEmails = [
    'admin@scoreresultsai.com',
    'hasan@scoreresultsai.com',
    // Gerekirse daha fazla admin email ekleyebilirsiniz
  ]
  
  return adminEmails.includes(user.email) || user.email.endsWith('@admin.com')
}

// Types for better TypeScript support
export interface UserProfile {
  id: string
  email: string
  created_at: string
  subscription_status: 'free' | 'basic' | 'pro'
  daily_limit: number
  current_usage: number
}

export interface MatchPrediction {
  id: string
  match_id: string
  home_team: string
  away_team: string
  league_name: string
  match_date: string
  llm_provider: string
  llm_model: string
  winner_prediction: 'HOME' | 'AWAY' | 'DRAW'
  winner_confidence: number
  goals_prediction: {
    home: number
    away: number
    total: number
  }
  over_under_prediction: 'OVER' | 'UNDER'
  analysis_text: string
  risk_factors: string[]
  key_stats: Record<string, any>
  cache_expires_at: string
  created_at: string
}