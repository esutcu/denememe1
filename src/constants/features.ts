export interface AIFeature {
  id: string
  title: string
  description: string
  image: string
  color: string
  icon: string
  benefits: string[]
}

export const aiFeatures: AIFeature[] = [
  {
    id: 'data-analysis',
    title: 'Veri Analizi',
    description: 'Kapsamlı futbol verilerini AI ile analiz ederek detaylı içgörüler sunuyoruz',
    image: '/images/card_data_analysis_3d.png',
    color: 'from-green-500 to-emerald-600',
    icon: '📊',
    benefits: [
      'Gerçek zamanlı veri işleme',
      '180+ lig ve binlerce takım verisi',
      'Gelişmiş istatistiksel modeller'
    ]
  },
  {
    id: 'machine-learning',
    title: 'Makine Öğrenimi',
    description: 'Gelişmiş ML algoritmaları ile maç sonuçlarını yüksek doğrulukla tahmin ediyoruz',
    image: '/images/card_ml_advanced.png',
    color: 'from-blue-500 to-purple-600',
    icon: '🧠',
    benefits: [
      '%78+ tahmin doğruluğu',
      'Sürekli öğrenen algoritmalar',
      'Çoklu model entegrasyonu'
    ]
  },
  {
    id: 'strategy-analysis',
    title: 'Strateji Analizi',
    description: 'Takım stratejilerini derinlemesine analiz ederek taktiksel öngörüler sağlıyoruz',
    image: '/images/card_strategy_chess.png',
    color: 'from-amber-500 to-orange-600',
    icon: '♟️',
    benefits: [
      'Taktiksel analiz',
      'Formation değerlendirmesi',
      'Oyuncu performans analizi'
    ]
  },
  {
    id: 'deep-learning',
    title: 'Derin Öğrenme',
    description: 'Neural network modelleri ile karmaşık futbol verilerini işleyip öngörüler üretiyoruz',
    image: '/images/card_deep_learning.png',
    color: 'from-cyan-500 to-blue-600',
    icon: '🔬',
    benefits: [
      'Derin neural network modelleri',
      'Kompleks veri ilişkileri',
      'Gelişmiş pattern recognition'
    ]
  },
  {
    id: 'performance-tracking',
    title: 'Performans Takibi',
    description: 'Oyuncu ve takım performanslarını sürekli izleyerek gelişim önerilerinde bulunuyoruz',
    image: '/images/card_performance_tracking.png',
    color: 'from-red-500 to-pink-600',
    icon: '📈',
    benefits: [
      'Gerçek zamanlı performans takibi',
      'Oyuncu gelişim analizi',
      'Takım dinamikleri değerlendirmesi'
    ]
  },
  {
    id: 'predictive-analytics',
    title: 'Tahmin Analitiği',
    description: 'Gelecekteki maç sonuçlarını ve oyuncu performanslarını önceden tahmin ediyoruz',
    image: '/images/card_predictive.png',
    color: 'from-purple-500 to-indigo-600',
    icon: '🔮',
    benefits: [
      'Gelecek maç tahminleri',
      'Oyuncu değeri projeksiyonları',
      'Risk analizi'
    ]
  },
  {
    id: 'big-data',
    title: 'Büyük Veri',
    description: 'Milyonlarca veri noktasını işleyerek kapsamlı futbol analizleri gerçekleştiriyoruz',
    image: '/images/card_big_data.png',
    color: 'from-gray-600 to-blue-600',
    icon: '🗄️',
    benefits: [
      'Milyonlarca veri noktası',
      'Hızlı veri işleme',
      'Ölçeklenebilir analiz altyapısı'
    ]
  },
  {
    id: 'live-analysis',
    title: 'Canlı Analiz',
    description: 'Maçlar sırasında gerçek zamanlı analiz ve tahminler sunuyoruz',
    image: '/images/card_live_analysis.png',
    color: 'from-green-600 to-teal-600',
    icon: '⚡',
    benefits: [
      'Gerçek zamanlı maç analizi',
      'Anlık tahmin güncellemeleri',
      'Live istatistik takibi'
    ]
  }
]

export const getFeatureById = (id: string) => {
  return aiFeatures.find(feature => feature.id === id)
}