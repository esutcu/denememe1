import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Helper to check for admin role
async function isAdmin(supabase: SupabaseClient, token: string): Promise<boolean> {
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return false
  return user.email?.endsWith('@admin.scoreresultsai.com') || user.email === 'your_admin_email@example.com'
}

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Admin authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }
    const token = authHeader.replace('Bearer ', '')
    if (!(await isAdmin(supabase, token))) {
      return new Response(JSON.stringify({ error: 'Access denied: Admin role required' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    }

    if (req.method === 'GET') {
      // List all batch runs, newest first
      const { data, error } = await supabase
        .from('batch_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50) // Limit to the last 50 runs for performance

      if (error) throw error
      return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
    }

  } catch (error) {
    console.error('Batch Run Manager Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
