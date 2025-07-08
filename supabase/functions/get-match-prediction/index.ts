import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface MatchRequest {
  matchId: string
  homeTeam: string
  awayTeam: string
  leagueName?: string
  matchDate?: string
}

interface UserLimits {
  planType: string
  dailyLimit: number
  currentUsage: number
  remainingPredictions: number
  hasLimitReached: boolean
  canMakePrediction: boolean
}

// Check user subscription and limits
async function checkUserLimits(supabase: any, userId: string): Promise<UserLimits> {
  // Get user subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  const planType = subscription?.plan_type || 'free'
  const dailyLimit = subscription?.daily_prediction_limit || 5

  // Get today's usage
  const today = new Date().toISOString().split('T')[0]
  const { data: usage } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  const currentUsage = usage?.prediction_requests || 0
  const remainingPredictions = Math.max(0, dailyLimit - currentUsage)
  const hasLimitReached = currentUsage >= dailyLimit
  const canMakePrediction = !hasLimitReached

  return {
    planType,
    dailyLimit,
    currentUsage,
    remainingPredictions,
    hasLimitReached,
    canMakePrediction
  }
}

// Update user usage
async function updateUserUsage(supabase: any, userId: string, success: boolean = true) {
  const today = new Date().toISOString().split('T')[0]
  
  const { data: existingUsage } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (existingUsage) {
    await supabase
      .from('user_usage')
      .update({
        prediction_requests: existingUsage.prediction_requests + 1,
        successful_requests: success ? existingUsage.successful_requests + 1 : existingUsage.successful_requests,
        failed_requests: success ? existingUsage.failed_requests : existingUsage.failed_requests + 1
      })
      .eq('id', existingUsage.id)
  } else {
    await supabase
      .from('user_usage')
      .insert({
        user_id: userId,
        date: today,
        prediction_requests: 1,
        successful_requests: success ? 1 : 0,
        failed_requests: success ? 0 : 1
      })
  }
}

// Record user prediction in history
async function recordUserPrediction(supabase: any, userId: string, predictionId: string, source: string) {
  await supabase
    .from('user_predictions')
    .insert({
      user_id: userId,
      match_prediction_id: predictionId,
      source
    })
}

// Generate match ID from team names if not provided
function generateMatchId(homeTeam: string, awayTeam: string, date?: string): string {
  const dateStr = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  return `${homeTeam.toLowerCase().replace(/\s+/g, '-')}_vs_${awayTeam.toLowerCase().replace(/\s+/g, '-')}_${dateStr}`
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

    if (req.method !== 'POST') {
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

    // Parse request
    const requestData = await req.json() as MatchRequest
    const { matchId, homeTeam, awayTeam, leagueName, matchDate } = requestData

    if (!homeTeam || !awayTeam) {
      return new Response('Home team and away team are required', { status: 400 })
    }

    // Generate match ID if not provided
    const finalMatchId = matchId || generateMatchId(homeTeam, awayTeam, matchDate)

    // Check user limits
    const userLimits = await checkUserLimits(supabase, user.id)
    
    if (!userLimits.canMakePrediction) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Daily prediction limit reached',
          limits: userLimits
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Look for cached prediction first
    const { data: cachedPrediction, error: cacheError } = await supabase
      .from('match_predictions')
      .select('*')
      .eq('match_id', finalMatchId)
      .eq('is_active', true)
      .gt('cache_expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (cachedPrediction && !cacheError) {
      console.log(`Cache hit for match ${finalMatchId}`)
      
      // Update user usage and record prediction
      await updateUserUsage(supabase, user.id, true)
      await recordUserPrediction(supabase, user.id, cachedPrediction.id, 'cache')

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: cachedPrediction.id,
            match_id: finalMatchId,
            home_team: cachedPrediction.home_team,
            away_team: cachedPrediction.away_team,
            league_name: cachedPrediction.league_name,
            match_date: cachedPrediction.match_date,
            llm_provider: cachedPrediction.llm_provider_name,
            llm_model: cachedPrediction.llm_model_name,
            winner_prediction: cachedPrediction.prediction_result.winner,
            winner_confidence: cachedPrediction.prediction_result.winner_confidence,
            goals_prediction: cachedPrediction.prediction_result.score_prediction,
            over_under_prediction: cachedPrediction.prediction_result.over_under,
            analysis_text: cachedPrediction.prediction_result.analysis,
            risk_factors: cachedPrediction.prediction_result.key_factors,
            key_stats: cachedPrediction.match_context,
            created_at: cachedPrediction.created_at
          },
          source: 'cache',
          remainingPredictions: userLimits.remainingPredictions - 1
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    console.log(`Cache miss for match ${finalMatchId}, generating new prediction`)

    // No cached prediction found, generate new one
    // First, prepare mock match data (in production, this would come from API-Football)
    const matchData = {
      match_id: finalMatchId,
      home_team: homeTeam,
      away_team: awayTeam,
      league_name: leagueName || 'Unknown League',
      match_date: matchDate || new Date().toISOString(),
      home_last_5: [
        { result: 'W', goals_for: 2, goals_against: 1, opponent: 'Team A' },
        { result: 'D', goals_for: 1, goals_against: 1, opponent: 'Team B' },
        { result: 'W', goals_for: 3, goals_against: 0, opponent: 'Team C' },
        { result: 'L', goals_for: 0, goals_against: 2, opponent: 'Team D' },
        { result: 'W', goals_for: 2, goals_against: 1, opponent: 'Team E' }
      ],
      away_last_5: [
        { result: 'L', goals_for: 1, goals_against: 2, opponent: 'Team X' },
        { result: 'W', goals_for: 2, goals_against: 0, opponent: 'Team Y' },
        { result: 'W', goals_for: 1, goals_against: 0, opponent: 'Team Z' },
        { result: 'D', goals_for: 2, goals_against: 2, opponent: 'Team W' },
        { result: 'W', goals_for: 3, goals_against: 1, opponent: 'Team V' }
      ],
      head_to_head: [
        { date: '2024-03-15', home_team: homeTeam, away_team: awayTeam, home_score: 2, away_score: 1 },
        { date: '2023-11-20', home_team: awayTeam, away_team: homeTeam, home_score: 0, away_score: 0 },
        { date: '2023-05-10', home_team: homeTeam, away_team: awayTeam, home_score: 1, away_score: 3 }
      ]
    }

    // Call LLM processor
    const llmResponse = await fetch(`${supabaseUrl}/functions/v1/llm-query-processor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ matchData })
    })

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text()
      console.error('LLM processor failed:', llmResponse.status, errorText)
      
      await updateUserUsage(supabase, user.id, false)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to generate prediction',
          details: errorText
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

    const llmResult = await llmResponse.json()
    
    if (!llmResult.success) {
      await updateUserUsage(supabase, user.id, false)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'LLM prediction failed',
          details: llmResult.error
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

    // Update user usage and record prediction
    await updateUserUsage(supabase, user.id, true)
    await recordUserPrediction(supabase, user.id, llmResult.data.prediction_id, 'llm')

    console.log(`Successfully generated new prediction for match ${finalMatchId}`)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: llmResult.data.prediction_id,
          match_id: finalMatchId,
          home_team: homeTeam,
          away_team: awayTeam,
          league_name: leagueName || 'Unknown League',
          match_date: matchDate || new Date().toISOString(),
          llm_provider: llmResult.data.provider,
          llm_model: llmResult.data.model,
          winner_prediction: llmResult.data.prediction.winner,
          winner_confidence: llmResult.data.prediction.winner_confidence,
          goals_prediction: llmResult.data.prediction.score_prediction,
          over_under_prediction: llmResult.data.prediction.over_under,
          analysis_text: llmResult.data.prediction.analysis,
          risk_factors: llmResult.data.prediction.key_factors,
          key_stats: matchData,
          created_at: new Date().toISOString()
        },
        source: 'llm',
        remainingPredictions: userLimits.remainingPredictions - 1,
        processingTime: llmResult.data.processing_time_ms
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
    console.error('Get Match Prediction Error:', error)
    
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