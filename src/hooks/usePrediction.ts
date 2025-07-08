import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

interface PredictionRequest {
  matchId: string
  homeTeam: string
  awayTeam: string
  leagueName?: string
  matchDate?: string
}

interface PredictionResponse {
  data: {
    id: string
    match_id: string
    home_team: string
    away_team: string
    league_name: string
    match_date: string
    llm_provider: string
    llm_model: string
    winner_prediction: 'HOME' | 'AWAY' | 'DRAW'
    winner_confidence: number
    goals_prediction: {
      home_goals: number
      away_goals: number
    }
    over_under_prediction: 'OVER' | 'UNDER'
    analysis_text: string
    risk_factors: string[]
    key_stats: Record<string, any>
    created_at: string
  }
  source: 'cache' | 'llm'
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

export function usePrediction() {
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const { user } = useAuth()

  // Kullanıcı limitlerini kontrol et
  const checkUserLimits = async (): Promise<UserLimits | null> => {
    if (!user) {
      toast.error('Lütfen giriş yapın')
      return null
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      
      if (!accessToken) {
        toast.error('Oturum süresi dolmuş, lütfen tekrar giriş yapın')
        return null
      }

      const { data, error } = await supabase.functions.invoke('user-limit-check', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (error) {
        console.error('Limit check error:', error)
        toast.error('Limit kontrolünde hata oluştu')
        return null
      }

      return data.data as UserLimits
    } catch (error) {
      console.error('Limit check failed:', error)
      toast.error('Limit kontrolünde hata oluştu')
      return null
    }
  }

  // Tahmin al
  const getPrediction = async (request: PredictionRequest): Promise<PredictionResponse | null> => {
    if (!user) {
      toast.error('Lütfen giriş yapın')
      return null
    }

    setLoading(true)
    try {
      // Önce limit kontrolü yap
      const limits = await checkUserLimits()
      if (!limits || !limits.canMakePrediction) {
        toast.error(`Günlük limit aşıldı. Plan: ${limits?.planType}, Kalan: ${limits?.remainingPredictions}`)
        return null
      }

      // Tahmin al
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      
      if (!accessToken) {
        toast.error('Oturum süresi dolmuş, lütfen tekrar giriş yapın')
        return null
      }

      const { data, error } = await supabase.functions.invoke('get-match-prediction', {
        body: request,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (error) {
        console.error('Prediction error:', error)
        toast.error('Tahmin alınırken hata oluştu')
        return null
      }

      const predictionData = data as PredictionResponse
      setPrediction(predictionData)

      // Eğer yeni tahmin ise (cache'den değil) kullanımı güncelle
      if (predictionData.source === 'llm') {
        await updateUserUsage()
      }

      toast.success(
        predictionData.source === 'cache' 
          ? 'Tahmin cache\'den alındı' 
          : 'Yeni tahmin oluşturuldu'
      )

      return predictionData
    } catch (error) {
      console.error('Get prediction failed:', error)
      toast.error('Tahmin alınırken hata oluştu')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Kullanım güncelle
  const updateUserUsage = async (): Promise<boolean> => {
    if (!user) return false

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      
      if (!accessToken) {
        console.error('No access token available')
        return false
      }

      const { data, error } = await supabase.functions.invoke('update-user-usage', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (error) {
        console.error('Usage update error:', error)
        return false
      }

      return data.data.success
    } catch (error) {
      console.error('Update usage failed:', error)
      return false
    }
  }

  return {
    loading,
    prediction,
    getPrediction,
    checkUserLimits,
    updateUserUsage
  }
}