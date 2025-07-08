import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface UserLimits {
  userId: string
  planType: string
  dailyLimit: number
  currentUsage: number
  remainingPredictions: number
  hasLimitReached: boolean
  canMakePrediction: boolean
  planFeatures: any
  subscriptionStatus: string
  periodEnd?: string
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      })
    }

    if (req.method !== 'POST' && req.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from JWT token
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response('Authorization required', { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response('Invalid token', { status: 401 })
    }

    // Get user subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Default plan if no subscription found
    const planType = subscription?.plan_type || 'free'
    const planLimits = {
      free: {
        dailyLimit: 5,
        features: {
          leagues: ['Premier League', 'Süper Lig'],
          aiAnalysis: 'basic',
          support: 'community'
        }
      },
      basic: {
        dailyLimit: 50,
        features: {
          leagues: ['All Major Leagues'],
          aiAnalysis: 'advanced',
          support: 'email',
          emailNotifications: true
        }
      },
      pro: {
        dailyLimit: 200,
        features: {
          leagues: ['All Leagues + Special Competitions'],
          aiAnalysis: 'premium',
          support: 'priority',
          emailNotifications: true,
          apiAccess: true,
          customReports: true
        }
      }
    }

    const currentPlan = planLimits[planType as keyof typeof planLimits] || planLimits.free
    const dailyLimit = subscription?.daily_prediction_limit || currentPlan.dailyLimit

    // Get today's usage
    const today = new Date().toISOString().split('T')[0]
    const { data: usage, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    const currentUsage = usage?.prediction_requests || 0
    const remainingPredictions = Math.max(0, dailyLimit - currentUsage)
    const hasLimitReached = currentUsage >= dailyLimit
    const canMakePrediction = !hasLimitReached

    const result: UserLimits = {
      userId: user.id,
      planType,
      dailyLimit,
      currentUsage,
      remainingPredictions,
      hasLimitReached,
      canMakePrediction,
      planFeatures: currentPlan.features,
      subscriptionStatus: subscription?.status || 'none',
      periodEnd: subscription?.current_period_end
    }

    console.log(`User ${user.id} limits: ${currentUsage}/${dailyLimit} (${planType})`)

    return new Response(
      JSON.stringify({
        success: true,
        data: result
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('User Limit Check Error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})