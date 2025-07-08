import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PredictionRequest {
  homeTeam: string
  awayTeam: string
  leagueName?: string
  matchDate?: string
}

async function callOpenRouter(apiKey: string, model: string, prompt: string): Promise<any> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://scoreresultsai.com'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { 
          role: 'system', 
          content: 'Sen bir futbol analisti uzmanısın. Sadece JSON formatında yanıt ver.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    })
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    const request: PredictionRequest = await req.json()
    
    if (!request.homeTeam || !request.awayTeam) {
      throw new Error('Home team and away team are required')
    }

    console.log(`Prediction request: ${request.homeTeam} vs ${request.awayTeam}`)

    // Check user limits
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      throw new Error('User profile not found')
    }

    // Reset daily if needed
    const today = new Date().toISOString().split('T')[0]
    if (profile.last_reset_date !== today) {
      await supabaseClient
        .from('profiles')
        .update({
          predictions_used_today: 0,
          last_reset_date: today
        })
        .eq('id', user.id)
      
      profile.predictions_used_today = 0
    }

    if (profile.predictions_used_today >= profile.daily_prediction_limit) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Daily prediction limit reached'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429
        }
      )
    }

    // Try cached first
    const { data: cached } = await supabaseClient
      .from('match_predictions')
      .select(`
        *,
        match_fixtures!inner(home_team, away_team, league_name)
      `)
      .ilike('match_fixtures.home_team', `%${request.homeTeam}%`)
      .ilike('match_fixtures.away_team', `%${request.awayTeam}%`)
      .gt('cache_expires_at', new Date().toISOString())
      .single()

    if (cached) {
      return new Response(
        JSON.stringify({
          success: true,
          data: cached,
          source: 'cache'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate fresh prediction
    const { data: providers } = await supabaseClient
      .from('llm_providers')
      .select('*')
      .eq('status', 'active')
      .order('priority')

    if (!providers?.length) {
      throw new Error('No active LLM providers')
    }

    const prompt = `
Maç Analizi: ${request.homeTeam} vs ${request.awayTeam}
Lig: ${request.leagueName || 'Bilinmiyor'}

JSON formatında tahmin ver:
{
  "homeWinProbability": number (0-100),
  "drawProbability": number (0-100), 
  "awayWinProbability": number (0-100),
  "confidenceScore": number (0-100),
  "analysisSummary": "kısa analiz",
  "keyFactors": ["faktör1", "faktör2", "faktör3"],
  "riskLevel": "low" | "medium" | "high"
}
    `

    let prediction = null
    for (const provider of providers) {
      try {
        const rawResponse = await callOpenRouter(
          provider.api_key_encrypted,
          provider.model_name,
          prompt
        )

        const cleanedResponse = rawResponse.replace(/```json\n|\n```|```/g, '').trim()
        prediction = JSON.parse(cleanedResponse)
        break
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error)
        continue
      }
    }

    if (!prediction) {
      throw new Error('All providers failed')
    }

    // Create match and store prediction
    const { data: match } = await supabaseClient
      .from('match_fixtures')
      .insert({
        external_match_id: `custom_${Date.now()}`,
        home_team: request.homeTeam,
        away_team: request.awayTeam,
        league_name: request.leagueName || 'Bilinmiyor',
        match_date: request.matchDate || new Date().toISOString()
      })
      .select('id')
      .single()

    await supabaseClient
      .from('match_predictions')
      .insert({
        match_id: match.id,
        llm_provider_id: providers[0].id,
        home_win_probability: prediction.homeWinProbability,
        draw_probability: prediction.drawProbability,
        away_win_probability: prediction.awayWinProbability,
        confidence_score: prediction.confidenceScore,
        analysis_summary: prediction.analysisSummary,
        key_factors: prediction.keyFactors,
        risk_level: prediction.riskLevel
      })

    // Update user usage
    await supabaseClient
      .from('profiles')
      .update({
        predictions_used_today: profile.predictions_used_today + 1
      })
      .eq('id', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        data: prediction,
        source: 'fresh'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})