// supabase/functions/get-match-prediction/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface PredictionRequest {
  matchId: string
  homeTeam?: string
  awayTeam?: string
  leagueName?: string
  matchDate?: string
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    const { matchId, homeTeam, awayTeam, leagueName, matchDate }: PredictionRequest = await req.json()

    if (!matchId) {
      return new Response(
        JSON.stringify({ error: 'Match ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // 1. Check user subscription and daily limits
    const { data: userLimits, error: limitsError } = await supabaseClient
      .rpc('get_user_subscription_info', { user_uuid: user.id })

    if (limitsError) {
      throw new Error(`Failed to get user limits: ${limitsError.message}`)
    }

    const limits = userLimits[0] || {
      plan_type: 'free',
      daily_limit: 5,
      current_usage: 0,
      remaining_predictions: 5
    }

    // Check if user has remaining predictions
    if (limits.remaining_predictions <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Daily prediction limit reached',
          limits: {
            plan_type: limits.plan_type,
            daily_limit: limits.daily_limit,
            current_usage: limits.current_usage,
            remaining_predictions: limits.remaining_predictions
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      )
    }

    // 2. Try to get cached prediction first
    const { data: cachedPrediction, error: cacheError } = await supabaseClient
      .from('match_predictions')
      .select(`
        *,
        llm_providers!inner(name, display_name),
        llm_models!inner(model_name, display_name)
      `)
      .eq('match_id', matchId)
      .eq('is_valid', true)
      .gt('cache_expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (cacheError) {
      console.error('Cache lookup error:', cacheError)
    }

    let predictionData = null
    let source = 'cache'

    if (cachedPrediction && cachedPrediction.length > 0) {
      // Found cached prediction
      predictionData = cachedPrediction[0]
    } else {
      // No valid cache found - generate new prediction
      console.log(`No cached prediction found for match ${matchId}, generating new one...`)
      
      // For real-time requests, we'll try to generate a quick prediction
      // This should be rare if the weekly batch is working properly
      const newPrediction = await generateRealTimePrediction(
        supabaseClient,
        { matchId, homeTeam, awayTeam, leagueName, matchDate }
      )

      if (newPrediction) {
        predictionData = newPrediction
        source = 'llm'
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Unable to generate prediction for this match'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 503,
          }
        )
      }
    }

    // 3. Increment user usage (only for successful predictions)
    const { data: usageIncremented, error: usageError } = await supabaseClient
      .rpc('increment_user_usage', {
        user_uuid: user.id,
        request_type: 'prediction'
      })

    if (usageError || !usageIncremented) {
      console.error('Failed to increment usage:', usageError)
    }

    // 4. Get updated limits after usage increment
    const { data: updatedLimits } = await supabaseClient
      .rpc('get_user_subscription_info', { user_uuid: user.id })

    const finalLimits = updatedLimits?.[0] || limits

    // 5. Format response
    const response = {
      success: true,
      data: {
        id: predictionData.id,
        match_id: predictionData.match_id,
        home_team: predictionData.home_team,
        away_team: predictionData.away_team,
        league_name: predictionData.league_name,
        match_date: predictionData.match_date,
        llm_provider: predictionData.llm_providers?.name || 'Unknown',
        llm_model: predictionData.llm_models?.display_name || 'Unknown',
        winner_prediction: predictionData.winner_prediction,
        winner_confidence: predictionData.winner_confidence,
        goals_prediction: {
          home_goals: predictionData.predicted_home_goals,
          away_goals: predictionData.predicted_away_goals
        },
        probabilities: {
          home_win: predictionData.home_win_probability,
          draw: predictionData.draw_probability,
          away_win: predictionData.away_win_probability
        },
        over_under_prediction: predictionData.over_under_prediction,
        analysis_text: predictionData.analysis_text,
        risk_factors: predictionData.risk_factors,
        risk_level: predictionData.risk_level,
        key_stats: predictionData.key_stats,
        team_form_analysis: predictionData.team_form_analysis,
        created_at: predictionData.created_at
      },
      source: source, // 'cache' or 'llm'
      user_limits: {
        plan_type: finalLimits.plan_type,
        daily_limit: finalLimits.daily_limit,
        current_usage: finalLimits.current_usage,
        remaining_predictions: finalLimits.remaining_predictions
      }
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Get prediction error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function generateRealTimePrediction(
  supabaseClient: any,
  matchData: PredictionRequest
): Promise<any | null> {
  try {
    // Get active LLM provider
    const { data: providers, error: providersError } = await supabaseClient
      .from('llm_providers')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(1)

    if (providersError || !providers?.length) {
      console.error('No active providers found')
      return null
    }

    const provider = providers[0]

    // Get active model
    const { data: models, error: modelsError } = await supabaseClient
      .from('llm_models')
      .select('*')
      .eq('provider_id', provider.id)
      .eq('is_active', true)
      .limit(1)

    if (modelsError || !models?.length) {
      console.error('No active models found')
      return null
    }

    const model = models[0]

    // Create a basic prediction prompt
    const prompt = `
Analyze this football match and provide a prediction:

MATCH DETAILS:
- Home Team: ${matchData.homeTeam || 'Unknown'}
- Away Team: ${matchData.awayTeam || 'Unknown'}
- League: ${matchData.leagueName || 'Unknown'}
- Date: ${matchData.matchDate || 'TBD'}

Provide your prediction in JSON format:
{
  "winner_prediction": "HOME|DRAW|AWAY",
  "winner_confidence": 75,
  "home_win_probability": 45,
  "draw_probability": 25,
  "away_win_probability": 30,
  "predicted_home_goals": 1.5,
  "predicted_away_goals": 1.0,
  "over_under_prediction": "UNDER",
  "analysis_text": "Quick analysis based on available data...",
  "risk_level": "medium",
  "risk_factors": ["Limited data available"],
  "key_stats": {"note": "Real-time prediction with limited data"},
  "team_form_analysis": {"note": "Form analysis not available for real-time prediction"}
}
`

    // Call LLM API
    const response = await fetch(provider.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.api_key_encrypted}`,
        'HTTP-Referer': 'https://scoreresultsai.com',
        'X-Title': 'ScoreResultsAI'
      },
      body: JSON.stringify({
        model: model.model_name,
        messages: [
          {
            role: 'system',
            content: 'You are a football analyst. Provide predictions in the requested JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: model.temperature,
        max_tokens: 800
      })
    })

    if (!response.ok) {
      console.error(`LLM API error: ${response.status}`)
      return null
    }

    const data = await response.json()
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const prediction = JSON.parse(jsonMatch[0])
          
          // Save to cache for future use
          const { data: savedPrediction, error: saveError } = await supabaseClient
            .from('match_predictions')
            .insert({
              match_id: matchData.matchId,
              home_team: matchData.homeTeam || 'Unknown',
              away_team: matchData.awayTeam || 'Unknown',
              league_name: matchData.leagueName || 'Unknown',
              league_id: 'unknown',
              match_date: matchData.matchDate || new Date().toISOString(),
              llm_provider_id: provider.id,
              llm_model_id: model.id,
              winner_prediction: prediction.winner_prediction,
              winner_confidence: prediction.winner_confidence,
              home_win_probability: prediction.home_win_probability,
              draw_probability: prediction.draw_probability,
              away_win_probability: prediction.away_win_probability,
              predicted_home_goals: prediction.predicted_home_goals,
              predicted_away_goals: prediction.predicted_away_goals,
              over_under_prediction: prediction.over_under_prediction,
              analysis_text: prediction.analysis_text,
              risk_level: prediction.risk_level,
              risk_factors: prediction.risk_factors,
              key_stats: prediction.key_stats,
              team_form_analysis: prediction.team_form_analysis,
              cache_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            })
            .select()
            .single()

          if (saveError) {
            console.error('Failed to save real-time prediction:', saveError)
          }

          return savedPrediction || {
            ...prediction,
            match_id: matchData.matchId,
            home_team: matchData.homeTeam,
            away_team: matchData.awayTeam,
            league_name: matchData.leagueName,
            match_date: matchData.matchDate,
            created_at: new Date().toISOString()
          }
        }
      } catch (parseError) {
        console.error('Failed to parse real-time LLM response:', parseError)
        return null
      }
    }

    return null
  } catch (error) {
    console.error('Real-time prediction generation failed:', error)
    return null
  }
}