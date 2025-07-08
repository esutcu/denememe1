import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate()

  const stats = [
    { label: 'Aktif Kullanıcı', value: '2,500+' },
    { label: 'Tahmin Doğruluğu', value: '%78' },
    { label: 'Desteklenen Lig', value: '180+' },
    { label: 'Günlük Tahmin', value: '500+' }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚽</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                ScoreResultsAI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/auth/login')}
                className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => navigate('/auth/register')}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Hemen Başla
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto text-center">
          <div className="inline-block px-4 py-2 mb-6 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            🚀 Yapay Zeka Destekli Futbol Analizi
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Futbol Bahislerinizi{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              AI ile Güçlendirin
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            OpenRouter LLM modelleri ve API-Football verileri ile desteklenen gelişmiş tahmin sistemi. 
            180+ ligden gerçek zamanlı verilerle %75+ doğruluk oranı.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/auth/register')}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg"
            >
              Ücretsiz Dene →
            </button>
            <button 
              onClick={() => navigate('/pricing')}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-lg"
            >
              Fiyatları İncele
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Neden ScoreResultsAI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Modern teknolojiler ve yapay zeka ile futbol tahminlerinde yeni dönem
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Tahmin Sistemi</h3>
              <p className="text-gray-600">
                OpenRouter ve 12 farklı LLM modeli ile gelişmiş tahmin analizi
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Yüksek Doğruluk</h3>
              <p className="text-gray-600">
                Son 5 maç verisi ve detaylı istatistiklerle %75+ doğruluk oranı
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Gerçek Zamanlı</h3>
              <p className="text-gray-600">
                API-Football ile anlık maç verileri ve canlı güncellemeler
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Futbol Bahislerinizi Bir Sonraki Seviyeye Taşıyın
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Yapay zeka destekli analizlerle daha bilinçli bahisler yapın
          </p>
          <button 
            onClick={() => navigate('/auth/register')}
            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold"
          >
            Hemen Ücretsiz Deneyin →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">⚽</span>
            </div>
            <span className="font-bold">ScoreResultsAI</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            AI destekli futbol tahmin platformu
          </p>
          <div className="text-sm text-gray-500">
            © 2025 ScoreResultsAI. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing