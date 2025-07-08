import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

interface AdminStats {
  predictions: {
    total: number
    last24h: number
    activeCache: number
  }
  users: {
    total: number
    subscriptions: {
      free: number
      basic: number
      pro: number
      premium: number
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
        premium: number
      }
    }
    cacheHitRate: number
  }
  system: {
    providers: Array<{
      name: string
      status: string
      priority: number
    }>
    uptime: string
    lastBatchRun: string
  }
  timestamp: string
}

export function useAdmin() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const { user } = useAuth()

  // Admin istatistiklerini al
  const getAdminStats = async (): Promise<AdminStats | null> => {
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

      const { data, error } = await supabase.functions.invoke('admin-stats', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (error) {
        console.error('Admin stats error:', error)
        toast.error('İstatistik alınırken hata oluştu')
        return null
      }

      const statsData = data.data as AdminStats
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

  // Haftalık batch işlemi tetikle
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
        toast.error('Oturum süresi dolmuş, lütfen tekrar giriş yapın')
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