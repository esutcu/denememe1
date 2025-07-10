import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export interface LLMProvider {
  id: string
  name: string
  api_endpoint: string
  api_key_encrypted: string
  status: 'active' | 'inactive' | 'error'
  priority: number
  created_at: string
}

export interface LLMModel {
  id: string
  provider_id: string
  model_name: string
  display_name: string
  status: 'active' | 'inactive'
  is_default: boolean
  cost_per_1k_tokens: number
  max_tokens: number
  created_at: string
}

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
  llm: {
    providersActive: number
    modelsTotal: number
    requestsToday: number
  }
  system: {
    providers: Array<{
      name: string
      priority: number
      status: 'active' | 'inactive'
    }>
    uptime: string
    lastBatchRun: string
  }
  timestamp: string
}

export function useAdmin() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [providers, setProviders] = useState<LLMProvider[]>([])
  const [models, setModels] = useState<LLMModel[]>([])

  // LLM Models alma
  const getModels = async () => {
    setLoading(true)
    try {
      // Mock data for now
      const mockModels: LLMModel[] = [
        {
          id: '1',
          provider_id: '1',
          model_name: 'deepseek/deepseek-r1',
          display_name: 'DeepSeek R1',
          status: 'active',
          is_default: true,
          cost_per_1k_tokens: 0,
          max_tokens: 4096,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          provider_id: '1',
          model_name: 'gpt-4',
          display_name: 'GPT-4',
          status: 'active',
          is_default: false,
          cost_per_1k_tokens: 0,
          max_tokens: 4096,
          created_at: new Date().toISOString()
        }
      ]
      
      setModels(mockModels)
    } catch (error) {
      console.error('Models error:', error)
      toast.error('Model listesi yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  // Model ekleme
  const addModel = async (model: Omit<LLMModel, 'id' | 'created_at'>) => {
    try {
      // Mock implementation
      const newModel: LLMModel = {
        ...model,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      
      setModels(prev => [...prev, newModel])
      toast.success('Model başarıyla eklendi')
    } catch (error) {
      console.error('Add model error:', error)
      toast.error('Model eklenemedi')
    }
  }

  // Model güncelleme
  const updateModel = async (id: string, updates: Partial<LLMModel>) => {
    try {
      setModels(prev =>
        prev.map(m => m.id === id ? { ...m, ...updates } : m)
      )
      toast.success('Model başarıyla güncellendi')
    } catch (error) {
      console.error('Update model error:', error)
      toast.error('Model güncellenemedi')
    }
  }

  // Model silme
  const deleteModel = async (id: string) => {
    try {
      setModels(prev => prev.filter(m => m.id !== id))
      toast.success('Model başarıyla silindi')
    } catch (error) {
      console.error('Delete model error:', error)
      toast.error('Model silinemedi')
    }
  }
  const { user } = useAuth()

  // Admin stats alma
  const getAdminStats = async () => {
    setLoading(true)
    try {
      // Mock data for now - bu daha sonra gerçek Supabase function'a bağlanacak
      const mockStats: AdminStats = {
        predictions: {
          total: 1250,
          last24h: 45,
          activeCache: 980,
          bySource: {
            cache: 820,
            realtime: 160
          }
        },
        users: {
          total: 350,
          subscriptions: {
            free: 250,
            basic: 75,
            pro: 20,
            premium: 5,
            total: 350
          }
        },
        usage: {
          today: {
            totalRequests: 145,
            averagePerUser: 2.1,
            planBreakdown: {
              free: 80,
              basic: 40,
              pro: 20,
              premium: 5
            }
          },
          cacheHitRate: 85.2
        },
        llm: {
          providersActive: 4,
          modelsTotal: 12,
          requestsToday: 145
        },
        system: {
          providers: [],
          uptime: "24 hours",
          lastBatchRun: "2025-07-10T00:00:00Z"
        },
        timestamp: new Date().toISOString()
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('Admin stats error:', error)
      toast.error('İstatistikler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  // LLM Providers alma
  const getProviders = async () => {
    setLoading(true)
    try {
      // Mock data for now
      const mockProviders: LLMProvider[] = [
        {
          id: '1',
          name: 'OpenRouter-1',
          api_endpoint: 'https://openrouter.ai/api/v1/chat/completions',
          api_key_encrypted: 'sk-or-v1-***',
          status: 'active',
          priority: 1,
          created_at: new Date().toISOString()
        },
        {
          id: '2', 
          name: 'OpenRouter-2',
          api_endpoint: 'https://openrouter.ai/api/v1/chat/completions',
          api_key_encrypted: 'sk-or-v1-***',
          status: 'active',
          priority: 2,
          created_at: new Date().toISOString()
        }
      ]
      
      setProviders(mockProviders)
    } catch (error) {
      console.error('Providers error:', error)
      toast.error('Provider listesi yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  // Provider ekleme
  const addProvider = async (provider: Omit<LLMProvider, 'id' | 'created_at'>) => {
    try {
      // Mock implementation
      const newProvider: LLMProvider = {
        ...provider,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      
      setProviders(prev => [...prev, newProvider])
      toast.success('Provider başarıyla eklendi')
    } catch (error) {
      console.error('Add provider error:', error)
      toast.error('Provider eklenemedi')
    }
  }

  // Provider güncelleme
  const updateProvider = async (id: string, updates: Partial<LLMProvider>) => {
    try {
      setProviders(prev => 
        prev.map(p => p.id === id ? { ...p, ...updates } : p)
      )
      toast.success('Provider başarıyla güncellendi')
    } catch (error) {
      console.error('Update provider error:', error)
      toast.error('Provider güncellenemedi')
    }
  }

  // Provider silme
  const deleteProvider = async (id: string) => {
    try {
      setProviders(prev => prev.filter(p => p.id !== id))
      toast.success('Provider başarıyla silindi')
    } catch (error) {
      console.error('Delete provider error:', error)
      toast.error('Provider silinemedi')
    }
  }

  // Haftalık batch tetikleme
  const triggerWeeklyBatch = async () => {
    setLoading(true)
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Haftalık batch işlemi başlatıldı')
      await getAdminStats() // Stats'ları yenile
    } catch (error) {
      console.error('Batch trigger error:', error)
      toast.error('Batch işlemi başlatılamadı')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    stats,
    providers,
    models,
    getAdminStats,
    getProviders,
    getModels,
    addProvider,
    updateProvider,
    deleteProvider,
    addModel,
    updateModel,
    deleteModel,
    triggerWeeklyBatch
  }
}
