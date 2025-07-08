import { OPENROUTER_MODELS, MODEL_PRIORITIES, API_KEY_CONFIG } from '../../constants/models'
import type { PredictionRequest, PredictionResponse } from '../types'

// 4 API Key Rotasyonu
const API_KEYS = [
  import.meta.env.VITE_OPENROUTER_API_KEY_1,
  import.meta.env.VITE_OPENROUTER_API_KEY_2, 
  import.meta.env.VITE_OPENROUTER_API_KEY_3,
  import.meta.env.VITE_OPENROUTER_API_KEY_4,
].filter(Boolean)

// Circuit Breaker ve Key Management
class ApiKeyManager {
  private currentKeyIndex = 0
  private failureCount = new Map<number, number>()
  private circuitBreaker = new Map<number, number>()

  getCurrentKey(): string {
    const now = Date.now()
    
    // Circuit breaker kontrolü
    for (let i = 0; i < API_KEYS.length; i++) {
      const keyIndex = (this.currentKeyIndex + i) % API_KEYS.length
      const breakerTime = this.circuitBreaker.get(keyIndex) || 0
      
      if (now < breakerTime) continue // Circuit açık
      
      this.currentKeyIndex = keyIndex
      return API_KEYS[keyIndex]
    }
    
    // Tüm keyler circuit breaker'da ise en az başarısızlığı olan key'i seç
    this.currentKeyIndex = 0
    this.circuitBreaker.clear()
    return API_KEYS[0]
  }

  markFailure(keyIndex: number): void {
    const failures = (this.failureCount.get(keyIndex) || 0) + 1
    this.failureCount.set(keyIndex, failures)
    
    if (failures >= API_KEY_CONFIG.circuitBreakerThreshold) {
      const breakerUntil = Date.now() + API_KEY_CONFIG.circuitBreakerTimeout
      this.circuitBreaker.set(keyIndex, breakerUntil)
      this.failureCount.set(keyIndex, 0)
      console.warn(`Circuit breaker activated for API key ${keyIndex + 1}`)
    }
  }

  markSuccess(keyIndex: number): void {
    this.failureCount.set(keyIndex, 0)
    this.circuitBreaker.delete(keyIndex)
  }

  getKeyIndex(key: string): number {
    return API_KEYS.indexOf(key)
  }
}

const keyManager = new ApiKeyManager()

// Prompt Builder - Son 5 maç verisi format et
export class PromptBuilder {
  static buildPredictionPrompt(request: PredictionRequest): string {
    const {
      home_team,
      away_team,
      home_form,
      away_form,
      league_name,
      stats,
      odds,
      historical_h2h
    } = request

    let prompt = `Sen bir profesyonel futbol analisti olarak aşağıdaki maç için detaylı tahmin analizi yap:

🏠 **Ev Sahibi:** ${home_team}
🚌 **Deplasman:** ${away_team}
🏆 **Lig:** ${league_name}

📊 **Takım Formları (Son 5 Maç):**
• ${home_team}: ${this.formatForm(home_form)}
• ${away_team}: ${this.formatForm(away_form)}
`

    if (stats) {
      prompt += `
📈 **Maç İstatistikleri:**
• Şutlar: ${stats.shots?.total || 'N/A'} (İsabetli: ${stats.shots?.on || 'N/A'})
• Top Hakimiyeti: %${stats.possession || 'N/A'}
• Faul: ${stats.fouls || 'N/A'}
• Korner: ${stats.corners || 'N/A'}
`
    }

    if (odds) {
      prompt += `
💰 **Bahis Oranları:**
• Ev Sahibi Galibiyeti (1): ${odds['1']}
• Beraberlik (X): ${odds['X']}
• Deplasman Galibiyeti (2): ${odds['2']}
• Üst 2.5 Gol: ${odds.over_2_5 || 'N/A'}
• Alt 2.5 Gol: ${odds.under_2_5 || 'N/A'}
`
    }

    if (historical_h2h && historical_h2h.length > 0) {
      prompt += `
🔄 **Son H2H (Kafa Kafaya) Maçlar:**
${historical_h2h.slice(0, 3).map(match => 
  `• ${match.teams.home.name} ${match.score.home}-${match.score.away} ${match.teams.away.name}`
).join('\n')}
`
    }

    prompt += `
🎯 **GÖREV:** Yukarıdaki verileri analiz ederek aşağıdaki JSON formatında tahmin üret:

{
  "winner": "1" | "X" | "2",
  "winner_confidence": 1-100 arası sayı,
  "goals": "over_2.5" | "under_2.5",
  "goals_confidence": 1-100 arası sayı,
  "both_teams_score": "yes" | "no",
  "btts_confidence": 1-100 arası sayı,
  "analysis": "Detaylı analiz açıklaması (max 200 kelime)",
  "risk_factors": ["Risk faktörü 1", "Risk faktörü 2"],
  "key_insights": ["Önemli bilgi 1", "Önemli bilgi 2"],
  "recommended_bets": [
    {
      "type": "winner" | "goals" | "btts",
      "selection": "Seçim açıklaması",
      "odds": Oran değeri,
      "confidence": 1-100,
      "stake_percentage": 1-5
    }
  ]
}

**ÖNEMLİ:** Sadece JSON formatında yanıt ver, başka metin ekleme.`

    return prompt
  }

  private static formatForm(form: string): string {
    const formMap: { [key: string]: string } = {
      'W': '✅ Galibiyet',
      'L': '❌ Mağlubiyet', 
      'D': '🟡 Beraberlik',
      'N': '⚪ Bilinmiyor'
    }
    
    return form.split('').map(char => formMap[char] || char).join(' → ')
  }
}

// OpenRouter API Call with Retry Logic
export async function callOpenRouterAPI(
  request: PredictionRequest,
  maxRetries: number = API_KEY_CONFIG.maxRetries
): Promise<PredictionResponse> {
  let lastError: Error = new Error('Bilinmeyen hata')
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = keyManager.getCurrentKey()
      const keyIndex = keyManager.getKeyIndex(apiKey)
      
      if (!apiKey) {
        throw new Error('API key bulunamadı')
      }

      // Model seçimi - priority'ye göre
      const availableModels = [
        ...MODEL_PRIORITIES.primary,
        ...MODEL_PRIORITIES.fallback
      ]
      const selectedModel = OPENROUTER_MODELS[availableModels[0]]
      
      const prompt = PromptBuilder.buildPredictionPrompt(request)
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'ScoreResultsAI'
        },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: [
            {
              role: 'system',
              content: 'Sen profesyonel bir futbol analisti ve bahis uzmanısın. Sadece JSON formatında yanıt veriyorsun.'
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          temperature: selectedModel.temperature,
          max_tokens: selectedModel.maxTokens,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      })

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit - sonraki key'i dene
          keyManager.markFailure(keyIndex)
          await sleep(API_KEY_CONFIG.rateLimitDelay * (attempt + 1))
          continue
        }
        
        if (response.status >= 500) {
          // Server error - retry
          throw new Error(`OpenRouter server error: ${response.status}`)
        }
        
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Boş yanıt alındı')
      }

      const content = data.choices[0].message.content.trim()
      const prediction = parseAIResponse(content)
      
      // Başarılı - key'i işaretle
      keyManager.markSuccess(keyIndex)
      
      return prediction

    } catch (error) {
      lastError = error as Error
      
      const currentKey = keyManager.getCurrentKey()
      const keyIndex = keyManager.getKeyIndex(currentKey)
      
      console.error(`OpenRouter attempt ${attempt + 1} failed:`, error)
      keyManager.markFailure(keyIndex)
      
      if (attempt < maxRetries - 1) {
        await sleep(API_KEY_CONFIG.retryDelay * Math.pow(2, attempt))
      }
    }
  }

  // Tüm denemeler başarısız - fallback prediction
  console.error('Tüm OpenRouter denemeleri başarısız, fallback kullanılıyor')
  return generateFallbackPrediction(request, lastError.message)
}

// AI Response Parser
function parseAIResponse(content: string): PredictionResponse {
  try {
    // JSON ayıklama
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('JSON bulunamadı')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    // Validation
    if (!parsed.winner || !parsed.goals || !parsed.analysis) {
      throw new Error('Gerekli alanlar eksik')
    }
    
    // Normalize confidence scores
    parsed.winner_confidence = Math.min(100, Math.max(1, parsed.winner_confidence || 50))
    parsed.goals_confidence = Math.min(100, Math.max(1, parsed.goals_confidence || 50))
    parsed.btts_confidence = Math.min(100, Math.max(1, parsed.btts_confidence || 50))
    
    // Set defaults
    parsed.risk_factors = parsed.risk_factors || []
    parsed.key_insights = parsed.key_insights || []
    parsed.recommended_bets = parsed.recommended_bets || []
    parsed.both_teams_score = parsed.both_teams_score || 'no'
    
    return parsed as PredictionResponse

  } catch (error) {
    console.error('AI response parse error:', error)
    throw new Error('AI yanıtı işlenemedi')
  }
}

// Fallback Prediction Generator
function generateFallbackPrediction(
  request: PredictionRequest, 
  errorMessage: string
): PredictionResponse {
  // Basit rule-based prediction
  const homeWins = (request.home_form.match(/W/g) || []).length
  const awayWins = (request.away_form.match(/W/g) || []).length
  
  let winner: '1' | 'X' | '2' = 'X'
  let confidence = 40
  
  if (homeWins > awayWins + 1) {
    winner = '1'
    confidence = 55
  } else if (awayWins > homeWins + 1) {
    winner = '2' 
    confidence = 55
  }
  
  return {
    winner,
    winner_confidence: confidence,
    goals: 'over_2.5',
    goals_confidence: 45,
    both_teams_score: 'yes',
    btts_confidence: 50,
    analysis: `AI servisi geçici olarak kullanılamıyor (${errorMessage}). Temel form analizi kullanılarak oluşturulmuş tahmin.`,
    risk_factors: [
      'AI servisi kullanılamıyor',
      'Temel analiz kullanıldı',
      'Düşük güvenilirlik'
    ],
    key_insights: [
      'Form analizi temel alınmıştır',
      'Detaylı istatistik analizi yapılamadı'
    ],
    recommended_bets: []
  }
}

// Test Connection
export async function testOpenRouterConnection(): Promise<boolean> {
  try {
    const testRequest: PredictionRequest = {
      fixture_id: 0,
      home_team: 'Test Takımı A',
      away_team: 'Test Takımı B', 
      home_form: 'WWWWW',
      away_form: 'LLLLL',
      league_name: 'Test Ligi'
    }
    
    await callOpenRouterAPI(testRequest, 1)
    return true
  } catch {
    return false
  }
}

// Utility Functions
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Export types and utilities
export type { PredictionRequest, PredictionResponse }
export { keyManager, PromptBuilder }