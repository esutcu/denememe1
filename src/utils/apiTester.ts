import { supabase } from '../lib/supabase'
import { llmService } from '../services/llmService'

interface TestResult {
  service: string
  status: 'success' | 'error' | 'warning'
  message: string
  data?: any
  error?: any
  duration?: number
}

interface ApiTestSuite {
  supabase: TestResult[]
  llm: TestResult[]
  overall: {
    passed: number
    failed: number
    warnings: number
    total: number
  }
}

class ApiTester {
  private results: ApiTestSuite = {
    supabase: [],
    llm: [],
    overall: { passed: 0, failed: 0, warnings: 0, total: 0 }
  }

  async testSupabaseConnection(): Promise<TestResult> {
    const start = Date.now()
    try {
      const { data, error } = await supabase.from('llm_providers').select('count').limit(1)
      const duration = Date.now() - start

      if (error) {
        return {
          service: 'Supabase Connection',
          status: 'error',
          message: `Connection failed: ${error.message}`,
          error,
          duration
        }
      }

      return {
        service: 'Supabase Connection',
        status: 'success',
        message: 'Successfully connected to Supabase',
        data,
        duration
      }
    } catch (error) {
      return {
        service: 'Supabase Connection',
        status: 'error',
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
        duration: Date.now() - start
      }
    }
  }

  async testSupabaseAuth(): Promise<TestResult> {
    const start = Date.now()
    try {
      const { data, error } = await supabase.auth.getSession()
      const duration = Date.now() - start

      if (error) {
        return {
          service: 'Supabase Auth',
          status: 'error',
          message: `Auth check failed: ${error.message}`,
          error,
          duration
        }
      }

      const isAuthenticated = !!data.session?.user
      
      return {
        service: 'Supabase Auth',
        status: isAuthenticated ? 'success' : 'warning',
        message: isAuthenticated 
          ? `User authenticated: ${data.session?.user?.email}` 
          : 'No active session (not logged in)',
        data: {
          userId: data.session?.user?.id,
          email: data.session?.user?.email,
          sessionExpiry: data.session?.expires_at
        },
        duration
      }
    } catch (error) {
      return {
        service: 'Supabase Auth',
        status: 'error',
        message: `Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
        duration: Date.now() - start
      }
    }
  }

  async testSupabaseFunctions(): Promise<TestResult[]> {
    const functions = [
      'get-match-prediction',
      'user-limit-check',
      'admin-stats'
    ]

    const results: TestResult[] = []

    for (const funcName of functions) {
      const start = Date.now()
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData.session?.access_token

        if (!accessToken && funcName !== 'admin-stats') {
          results.push({
            service: `Supabase Function: ${funcName}`,
            status: 'warning',
            message: 'No auth token - skipping authenticated function test',
            duration: Date.now() - start
          })
          continue
        }

        const { data, error } = await supabase.functions.invoke(funcName, {
          body: { test: true },
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        })

        const duration = Date.now() - start

        if (error) {
          results.push({
            service: `Supabase Function: ${funcName}`,
            status: 'error',
            message: `Function error: ${error.message}`,
            error,
            duration
          })
        } else {
          results.push({
            service: `Supabase Function: ${funcName}`,
            status: 'success',
            message: 'Function accessible',
            data,
            duration
          })
        }
      } catch (error) {
        results.push({
          service: `Supabase Function: ${funcName}`,
          status: 'error',
          message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error,
          duration: Date.now() - start
        })
      }
    }

    return results
  }

  async testLLMProviders(): Promise<TestResult[]> {
    const start = Date.now()
    const results: TestResult[] = []

    try {
      const { data: providers, error } = await supabase
        .from('llm_providers')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: true })

      if (error) {
        results.push({
          service: 'LLM Providers Query',
          status: 'error',
          message: `Failed to fetch providers: ${error.message}`,
          error,
          duration: Date.now() - start
        })
        return results
      }

      if (!providers || providers.length === 0) {
        results.push({
          service: 'LLM Providers',
          status: 'warning',
          message: 'No active LLM providers found',
          duration: Date.now() - start
        })
        return results
      }

      results.push({
        service: 'LLM Providers Query',
        status: 'success',
        message: `Found ${providers.length} active providers`,
        data: providers.map(p => ({ name: p.name, model: p.model_name, priority: p.priority })),
        duration: Date.now() - start
      })

      // Test mock prediction
      const mockRequest = {
        homeTeam: 'Test Home Team',
        awayTeam: 'Test Away Team',
        leagueName: 'Test League'
      }

      const predictionStart = Date.now()
      try {
        const prediction = await llmService.generatePrediction(mockRequest)
        const predictionDuration = Date.now() - predictionStart

        if (prediction) {
          results.push({
            service: 'LLM Prediction Service',
            status: 'success',
            message: 'Successfully generated mock prediction',
            data: {
              homeWinProbability: prediction.homeWinProbability,
              confidenceScore: prediction.confidenceScore,
              riskLevel: prediction.riskLevel
            },
            duration: predictionDuration
          })
        } else {
          results.push({
            service: 'LLM Prediction Service',
            status: 'error',
            message: 'Prediction service returned null',
            duration: predictionDuration
          })
        }
      } catch (error) {
        results.push({
          service: 'LLM Prediction Service',
          status: 'error',
          message: `Prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error,
          duration: Date.now() - predictionStart
        })
      }

    } catch (error) {
      results.push({
        service: 'LLM Service',
        status: 'error',
        message: `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
        duration: Date.now() - start
      })
    }

    return results
  }

  async testOpenRouterConnectivity(): Promise<TestResult[]> {
    const apiKeys = [
      import.meta.env.VITE_OPENROUTER_API_KEY_1,
      import.meta.env.VITE_OPENROUTER_API_KEY_2,
      import.meta.env.VITE_OPENROUTER_API_KEY_3,
      import.meta.env.VITE_OPENROUTER_API_KEY_4
    ].filter(Boolean)

    const results: TestResult[] = []

    if (apiKeys.length === 0) {
      results.push({
        service: 'OpenRouter API Keys',
        status: 'error',
        message: 'No OpenRouter API keys found in environment variables'
      })
      return results
    }

    for (let i = 0; i < apiKeys.length; i++) {
      const start = Date.now()
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKeys[i]}`,
            'Content-Type': 'application/json'
          }
        })

        const duration = Date.now() - start

        if (response.ok) {
          const data = await response.json()
          results.push({
            service: `OpenRouter API Key ${i + 1}`,
            status: 'success',
            message: `API key valid - ${data.data?.length || 0} models available`,
            duration
          })
        } else {
          results.push({
            service: `OpenRouter API Key ${i + 1}`,
            status: 'error',
            message: `API key invalid: ${response.status} ${response.statusText}`,
            duration
          })
        }
      } catch (error) {
        results.push({
          service: `OpenRouter API Key ${i + 1}`,
          status: 'error',
          message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error,
          duration: Date.now() - start
        })
      }
    }

    return results
  }

  async runFullTest(): Promise<ApiTestSuite> {
    console.log('🧪 Starting comprehensive API test suite...')
    
    // Reset results
    this.results = {
      supabase: [],
      llm: [],
      overall: { passed: 0, failed: 0, warnings: 0, total: 0 }
    }

    // Test Supabase
    console.log('📊 Testing Supabase services...')
    this.results.supabase.push(await this.testSupabaseConnection())
    this.results.supabase.push(await this.testSupabaseAuth())
    this.results.supabase.push(...await this.testSupabaseFunctions())

    // Test LLM services
    console.log('🧠 Testing LLM services...')
    this.results.llm.push(...await this.testLLMProviders())
    this.results.llm.push(...await this.testOpenRouterConnectivity())

    // Calculate overall stats
    const allResults = [...this.results.supabase, ...this.results.llm]
    this.results.overall = {
      total: allResults.length,
      passed: allResults.filter(r => r.status === 'success').length,
      failed: allResults.filter(r => r.status === 'error').length,
      warnings: allResults.filter(r => r.status === 'warning').length
    }

    console.log('✅ Test suite completed')
    return this.results
  }

  getResultsSummary(): string {
    const { overall } = this.results
    const successRate = overall.total > 0 ? Math.round((overall.passed / overall.total) * 100) : 0
    
    return `
🔍 API Test Results Summary:
✅ Passed: ${overall.passed}
❌ Failed: ${overall.failed}  
⚠️  Warnings: ${overall.warnings}
📊 Success Rate: ${successRate}%
📈 Total Tests: ${overall.total}
    `.trim()
  }

  printDetailedResults(): void {
    console.log('\n' + '='.repeat(50))
    console.log('📋 DETAILED TEST RESULTS')
    console.log('='.repeat(50))

    console.log('\n📊 SUPABASE TESTS:')
    this.results.supabase.forEach(result => {
      const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
      console.log(`${icon} ${result.service}: ${result.message}${result.duration ? ` (${result.duration}ms)` : ''}`)
      if (result.error) console.log(`   Error:`, result.error)
    })

    console.log('\n🧠 LLM TESTS:')
    this.results.llm.forEach(result => {
      const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
      console.log(`${icon} ${result.service}: ${result.message}${result.duration ? ` (${result.duration}ms)` : ''}`)
      if (result.error) console.log(`   Error:`, result.error)
    })

    console.log('\n' + this.getResultsSummary())
    console.log('\n' + '='.repeat(50))
  }
}

export const apiTester = new ApiTester()
export type { TestResult, ApiTestSuite }