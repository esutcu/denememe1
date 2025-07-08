// supabase/functions/shared/llmService.ts
// OpenRouter LLM Service with 4 Failover APIs

interface LLMProvider {
  name: string
  apiKey: string
  priority: number
  status: 'active' | 'error'
  lastError?: string
}

interface LLMRequest {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  max_tokens?: number
  top_p?: number
}

interface LLMResponse {
  success: boolean
  content?: string
  provider?: string
  model?: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  error?: string
  processing_time_ms?: number
}

interface MatchPredictionPrompt {
  homeTeam: string
  awayTeam: string
  leagueName: string
  matchDate: string
  homeTeamForm: string[]  // Son 5 maç: ['W', 'L', 'D', 'W', 'L']
  awayTeamForm: string[]
  headToHead: Array<{
    date: string
    homeScore: number
    awayScore: number
    result: 'home' | 'away' | 'draw'
  }>
  homeTeamStats?: {
    goalsFor: number
    goalsAgainst: number
    position?: number
    points?: number
  }
  awayTeamStats?: {
    goalsFor: number
    goalsAgainst: number
    position?: number
    points?: number
  }
}

export class LLMService {
  private providers: LLMProvider[] = []
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions'

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    const apiKeys = [
      Deno.env.get('OPENROUTER_API_KEY_1'),
      Deno.env.get('OPENROUTER_API_KEY_2'), 
      Deno.env.get('OPENROUTER_API_KEY_3'),
      Deno.env.get('OPENROUTER_API_KEY_4')
    ]

    this.providers = apiKeys
      .filter(key => key) // null check
      .map((key, index) => ({
        name: `OpenRouter_${index + 1}`,
        apiKey: key!,
        priority: index + 1,
        status: 'active' as const
      }))

    console.log(`Initialized ${this.providers.length} LLM providers`)
  }

  // Ana LLM çağrısı - yedekli sistem ile
  async callLLM(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now()
    
    // Providers'ı öncelik sırasına göre dene
    for (const provider of this.providers.filter(p => p.status === 'active')) {
      try {
        console.log(`Trying provider: ${provider.name}`)
        
        const response = await this.makeRequest(provider, request)
        const processingTime = Date.now() - startTime
        
        if (response.success) {
          return {
            ...response,
            provider: provider.name,
            processing_time_ms: processingTime
          }
        }
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error)
        provider.status = 'error'
        provider.lastError = error.message
        
        // Bir sonraki provider'ı dene
        continue
      }
    }

    return {
      success: false,
      error: 'All LLM providers failed',
      processing_time_ms: Date.now() - startTime
    }
  }

  private async makeRequest(provider: LLMProvider, request: LLMRequest): Promise<LLMResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('VITE_APP_URL') || 'https://scoreresultsai.vercel.app',
        'X-Title': 'ScoreResultsAI'
      },
      body: JSON.stringify({
        ...request,
        stream: false // Non-streaming for cache system
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      content: data.choices?.[0]?.message?.content,
      model: data.model,
      usage: data.usage
    }
  }

  // Futbol tahmin sistemi için optimize edilmiş prompt
  createFootballPredictionPrompt(matchData: MatchPredictionPrompt): LLMRequest {
    const systemPrompt = `Sen uzman bir futbol analisti ve tahmin sistemisin. Verilen maç bilgilerini analiz ederek objektif ve veri odaklı tahminler yapacaksın.

GÖREV: Verilen maç için detaylı analiz ve tahmin yap.

ÇIKTI FORMATI (JSON):
{
  "winner_prediction": "HOME|DRAW|AWAY",
  "winner_confidence": 1-100,
  "goals_prediction": {
    "home": 0-5,
    "away": 0-5, 
    "total": 0-10
  },
  "over_under_prediction": "OVER|UNDER",
  "over_under_confidence": 1-100,
  "analysis_text": "Detaylı analiz metni",
  "risk_factors": ["faktör1", "faktör2"],
  "key_stats": {
    "critical_factor": "değer",
    "home_advantage": "değer"
  },
  "confidence_breakdown": {
    "home": 0-100,
    "draw": 0-100, 
    "away": 0-100
  }
}

ANALIZ KRİTERLERİ:
1. Son 5 maç formu ve momentum
2. Head-to-head geçmişi
3. Ev sahibi avantajı
4. Takım istatistikleri (gol ortalamaları)
5. Lig pozisyonu ve puan durumu
6. Yaralanma/ceza durumu (varsa)

ÖNEMLI: Sadece JSON formatında yanıt ver, ekstra açıklama ekleme.`

    const userPrompt = `MAÇA ANALİZ:
📅 Tarih: ${matchData.matchDate}
🏆 Lig: ${matchData.leagueName}
🏠 Ev Sahibi: ${matchData.homeTeam}
🚌 Deplasman: ${matchData.awayTeam}

SON 5 MAÇ FORMU:
🏠 ${matchData.homeTeam}: ${matchData.homeTeamForm.join('-')}
🚌 ${matchData.awayTeam}: ${matchData.awayTeamForm.join('-')}

HEAD-TO-HEAD SON 3 KARŞILAŞMA:
${matchData.headToHead.map(h2h => 
  `${h2h.date}: ${h2h.homeScore}-${h2h.awayScore} (${h2h.result})`
).join('\n')}

TAKIM İSTATİSTİKLERİ:
🏠 ${matchData.homeTeam}: ${matchData.homeTeamStats?.goalsFor || 'N/A'} gol attı, ${matchData.homeTeamStats?.goalsAgainst || 'N/A'} gol yedi
🚌 ${matchData.awayTeam}: ${matchData.awayTeamStats?.goalsFor || 'N/A'} gol attı, ${matchData.awayTeamStats?.goalsAgainst || 'N/A'} gol yedi

Bu verileri analiz ederek maç tahminini JSON formatında ver.`

    return {
      model: 'deepseek/deepseek-r1', // Default model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1, // Düşük temperature = daha tutarlı tahminler
      max_tokens: 2000,
      top_p: 0.9
    }
  }

  // Alternative models untuk farklı senaryolar
  async generatePredictionWithMultipleModels(matchData: MatchPredictionPrompt): Promise<LLMResponse[]> {
    const models = [
      'deepseek/deepseek-r1',
      'deepseek/deepseek-chat-v3-0324',
      'mistralai/mistral-small-3.2-24b-instruct:free'
    ]

    const predictions = []
    
    for (const model of models) {
      const request = this.createFootballPredictionPrompt(matchData)
      request.model = model
      
      try {
        const result = await this.callLLM(request)
        if (result.success) {
          predictions.push({ ...result, model })
        }
      } catch (error) {
        console.error(`Model ${model} failed:`, error)
      }
    }

    return predictions
  }

  // Provider durumunu kontrol et
  getProviderStatus(): { name: string; status: string; lastError?: string }[] {
    return this.providers.map(p => ({
      name: p.name,
      status: p.status,
      lastError: p.lastError
    }))
  }

  // Provider'ı yeniden aktif hale getir
  resetProvider(providerName: string) {
    const provider = this.providers.find(p => p.name === providerName)
    if (provider) {
      provider.status = 'active'
      provider.lastError = undefined
    }
  }

  // Consensus tahmin - birden fazla modelin sonucunu birleştir
  async generateConsensusPredict(matchData: MatchPredictionPrompt): Promise<any> {
    const predictions = await this.generatePredictionWithMultipleModels(matchData)
    
    if (predictions.length === 0) {
      throw new Error('No models available for prediction')
    }

    // Basit consensus algoritması - çoğunluk oyunu
    // Gerçek implementasyonda ağırlıklı ortalama yapılabilir
    const parsedPredictions = predictions
      .map(p => {
        try {
          return JSON.parse(p.content || '{}')
        } catch {
          return null
        }
      })
      .filter(p => p !== null)

    if (parsedPredictions.length === 0) {
      throw new Error('No valid predictions generated')
    }

    // İlk geçerli tahmini döndür (consensus algoritması geliştirilebilir)
    return parsedPredictions[0]
  }
}