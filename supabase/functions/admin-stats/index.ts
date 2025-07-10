
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Function to verify admin user
async function isAdmin(supabase: SupabaseClient, token: string): Promise<boolean> {
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return false
  // This logic should match your RLS policies for admin access
  return user.email?.endsWith('@admin.scoreresultsai.com') || user.email === 'your_admin_email@example.com'
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify admin user
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response('Authorization required', { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')
    if (!(await isAdmin(supabase, token))) {
      return new Response('Access denied: Admin role required', { status: 403 })
    }

    // --- Fetch all stats in parallel ---
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const today = new Date().toISOString().split('T')[0]

    const [
      predictionsRes,
      predictions24hRes,
      activeCacheRes,
      subscriptionsRes,
      usageRes,
      providersRes,
      lastBatchRunRes,
      totalUsersRes
    ] = await Promise.all([
      supabase.from('match_predictions').select('id', { count: 'exact', head: true }),
      supabase.from('match_predictions').select('id', { count: 'exact', head: true }).gt('created_at', yesterday.toISOString()),
      supabase.from('match_predictions').select('id', { count: 'exact', head: true }).eq('is_expired', false),
      supabase.from('subscriptions').select('plan_type'),
      supabase.from('user_usage').select('prediction_requests, cache_hits').eq('date', today),
      supabase.from('llm_providers').select('name, status, priority').order('priority'),
      supabase.from('batch_runs').select('completed_at').eq('status', 'completed').order('completed_at', { ascending: false }).limit(1).single(),
      supabase.auth.admin.listUsers()
    ])

    // --- Process stats ---

    // Predictions
    const predictions = {
      total: predictionsRes.count ?? 0,
      last24h: predictions24hRes.count ?? 0,
      activeCache: activeCacheRes.count ?? 0,
    }

    // Users and Subscriptions
    const subs = subscriptionsRes.data || []
    const users = {
      total: totalUsersRes.data?.users?.length ?? 0,
      subscriptions: {
        free: (totalUsersRes.data?.users?.length ?? 0) - subs.length,
        basic: subs.filter(s => s.plan_type === 'basic').length,
        pro: subs.filter(s => s.plan_type === 'pro').length,
        premium: subs.filter(s => s.plan_type === 'premium').length,
        total: subs.length,
      }
    }

    // Usage
    const dailyUsage = usageRes.data || []
    const totalRequests = dailyUsage.reduce((acc, u) => acc + u.prediction_requests, 0)
    const totalCacheHits = dailyUsage.reduce((acc, u) => acc + u.cache_hits, 0)
    const cacheHitRate = totalRequests > 0 ? Math.round((totalCacheHits / totalRequests) * 100) : 0
    
    const usage = {
      today: {
        totalRequests,
        averagePerUser: users.total > 0 ? parseFloat((totalRequests / users.total).toFixed(2)) : 0,
        planBreakdown: { free: 0, basic: 0, pro: 0, premium: 0 } // Note: This requires joining usage with subscriptions, skipping for now.
      },
      cacheHitRate,
    }

    // System
    const system = {
      providers: providersRes.data || [],
      uptime: '99.9%', // Placeholder
      lastBatchRun: lastBatchRunRes.data?.completed_at || 'N/A',
    }

    const finalStats = {
      predictions,
      users,
      usage,
      system,
      timestamp: new Date().toISOString(),
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: finalStats
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
    console.error('Admin Stats Error:', error)
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
