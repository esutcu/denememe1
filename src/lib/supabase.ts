import { createClient } from '@supabase/supabase-js'

// Supabase configuration - hardcoded as per best practices
const supabaseUrl = 'https://eyouisaqohhujtfwmktp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5b3Vpc2Fxb2hodWp0Zndta3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NzExMzAsImV4cCI6MjA2NzU0NzEzMH0.pj9tFt_naBnEyXyCx3rOzK03gXWbitt6wK2LCO8BTGA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

// Helper function for sign up with email redirect
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