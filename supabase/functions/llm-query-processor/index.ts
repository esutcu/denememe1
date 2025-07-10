import '../_shared/types.d.ts';

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// OpenRouter API Configuration
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

interface MatchData {
  match_id: string
  home_team: string
  away_team: string
  league_name: string
  match_date: string
  home_last_5?: any[]
  away_last_5?: any[]
  head_to_head?: any[]
  league_stats?: any
}

interface LLMProvider {
  id: string
  name: string
  api_key_encrypted: string
  priority: number
  status: string
}

interface LLMModel {
  id: string
  provider_id: string
  model_name: string
  display_name: string
  is_default: boolean
}

interface PredictionResult {
  winner: 'HOME' | 'DRAW' | 'AWAY'
  winner_confidence: number
  score_prediction: { home: number; away: number }
  over_under: 'OVER' | 'UNDER'
  over_under_line: number
  both_teams_score: boolean
  analysis: string
  key_factors: string[]
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
}

// Football prediction prompt template
function createPredictionPrompt(matchData: MatchData): string {
  const { home_team, away_team, league_name, home_last_5, away_last_5, head_to_head } = matchData
  
  return `You are a professional football analyst with expertise in statistical analysis and prediction modeling.

MATCH DETAILS:
- League: ${league_name}
- Home Team: ${home_team}
- Away Team: ${away_team}
- Date: ${matchData.match_date}

RECENT FORM (Last 5 matches):
${home_team}: ${home_last_5?.map(m => `${m.result} (${m.goals_for}-${m.goals_against})`).join(', ') || 'Data not available'}
${away_team}: ${away_last_5?.map(m => `${m.result} (${m.goals_for}-${m.goals_against})`).join(', ') || 'Data not available'}

HEAD-TO-HEAD (Last 3 meetings):
${head_to_head?.map(h => `${h.date}: ${h.home_team} ${h.home_score}-${h.away_score} ${h.away_team}`).join('\n') || 'No recent meetings'}

ANALYZE THIS MATCH AND PROVIDE:

1. **Winner Prediction**: HOME, DRAW, or AWAY
2. **Confidence Level**: 1-100 scale
3. **Score Prediction**: Most likely final score
4. **Over/Under 2.5 Goals**: OVER or UNDER
5. **Both Teams To Score**: true or false
6. **Risk Assessment**: LOW, MEDIUM, or HIGH
7. **Key Factors**: 3-5 most important factors affecting the outcome
8. **Detailed Analysis**: 2-3 sentences explaining your prediction

Please respond ONLY with a valid JSON object in this exact format:
{
  "winner": "HOME|DRAW|AWAY",
  "winner_confidence": 85,
  "score_prediction": {"home": 2, "away": 1},
  "over_under": "OVER|UNDER",
  "over_under_line": 2.5,
  "both_teams_score": true,
  "analysis": "Detailed analysis here...",
  "key_factors": ["Factor 1", "Factor 2", "Factor 3"],
  "risk_level": "LOW|MEDIUM|HIGH"
}`
}

// OpenRouter API call with failover
async function callOpenRouterAPI(
  prompt: string, 
  providers: LLMProvider[], 
  models: LLMModel[]
): Promise<{ result: PredictionResult; provider: LLMProvider; model: LLMModel; tokens: any }> {
  
  // Sort providers by priority
  const sortedProviders = providers
    .filter(p => p.status === 'active')
    .sort((a, b) => a.priority - b.priority)
  
  for (const provider of sortedProviders) {
    // Get default model for this provider
    const model = models.find(m => m.provider_id === provider.id && m.is_default) || models[0]
    
    try {
      console.log(`Trying provider: ${provider.name}, model: ${model.model_name}`)
      
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.api_key_encrypted}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://scoreresultsai.com',
          'X-Title': 'ScoreResultsAI'
        },
        body: JSON.stringify({
          model: model.model_name,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.1, // Low temperature for consistent predictions
          top_p: 0.9
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Provider ${provider.name} failed:`, response.status, errorText)
        continue // Try next provider
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error(`Invalid response from ${provider.name}:`, data)
        continue
      }

      const content = data.choices[0].message.content.trim()
      
      // Parse JSON response
      let predictionResult: PredictionResult
      try {
        // Clean up the content (remove markdown code blocks if present)
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
        predictionResult = JSON.parse(cleanContent)
      } catch (parseError) {
        console.error(`JSON parse error from ${provider.name}:`, parseError, content)
        continue
      }

      // Validate required fields
      if (!predictionResult.winner || !predictionResult.winner_confidence) {
        console.error(`Invalid prediction format from ${provider.name}:`, predictionResult)
        continue
      }

      console.log(`Success with provider: ${provider.name}`)
      
      return {
        result: predictionResult,
        provider,
        model,
        tokens: {
          prompt_tokens: data.usage?.prompt_tokens || 0,
          completion_tokens: data.usage?.completion_tokens || 0,
          total_tokens: data.usage?.total_tokens || 0
        }
      }

    } catch (error) {
      console.error(`Error with provider ${provider.name}:`, error)
      continue // Try next provider
    }
  }

  throw new Error('All LLM providers failed')
}

// Main function
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

    // Parse request
    const { matchData } = await req.json() as { matchData: MatchData }
    
    if (!matchData || !matchData.match_id) {
      return new Response('Invalid match data', { status: 400 })
    }

    // Get active LLM providers and models
    const { data: providers, error: providersError } = await supabase
      .from('llm_providers')
      .select('*')
      .eq('status', 'active')
      .order('priority')

    if (providersError || !providers?.length) {
      console.error('No providers available:', providersError)
      return new Response('No LLM providers available', { status: 503 })
    }

    const { data: models, error: modelsError } = await supabase
      .from('llm_models')
      .select('*')
      .eq('status', 'active')

    if (modelsError || !models?.length) {
      console.error('No models available:', modelsError)
      return new Response('No LLM models available', { status: 503 })
    }

    // Create prediction prompt
    const prompt = createPredictionPrompt(matchData)
    console.log('Generated prompt for match:', matchData.match_id)

    // Call LLM API with failover
    const startTime = Date.now()
    const { result, provider, model, tokens } = await callOpenRouterAPI(prompt, providers, models)
    const processingTime = Date.now() - startTime

    // Store prediction in cache, mapping to the correct schema
    const { data: prediction, error: insertError } = await supabase
      .from('match_predictions')
      .insert({
        match_id: matchData.match_id,
        home_team: matchData.home_team,
        away_team: matchData.away_team,
        league_name: matchData.league_name,
        match_date: matchData.match_date,
        
        // LLM and provider info
        llm_provider: provider.name,
        llm_model: model.model_name,
        
        // Flattened prediction results
        winner_prediction: result.winner,
        winner_confidence: result.winner_confidence,
        over_under_prediction: result.over_under,
        over_under_line: result.over_under_line,
        predicted_home_goals: result.score_prediction.home,
        predicted_away_goals: result.score_prediction.away,
        
        // Detailed analysis
        analysis_summary: result.analysis,
        key_factors: { factors: result.key_factors }, // Wrap array in a JSON object
        risk_assessment: result.risk_level,
        
        // Context data
        form_analysis: {
          home_last_5: matchData.home_last_5 || [],
          away_last_5: matchData.away_last_5 || []
        },
        head_to_head: {
          meetings: matchData.head_to_head || []
        },
        
        // Performance tracking
        processing_time_ms: processingTime,
        tokens_used: tokens.total_tokens
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to store prediction:', insertError)
      // Still return the result even if storage fails
    }

    // Update provider success status
    await supabase
      .from('llm_providers')
      .update({ 
        last_used_at: new Date().toISOString(),
        error_count: 0 // Reset error count on success
      })
      .eq('id', provider.id)

    console.log(`Successfully processed prediction for match ${matchData.match_id}`)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          prediction_id: prediction?.id,
          match_id: matchData.match_id,
          prediction: result,
          provider: provider.name,
          model: model.display_name,
          processing_time_ms: processingTime,
          tokens,
          cached_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
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
    console.error('LLM Query Processor Error:', error)
    
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