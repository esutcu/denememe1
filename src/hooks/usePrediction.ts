import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { llmService, type PredictionRequest, type PredictionResult } from '../services/llmService'
import { toast } from 'sonner'

interface UserLimits {
  canPredict: boolean
  remainingPredictions: number
  planType: string
  dailyLimit: number
  currentUsage: number
}

interface PredictionResponse {
  id: string
  homeTeam: string
  awayTeam: string
  prediction: PredictionResult
  source: 'cache' | 'fresh'
  createdAt: string
}

export function usePrediction() {
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const { user } = useAuth()

  const checkUserLimits = async (): Promise<UserLimits | null> => {
    if (!user) {
      toast.error('Lütfen giriş yapın')
      return null
    }

    try {
      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !profile) {
        console.error('Profile not found:', error)
        return null
      }

      // Reset daily usage if needed
      const today = new Date().toISOString().split('T')[0]
      if (profile.last_reset_date !== today) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            predictions_used_today: 0,
            last_reset_date: today
          })
          .eq('id', user.id)
        
        if (!updateError) {
          profile.predictions_used_today = 0
        }
      }

      const canPredict = profile.predictions_used_today < profile.daily_prediction_limit
      const remaining = Math.max(0, profile.daily_prediction_limit - profile.predictions_used_today)

      return {
        canPredict,
        remainingPredictions: remaining,
        planType: profile.plan_type,
        dailyLimit: profile.daily_prediction_limit,
        currentUsage: profile.predictions_used_today
      }
    } catch (error) {
      console.error('Error checking user limits:', error)
      return null
    }
  }

  const getPrediction = async (request: PredictionRequest): Promise<PredictionResponse | null> => {
    if (!user) {
      toast.error('Lütfen giriş yapın')
      return null
    }

    setLoading(true)
    try {
      // Check user limits first
      const limits = await checkUserLimits()
      if (!limits || !limits.canPredict) {
        toast.error(`Günlük limit aşıldı. Kalan: ${limits?.remainingPredictions || 0}`)
        return null
      }

      // Try to find cached prediction first
      let cachedPrediction = await llmService.findCachedPrediction(
        request.homeTeam, 
        request.awayTeam
      )

      if (cachedPrediction) {
        const response: PredictionResponse = {
          id: cachedPrediction.id,
          homeTeam: request.homeTeam,
          awayTeam: request.awayTeam,
          prediction: {
            homeWinProbability: cachedPrediction.home_win_probability,
            drawProbability: cachedPrediction.draw_probability,
            awayWinProbability: cachedPrediction.away_win_probability,
            confidenceScore: cachedPrediction.confidence_score,
            analysisSummary: cachedPrediction.analysis_summary,
            keyFactors: cachedPrediction.key_factors,
            riskLevel: cachedPrediction.risk_level
          },
          source: 'cache',
          createdAt: cachedPrediction.created_at
        }

        setPrediction(response)
        toast.success('Tahmin cache\'den alındı')
        return response
      }

      // Generate fresh prediction
      const freshPrediction = await llmService.generatePrediction(request)
      
      if (!freshPrediction) {
        toast.error('Tahmin oluşturulamadı, lütfen tekrar deneyin')
        return null
      }

      // Create match fixture if not exists
      const { data: existingMatch } = await supabase
        .from('match_fixtures')
        .select('id')
        .eq('home_team', request.homeTeam)
        .eq('away_team', request.awayTeam)
        .single()

      let matchId = existingMatch?.id

      if (!matchId) {
        const { data: newMatch, error: matchError } = await supabase
          .from('match_fixtures')
          .insert({
            external_match_id: `custom_${Date.now()}`,
            home_team: request.homeTeam,
            away_team: request.awayTeam,
            league_name: request.leagueName || 'Bilinmiyor',
            match_date: request.matchDate || new Date().toISOString(),
            status: 'scheduled'
          })
          .select('id')
          .single()

        if (matchError) {
          console.error('Error creating match fixture:', matchError)
          return null
        }
        matchId = newMatch.id
      }

      // Store prediction in cache
      const { data: providers } = await supabase
        .from('llm_providers')
        .select('id')
        .eq('status', 'active')
        .order('priority')
        .limit(1)
        .single()

      if (providers) {
        await llmService.storePrediction(matchId, providers.id, freshPrediction)
      }

      // Update user usage
      await supabase
        .from('profiles')
        .update({
          predictions_used_today: limits.currentUsage + 1
        })
        .eq('id', user.id)

      const response: PredictionResponse = {
        id: matchId,
        homeTeam: request.homeTeam,
        awayTeam: request.awayTeam,
        prediction: freshPrediction,
        source: 'fresh',
        createdAt: new Date().toISOString()
      }

      setPrediction(response)
      toast.success('Yeni tahmin oluşturuldu!')
      return response

    } catch (error) {
      console.error('Prediction error:', error)
      toast.error('Tahmin alınırken hata oluştu')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    prediction,
    getPrediction,
    checkUserLimits
  }
}