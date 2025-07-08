import { supabase } from '../supabase'
import { callOpenRouterAPI } from './openrouter'
import { getMatchStats, getMatchOdds, getTeamForm } from './api-football'
import { getCachedPrediction, setCachedPrediction } from './cache'
import type { 
  PredictionRequest, 
  PredictionResponse, 
  Prediction, 
  Fixture,
  SubscriptionUsage 
} from '../types'

// Prediction Service Class
export class PredictionService {
  
  /**
   * Ana tahmin fonksiyonu - Cache kontrolü ile
   */
  static async getPrediction(
    fixtureId: number, 
    userId?: string
  ): Promise<{ prediction: Prediction; fromCache: boolean }> {
    try {
      // 1. Cache kontrolü
      const cachedPrediction = await getCachedPrediction(fixtureId)
      
      if (cachedPrediction) {
        console.log(`Cache hit for fixture ${fixtureId}`)
        return {
          prediction: cachedPrediction,
          fromCache: true
        }
      }
      
      // 2. Kullanıcı limit kontrolü (eğer userId varsa)
      if (userId) {
        const canGenerate = await this.checkUserLimits(userId)
        if (!canGenerate.allowed) {
          throw new Error(canGenerate.reason || 'Aylık tahmin limitiniz dolmuş')
        }
      }
      
      // 3. Fixture bilgilerini al
      const fixtureData = await this.getFixtureData(fixtureId)
      if (!fixtureData) {
        throw new Error('Maç bilgisi bulunamadı')
      }
      
      // 4. Detaylı veri toplama
      const enhancedData = await this.enhanceFixtureData(fixtureData)
      
      // 5. AI tahmin üretimi
      const predictionResponse = await callOpenRouterAPI(enhancedData)
      
      // 6. Prediction oluştur
      const prediction: Prediction = {
        id: crypto.randomUUID(),
        fixture_id: fixtureId,
        prediction: predictionResponse,
        model_used: 'deepseek-r1', // Dynamic olabilir
        created_at: new Date().toISOString()
      }
      
      // 7. Cache ve Database'e kaydet
      await Promise.all([
        setCachedPrediction(fixtureId, predictionResponse),
        this.savePrediction(prediction)
      ])
      
      // 8. Kullanıcı kullanımını güncelle
      if (userId) {
        await this.updateUserUsage(userId)
      }
      
      return {
        prediction,
        fromCache: false
      }
      
    } catch (error) {
      console.error('Prediction generation error:', error)
      throw error
    }
  }
  
  /**
   * Fixture verilerini al ve geliştir
   */
  private static async getFixtureData(fixtureId: number): Promise<Fixture | null> {
    try {
      // Önce cache'den fixture'ı al
      const { data: fixtureData, error } = await supabase
        .from('fixtures')
        .select('*')
        .eq('fixture_id', fixtureId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Fixture fetch error:', error)
        return null
      }
      
      return fixtureData
    } catch (error) {
      console.error('Get fixture data error:', error)
      return null
    }
  }
  
  /**
   * Fixture verilerini istatistik ve oranlarla zenginleştir
   */
  private static async enhanceFixtureData(fixture: Fixture): Promise<PredictionRequest> {
    const baseRequest: PredictionRequest = {
      fixture_id: fixture.fixture_id,
      home_team: fixture.teams.home.name,
      away_team: fixture.teams.away.name,
      home_form: 'NNNNN', // Default
      away_form: 'NNNNN', // Default
      league_name: fixture.league?.name || 'Bilinmeyen Lig'
    }
    
    try {
      // Paralel veri toplama
      const [statsData, oddsData, homeForm, awayForm] = await Promise.allSettled([
        getMatchStats(fixture.fixture_id),
        getMatchOdds(fixture.fixture_id),
        getTeamForm(fixture.teams.home.id, 5),
        getTeamForm(fixture.teams.away.id, 5)
      ])
      
      // Stats ekleme
      if (statsData.status === 'fulfilled' && statsData.value.response?.[0]) {
        const homeStats = statsData.value.response.find(
          (stat: any) => stat.team.id === fixture.teams.home.id
        )
        const awayStats = statsData.value.response.find(
          (stat: any) => stat.team.id === fixture.teams.away.id
        )
        
        if (homeStats || awayStats) {
          baseRequest.stats = this.parseStatsData(homeStats, awayStats)
        }
      }
      
      // Odds ekleme
      if (oddsData.status === 'fulfilled' && oddsData.value.response?.[0]) {
        const oddsInfo = oddsData.value.response[0]
        baseRequest.odds = this.parseOddsData(oddsInfo)
      }
      
      // Form ekleme
      if (homeForm.status === 'fulfilled') {
        baseRequest.home_form = homeForm.value || 'NNNNN'
      }
      if (awayForm.status === 'fulfilled') {
        baseRequest.away_form = awayForm.value || 'NNNNN'
      }
      
      // H2H data (gelecekte eklenebilir)
      // baseRequest.historical_h2h = await this.getH2HData(fixture.teams.home.id, fixture.teams.away.id)
      
    } catch (error) {
      console.error('Enhance fixture data error:', error)
      // Hata durumunda base request döndür
    }
    
    return baseRequest
  }
  
  /**
   * Stats verisini parse et
   */
  private static parseStatsData(homeStats: any, awayStats: any) {
    // Simplified stats parsing
    const getStatValue = (stats: any, statType: string) => {
      const stat = stats?.statistics?.find((s: any) => s.type === statType)
      return stat ? parseInt(stat.value) || 0 : 0
    }
    
    return {
      shots: {
        on: getStatValue(homeStats, 'Shots on Goal') + getStatValue(awayStats, 'Shots on Goal'),
        total: getStatValue(homeStats, 'Total Shots') + getStatValue(awayStats, 'Total Shots')
      },
      possession: (getStatValue(homeStats, 'Ball Possession') + getStatValue(awayStats, 'Ball Possession')) / 2,
      fouls: getStatValue(homeStats, 'Fouls') + getStatValue(awayStats, 'Fouls'),
      corners: getStatValue(homeStats, 'Corner Kicks') + getStatValue(awayStats, 'Corner Kicks')
    }
  }
  
  /**
   * Odds verisini parse et
   */
  private static parseOddsData(oddsInfo: any) {
    const bookmaker = oddsInfo.bookmakers?.[0]
    if (!bookmaker) return undefined
    
    const matchWinner = bookmaker.bets?.find((bet: any) => bet.id === 1)
    const overUnder = bookmaker.bets?.find((bet: any) => bet.id === 5)
    const btts = bookmaker.bets?.find((bet: any) => bet.id === 8)
    
    const odds: any = {}
    
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
    
    if (btts) {
      const values = btts.values
      odds.both_teams_score = {
        yes: parseFloat(values.find((v: any) => v.value === 'Yes')?.odd || '0'),
        no: parseFloat(values.find((v: any) => v.value === 'No')?.odd || '0')
      }
    }
    
    return odds
  }
  
  /**
   * Kullanıcı limitlerini kontrol et
   */
  private static async checkUserLimits(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const { data: usage, error } = await supabase
        .from('subscription_usage')
        .select('*')
        .eq('user_id', userId)
        .gte('reset_date', new Date().toISOString())
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Usage check error:', error)
        return { allowed: true } // Hata durumunda izin ver
      }
      
      if (!usage) {
        // Kullanım kaydı yoksa oluştur
        await this.createUserUsage(userId)
        return { allowed: true }
      }
      
      if (usage.predictions_limit === -1) {
        return { allowed: true } // Unlimited
      }
      
      if (usage.predictions_used >= usage.predictions_limit) {
        return { 
          allowed: false, 
          reason: `Aylık ${usage.predictions_limit} tahmin limitiniz dolmuş. Paketinizi yükseltebilirsiniz.`
        }
      }
      
      return { allowed: true }
      
    } catch (error) {
      console.error('Check user limits error:', error)
      return { allowed: true } // Hata durumunda izin ver
    }
  }
  
  /**
   * Kullanıcı kullanımını güncelle
   */
  private static async updateUserUsage(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('increment_user_predictions', { user_id: userId })
      
      if (error) {
        console.error('Update usage error:', error)
      }
    } catch (error) {
      console.error('Update user usage error:', error)
    }
  }
  
  /**
   * Kullanıcı kullanım kaydı oluştur
   */
  private static async createUserUsage(userId: string): Promise<void> {
    try {
      // Kullanıcının plan bilgilerini al
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', userId)
        .single()
      
      if (userError) {
        console.error('Get user plan error:', userError)
        return
      }
      
      // Plan limitlerini belirle
      const planId = user.subscription_plan || 'free'
      const limits = this.getPlanLimits(planId)
      
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      nextMonth.setDate(1)
      nextMonth.setHours(0, 0, 0, 0)
      
      const { error } = await supabase
        .from('subscription_usage')
        .insert({
          user_id: userId,
          plan_id: planId,
          predictions_used: 0,
          predictions_limit: limits.predictions_per_month,
          reset_date: nextMonth.toISOString(),
          leagues_access: limits.leagues
        })
      
      if (error) {
        console.error('Create usage error:', error)
      }
    } catch (error) {
      console.error('Create user usage error:', error)
    }
  }
  
  /**
   * Plan limitlerini al
   */
  private static getPlanLimits(planId: string) {
    // Import subscription plans
    const { SUBSCRIPTION_PLANS } = require('../../constants/subscriptions')
    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()]
    
    return plan?.limits || {
      predictions_per_month: 150,
      leagues: ['super-lig'],
      analysis_depth: 'basic'
    }
  }
  
  /**
   * Prediction'ı veritabanına kaydet
   */
  private static async savePrediction(prediction: Prediction): Promise<void> {
    try {
      const { error } = await supabase
        .from('predictions')
        .insert({
          id: prediction.id,
          fixture_id: prediction.fixture_id,
          prediction: prediction.prediction,
          model_used: prediction.model_used,
          created_at: prediction.created_at
        })
      
      if (error) {
        console.error('Save prediction error:', error)
      }
    } catch (error) {
      console.error('Save prediction database error:', error)
    }
  }
  
  /**
   * Kullanıcının tahminlerini getir
   */
  static async getUserPredictions(
    userId: string, 
    limit: number = 20,
    offset: number = 0
  ): Promise<Prediction[]> {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          *,
          fixtures (
            fixture_id,
            date,
            teams,
            league,
            status
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) {
        console.error('Get user predictions error:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Get user predictions database error:', error)
      return []
    }
  }
  
  /**
   * Tahmin doğruluğunu güncelle (maç bittiğinde)
   */
  static async updatePredictionAccuracy(
    predictionId: string,
    actualResult: { winner: '1' | 'X' | '2'; goals: number; btts: boolean }
  ): Promise<void> {
    try {
      const { data: prediction, error: fetchError } = await supabase
        .from('predictions')
        .select('prediction')
        .eq('id', predictionId)
        .single()
      
      if (fetchError || !prediction) {
        console.error('Fetch prediction for accuracy error:', fetchError)
        return
      }
      
      // Accuracy hesaplama
      const pred = prediction.prediction
      let correctPredictions = 0
      let totalPredictions = 3 // winner, goals, btts
      
      if (pred.winner === actualResult.winner) correctPredictions++
      if (
        (pred.goals === 'over_2.5' && actualResult.goals > 2.5) ||
        (pred.goals === 'under_2.5' && actualResult.goals <= 2.5)
      ) correctPredictions++
      if (
        (pred.both_teams_score === 'yes' && actualResult.btts) ||
        (pred.both_teams_score === 'no' && !actualResult.btts)
      ) correctPredictions++
      
      const accuracy = Math.round((correctPredictions / totalPredictions) * 100)
      
      const { error } = await supabase
        .from('predictions')
        .update({ accuracy })
        .eq('id', predictionId)
      
      if (error) {
        console.error('Update prediction accuracy error:', error)
      }
    } catch (error) {
      console.error('Update prediction accuracy database error:', error)
    }
  }
}

// Export convenience functions
export const getPrediction = PredictionService.getPrediction.bind(PredictionService)
export const getUserPredictions = PredictionService.getUserPredictions.bind(PredictionService)
export const updatePredictionAccuracy = PredictionService.updatePredictionAccuracy.bind(PredictionService)