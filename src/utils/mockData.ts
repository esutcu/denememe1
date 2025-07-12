// Mock data for testing frontend components without backend dependencies

export const mockMatches = [
  {
    id: '1',
    home_team: 'Barcelona',
    away_team: 'Real Madrid',
    league_name: 'La Liga',
    match_date: '2024-12-20T20:00:00Z',
    status: 'scheduled',
    home_odds: 2.1,
    draw_odds: 3.2,
    away_odds: 3.5
  },
  {
    id: '2',
    home_team: 'Manchester City',
    away_team: 'Liverpool',
    league_name: 'Premier League',
    match_date: '2024-12-21T17:30:00Z',
    status: 'scheduled',
    home_odds: 2.8,
    draw_odds: 3.1,
    away_odds: 2.4
  },
  {
    id: '3',
    home_team: 'PSG',
    away_team: 'Olympique Marseille',
    league_name: 'Ligue 1',
    match_date: '2024-12-19T21:00:00Z',
    status: 'finished',
    home_odds: 1.8,
    draw_odds: 3.8,
    away_odds: 4.2,
    final_score: { home: 2, away: 1 }
  }
]

export const mockPredictions = [
  {
    id: 'pred_1',
    match_id: '1',
    home_team: 'Barcelona',
    away_team: 'Real Madrid',
    league_name: 'La Liga',
    match_date: '2024-12-20T20:00:00Z',
    llm_provider: 'OpenRouter',
    llm_model: 'claude-3-sonnet',
    winner_prediction: 'HOME' as const,
    winner_confidence: 75,
    goals_prediction: {
      home: 2,
      away: 1,
      total: 3
    },
    over_under_prediction: 'OVER' as const,
    over_under_confidence: 68,
    analysis_text: 'Barcelona\'nın ev sahibi avantajı ve son dönemdeki formunu göz önünde bulundurarak, takımın bu maçı kazanma olasılığı yüksek görünüyor. Real Madrid\'in savunma performansındaki düşüş dikkat çekici.',
    risk_factors: [
      'Real Madrid\'in son 3 maçta sadece 1 galibiyet',
      'Barcelona\'nın ev sahibi olarak güçlü performansı',
      'Clasico maçlarının öngörülemez doğası'
    ],
    key_stats: {
      barcelona_home_form: '4W-1D-0L',
      real_madrid_away_form: '2W-1D-2L',
      head_to_head_last_5: '2-1-2',
      goal_average_barcelona: 2.3,
      goal_average_real_madrid: 1.8
    },
    confidence_breakdown: {
      home: 75,
      draw: 15,
      away: 10
    },
    created_at: '2024-12-15T10:00:00Z'
  },
  {
    id: 'pred_2',
    match_id: '2',
    home_team: 'Manchester City',
    away_team: 'Liverpool',
    league_name: 'Premier League',
    match_date: '2024-12-21T17:30:00Z',
    llm_provider: 'OpenRouter',
    llm_model: 'gpt-4-turbo',
    winner_prediction: 'AWAY' as const,
    winner_confidence: 62,
    goals_prediction: {
      home: 1,
      away: 2,
      total: 3
    },
    over_under_prediction: 'OVER' as const,
    over_under_confidence: 71,
    analysis_text: 'Liverpool\'un son haftalardaki hücum performansı dikkat çekici. Manchester City\'nin savunmada yaşadığı sorunlar ve Liverpool\'un uzakta oynadığı maçlardaki başarısı göz önünde bulundurulduğunda, misafir takım favorisi görünüyor.',
    risk_factors: [
      'Manchester City\'nin ev sahibi olarak güçlü olması',
      'Liverpool\'un son 2 maçta 6 gol yemesi',
      'Her iki takımın da değişken formu'
    ],
    key_stats: {
      manchester_city_home_form: '3W-1D-1L',
      liverpool_away_form: '4W-0D-1L',
      head_to_head_last_5: '1-2-2',
      goal_average_city: 2.1,
      goal_average_liverpool: 2.4
    },
    confidence_breakdown: {
      home: 28,
      draw: 10,
      away: 62
    },
    created_at: '2024-12-16T14:30:00Z'
  }
]

export const mockUserStats = {
  userId: 'user_123',
  planType: 'premium',
  dailyLimit: 50,
  currentUsage: 12,
  remainingPredictions: 38,
  hasLimitReached: false,
  canMakePrediction: true,
  weeklyUsage: [
    { date: '2024-12-15', count: 8 },
    { date: '2024-12-16', count: 12 },
    { date: '2024-12-17', count: 6 },
    { date: '2024-12-18', count: 15 },
    { date: '2024-12-19', count: 9 },
    { date: '2024-12-20', count: 12 },
    { date: '2024-12-21', count: 4 }
  ],
  monthlyTotal: 156,
  successRate: 73,
  favoriteLeagues: ['Premier League', 'La Liga', 'Champions League']
}

export const mockLeagues = [
  {
    id: '1',
    name: 'Premier League',
    country: 'England',
    logo: '/leagues/premier-league.png',
    season: '2024-25',
    matches_count: 380,
    active: true
  },
  {
    id: '2',
    name: 'La Liga',
    country: 'Spain',
    logo: '/leagues/la-liga.png',
    season: '2024-25',
    matches_count: 380,
    active: true
  },
  {
    id: '3',
    name: 'Bundesliga',
    country: 'Germany',
    logo: '/leagues/bundesliga.png',
    season: '2024-25',
    matches_count: 306,
    active: true
  },
  {
    id: '4',
    name: 'Serie A',
    country: 'Italy',
    logo: '/leagues/serie-a.png',
    season: '2024-25',
    matches_count: 380,
    active: true
  },
  {
    id: '5',
    name: 'Ligue 1',
    country: 'France',
    logo: '/leagues/ligue-1.png',
    season: '2024-25',
    matches_count: 342,
    active: true
  }
]

export const mockLLMProviders = [
  {
    id: 'provider_1',
    name: 'OpenRouter Claude',
    model_name: 'anthropic/claude-3-sonnet',
    status: 'active',
    priority: 1,
    success_rate: 98.5,
    avg_response_time: 2300,
    daily_requests: 45,
    monthly_cost: 12.50
  },
  {
    id: 'provider_2',
    name: 'OpenRouter GPT-4',
    model_name: 'openai/gpt-4-turbo',
    status: 'active',
    priority: 2,
    success_rate: 96.2,
    avg_response_time: 3100,
    daily_requests: 38,
    monthly_cost: 18.75
  },
  {
    id: 'provider_3',
    name: 'OpenRouter Llama',
    model_name: 'meta-llama/llama-3-70b',
    status: 'active',
    priority: 3,
    success_rate: 92.8,
    avg_response_time: 1800,
    daily_requests: 22,
    monthly_cost: 8.20
  },
  {
    id: 'provider_4',
    name: 'OpenRouter Mixtral',
    model_name: 'mistralai/mixtral-8x7b',
    status: 'inactive',
    priority: 4,
    success_rate: 89.1,
    avg_response_time: 2600,
    daily_requests: 0,
    monthly_cost: 0
  }
]

export const mockAdminStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalPredictions: 15678,
  successfulPredictions: 14234,
  totalRevenue: 8950.75,
  monthlyRevenue: 2340.25,
  popularLeagues: [
    { name: 'Premier League', count: 3456 },
    { name: 'La Liga', count: 2890 },
    { name: 'Champions League', count: 2234 },
    { name: 'Bundesliga', count: 1876 },
    { name: 'Serie A', count: 1654 }
  ],
  userGrowth: [
    { month: 'Jan', users: 234 },
    { month: 'Feb', users: 345 },
    { month: 'Mar', users: 456 },
    { month: 'Apr', users: 567 },
    { month: 'May', users: 678 },
    { month: 'Jun', users: 789 },
    { month: 'Jul', users: 890 },
    { month: 'Aug', users: 987 },
    { month: 'Sep', users: 1098 },
    { month: 'Oct', users: 1156 },
    { month: 'Nov', users: 1203 },
    { month: 'Dec', users: 1247 }
  ],
  revenueGrowth: [
    { month: 'Jan', revenue: 1200 },
    { month: 'Feb', revenue: 1450 },
    { month: 'Mar', revenue: 1650 },
    { month: 'Apr', revenue: 1890 },
    { month: 'May', revenue: 2100 },
    { month: 'Jun', revenue: 2340 },
    { month: 'Jul', revenue: 2580 },
    { month: 'Aug', revenue: 2890 },
    { month: 'Sep', revenue: 3120 },
    { month: 'Oct', revenue: 3450 },
    { month: 'Nov', revenue: 3680 },
    { month: 'Dec', revenue: 3920 }
  ]
}

// Error simulation for testing error handling
export const mockErrors = {
  networkError: new Error('Network request failed'),
  authError: new Error('Authentication failed'),
  validationError: new Error('Invalid input data'),
  rateLimitError: new Error('API rate limit exceeded'),
  serverError: new Error('Internal server error'),
  timeoutError: new Error('Request timeout')
}

// Mock API responses for different scenarios
export const mockApiResponses = {
  success: {
    success: true,
    data: mockPredictions[0],
    source: 'llm' as const,
    limits: mockUserStats
  },
  cached: {
    success: true,
    data: mockPredictions[0],
    source: 'cache' as const,
    limits: mockUserStats
  },
  limitExceeded: {
    success: false,
    error: 'Daily prediction limit exceeded',
    limits: {
      ...mockUserStats,
      remainingPredictions: 0,
      hasLimitReached: true,
      canMakePrediction: false
    }
  },
  noProviders: {
    success: false,
    error: 'No active LLM providers available'
  },
  invalidMatch: {
    success: false,
    error: 'Match not found or invalid match data'
  }
}

// Utility functions for mock data
export const getMockMatch = (id: string) => {
  return mockMatches.find(match => match.id === id)
}

export const getMockPrediction = (matchId: string) => {
  return mockPredictions.find(pred => pred.match_id === matchId)
}

export const simulateApiDelay = (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const simulateRandomError = (errorRate: number = 0.1) => {
  if (Math.random() < errorRate) {
    const errors = Object.values(mockErrors)
    throw errors[Math.floor(Math.random() * errors.length)]
  }
}

export const generateMockPrediction = (homeTeam: string, awayTeam: string, leagueName?: string) => {
  const confidence = Math.floor(Math.random() * 40) + 60 // 60-100
  const homeWin = Math.floor(Math.random() * 60) + 20 // 20-80
  const awayWin = Math.floor(Math.random() * 60) + 20 // 20-80
  const draw = 100 - homeWin - awayWin

  return {
    id: `pred_${Date.now()}`,
    match_id: `match_${Date.now()}`,
    home_team: homeTeam,
    away_team: awayTeam,
    league_name: leagueName || 'Unknown League',
    match_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    llm_provider: 'Mock Provider',
    llm_model: 'mock-model-v1',
    winner_prediction: homeWin > awayWin ? 'HOME' : awayWin > homeWin ? 'AWAY' : 'DRAW' as const,
    winner_confidence: confidence,
    goals_prediction: {
      home: Math.floor(Math.random() * 4) + 1,
      away: Math.floor(Math.random() * 4) + 1,
      total: Math.floor(Math.random() * 5) + 2
    },
    over_under_prediction: Math.random() > 0.5 ? 'OVER' : 'UNDER' as const,
    over_under_confidence: Math.floor(Math.random() * 30) + 60,
    analysis_text: `Mock analysis for ${homeTeam} vs ${awayTeam}. Generated automatically for testing purposes.`,
    risk_factors: [
      'Mock risk factor 1',
      'Mock risk factor 2',
      'This is a simulated prediction'
    ],
    key_stats: {
      mock_stat_1: Math.random() * 10,
      mock_stat_2: Math.random() * 5,
      confidence_level: confidence
    },
    confidence_breakdown: {
      home: homeWin,
      draw: draw,
      away: awayWin
    },
    created_at: new Date().toISOString()
  }
}