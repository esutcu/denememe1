import { createClient } from '@supabase/supabase-js'

// Doğru Supabase bilgileri
const supabaseUrl = 'https://ffeisjizngxvrpaencph.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZWlzaml6bmd4dnJwYWVuY3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mjc1NTMsImV4cCI6MjA2NzUwMzU1M30.YUCx47onp10u7Lopl5Yki98h9zNKkyMkXogWJQecXPc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Profile {
  id: string
  email: string
  full_name?: string
  plan_type: 'free' | 'basic' | 'pro'
  daily_prediction_limit: number
  predictions_used_today: number
  last_reset_date: string
}

export interface MatchPrediction {
  id: string
  match_id: string
  home_win_probability: number
  draw_probability: number
  away_win_probability: number
  confidence_score: number
  analysis_summary: string
  key_factors: string[]
  risk_level: 'low' | 'medium' | 'high'
}

// Helper functions
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`
    }
  })

  if (error) {
    console.error('Error signing up:', error.message)
    throw error
  }
  return data
}

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

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error.message)
    throw error
  }
}