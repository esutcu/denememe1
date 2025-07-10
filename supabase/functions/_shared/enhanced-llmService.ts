// supabase/functions/_shared/enhanced-llmService.ts
// Geliştirilmiş OpenRouter LLM Service - Son 5 Maç Optimizasyonu

interface TeamFormAnalysis {
  team: string
  last5Matches: Array<{
    date: string
    opponent: string
    venue: 'home' | 'away'
    result: 'W' | 'L' | 'D'
    goalsFor: number
    goalsAgainst: number
    competition: string
    scoreline: string
  }>
  formString: string // "WLWDL"
  formScore: number // 0-100 arası
  goalsScoredAvg: number
  goalsConcededAvg: number
  cleanSheets: number
  homeFormScore?: number
  awayFormScore?: number
}

interface EnhancedMatchData {
  match_id: string
  home_team: string
  away_team: string
  league_name: string
  match_date: string
  venue: string
  
  // Geliştirilmiş form analizi
  home_team_form: TeamFormAnalysis
  away_team_form: TeamFormAnalysis
  
  // Kafa kafaya geçmiş (son 5 karşılaşma)
  head_to_head: Array<{
    date: string
    home_team: string
    away_team: string
    home_score: number
    away_score: number
    venue: string
    competition: string
    result_for_home: 'W' | 'L' | 'D'
  }>
  
  // Lig durumu
  league_standings: {
    home_team_position: number
    away_team_position: number
    home_team_points: number
    away_team_points: number
    league_average_goals: number
    home_advantage_factor: number
  }
  
  // Takım istatistikleri
  team_stats: {
    home_team: {
      goals_per_game: number
      goals_conceded_per_game: number
      clean_sheet_percentage: number
      home_win_percentage: number
      recent_injuries: string[]
    }
    away_team: {
      goals_per_game: number
      goals_conceded_per_game: number
      clean_sheet_percentage: number
      away_win_percentage: number
      recent_injuries: string[]
    }
  }
  
  // Ek faktörler
  additional_factors?: {
    weather_conditions?: string
    referee?: string
    derby_match?: boolean
    cup_competition?: boolean
    european_competition_impact?: boolean
    suspension_list?: string[]
  }
}

interface AdvancedPredictionResult {
  // Ana tahmin
  match_outcome: {
    home_win_probability: number
    draw_probability: number
    away_win_probability: number
    confidence_level: number
  }
  
  // Gol tahminleri
  goals_prediction: {
    most_likely_score: { home: number; away: number }
    alternative_scores: Array<{ home: number; away: number; probability: number }>
    total_goals_expected: number
    over_under_2_5: { over: number; under: number }
    both_teams_score: { yes: number; no: number }
  }
  
  // Detaylı analiz
  match_analysis: {
    key_factors: string[]
    tactical_analysis: string
    form_comparison: string
    historical_context: string
    risk_assessment: 'low' | 'medium' | 'high'
    confidence_explanation: string
  }
  
  // Betting insights
  betting_insights: {
    value_bets: string[]
    recommended_markets: string[]
    avoid_markets: string[]
  }
  
  // Model metadata
  model_info: {
    model_name: string
    provider: string
    processing_time_ms: number
    data_quality_score: number
  }
}

export class EnhancedLLMService {
  private readonly API_KEYS = [
    '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',
    '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',
    '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',
    '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'
  ]
  
  private readonly MODELS = [
    'deepseek/deepseek-r1',
    'deepseek/deepseek-r1-0528',
    'deepseek/deepseek-r1-0528-qwen3-8b',
    'deepseek/deepseek-chat-v3-0324',
    'deepseek/deepseek-v3-base',
    'mistralai/mistral-small-3.2-24b-instruct',
    'qwen/qwen3-30b-a3b',
    'qwen/qwen3-32b',
    'qwen/qwen2.5-vl-32b-instruct',
    'thudm/glm-4-32b',
    'moonshotai/kimi-dev-72b',
    'openrouter/cypher-alpha'
  ]

  // Geliştirilmiş prompt template - Son 5 maç odaklı
  private createAdvancedPrompt(matchData: EnhancedMatchData): string {
    const { home_team, away_team, league_name, home_team_form, away_team_form, head_to_head } = matchData
    
    return `Sen profesyonel bir futbol analisti ve veri bilimcisin. Verilen detaylı verileri kullanarak kapsamlı maç analizi yap.

🏆 MAÇ BİLGİLERİ:
Liga: ${league_name}
Ev Sahibi: ${home_team} (Sıralama: ${matchData.league_standings.home_team_position})
Deplasman: ${away_team} (Sıralama: ${matchData.league_standings.away_team_position})
Tarih: ${matchData.match_date}
Saha: ${matchData.venue}

📊 SON 5 MAÇ FORM ANALİZİ:

${home_team} (Form: ${home_team_form.formString}):
${home_team_form.last5Matches.map((m, i) => 
  `${i+1}. ${m.date} | ${m.venue === 'home' ? 'EV' : 'DEP'} | vs ${m.opponent} | ${m.result} ${m.scoreline} | ${m.competition}`
).join('\n')}
Form Puanı: ${home_team_form.formScore}/100
Gol Ortalaması: ${home_team_form.goalsScoredAvg} (attığı) - ${home_team_form.goalsConcededAvg} (yediği)
Temiz Çarşaf: ${home_team_form.cleanSheets}/5

${away_team} (Form: ${away_team_form.formString}):
${away_team_form.last5Matches.map((m, i) => 
  `${i+1}. ${m.date} | ${m.venue === 'home' ? 'EV' : 'DEP'} | vs ${m.opponent} | ${m.result} ${m.scoreline} | ${m.competition}`
).join('\n')}
Form Puanı: ${away_team_form.formScore}/100
Gol Ortalaması: ${away_team_form.goalsScoredAvg} (attığı) - ${away_team_form.goalsConcededAvg} (yediği)
Temiz Çarşaf: ${away_team_form.cleanSheets}/5

🔥 KAFA KAFAYA GEÇMİŞ (Son 5 Karşılaşma):
${head_to_head.map((h, i) => 
  `${i+1}. ${h.date} | ${h.home_team} ${h.home_score}-${h.away_score} ${h.away_team} | ${h.venue} | ${h.competition}`
).join('\n')}

📈 TAKIM İSTATİSTİKLERİ:
${home_team}:
- Maç başı gol: ${matchData.team_stats.home_team.goals_per_game}
- Maç başı yediği: ${matchData.team_stats.home_team.goals_conceded_per_game}
- Evde kazanma: %${matchData.team_stats.home_team.home_win_percentage}
- Sakatlık: ${matchData.team_stats.home_team.recent_injuries.join(', ') || 'Yok'}

${away_team}:
- Maç başı gol: ${matchData.team_stats.away_team.goals_per_game}
- Maç başı yediği: ${matchData.team_stats.away_team.goals_conceded_per_game}
- Deplasmanda kazanma: %${matchData.team_stats.away_team.away_win_percentage}
- Sakatlık: ${matchData.team_stats.away_team.recent_injuries.join(', ') || 'Yok'}

${matchData.additional_factors?.weather_conditions ? `🌤️ Hava: ${matchData.additional_factors.weather_conditions}` : ''}
${matchData.additional_factors?.derby_match ? '🔥 DERBİ MAÇI!' : ''}

📋 ANALİZ TALİMATLARI:
1. Son 5 maç formlarını detaylı karşılaştır
2. Ev sahibi avantajını hesapla
3. Gol potansiyellerini analiz et
4. Kafa kafaya geçmişi değerlendir
5. Takımların güncel durumlarını gözönünde bulundur
6. Risk faktörlerini belirle

SADECE şu JSON formatında yanıt ver:
{
  "match_outcome": {
    "home_win_probability": 45,
    "draw_probability": 30,
    "away_win_probability": 25,
    "confidence_level": 78
  },
  "goals_prediction": {
    "most_likely_score": {"home": 2, "away": 1},
    "alternative_scores": [
      {"home": 1, "away": 1, "probability": 18},
      {"home": 2, "away": 0, "probability": 15}
    ],
    "total_goals_expected": 2.3,
    "over_under_2_5": {"over": 55, "under": 45},
    "both_teams_score": {"yes": 62, "no": 38}
  },
  "match_analysis": {
    "key_factors": [
      "Form faktörü analizi",
      "Ev sahibi avantajı",
      "Kafa kafaya geçmiş"
    ],
    "tactical_analysis": "Kısa taktiksel analiz",
    "form_comparison": "Form karşılaştırma sonucu",
    "historical_context": "Tarihsel bağlam",
    "risk_assessment": "medium",
    "confidence_explanation": "Güven açıklaması"
  },
  "betting_insights": {
    "value_bets": ["Önerilen bahis seçenekleri"],
    "recommended_markets": ["Önerilen piyasalar"],
    "avoid_markets": ["Kaçınılacak piyasalar"]
  },
  "model_info": {
    "model_name": "deepseek-r1",
    "provider": "OpenRouter",
    "processing_time_ms": 0,
    "data_quality_score": 85
  }
}`
  }

  // Çoklu model konsensüs sistemi
  async generateConsensusPredict(matchData: EnhancedMatchData): Promise<AdvancedPredictionResult> {
    const prompt = this.createAdvancedPrompt(matchData)
    const results: AdvancedPredictionResult[] = []
    
    // 3 farklı model ile tahmin yap
    const selectedModels = this.MODELS.slice(0, 3)
    
    for (let i = 0; i < selectedModels.length && i < this.API_KEYS.length; i++) {
      try {
        const result = await this.callOpenRouter(this.API_KEYS[i], selectedModels[i], prompt)
        if (result) {
          results.push(result)
        }
      } catch (error) {
        console.error(`Model ${selectedModels[i]} failed:`, error)
      }
    }
    
    if (results.length === 0) {
      throw new Error('All models failed to generate predictions')
    }
    
    // Konsensüs algoritması - ağırlıklı ortalama
    return this.calculateConsensus(results)
  }

  private async callOpenRouter(apiKey: string, model: string, prompt: string): Promise<AdvancedPredictionResult> {
    const startTime = Date.now()
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://scoreresultsai.com',
        'X-Title': 'ScoreResultsAI'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2000,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()
    
    // JSON ayrıştırma
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
    const result = JSON.parse(cleanContent) as AdvancedPredictionResult
    
    // Metadata ekle
    result.model_info = {
      model_name: model,
      provider: 'OpenRouter',
      processing_time_ms: Date.now() - startTime,
      data_quality_score: 85
    }
    
    return result
  }

  private calculateConsensus(results: AdvancedPredictionResult[]): AdvancedPredictionResult {
    // Basit ortalama konsensüs algoritması
    const consensus: AdvancedPredictionResult = results[0] // Base olarak ilkini al
    
    // Olasılıkları ortala
    consensus.match_outcome.home_win_probability = Math.round(
      results.reduce((sum, r) => sum + r.match_outcome.home_win_probability, 0) / results.length
    )
    consensus.match_outcome.draw_probability = Math.round(
      results.reduce((sum, r) => sum + r.match_outcome.draw_probability, 0) / results.length
    )
    consensus.match_outcome.away_win_probability = Math.round(
      results.reduce((sum, r) => sum + r.match_outcome.away_win_probability, 0) / results.length
    )
    
    // Güven seviyesini ortala
    consensus.match_outcome.confidence_level = Math.round(
      results.reduce((sum, r) => sum + r.match_outcome.confidence_level, 0) / results.length
    )
    
    // Model bilgisini güncelle
    consensus.model_info.model_name = `Konsensüs (${results.length} model)`
    
    return consensus
  }

  // Haftalık batch processing için optimized versiyon
  async generateWeeklyPredictions(matches: EnhancedMatchData[]): Promise<Array<{
    match_id: string
    prediction: AdvancedPredictionResult | null
    success: boolean
    error?: string
  }>> {
    const results: Array<{
      match_id: string
      prediction: AdvancedPredictionResult | null
      success: boolean
      error?: string
    }> = []
    
    for (const match of matches) {
      try {
        console.log(`Processing ${match.home_team} vs ${match.away_team}`)
        const prediction = await this.generateConsensusPredict(match)
        
        results.push({
          match_id: match.match_id,
          prediction,
          success: true
        })
        
        // Rate limiting - 1 saniye bekle
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Failed to process match ${match.match_id}:`, error)
        results.push({
          match_id: match.match_id,
          prediction: null,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
    
    return results
  }
}

export const enhancedLLMService = new EnhancedLLMService()