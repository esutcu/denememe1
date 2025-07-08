// OpenRouter LLM model tanımları
export const OPENROUTER_MODELS = {
  'deepseek-r1': {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 Free',
    provider: 'deepseek',
    tier: 'free',
    recommended: true,
    features: ['reasoning', 'analysis', 'fast'],
    maxTokens: 1000,
    temperature: 0.7,
    description: 'En gelişmiş ücretsiz model, futbol analizi için optimize'
  },
  'deepseek-chat-v3': {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek Chat V3',
    provider: 'deepseek',
    tier: 'free',
    features: ['chat', 'analysis', 'stable'],
    maxTokens: 1000,
    temperature: 0.7,
    description: 'Stabil ve güvenilir chat modeli'
  },
  'deepseek-v3-base': {
    id: 'deepseek/deepseek-v3-base:free',
    name: 'DeepSeek V3 Base',
    provider: 'deepseek',
    tier: 'free',
    features: ['base', 'reliable'],
    maxTokens: 1000,
    temperature: 0.7,
    description: 'Temel analiz için güvenilir model'
  },
  'mistral-small': {
    id: 'mistralai/mistral-small-3.2-24b-instruct:free',
    name: 'Mistral Small 3.2',
    provider: 'mistral',
    tier: 'free',
    features: ['instruction', 'precise'],
    maxTokens: 1000,
    temperature: 0.7,
    description: 'Hassas talimat takibi için'
  },
  'qwen3-30b': {
    id: 'qwen/qwen3-30b-a3b:free',
    name: 'Qwen3 30B',
    provider: 'qwen',
    tier: 'free',
    features: ['large', 'comprehensive'],
    maxTokens: 1000,
    temperature: 0.7,
    description: 'Kapsamlı analiz için büyük model'
  },
  'qwen3-32b': {
    id: 'qwen/qwen3-32b:free',
    name: 'Qwen3 32B',
    provider: 'qwen',
    tier: 'free',
    features: ['large', 'detailed'],
    maxTokens: 1000,
    temperature: 0.7,
    description: 'Detaylı analiz için güçlü model'
  },
  'glm-4': {
    id: 'thudm/glm-4-32b:free',
    name: 'GLM-4 32B',
    provider: 'thudm',
    tier: 'free',
    features: ['chinese', 'multilingual'],
    maxTokens: 1000,
    temperature: 0.7,
    description: 'Çok dilli analiz desteği'
  },
  'moonshot-kimi': {
    id: 'moonshotai/kimi-dev-72b:free',
    name: 'Moonshot Kimi Dev',
    provider: 'moonshot',
    tier: 'free',
    features: ['dev', 'experimental'],
    maxTokens: 1000,
    temperature: 0.7,
    description: 'Deneysel özellikler ile'
  },
  'cypher-alpha': {
    id: 'openrouter/cypher-alpha:free',
    name: 'Cypher Alpha',
    provider: 'openrouter',
    tier: 'free',
    features: ['alpha', 'experimental'],
    maxTokens: 1000,
    temperature: 0.7,
    description: 'Alpha aşama model'
  },
  'qwen2-vl': {
    id: 'qwen/qwen2.5-vl-32b-instruct:free',
    name: 'Qwen2.5 VL',
    provider: 'qwen',
    tier: 'free',
    features: ['vision', 'multimodal'],
    maxTokens: 1000,
    temperature: 0.7,
    description: 'Görsel analiz desteği (gelecek için)'
  },
  'deepseek-r1-qwen': {
    id: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    name: 'DeepSeek R1 Qwen',
    provider: 'deepseek',
    tier: 'free',
    features: ['reasoning', 'qwen-base'],
    maxTokens: 1000,
    temperature: 0.7,
    description: 'Qwen tabanlı reasoning modeli'
  },
  'deepseek-r1-base': {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek R1 Base',
    provider: 'deepseek',
    tier: 'free',
    features: ['reasoning', 'lightweight'],
    maxTokens: 1000,
    temperature: 0.7,
    description: 'Hafif reasoning modeli'
  }
} as const

// Model selection priority for different use cases
export const MODEL_PRIORITIES = {
  primary: ['deepseek-r1', 'deepseek-chat-v3', 'mistral-small'],
  fallback: ['qwen3-30b', 'qwen3-32b', 'glm-4'],
  experimental: ['cypher-alpha', 'moonshot-kimi', 'deepseek-r1-qwen']
} as const

// API Key rotation configuration
export const API_KEY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // ms
  rateLimitDelay: 2000, // ms
  circuitBreakerThreshold: 5, // failures before circuit break
  circuitBreakerTimeout: 60000 // ms
} as const

export type ModelId = keyof typeof OPENROUTER_MODELS
export type ModelTier = 'free' | 'paid'
export type ModelProvider = 'deepseek' | 'mistral' | 'qwen' | 'thudm' | 'moonshot' | 'openrouter'

export const getModelsByProvider = (provider: ModelProvider) => {
  return Object.entries(OPENROUTER_MODELS)
    .filter(([_, model]) => model.provider === provider)
    .map(([id, model]) => ({ id: id as ModelId, ...model }))
}

export const getRecommendedModels = () => {
  return Object.entries(OPENROUTER_MODELS)
    .filter(([_, model]) => model.recommended)
    .map(([id, model]) => ({ id: id as ModelId, ...model }))
}