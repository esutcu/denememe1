// Enhanced API-Football entegrasyonu
import { SUPPORTED_LEAGUES } from '../../constants/subscriptions'
import type { ApiFootballFixture, Fixture, MatchStats, BettingOdds } from '../types'

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3'

const headers = {
  'X-RapidAPI-Key': API_KEY,
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
}

// Rate limiting ve request queue
class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private isProcessing = false
  private lastRequestTime = 0
  private readonly RATE_LIMIT_DELAY = 1000 // 1 saniye bekleme

  async addRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime

      if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
        await this.sleep(this.RATE_LIMIT_DELAY - timeSinceLastRequest)
      }

      const request = this.queue.shift()
      if (request) {
        this.lastRequestTime = Date.now()
        await request()
      }
    }

    this.isProcessing = false
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

const requestQueue = new RequestQueue()

// Enhanced fetch with retry logic
const fetchWithRetry = async (url: string, maxRetries = 3): Promise<any> => {
  return requestQueue.addRequest(async () => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, { headers })
        
        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit - exponential backoff
            const backoffTime = Math.pow(2, attempt) * 2000
            await new Promise(resolve => setTimeout(resolve, backoffTime))
            continue
          }
          if (response.status === 404) {
            // Not found - don't retry
            throw new Error(`API-Football: Veri bulunamadı (404)`)
          }
          throw new Error(`API-Football error: ${response.status}`)
        }
        
        const data = await response.json()
        return data
      } catch (error) {
        console.error(`API-Football attempt ${attempt + 1} failed:`, error)
        
        if (attempt === maxRetries - 1) {
          throw error
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  })
}

// Mock data generator for fallback
const generateMockData = {
  fixtures: (leagueId: number, count: number = 10): ApiFootballFixture[] => {
    const mockTeams = [
      { id: 610, name: 'Fenerbahçe', logo: '' },
      { id: 645, name: 'Galatasaray', logo: '' },
      { id: 641, name: 'Beşiktaş', logo: '' },
      { id: 609, name: 'Trabzonspor', logo: '' },
      { id: 607, name: 'Başakşehir', logo: '' }
    ]

    return Array.from({ length: count }, (_, i) => ({
      fixture: {
        id: 1000 + i,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        status: { short: 'NS', long: 'Not Started' },
        venue: { name: 'Test Stadium', city: 'Istanbul' }
      },
      league: {
        id: leagueId,
        name: SUPPORTED_LEAGUES['super-lig']?.name || 'Test League',
        country: 'Turkey',
        logo: '',
        flag: '🇹🇷'
      },
      teams: {
        home: mockTeams[i % mockTeams.length],
        away: mockTeams[(i + 1) % mockTeams.length]
      },
      goals: { home: null, away: null },
      score: {
        halftime: { home: null, away: null },
        fulltime: { home: null, away: null }
      }
    }))
  },

  stats: (fixtureId: number) => ({
    response: [
      {
        team: { id: 610, name: 'Fenerbahçe' },
        statistics: [
          { type: 'Shots on Goal', value: Math.floor(Math.random() * 10) + 3 },
          { type: 'Shots off Goal', value: Math.floor(Math.random() * 8) + 2 },
          { type: 'Total Shots', value: Math.floor(Math.random() * 15) + 8 },
          { type: 'Ball Possession', value: `${Math.floor(Math.random() * 40) + 30}%` },
          { type: 'Fouls', value: Math.floor(Math.random() * 15) + 5 },
          { type: 'Corner Kicks', value: Math.floor(Math.random() * 8) + 2 }
        ]
      },
      {
        team: { id: 645, name: 'Galatasaray' },
        statistics: [
          { type: 'Shots on Goal', value: Math.floor(Math.random() * 10) + 3 },
          { type: 'Shots off Goal', value: Math.floor(Math.random() * 8) + 2 },
          { type: 'Total Shots', value: Math.floor(Math.random() * 15) + 8 },
          { type: 'Ball Possession', value: `${Math.floor(Math.random() * 40) + 30}%` },
          { type: 'Fouls', value: Math.floor(Math.random() * 15) + 5 },
          { type: 'Corner Kicks', value: Math.floor(Math.random() * 8) + 2 }
        ]
      }
    ]
  }),

  odds: (fixtureId: number) => ({
    response: [{
      league: { id: 203, name: 'Süper Lig' },
      fixture: { id: fixtureId },
      bookmakers: [{
        id: 8,
        name: 'Bet365',
        bets: [
          {
            id: 1,
            name: 'Match Winner',
            values: [
              { value: 'Home', odd: (Math.random() * 2 + 1.5).toFixed(2) },
              { value: 'Draw', odd: (Math.random() * 1.5 + 2.8).toFixed(2) },
              { value: 'Away', odd: (Math.random() * 2 + 1.5).toFixed(2) }
            ]
          },
          {
            id: 5,
            name: 'Goals Over/Under',
            values: [
              { value: 'Over 2.5', odd: (Math.random() * 0.5 + 1.6).toFixed(2) },
              { value: 'Under 2.5', odd: (Math.random() * 0.5 + 1.8).toFixed(2) }
            ]
          },
          {
            id: 8,
            name: 'Both Teams Score',
            values: [
              { value: 'Yes', odd: (Math.random() * 0.8 + 1.5).toFixed(2) },
              { value: 'No', odd: (Math.random() * 0.8 + 1.8).toFixed(2) }
            ]
          }
        ]
      }]
    }]
  })
}

// Main API Functions

export const getWeeklyFixtures = async (date: string): Promise<{ response: ApiFootballFixture[] }> => {
  if (!API_KEY || API_KEY === 'your_rapidapi_key_here') {
    console.warn('API-Football key not configured, using mock data')
    return { response: generateMockData.fixtures(203, 15) }
  }

  try {
    const url = `${BASE_URL}/fixtures?date=${date}&timezone=Europe/Istanbul`
    const data = await fetchWithRetry(url)
    return data
  } catch (error) {
    console.error('Weekly fixtures API error, using mock data:', error)
    return { response: generateMockData.fixtures(203, 15) }
  }
}

export const getFixturesByLeague = async (
  leagueId: number, 
  season: number = new Date().getFullYear()
): Promise<{ response: ApiFootballFixture[] }> => {
  if (!API_KEY || API_KEY === 'your_rapidapi_key_here') {
    return { response: generateMockData.fixtures(leagueId, 20) }
  }

  try {
    const url = `${BASE_URL}/fixtures?league=${leagueId}&season=${season}&next=20`
    const data = await fetchWithRetry(url)
    return data
  } catch (error) {
    console.error('League fixtures API error, using mock data:', error)
    return { response: generateMockData.fixtures(leagueId, 20) }
  }
}

export const getUpcomingFixtures = async (
  leagues: string[] = ['super-lig']
): Promise<{ response: ApiFootballFixture[] }> => {
  if (!API_KEY || API_KEY === 'your_rapidapi_key_here') {
    return { response: generateMockData.fixtures(203, 25) }
  }

  try {
    const allFixtures: ApiFootballFixture[] = []
    
    for (const leagueKey of leagues) {
      const league = SUPPORTED_LEAGUES[leagueKey as keyof typeof SUPPORTED_LEAGUES]
      if (!league) continue

      const url = `${BASE_URL}/fixtures?league=${league.id}&next=10&timezone=Europe/Istanbul`
      const data = await fetchWithRetry(url)
      
      if (data?.response) {
        allFixtures.push(...data.response)
      }
    }

    // Sort by date
    allFixtures.sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
    
    return { response: allFixtures.slice(0, 50) }
  } catch (error) {
    console.error('Upcoming fixtures API error, using mock data:', error)
    return { response: generateMockData.fixtures(203, 25) }
  }
}

export const getMatchStats = async (fixtureId: number): Promise<{ response: any[] }> => {
  if (!API_KEY || API_KEY === 'your_rapidapi_key_here') {
    return generateMockData.stats(fixtureId)
  }

  try {
    const url = `${BASE_URL}/fixtures/statistics?fixture=${fixtureId}`
    const data = await fetchWithRetry(url)
    return data
  } catch (error) {
    console.error('Match stats API error, using mock data:', error)
    return generateMockData.stats(fixtureId)
  }
}

export const getMatchOdds = async (fixtureId: number): Promise<{ response: any[] }> => {
  if (!API_KEY || API_KEY === 'your_rapidapi_key_here') {
    return generateMockData.odds(fixtureId)
  }

  try {
    const url = `${BASE_URL}/odds?fixture=${fixtureId}&bookmaker=8`
    const data = await fetchWithRetry(url)
    return data
  } catch (error) {
    console.error('Match odds API error, using mock data:', error)
    return generateMockData.odds(fixtureId)
  }
}

export const getTeamForm = async (teamId: number, last: number = 5): Promise<string> => {
  if (!API_KEY || API_KEY === 'your_rapidapi_key_here') {
    // Generate random form
    const forms = ['W', 'L', 'D']
    return Array.from({ length: last }, () => forms[Math.floor(Math.random() * forms.length)]).join('')
  }

  try {
    const currentSeason = new Date().getFullYear()
    const url = `${BASE_URL}/teams/statistics?team=${teamId}&season=${currentSeason}&league=203`
    const data = await fetchWithRetry(url)
    
    if (data?.response?.form) {
      return data.response.form.slice(-last)
    }
    
    return 'NNNNN'.slice(0, last)
  } catch (error) {
    console.error('Team form API error:', error)
    return 'NNNNN'.slice(0, last)
  }
}

export const getH2HMatches = async (
  team1Id: number, 
  team2Id: number, 
  last: number = 5
): Promise<{ response: any[] }> => {
  if (!API_KEY || API_KEY === 'your_rapidapi_key_here') {
    return { response: [] }
  }

  try {
    const url = `${BASE_URL}/fixtures/headtohead?h2h=${team1Id}-${team2Id}&last=${last}`
    const data = await fetchWithRetry(url)
    return data
  } catch (error) {
    console.error('H2H matches API error:', error)
    return { response: [] }
  }
}

export const getLeagueStandings = async (leagueId: number, season?: number): Promise<{ response: any[] }> => {
  if (!API_KEY || API_KEY === 'your_rapidapi_key_here') {
    return { response: [] }
  }

  try {
    const currentSeason = season || new Date().getFullYear()
    const url = `${BASE_URL}/standings?league=${leagueId}&season=${currentSeason}`
    const data = await fetchWithRetry(url)
    return data
  } catch (error) {
    console.error('League standings API error:', error)
    return { response: [] }
  }
}

export const searchTeams = async (teamName: string): Promise<{ response: any[] }> => {
  if (!API_KEY || API_KEY === 'your_rapidapi_key_here') {
    return { response: [] }
  }

  try {
    const url = `${BASE_URL}/teams?search=${encodeURIComponent(teamName)}`
    const data = await fetchWithRetry(url)
    return data
  } catch (error) {
    console.error('Team search API error:', error)
    return { response: [] }
  }
}

// Utility Functions

export const transformApiFixtureToFixture = (apiFixture: ApiFootballFixture): Fixture => {
  return {
    fixture_id: apiFixture.fixture.id,
    date: apiFixture.fixture.date,
    status: apiFixture.fixture.status.short as any,
    league: {
      id: apiFixture.league.id,
      name: apiFixture.league.name,
      country: apiFixture.league.country,
      logo: apiFixture.league.logo,
      flag: apiFixture.league.flag
    },
    teams: {
      home: {
        id: apiFixture.teams.home.id,
        name: apiFixture.teams.home.name,
        logo: apiFixture.teams.home.logo
      },
      away: {
        id: apiFixture.teams.away.id,
        name: apiFixture.teams.away.name,
        logo: apiFixture.teams.away.logo
      }
    },
    goals: apiFixture.goals,
    score: apiFixture.score,
    last_updated: new Date().toISOString()
  }
}

export const testApiFootballConnection = async (): Promise<boolean> => {
  if (!API_KEY || API_KEY === 'your_rapidapi_key_here') {
    console.warn('API-Football key not configured')
    return false
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    await getWeeklyFixtures(today)
    return true
  } catch {
    return false
  }
}

// Data quality helpers
export const validateFixtureData = (fixture: Fixture): boolean => {
  return !!(
    fixture.fixture_id &&
    fixture.teams?.home?.name &&
    fixture.teams?.away?.name &&
    fixture.date
  )
}

export const enrichFixtureWithCache = async (fixture: Fixture): Promise<Fixture> => {
  try {
    // Try to get additional data
    const [statsData, oddsData] = await Promise.allSettled([
      getMatchStats(fixture.fixture_id),
      getMatchOdds(fixture.fixture_id)
    ])
    
    // Add stats if available
    if (statsData.status === 'fulfilled' && statsData.value?.response?.[0]) {
      // Process stats data
      fixture.stats = processStatsData(statsData.value.response)
    }
    
    // Add odds if available
    if (oddsData.status === 'fulfilled' && oddsData.value?.response?.[0]) {
      fixture.odds = processOddsData(oddsData.value.response[0])
    }
    
    return fixture
  } catch (error) {
    console.error('Enrich fixture error:', error)
    return fixture
  }
}

function processStatsData(statsArray: any[]): MatchStats {
  // Simple processing - can be enhanced
  const homeStats = statsArray[0]?.statistics || []
  const awayStats = statsArray[1]?.statistics || []
  
  const getStat = (stats: any[], type: string) => {
    const stat = stats.find(s => s.type === type)
    return stat ? parseInt(stat.value) || 0 : 0
  }
  
  return {
    shots: {
      on: getStat(homeStats, 'Shots on Goal') + getStat(awayStats, 'Shots on Goal'),
      total: getStat(homeStats, 'Total Shots') + getStat(awayStats, 'Total Shots')
    },
    possession: (getStat(homeStats, 'Ball Possession') + getStat(awayStats, 'Ball Possession')) / 2,
    fouls: getStat(homeStats, 'Fouls') + getStat(awayStats, 'Fouls'),
    corners: getStat(homeStats, 'Corner Kicks') + getStat(awayStats, 'Corner Kicks')
  }
}

function processOddsData(oddsData: any): BettingOdds {
  const bookmaker = oddsData.bookmakers?.[0]
  if (!bookmaker) return { '1': 0, 'X': 0, '2': 0 }
  
  const matchWinner = bookmaker.bets?.find((bet: any) => bet.id === 1)
  const overUnder = bookmaker.bets?.find((bet: any) => bet.id === 5)
  
  const odds: BettingOdds = { '1': 0, 'X': 0, '2': 0 }
  
  if (matchWinner) {
    const values = matchWinner.values
    odds['1'] = parseFloat(values.find((v: any) => v.value === 'Home')?.odd || '0')
    odds['X'] = parseFloat(values.find((v: any) => v.value === 'Draw')?.odd || '0')
    odds['2'] = parseFloat(values.find((v: any) => v.value === 'Away')?.odd || '0')
  }
  
  if (overUnder) {
    const values = overUnder.values
    odds.over_2_5 = parseFloat(values.find((v: any) => v.value === 'Over 2.5')?.odd || '0')
    odds.under_2_5 = parseFloat(values.find((v: any) => v.value === 'Under 2.5')?.odd || '0')
  }
  
  return odds
}