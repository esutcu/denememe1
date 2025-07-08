// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

// src/hooks/usePrediction.ts - Updated
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
  success: boolean
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
    probabilities: {
      home_win: number
      draw: number
      away_win: number
    }
    over_under_prediction: 'OVER' | 'UNDER'
    analysis_text: string
    risk_factors: string[]
    risk_level: string
    key_stats: Record<string, any>
    team_form_analysis: Record<string, any>
    created_at: string
  }
  source: 'cache' | 'llm'
  user_limits: {
    plan_type: string
    daily_limit: number
    current_usage: number
    remaining_predictions: number
  }
}

export function usePrediction() {
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const { user } = useAuth()

  // Get match prediction from cache or generate new one
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

      const { data, error } = await supabase.functions.invoke('get-match-prediction', {
        body: request,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (error) {
        console.error('Prediction error:', error)
        
        if (error.message.includes('Daily prediction limit reached')) {
          toast.error('Günlük tahmin limitiniz dolmuş. Planınızı yükseltin.')
        } else {
          toast.error('Tahmin alınırken hata oluştu')
        }
        return null
      }

      const predictionData = data as PredictionResponse
      setPrediction(predictionData)

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

  // Check user subscription limits
  const checkUserLimits = async () => {
    if (!user) {
      toast.error('Lütfen giriş yapın')
      return null
    }

    try {
      const { data, error } = await supabase
        .rpc('get_user_subscription_info', { user_uuid: user.id })

      if (error) {
        console.error('Limit check error:', error)
        return null
      }

      return data[0] || {
        plan_type: 'free',
        status: 'active',
        daily_limit: 5,
        current_usage: 0,
        remaining_predictions: 5
      }
    } catch (error) {
      console.error('Limit check failed:', error)
      return null
    }
  }

  return {
    loading,
    prediction,
    getPrediction,
    checkUserLimits
  }
}

// src/hooks/useSubscription.ts - New hook for subscription management
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

interface SubscriptionPlan {
  name: string
  price: number
  priceId?: string
  currency: string
  interval: string
  features: string[]
  dailyLimit: number
  leagueAccess: string[] | 'all'
  aiAnalysis: boolean
  priority: string
}

const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    name: 'Ücretsiz',
    price: 0,
    currency: 'TRY',
    interval: 'month',
    features: [
      'Günlük 5 tahmin',
      'Temel istatistikler',
      '5 lig erişimi',
      'Reklam gösterimi'
    ],
    dailyLimit: 5,
    leagueAccess: ['premier-league', 'super-lig', 'bundesliga', 'serie-a', 'la-liga'],
    aiAnalysis: false,
    priority: 'normal'
  },
  basic: {
    name: 'Temel',
    price: 29,
    priceId: 'price_basic_monthly',
    currency: 'TRY',
    interval: 'month',
    features: [
      'Günlük 25 tahmin',
      'Detaylı istatistikler',
      'Tüm liglere erişim',
      'Temel AI analizler',
      'Email bildirimleri'
    ],
    dailyLimit: 25,
    leagueAccess: 'all',
    aiAnalysis: true,
    priority: 'normal'
  },
  pro: {
    name: 'Profesyonel',
    price: 79,
    priceId: 'price_pro_monthly',
    currency: 'TRY',
    interval: 'month',
    features: [
      'Günlük 100 tahmin',
      'Gelişmiş AI analizler',
      'Tüm liglere erişim',
      'Gerçek zamanlı bildirimler',
      'Özel istatistikler',
      'Öncelikli destek',
      'Risk analizi'
    ],
    dailyLimit: 100,
    leagueAccess: 'all',
    aiAnalysis: true,
    priority: 'high'
  }
}

export function useSubscription() {
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [limits, setLimits] = useState<any>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadSubscriptionData()
    }
  }, [user])

  const loadSubscriptionData = async () => {
    if (!user) return

    try {
      // Get subscription info
      const { data, error } = await supabase
        .rpc('get_user_subscription_info', { user_uuid: user.id })

      if (error) {
        console.error('Subscription data error:', error)
        return
      }

      const subscriptionData = data[0] || {
        plan_type: 'free',
        status: 'active',
        daily_limit: 5,
        current_usage: 0,
        remaining_predictions: 5
      }

      setSubscription(subscriptionData)
      setLimits(subscriptionData)
    } catch (error) {
      console.error('Load subscription data failed:', error)
    }
  }

  const createCheckoutSession = async (planType: string) => {
    if (!user) {
      toast.error('Lütfen giriş yapın')
      return null
    }

    const plan = SUBSCRIPTION_PLANS[planType]
    if (!plan || !plan.priceId) {
      toast.error('Geçersiz plan seçimi')
      return null
    }

    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      
      if (!accessToken) {
        toast.error('Oturum süresi dolmuş')
        return null
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.priceId,
          customerId: null // Stripe will create customer automatically
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (error) {
        console.error('Checkout session error:', error)
        toast.error('Ödeme oturumu oluşturulamadı')
        return null
      }

      return data
    } catch (error) {
      console.error('Create checkout session failed:', error)
      toast.error('Ödeme işlemi başlatılamadı')
      return null
    } finally {
      setLoading(false)
    }
  }

  const upgradeSubscription = async (planType: string) => {
    const sessionData = await createCheckoutSession(planType)
    
    if (sessionData?.url) {
      window.location.href = sessionData.url
    }
  }

  return {
    loading,
    subscription,
    limits,
    plans: SUBSCRIPTION_PLANS,
    loadSubscriptionData,
    createCheckoutSession,
    upgradeSubscription
  }
}

// src/hooks/useAdmin.ts - Updated for new LLM system
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

interface AdminStats {
  predictions: {
    total: number
    last24h: number
    activeCache: number
    bySource: {
      cache: number
      realtime: number
    }
  }
  users: {
    total: number
    subscriptions: {
      free: number
      basic: number
      pro: number
      total: number
    }
  }
  usage: {
    today: {
      totalRequests: number
      averagePerUser: number
      planBreakdown: {
        free: number
        basic: number
        pro: number
      }
    }
    cacheHitRate: number
  }
  llm: {
    providers: Array<{
      name: string
      status: string
      priority: number
      last_used: string
      error_count: number
    }>
    models: Array<{
      name: string
      display_name: string
      is_active: boolean
      provider_name: string
    }>
    weeklyBatch: {
      last_run: string
      status: string
      processed_matches: number
      success_rate: number
    }
  }
  timestamp: string
}

export function useAdmin() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const { user } = useAuth()

  const getAdminStats = async (): Promise<AdminStats | null> => {
    if (!user) {
      toast.error('Lütfen giriş yapın')
      return null
    }

    setLoading(true)
    try {
      // Fetch comprehensive admin statistics
      const [
        predictionsResult,
        usersResult,
        providersResult,
        modelsResult,
        batchResult
      ] = await Promise.all([
        supabase.from('match_predictions').select('*'),
        supabase.from('user_subscriptions').select('*'),
        supabase.from('llm_providers').select('*'),
        supabase.from('llm_models').select('*, llm_providers(name)'),
        supabase.from('batch_process_log').select('*').order('created_at', { ascending: false }).limit(1)
      ])

      // Process statistics
      const predictions = predictionsResult.data || []
      const users = usersResult.data || []
      const providers = providersResult.data || []
      const models = modelsResult.data || []
      const lastBatch = batchResult.data?.[0]

      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

      const statsData: AdminStats = {
        predictions: {
          total: predictions.length,
          last24h: predictions.filter(p => p.created_at >= yesterday).length,
          activeCache: predictions.filter(p => 
            p.is_valid && new Date(p.cache_expires_at) > now
          ).length,
          bySource: {
            cache: predictions.filter(p => p.created_at < yesterday).length,
            realtime: predictions.filter(p => p.created_at >= yesterday).length
          }
        },
        users: {
          total: users.length,
          subscriptions: {
            free: users.filter(u => u.plan_type === 'free').length,
            basic: users.filter(u => u.plan_type === 'basic').length,
            pro: users.filter(u => u.plan_type === 'pro').length,
            total: users.length
          }
        },
        usage: {
          today: {
            totalRequests: 0, // Would need usage tracking
            averagePerUser: 0,
            planBreakdown: {
              free: 0,
              basic: 0,
              pro: 0
            }
          },
          cacheHitRate: predictions.length > 0 ? 
            Math.round((predictions.filter(p => p.created_at < yesterday).length / predictions.length) * 100) : 0
        },
        llm: {
          providers: providers.map(p => ({
            name: p.name,
            status: p.status,
            priority: p.priority,
            last_used: p.last_used_at || 'Never',
            error_count: p.error_count || 0
          })),
          models: models.map(m => ({
            name: m.model_name,
            display_name: m.display_name,
            is_active: m.is_active,
            provider_name: m.llm_providers?.name || 'Unknown'
          })),
          weeklyBatch: {
            last_run: lastBatch?.started_at || 'Never',
            status: lastBatch?.status || 'Not started',
            processed_matches: lastBatch?.processed_matches || 0,
            success_rate: lastBatch ? 
              Math.round((lastBatch.successful_predictions / Math.max(lastBatch.processed_matches, 1)) * 100) : 0
          }
        },
        timestamp: new Date().toISOString()
      }

      setStats(statsData)
      return statsData
    } catch (error) {
      console.error('Get admin stats failed:', error)
      toast.error('İstatistik alınırken hata oluştu')
      return null
    } finally {
      setLoading(false)
    }
  }

  const triggerWeeklyBatch = async (): Promise<boolean> => {
    if (!user) {
      toast.error('Lütfen giriş yapın')
      return false
    }

    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      
      if (!accessToken) {
        toast.error('Oturum süresi dolmuş')
        return false
      }

      const { data, error } = await supabase.functions.invoke('weekly-prediction-generator', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (error) {
        console.error('Batch trigger error:', error)
        toast.error('Batch işlemi tetiklenirken hata oluştu')
        return false
      }

      toast.success('Haftalık batch işlemi başlatıldı')
      return true
    } catch (error) {
      console.error('Trigger batch failed:', error)
      toast.error('Batch işlemi tetiklenirken hata oluştu')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    stats,
    getAdminStats,
    triggerWeeklyBatch
  }
}