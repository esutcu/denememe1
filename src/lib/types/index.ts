// Auth Types
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  subscription_plan: SubscriptionPlanId
  subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing'
  subscription_expires?: string
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Football Data Types
export interface Team {
  id: number
  name: string
  logo?: string
  short_name?: string
  country?: string
}

export interface Fixture {
  fixture_id: number
  date: string
  status: 'NS' | 'LIVE' | 'FT' | 'HT' | 'ET' | 'PST' | 'CANC'
  league: {
    id: number
    name: string
    country: string
    logo?: string
    flag?: string
  }
  teams: {
    home: Team
    away: Team
  }
  goals?: {
    home: number | null
    away: number | null
  }
  score?: {
    halftime: { home: number | null; away: number | null }
    fulltime: { home: number | null; away: number | null }
    extratime?: { home: number | null; away: number | null }
    penalty?: { home: number | null; away: number | null }
  }
  stats?: MatchStats
  odds?: BettingOdds
  last_updated: string
}

export interface MatchStats {
  shots: {
    on: number
    total: number
  }
  possession: number
  fouls: number
  corners?: number
  cards?: {
    yellow: number
    red: number
  }
  passes?: {
    total: number
    accurate: number
    percentage: number
  }
}

export interface BettingOdds {
  '1': number  // Home win
  'X': number  // Draw
  '2': number  // Away win
  over_2_5?: number
  under_2_5?: number
  both_teams_score?: {
    yes: number
    no: number
  }
}

// Prediction Types
export interface PredictionRequest {
  fixture_id: number
  home_team: string
  away_team: string
  home_form: string
  away_form: string
  league_name: string
  stats?: MatchStats
  odds?: BettingOdds
  historical_h2h?: FixtureResult[]
}

export interface PredictionResponse {
  winner: '1' | 'X' | '2'
  winner_confidence: number
  goals: 'over_2.5' | 'under_2.5'
  goals_confidence: number
  both_teams_score: 'yes' | 'no'
  btts_confidence: number
  analysis: string
  risk_factors: string[]
  key_insights: string[]
  recommended_bets?: RecommendedBet[]
}

export interface RecommendedBet {
  type: 'winner' | 'goals' | 'btts'
  selection: string
  odds: number
  confidence: number
  stake_percentage: number // 1-5% of bankroll
}

export interface Prediction {
  id: string
  fixture_id: number
  prediction: PredictionResponse
  model_used: string
  created_at: string
  accuracy?: number // Set after match ends
  profit?: number   // Set after match ends
}

export interface FixtureResult {
  fixture_id: number
  date: string
  teams: {
    home: Team
    away: Team
  }
  score: {
    home: number
    away: number
  }
  result: '1' | 'X' | '2'
}

// Subscription Types
export interface SubscriptionUsage {
  user_id: string
  plan_id: SubscriptionPlanId
  predictions_used: number
  predictions_limit: number
  reset_date: string
  leagues_access: string[]
}

export interface SubscriptionLimits {
  predictions_per_month: number
  leagues: string[]
  analysis_depth: 'basic' | 'detailed' | 'advanced' | 'premium'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

// OpenRouter Types
export interface OpenRouterRequest {
  model: string
  messages: {
    role: 'system' | 'user' | 'assistant'
    content: string
  }[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

export interface OpenRouterResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// API Football Types
export interface ApiFootballFixture {
  fixture: {
    id: number
    date: string
    status: {
      short: string
      long: string
    }
    venue: {
      name: string
      city: string
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
    }
    away: {
      id: number
      name: string
      logo: string
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: {
      home: number | null
      away: number | null
    }
    fulltime: {
      home: number | null
      away: number | null
    }
  }
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface FilterOptions {
  league?: string
  date_from?: string
  date_to?: string
  status?: string
  team?: string
}

// Re-export from constants
export type { SubscriptionPlanId, LeagueId } from '../../constants/subscriptions'
export type { ModelId, ModelProvider } from '../../constants/models'