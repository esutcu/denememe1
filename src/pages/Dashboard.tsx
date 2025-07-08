import { useState, useEffect } from 'react'

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Bu Ay Tahmin</h3>
            <p className="text-3xl font-bold text-blue-600">25/50</p>
            <p className="text-sm text-gray-600">Kalan: 25 tahmin</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Doğruluk Oranı</h3>
            <p className="text-3xl font-bold text-green-600">%78</p>
            <p className="text-sm text-gray-600">Son 30 gün</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Aktif Plan</h3>
            <p className="text-3xl font-bold text-purple-600">Temel</p>
            <p className="text-sm text-gray-600">₺99/ay</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Bugünün Maçları</h2>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              <p>Bugün için henüz maç verisi yok.</p>
              <p className="text-sm">API-Football entegrasyonu devam ediyor...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard