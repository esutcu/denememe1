import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

interface PredictionRequest {
  matchId?: string
  homeTeam?: string
  awayTeam?: string
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
      home: number
      away: number
      total: number
    }
    over_under_prediction: 'OVER' | 'UNDER'
    over_under_confidence: number
    analysis_text: string
    risk_factors: string[]
    key_stats: Record<string, any>
    confidence_breakdown: {
      home: number
      draw: number
      away: number
    }
    created_at: string
  }
  source: 'cache' | 'llm'
  limits: {
    userId: string
    planType: string
    dailyLimit: number
    currentUsage: number
    remainingPredictions: number
    hasLimitReached: boolean
    canMakePrediction: boolean
  }
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

      return data.limits as UserLimits
    } catch (error) {
      console.error('Limit check failed:', error)
      toast.error('Limit kontrolünde hata oluştu')
      return null
    }
  }

  // Tahmin al (cache'den veya LLM'den)
  const getPrediction = async (request: PredictionRequest): Promise<PredictionResponse | null> => {
    if (!user) {
      toast.error('Lütfen giriş yapın')
      return null
    }

    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      
      if (!accessToken) {
        toast.error('Oturum süresi dolmuş, lütfen tekrar giriş yapın')
        return null
      }

      console.log('🎯 Requesting prediction:', request)

      const { data, error } = await supabase.functions.invoke('get-match-prediction', {
        body: request,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (error) {
        console.error('Prediction error:', error)
        toast.error(`Tahmin alınırken hata oluştu: ${error.message}`)
        return null
      }

      if (!data.success) {
        toast.error(data.error || 'Tahmin alınamadı')
        return null
      }

      const predictionData = data as PredictionResponse
      setPrediction(predictionData)

      // Başarı mesajı
      const sourceText = predictionData.source === 'cache' 
        ? '⚡ Cache\'den alındı' 
        : '🧠 Yeni tahmin oluşturuldu'
      
      toast.success(`${sourceText} - Kalan: ${predictionData.limits.remainingPredictions}`)

      return predictionData
    } catch (error) {
      console.error('Get prediction failed:', error)
      toast.error('Tahmin alınırken hata oluştu')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Hızlı tahmin alma - match ID ile
  const getPredictionByMatchId = async (matchId: string): Promise<PredictionResponse | null> => {
    return await getPrediction({ matchId })
  }

  // Takım isimleri ile tahmin alma
  const getPredictionByTeams = async (
    homeTeam: string, 
    awayTeam: string, 
    leagueName?: string, 
    matchDate?: string
  ): Promise<PredictionResponse | null> => {
    return await getPrediction({
      homeTeam,
      awayTeam,
      leagueName,
      matchDate
    })
  }

  // Kullanım istatistikleri al
  const getUsageStats = async (): Promise<any> => {
    if (!user) return null

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      
      if (!accessToken) return null

      const { data, error } = await supabase.functions.invoke('user-usage-stats', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (error) {
        console.error('Usage stats error:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Get usage stats failed:', error)
      return null
    }
  }

  // Cache durumunu kontrol et
  const checkCacheStatus = async (matchId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('match_predictions')
        .select('id')
        .eq('match_id', matchId)
        .gt('cache_expires_at', new Date().toISOString())
        .single()

      return !error && !!data
    } catch (error) {
      return false
    }
  }

  // Prediction formatting helpers
  const formatConfidence = (confidence: number): string => {
    if (confidence >= 80) return 'Çok Güvenli'
    if (confidence >= 60) return 'Güvenli'
    if (confidence >= 40) return 'Orta'
    return 'Düşük Güven'
  }

  const formatPredictionText = (prediction: PredictionResponse['data']): string => {
    const winnerText = prediction.winner_prediction === 'HOME' 
      ? prediction.home_team 
      : prediction.winner_prediction === 'AWAY' 
        ? prediction.away_team 
        : 'Beraberlik'
    
    return `${winnerText} (%${prediction.winner_confidence} güven)`
  }

  const getRiskLevel = (riskFactors: string[]): 'low' | 'medium' | 'high' => {
    if (riskFactors.length >= 3) return 'high'
    if (riskFactors.length >= 2) return 'medium'
    return 'low'
  }

  const getRiskColor = (risk: 'low' | 'medium' | 'high'): string => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
    }
  }

  return {
    loading,
    prediction,
    setPrediction,
    getPrediction,
    getPredictionByMatchId,
    getPredictionByTeams,
    checkUserLimits,
    getUsageStats,
    checkCacheStatus,
    
    // Helper functions
    formatConfidence,
    formatPredictionText,
    getRiskLevel,
    getRiskColor
  }
}