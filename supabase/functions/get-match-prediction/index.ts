// supabase/functions/get-match-prediction/index.ts
// Kullanıcıların cache'den tahmin alması için API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { LLMService } from '../shared/llmService.ts'

interface PredictionRequest {
  matchId?: string
  homeTeam?: string
  awayTeam?: string
  leagueName?: string
  matchDate?: string
}

interface UserLimits {
  userId: string
  planType: string
  dailyLimit: number
  currentUsage: number
  remainingPredictions: number
  hasLimitReached: boolean
  canMakePrediction: boolean
}

class PredictionService {
  private supabase

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
  }

  // Ana tahmin alma fonksiyonu
  async getPrediction(request: PredictionRequest, userId: string): Promise<any> {
    console.log('🎯 Getting prediction for:', request)

    // 1. Kullanıcı limitlerini kontrol et
    const limits = await this.checkUserLimits(userId)
    if (!limits.canMakePrediction) {
      throw new Error(`Daily limit reached. Plan: ${limits.planType}, Remaining: ${limits.remainingPredictions}`)
    }

    // 2. Cache'de arama yap
    let prediction = await this.searchInCache(request)
    let source: 'cache' | 'llm' = 'cache'

    // 3. Cache'de yoksa LLM ile üret (sadece acil durumlar için)
    if (!prediction) {
      console.log('⚡ Cache miss - generating new prediction')
      prediction = await this.generateFreshPrediction(request)
      source = 'llm'
    }

    // 4. Kullanım sayacını güncelle
    await this.updateUserUsage(userId, source)

    return {
      data: prediction,
      source,
      limits: await this.checkUserLimits(userId) // Güncel limitler
    }
  }

  // Kullanıcı limitlerini kontrol et
  async checkUserLimits(userId: string): Promise<UserLimits> {
    const today = new Date().toISOString().split('T')[0]

    // Kullanıcının abonelik bilgilerini al
    const { data: subscription } = await this.supabase
      .from('subscriptions')
      .select('plan_type, daily_limit, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    // Default free plan
    const planType = subscription?.plan_type || 'free'
    const dailyLimit = subscription?.daily_limit || this.getDefaultLimit(planType)

    // Bugünkü kullanım miktarını al
    const { data: usage } = await this.supabase
      .from('user_usage')
      .select('prediction_requests')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    const currentUsage = usage?.prediction_requests || 0
    const remainingPredictions = Math.max(0, dailyLimit - currentUsage)
    const hasLimitReached = currentUsage >= dailyLimit
    const canMakePrediction = !hasLimitReached

    return {
      userId,
      planType,
      dailyLimit,
      currentUsage,
      remainingPredictions,
      hasLimitReached,
      canMakePrediction
    }
  }

  // Cache'de arama
  private async searchInCache(request: PredictionRequest): Promise<any> {
    let query = this.supabase
      .from('match_predictions')
      .select('*')
      .gt('cache_expires_at', new Date().toISOString())

    // Önce match_id ile ara
    if (request.matchId) {
      query = query.eq('match_id', request.matchId)
    } else if (request.homeTeam && request.awayTeam) {
      // Takım isimleri ile ara
      query = query
        .eq('home_team', request.homeTeam)
        .eq('away_team', request.awayTeam)
      
      if (request.matchDate) {
        const matchDate = new Date(request.matchDate)
        const dayStart = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate())
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
        
        query = query
          .gte('match_date', dayStart.toISOString())
          .lt('match_date', dayEnd.toISOString())
      }
    } else {
      throw new Error('Either matchId or homeTeam+awayTeam required')
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Cache search failed: ${error.message}`)
    }

    if (data) {
      console.log('✅ Cache hit for:', data.home_team, 'vs', data.away_team)
      return this.formatPredictionResponse(data)
    }

    return null
  }

  // Acil durumlarda LLM ile tahmin üret
  private async generateFreshPrediction(request: PredictionRequest): Promise<any> {
    if (!request.homeTeam || !request.awayTeam) {
      throw new Error('Cannot generate fresh prediction without team names')
    }

    const llmService = new LLMService()
    
    // Minimal data ile tahmin üret
    const matchData = {
      homeTeam: request.homeTeam,
      awayTeam: request.awayTeam,
      leagueName: request.leagueName || 'Unknown League',
      matchDate: request.matchDate || new Date().toISOString(),
      homeTeamForm: ['N', 'N', 'N', 'N', 'N'], // No data available
      awayTeamForm: ['N', 'N', 'N', 'N', 'N'],
      headToHead: []
    }

    const prediction = await llmService.generateConsensusPredict(matchData)

    // Fresh prediction'ı cache'e kaydet
    const matchId = request.matchId || `manual_${Date.now()}`
    await this.savePredictionToCache(matchId, matchData, prediction)

    return this.formatPredictionResponse({
      id: matchId,
      match_id: matchId,
      home_team: request.homeTeam,
      away_team: request.awayTeam,
      league_name: request.leagueName || 'Unknown',
      match_date: request.matchDate || new Date().toISOString(),
      llm_provider: 'OpenRouter_Primary',
      llm_model: 'deepseek/deepseek-r1',
      ...prediction,
      created_at: new Date().toISOString()
    })
  }

  // Kullanım sayacını güncelle
  private async updateUserUsage(userId: string, source: 'cache' | 'llm'): Promise<void> {
    const today = new Date().toISOString().split('T')[0]

    // Upsert user usage
    const { error } = await this.supabase
      .from('user_usage')
      .upsert({
        user_id: userId,
        date: today,
        prediction_requests: 1,
        cache_hits: source === 'cache' ? 1 : 0,
        cache_misses: source === 'llm' ? 1 : 0,
        llm_requests: source === 'llm' ? 1 : 0
      }, {
        onConflict: 'user_id,date'
      })

    if (error) {
      console.error('Failed to update user usage:', error)
    }

    // User activity log
    await this.supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: 'prediction_request',
        activity_data: { source, timestamp: new Date().toISOString() }
      })
  }

  // Cache'e kaydet
  private async savePredictionToCache(matchId: string, matchData: any, prediction: any): Promise<void> {
    const { error } = await this.supabase
      .from('match_predictions')
      .insert({
        match_id: matchId,
        home_team: matchData.homeTeam,
        away_team: matchData.awayTeam,
        league_name: matchData.leagueName,
        match_date: matchData.matchDate,
        llm_provider: 'OpenRouter_Primary',
        llm_model: 'deepseek/deepseek-r1',
        winner_prediction: prediction.winner_prediction,
        winner_confidence: prediction.winner_confidence,
        goals_prediction: prediction.goals_prediction,
        over_under_prediction: prediction.over_under_prediction,
        over_under_confidence: prediction.over_under_confidence,
        analysis_text: prediction.analysis_text,
        risk_factors: prediction.risk_factors,
        key_stats: prediction.key_stats,
        confidence_breakdown: prediction.confidence_breakdown,
        input_data: matchData,
        cache_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (error) {
      console.error('Failed to save fresh prediction:', error)
    }
  }

  // Response formatla
  private formatPredictionResponse(data: any): any {
    return {
      id: data.id,
      match_id: data.match_id,
      home_team: data.home_team,
      away_team: data.away_team,
      league_name: data.league_name,
      match_date: data.match_date,
      llm_provider: data.llm_provider,
      llm_model: data.llm_model,
      winner_prediction: data.winner_prediction,
      winner_confidence: data.winner_confidence,
      goals_prediction: data.goals_prediction,
      over_under_prediction: data.over_under_prediction,
      over_under_confidence: data.over_under_confidence,
      analysis_text: data.analysis_text,
      risk_factors: data.risk_factors,
      key_stats: data.key_stats,
      confidence_breakdown: data.confidence_breakdown,
      created_at: data.created_at
    }
  }

  // Plan limitleri
  private getDefaultLimit(planType: string): number {
    switch (planType) {
      case 'free': return 5
      case 'basic': return 50
      case 'pro': return 200
      default: return 5
    }
  }
}

// Edge Function Handler
serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // JWT'den user ID çıkar
    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Request body parse et
    const requestData: PredictionRequest = await req.json()

    // Prediction service
    const service = new PredictionService()
    const result = await service.getPrediction(requestData, user.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...result,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/* 
KULLANIM ÖRNEKLERİ:

1. Match ID ile tahmin al:
POST /functions/v1/get-match-prediction
{
  "matchId": "12345"
}

2. Takım isimleri ile tahmin al:
POST /functions/v1/get-match-prediction  
{
  "homeTeam": "Manchester City",
  "awayTeam": "Liverpool", 
  "leagueName": "Premier League",
  "matchDate": "2025-07-10T19:00:00Z"
}

3. Response örneği:
{
  "success": true,
  "data": {
    "id": "...",
    "match_id": "12345", 
    "home_team": "Manchester City",
    "away_team": "Liverpool",
    "winner_prediction": "HOME",
    "winner_confidence": 65,
    "goals_prediction": {"home": 2, "away": 1},
    "analysis_text": "...",
    ...
  },
  "source": "cache",
  "limits": {
    "planType": "free",
    "dailyLimit": 5,
    "currentUsage": 3,
    "remainingPredictions": 2
  }
}
*/