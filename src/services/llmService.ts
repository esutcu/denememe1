import { supabase } from '../lib/supabase'

interface LLMProvider {
  id: string
  name: string
  api_key_encrypted: string
  model_name: string
  priority: number
}

interface PredictionRequest {
  homeTeam: string
  awayTeam: string
  leagueName?: string
  matchDate?: string
}

interface PredictionResult {
  homeWinProbability: number
  drawProbability: number
  awayWinProbability: number
  confidenceScore: number
  analysisSummary: string
  keyFactors: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

class LLMService {
  private async getActiveProviders(): Promise<LLMProvider[]> {
    const { data, error } = await supabase
      .from('llm_providers')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: true })

    if (error) {
      console.error('Error loading LLM providers:', error)
      return []
    }

    return data || []
  }

  private async callOpenRouter(apiKey: string, model: string, prompt: string): Promise<any> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ScoreResultsAI'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `Sen bir futbol analisti uzmanısın. Verilen maç verilerini analiz ederek JSON formatında tahmin yapıyorsun.
            Yanıtın kesinlikle şu JSON formatında olmalı:
            {
              "homeWinProbability": number (0-100),
              "drawProbability": number (0-100),
              "awayWinProbability": number (0-100),
              "confidenceScore": number (0-100),
              "analysisSummary": "kısa analiz metni",
              "keyFactors": ["faktör1", "faktör2", "faktör3"],
              "riskLevel": "low" | "medium" | "high"
            }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private generatePrompt(request: PredictionRequest): string {
    return `
Maç Analizi Talebi:
${request.homeTeam} vs ${request.awayTeam}
Lig: ${request.leagueName || 'Bilinmiyor'}
Tarih: ${request.matchDate || 'Bilinmiyor'}

Bu maç için detaylı analiz yap ve JSON formatında tahmin ver.
Ev sahibi avantajını, takımların genel formunu ve lig seviyesini göz önünde bulundur.
Analiz kısa ve öz olsun, tahminler mantıklı olsun.
    `
  }

  async generatePrediction(request: PredictionRequest): Promise<PredictionResult | null> {
    const providers = await this.getActiveProviders()
    
    if (providers.length === 0) {
      console.error('No active LLM providers found')
      return null
    }

    const prompt = this.generatePrompt(request)

    for (const provider of providers) {
      try {
        console.log(`Trying provider: ${provider.name}`)
        
        const rawResponse = await this.callOpenRouter(
          provider.api_key_encrypted,
          provider.model_name,
          prompt
        )

        // JSON parsing
        let parsedResponse
        try {
          const cleanedResponse = rawResponse.replace(/```json\n|\n```|```/g, '').trim()
          parsedResponse = JSON.parse(cleanedResponse)
        } catch (parseError) {
          console.error(`JSON parse error for provider ${provider.name}:`, parseError)
          continue
        }

        // Validate response
        const required = ['homeWinProbability', 'drawProbability', 'awayWinProbability', 'confidenceScore', 'analysisSummary', 'keyFactors', 'riskLevel']
        let isValid = true
        
        for (const field of required) {
          if (!(field in parsedResponse)) {
            isValid = false
            break
          }
        }

        if (!isValid) {
          console.error(`Invalid response structure from provider ${provider.name}`)
          continue
        }

        console.log(`Successful prediction from ${provider.name}`)
        return parsedResponse as PredictionResult

      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error)
        continue
      }
    }

    console.error('All LLM providers failed')
    return null
  }

  async findCachedPrediction(homeTeam: string, awayTeam: string): Promise<any> {
    const { data, error } = await supabase
      .from('match_predictions')
      .select(`
        *,
        match_fixtures!inner(home_team, away_team, league_name)
      `)
      .ilike('match_fixtures.home_team', `%${homeTeam}%`)
      .ilike('match_fixtures.away_team', `%${awayTeam}%`)
      .gt('cache_expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding cached prediction:', error)
      return null
    }

    return data
  }

  async storePrediction(
    matchId: string, 
    providerId: string, 
    prediction: PredictionResult
  ): Promise<void> {
    try {
      await supabase
        .from('match_predictions')
        .insert({
          match_id: matchId,
          llm_provider_id: providerId,
          home_win_probability: prediction.homeWinProbability,
          draw_probability: prediction.drawProbability,
          away_win_probability: prediction.awayWinProbability,
          confidence_score: prediction.confidenceScore,
          analysis_summary: prediction.analysisSummary,
          key_factors: prediction.keyFactors,
          risk_level: prediction.riskLevel
        })
    } catch (error) {
      console.error('Error storing prediction:', error)
    }
  }
}

export const llmService = new LLMService()
export type { PredictionRequest, PredictionResult }