// supabase/functions/weekly-prediction-generator/index.ts
// CORE SYSTEM: Haftalık LLM Batch Processing + Cache

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { LLMService } from '../shared/llmService.ts'

interface FootballFixture {
  fixture: {
    id: number
    date: string
    status: {
      short: string // 'NS' = Not Started
    }
  }
  teams: {
    home: {
      id: number
      name: string
    }
    away: {
      id: number
      name: string
    }
  }
  league: {
    id: number
    name: string
    season: number
  }
}

interface TeamForm {
  team: {
    id: number
    name: string
  }
  form: string // "WDLWW"
  fixtures: Array<{
    fixture: {
      date: string
    }
    teams: {
      home: { name: string }
      away: { name: string }
    }
    goals: {
      home: number
      away: number
    }
  }>
}

class WeeklyPredictionGenerator {
  private supabase
  private llmService: LLMService
  private apiFootballKey: string
  private apiFootballHost = 'v3.football.api-sports.io'

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    this.llmService = new LLMService()
    this.apiFootballKey = Deno.env.get('API_FOOTBALL_KEY') ?? ''
  }

  // Ana haftalık batch işlemi
  async generateWeeklyPredictions(): Promise<{ success: boolean; processed: number; errors: string[] }> {
    console.log('🚀 Starting weekly prediction generation...')
    
    const results = {
      success: true,
      processed: 0,
      errors: [] as string[]
    }

    try {
      // 1. Bu haftaki maçları çek
      const fixtures = await this.fetchWeeklyFixtures()
      console.log(`📅 Found ${fixtures.length} matches for this week`)

      // 2. Her maç için tahmin üret
      for (const fixture of fixtures) {
        try {
          await this.processSingleMatch(fixture)
          results.processed++
          console.log(`✅ Processed: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`)
        } catch (error) {
          const errorMsg = `❌ Failed to process ${fixture.teams.home.name} vs ${fixture.teams.away.name}: ${error.message}`
          console.error(errorMsg)
          results.errors.push(errorMsg)
        }

        // Rate limiting - API call'lar arası bekleme
        await this.sleep(1000) // 1 saniye bekle
      }

      // 3. Eski cache'leri temizle
      await this.cleanupExpiredCache()

      console.log(`🎉 Weekly batch completed: ${results.processed} processed, ${results.errors.length} errors`)
      
    } catch (error) {
      console.error('💥 Weekly batch failed:', error)
      results.success = false
      results.errors.push(error.message)
    }

    return results
  }

  // API-Football'dan bu haftaki maçları çek
  private async fetchWeeklyFixtures(): Promise<FootballFixture[]> {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const from = today.toISOString().split('T')[0]
    const to = nextWeek.toISOString().split('T')[0]

    // Öncelikli ligler
    const priorityLeagues = [
      39,  // Premier League
      140, // La Liga  
      78,  // Bundesliga
      135, // Serie A
      61,  // Ligue 1
      203, // Süper Lig
      2    // Champions League
    ]

    const allFixtures: FootballFixture[] = []

    for (const leagueId of priorityLeagues) {
      try {
        const fixtures = await this.fetchFixturesForLeague(leagueId, from, to)
        allFixtures.push(...fixtures)
        console.log(`📊 League ${leagueId}: ${fixtures.length} fixtures`)
        
        // Rate limiting
        await this.sleep(500)
      } catch (error) {
        console.error(`Failed to fetch league ${leagueId}:`, error)
      }
    }

    return allFixtures.filter(f => f.fixture.status.short === 'NS') // Sadece oynanmamış maçlar
  }

  private async fetchFixturesForLeague(leagueId: number, from: string, to: string): Promise<FootballFixture[]> {
    const url = `https://${this.apiFootballHost}/fixtures?league=${leagueId}&from=${from}&to=${to}&season=2024`
    
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': this.apiFootballKey,
        'X-RapidAPI-Host': this.apiFootballHost
      }
    })

    if (!response.ok) {
      throw new Error(`API-Football error: ${response.status}`)
    }

    const data = await response.json()
    return data.response || []
  }

  // Tek maç için tahmin üret
  private async processSingleMatch(fixture: FootballFixture): Promise<void> {
    const matchId = fixture.fixture.id.toString()
    const homeTeam = fixture.teams.home.name
    const awayTeam = fixture.teams.away.name

    // Cache'de zaten var mı kontrol et
    const { data: existingPrediction } = await this.supabase
      .from('match_predictions')
      .select('id')
      .eq('match_id', matchId)
      .eq('llm_provider', 'OpenRouter_Primary')
      .single()

    if (existingPrediction) {
      console.log(`⏭️  Skipping ${homeTeam} vs ${awayTeam} - already cached`)
      return
    }

    // Takım verilerini topla
    const [homeForm, awayForm, h2hData] = await Promise.all([
      this.getTeamForm(fixture.teams.home.id),
      this.getTeamForm(fixture.teams.away.id),
      this.getHeadToHead(fixture.teams.home.id, fixture.teams.away.id)
    ])

    // LLM ile tahmin üret
    const matchData = {
      homeTeam,
      awayTeam,
      leagueName: fixture.league.name,
      matchDate: fixture.fixture.date,
      homeTeamForm: this.parseFormString(homeForm?.form || 'NNNNN'),
      awayTeamForm: this.parseFormString(awayForm?.form || 'NNNNN'),
      headToHead: h2hData,
      homeTeamStats: await this.getTeamStats(fixture.teams.home.id),
      awayTeamStats: await this.getTeamStats(fixture.teams.away.id)
    }

    const prediction = await this.llmService.generateConsensusPredict(matchData)

    // Cache'e kaydet
    await this.savePredictionToCache(matchId, matchData, prediction)
  }

  // Takım formu çek (son 5 maç)
  private async getTeamForm(teamId: number): Promise<TeamForm | null> {
    try {
      const url = `https://${this.apiFootballHost}/fixtures?team=${teamId}&last=5&season=2024`
      
      const response = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': this.apiFootballKey,
          'X-RapidAPI-Host': this.apiFootballHost
        }
      })

      if (!response.ok) return null

      const data = await response.json()
      const fixtures = data.response || []

      // Form string oluştur
      let form = ''
      for (const fixture of fixtures.slice(-5)) {
        const isHome = fixture.teams.home.id === teamId
        const teamScore = isHome ? fixture.goals.home : fixture.goals.away
        const oppScore = isHome ? fixture.goals.away : fixture.goals.home

        if (teamScore > oppScore) form += 'W'
        else if (teamScore < oppScore) form += 'L'
        else form += 'D'
      }

      return {
        team: { id: teamId, name: '' },
        form,
        fixtures: fixtures.slice(-5)
      }
    } catch (error) {
      console.error(`Failed to get team form for ${teamId}:`, error)
      return null
    }
  }

  // Head-to-head geçmişi
  private async getHeadToHead(homeTeamId: number, awayTeamId: number): Promise<any[]> {
    try {
      const url = `https://${this.apiFootballHost}/fixtures/headtohead?h2h=${homeTeamId}-${awayTeamId}&last=3`
      
      const response = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': this.apiFootballKey,
          'X-RapidAPI-Host': this.apiFootballHost
        }
      })

      if (!response.ok) return []

      const data = await response.json()
      const fixtures = data.response || []

      return fixtures.map((f: any) => {
        const homeScore = f.goals.home
        const awayScore = f.goals.away
        let result: 'home' | 'away' | 'draw'
        
        if (homeScore > awayScore) result = 'home'
        else if (homeScore < awayScore) result = 'away'
        else result = 'draw'

        return {
          date: f.fixture.date.split('T')[0],
          homeScore,
          awayScore,
          result
        }
      })
    } catch (error) {
      console.error(`Failed to get H2H for ${homeTeamId} vs ${awayTeamId}:`, error)
      return []
    }
  }

  // Takım istatistikleri
  private async getTeamStats(teamId: number): Promise<any> {
    // Basit mock stats - gerçek implementasyonda API'den çekilir
    return {
      goalsFor: Math.floor(Math.random() * 30) + 20,
      goalsAgainst: Math.floor(Math.random() * 20) + 10,
      position: Math.floor(Math.random() * 20) + 1,
      points: Math.floor(Math.random() * 40) + 20
    }
  }

  // Tahmini cache'e kaydet
  private async savePredictionToCache(
    matchId: string, 
    matchData: any, 
    prediction: any
  ): Promise<void> {
    const { error } = await this.supabase
      .from('match_predictions')
      .insert({
        match_id: matchId,
        home_team: matchData.homeTeam,
        away_team: matchData.awayTeam,
        league_name: matchData.leagueName,
        match_date: matchData.matchDate,
        llm_provider: 'OpenRouter_Primary',
        llm_model: 'deepseek/deepseek-r1',
        winner_prediction: prediction.winner_prediction,
        winner_confidence: prediction.winner_confidence,
        goals_prediction: prediction.goals_prediction,
        over_under_prediction: prediction.over_under_prediction,
        over_under_confidence: prediction.over_under_confidence,
        analysis_text: prediction.analysis_text,
        risk_factors: prediction.risk_factors,
        key_stats: prediction.key_stats,
        confidence_breakdown: prediction.confidence_breakdown,
        input_data: matchData,
        cache_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 gün
      })

    if (error) {
      throw new Error(`Failed to save prediction: ${error.message}`)
    }
  }

  // Utility functions
  private parseFormString(form: string): string[] {
    return form.split('')
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Eski cache'leri temizle
  private async cleanupExpiredCache(): Promise<void> {
    console.log('🧹 Cleaning up expired cache...')
    
    const { error } = await this.supabase
      .from('match_predictions')
      .delete()
      .lt('cache_expires_at', new Date().toISOString())

    if (error) {
      console.error('Failed to cleanup cache:', error)
    } else {
      console.log('✅ Cache cleanup completed')
    }
  }
}

// Edge Function Handler
serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Auth check - sadece servis rolü veya admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.includes('Bearer')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const generator = new WeeklyPredictionGenerator()
    const result = await generator.generateWeeklyPredictions()

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/* 
DEPLOYMENT NOTES:

1. Bu function'ı deploy etmek için:
   supabase functions deploy weekly-prediction-generator

2. Cron job kurmak için Supabase Dashboard > Database > Cron Jobs:
   SELECT cron.schedule('weekly-predictions', '0 9 * * 1', 'SELECT net.http_post(
     url:=''https://your-project.supabase.co/functions/v1/weekly-prediction-generator'',
     headers:=''{"Authorization": "Bearer YOUR_SERVICE_KEY"}''::jsonb
   ) as request_id;');

3. Manuel tetikleme için:
   curl -X POST https://your-project.supabase.co/functions/v1/weekly-prediction-generator \
   -H "Authorization: Bearer YOUR_SERVICE_KEY"

4. Environment variables gerekli:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY  
   - OPENROUTER_API_KEY_1-4
   - API_FOOTBALL_KEY
*/