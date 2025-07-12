import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Loader2, Play, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import { apiTester, TestResult, ApiTestSuite } from '../utils/apiTester'
import { toast } from 'sonner'

export function ApiTestPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<ApiTestSuite | null>(null)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)

  const runTests = async () => {
    setIsRunning(true)
    setResults(null)
    
    try {
      toast.info('API testleri başlatılıyor...')
      const testResults = await apiTester.runFullTest()
      setResults(testResults)
      
      const { overall } = testResults
      const successRate = overall.total > 0 ? Math.round((overall.passed / overall.total) * 100) : 0
      
      if (successRate >= 80) {
        toast.success(`Testler tamamlandı! Başarı oranı: %${successRate}`)
      } else if (successRate >= 50) {
        toast.warning(`Testler tamamlandı. Başarı oranı: %${successRate} - Bazı sorunlar var`)
      } else {
        toast.error(`Testler tamamlandı. Başarı oranı: %${successRate} - Kritik sorunlar detected`)
      }
      
      // Console'a detaylı sonuçları yazdır
      apiTester.printDetailedResults()
    } catch (error) {
      console.error('Test suite failed:', error)
      toast.error('Test paketi çalıştırılırken hata oluştu')
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Başarılı</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Hata</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Uyarı</Badge>
      default:
        return <Badge variant="secondary">Beklemede</Badge>
    }
  }

  const TestResultItem = ({ result }: { result: TestResult }) => (
    <div 
      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={() => setSelectedTest(selectedTest === result.service ? null : result.service)}
    >
      <div className="flex items-center gap-3">
        {getStatusIcon(result.status)}
        <div>
          <div className="font-medium">{result.service}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {result.message}
          </div>
          {selectedTest === result.service && result.duration && (
            <div className="text-xs text-gray-500 mt-1">
              Süre: {result.duration}ms
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {result.duration && (
          <span className="text-xs text-gray-500">{result.duration}ms</span>
        )}
        {getStatusBadge(result.status)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            API Bağlantı Tester
          </CardTitle>
          <CardDescription>
            Backend ve frontend arasındaki bağlantıları test edin. Supabase, LLM servisleri ve API'lerin durumunu kontrol eder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="w-full mb-4"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testler Çalışıyor...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Testleri Başlat
              </>
            )}
          </Button>

          {results && (
            <div className="space-y-4">
              {/* Overall Stats */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{results.overall.passed}</div>
                      <div className="text-sm text-gray-600">Başarılı</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{results.overall.failed}</div>
                      <div className="text-sm text-gray-600">Hata</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{results.overall.warnings}</div>
                      <div className="text-sm text-gray-600">Uyarı</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {results.overall.total > 0 ? Math.round((results.overall.passed / results.overall.total) * 100) : 0}%
                      </div>
                      <div className="text-sm text-gray-600">Başarı Oranı</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supabase Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Supabase Testleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {results.supabase.map((result, index) => (
                    <TestResultItem key={index} result={result} />
                  ))}
                </CardContent>
              </Card>

              {/* LLM Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🧠 LLM & AI Testleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {results.llm.map((result, index) => (
                    <TestResultItem key={index} result={result} />
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔧 Hızlı Çözümler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {results.overall.failed > 0 && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                        <strong>Hatalar tespit edildi:</strong>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          <li>Supabase bağlantısı için .env dosyasındaki credentials'ları kontrol edin</li>
                          <li>OpenRouter API anahtarlarının geçerli olduğunu kontrol edin</li>
                          <li>İnternet bağlantınızı kontrol edin</li>
                          <li>Supabase projesi aktif mi kontrol edin</li>
                        </ul>
                      </div>
                    )}

                    {results.overall.warnings > 0 && results.overall.failed === 0 && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                        <strong>Uyarılar:</strong>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          <li>Bazı özellikler giriş yapmayı gerektirebilir</li>
                          <li>LLM provider'ları database'de tanımlı olmalı</li>
                        </ul>
                      </div>
                    )}

                    {results.overall.passed === results.overall.total && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                        <strong>✅ Tüm sistemler çalışıyor!</strong>
                        <p className="mt-1">Backend ve frontend bağlantıları başarıyla kuruldu.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}