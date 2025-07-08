// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Updated Supabase configuration with provided credentials
const supabaseUrl = 'https://ffeisjizngxvrpaencph.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZWlzaml6bmd4dnJwYWVuY3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mjc1NTMsImV4cCI6MjA2NzUwMzU1M30.YUCx47onp10u7Lopl5Yki98h9zNKkyMkXogWJQecXPc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    return user
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

// Helper function for sign up with email redirect
export async function signUp(email: string, password: string) {
  try {
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
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

// Helper function for sign in
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    
    if (error) {
      console.error('Error signing in:', error.message)
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

// Helper function for sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error.message)
      throw error
    }
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// Database helper functions
export async function getUserSubscriptionInfo(userId: string) {
  try {
    const { data, error } = await supabase.rpc('get_user_subscription_info', {
      user_uuid: userId
    })
    
    if (error) {
      console.error('Error getting subscription info:', error)
      return null
    }
    
    return data[0] || {
      plan_type: 'free',
      status: 'active',
      daily_limit: 5,
      current_usage: 0,
      remaining_predictions: 5
    }
  } catch (error) {
    console.error('Error in getUserSubscriptionInfo:', error)
    return null
  }
}

export async function incrementUserUsage(userId: string) {
  try {
    const { data, error } = await supabase.rpc('increment_user_usage', {
      user_uuid: userId,
      request_type: 'prediction'
    })
    
    if (error) {
      console.error('Error incrementing usage:', error)
      return false
    }
    
    return data
  } catch (error) {
    console.error('Error in incrementUserUsage:', error)
    return false
  }
}

// Get cached match predictions
export async function getCachedPrediction(matchId: string) {
  try {
    const { data, error } = await supabase
      .from('match_predictions')
      .select('*')
      .eq('match_id', matchId)
      .eq('is_valid', true)
      .gt('cache_expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (error) {
      console.error('Error getting cached prediction:', error)
      return null
    }
    
    return data[0] || null
  } catch (error) {
    console.error('Error in getCachedPrediction:', error)
    return null
  }
}

// Get recent match predictions for dashboard
export async function getRecentPredictions(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('match_predictions')
      .select('*')
      .eq('is_valid', true)
      .gt('cache_expires_at', new Date().toISOString())
      .gte('match_date', new Date().toISOString().split('T')[0]) // Today or future
      .order('match_date', { ascending: true })
      .limit(limit)
    
    if (error) {
      console.error('Error getting recent predictions:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getRecentPredictions:', error)
    return []
  }
}