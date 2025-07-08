import { createClient } from '@supabase/supabase-js'

// Doğru Supabase credentials (APILER belgesinden)
const supabaseUrl = 'https://ffeisjizngxvrpaencph.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZWlzaml6bmd4dnJwYWVuY3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mjc1NTMsImV4cCI6MjA2NzUwMzU1M30.YUCx47onp10u7Lopl5Yki98h9zNKkyMkXogWJQecXPc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ===== AUTH HELPER FUNCTIONS =====

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

// ===== SUBSCRIPTION HELPERS =====

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
    
  return { data, error }
}

export async function getUserUsage(userId: string, date: string = new Date().toISOString().split('T')[0]) {
  const { data, error } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single()
    
  return { data, error }
}