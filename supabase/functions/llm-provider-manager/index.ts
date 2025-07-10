import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Helper to check for admin role
async function isAdmin(supabase: SupabaseClient, token: string): Promise<boolean> {
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return false
  // This logic should match your RLS policies for admin access
  // Ensure this email is correct and secured
  return user.email?.endsWith('@admin.scoreresultsai.com') || user.email === 'your_admin_email@example.com'
}

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

    let body = {}
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
        body = await req.json().catch(() => ({}))
    }
    
    const { id, ...providerData } = body;

    switch (req.method) {
      case 'GET': {
        // List all providers
        const { data, error } = await supabase.from('llm_providers').select('*').order('priority')
        if (error) throw error
        return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }

      case 'POST': {
        // Create a new provider
        const { data, error } = await supabase.from('llm_providers').insert(providerData).select().single()
        if (error) throw error
        return new Response(JSON.stringify({ success: true, data }), { status: 201, headers: { 'Content-Type': 'application/json' } })
      }

      case 'PUT': {
        // Update a provider
        if (!id) return new Response(JSON.stringify({ error: 'Provider ID is required for update' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        const { data, error } = await supabase.from('llm_providers').update(providerData).eq('id', id).select().single()
        if (error) throw error
        return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }

      case 'DELETE': {
        // Delete a provider
        if (!id) return new Response(JSON.stringify({ error: 'Provider ID is required for delete' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        const { error } = await supabase.from('llm_providers').delete().eq('id', id)
        if (error) throw error
        return new Response(JSON.stringify({ success: true, message: 'Provider deleted' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
    }
  } catch (error) {
    console.error('LLM Provider Manager Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
