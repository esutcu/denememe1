export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: 'free' | 'premium' | 'pro'
  createdAt: string
}

export interface Prediction {
  id: string
  matchId: string
  userId: string
  prediction: 'home' | 'draw' | 'away'
  confidence: number
  createdAt: string
  result?: 'correct' | 'incorrect' | 'pending'
}

export interface AnalyticsData {
  totalPredictions: number
  accuracyRate: number
  bestPerformingLeague: string
  totalUsers: number
  monthlyGrowth: number
}

export interface DashboardStats {
  todayMatches: number
  activePredictions: number
  accuracyRate: number
  totalLeagues: number
}

export interface TeamStats {
  name: string
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  form: ('W' | 'D' | 'L')[]
  position: number
}

export interface MatchEvent {
  id: string
  type: 'goal' | 'card' | 'substitution'
  minute: number
  player: string
  team: 'home' | 'away'
  details?: string
}

export interface LiveMatchData {
  id: string
  minute: number
  events: MatchEvent[]
  stats: {
    possession: { home: number; away: number }
    shots: { home: number; away: number }
    shotsOnTarget: { home: number; away: number }
    corners: { home: number; away: number }
    fouls: { home: number; away: number }
  }
}

export interface AdminStats {
  system: {
    providers: {
      name: string
      priority: number
      status: 'active' | 'inactive'
    }[]
  }
}

export interface AdminStats {
  system: {
    providers: Array<{
      name: string
      priority: number
      status: 'active' | 'inactive'
    }>
  }
}