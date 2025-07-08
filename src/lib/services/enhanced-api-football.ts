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

// Main API Functions - Mevcut api-football.ts'dan copy edelim ama enhanced versiyonla...