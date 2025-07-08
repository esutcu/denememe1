export interface AIFeature {
  id: string
  title: string
  description: string
  image: string
  color: string
  icon: string
  benefits: string[]
}

import dataAnalysisImg from '/images/card_data_analysis_3d.png';
import mlAdvancedImg from '/images/card_ml_advanced.png';
import strategyChessImg from '/images/card_strategy_chess.png';
import deepLearningImg from '/images/card_deep_learning.png';
import performanceTrackingImg from '/images/card_performance_tracking.png';
import predictiveImg from '/images/card_predictive.png';
import bigDataImg from '/images/card_big_data.png';
import liveAnalysisImg from '/images/card_live_analysis.png';

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
    id: '1',
    title: 'Big Data Analysis',
    description: 'Milyonlarca veri noktasını işleyerek kapsamlı futbol analizleri gerçekleştiriyoruz',
    image: '/denememe/images/card_big_data.png',
    color: 'from-gray-600 to-blue-600',
    icon: '🗄️',
    benefits: [
      'Milyonlarca veri noktası',
      'Hızlı veri işleme',
      'Ölçeklenebilir analiz altyapısı'
    ]
  },
  {
    id: '2',
    title: 'Data Analysis',
    description: 'Kapsamlı futbol verilerini AI ile analiz ederek detaylı içgörüler sunuyoruz',
    image: '/denememe/images/card_data_analysis_3d.png',
    color: 'from-green-500 to-emerald-600',
    icon: '📊',
    benefits: [
      'Gerçek zamanlı veri işleme',
      '180+ lig ve binlerce takım verisi',
      'Gelişmiş istatistiksel modeller'
    ]
  },
  {
    id: '3',
    title: 'Deep Learning',
    description: 'Neural network modelleri ile karmaşık futbol verilerini işleyip öngörüler üretiyoruz',
    image: '/denememe/images/card_deep_learning.png',
    color: 'from-cyan-500 to-blue-600',
    icon: '🔬',
    benefits: [
      'Derin neural network modelleri',
      'Kompleks veri ilişkileri',
      'Gelişmiş pattern recognition'
    ]
  },
  {
    id: '4',
    title: 'Fan Engagement',
    description: 'Takım stratejilerini derinlemesine analiz ederek taktiksel öngörüler sağlıyoruz',
    image: '/denememe/images/card_fan_engagement.png',
    color: 'from-amber-500 to-orange-600',
    icon: '♟️',
    benefits: [
      'Taktiksel analiz',
      'Formation değerlendirmesi',
      'Oyuncu performans analizi'
    ]
  },
  {
    id: '5',
    title: 'Financial Analysis',
    description: 'Gelişmiş ML algoritmaları ile maç sonuçlarını yüksek doğrulukla tahmin ediyoruz',
    image: '/denememe/images/card_financial.png',
    color: 'from-blue-500 to-purple-600',
    icon: '🧠',
    benefits: [
      '%68+ tahmin doğruluğu',
      'Sürekli öğrenen algoritmalar',
      'Çoklu model entegrasyonu'
    ]
  },
  {
    id: '6',
    title: 'Formation Analysis',
    description: 'Oyuncu ve takım performanslarını sürekli izleyerek gelişim önerilerinde bulunuyoruz',
    image: '/denememe/images/card_formation.png',
    color: 'from-red-500 to-pink-600',
    icon: '📈',
    benefits: [
      'Gerçek zamanlı performans takibi',
      'Oyuncu gelişim analizi',
      'Takım dinamikleri değerlendirmesi'
    ]
  },
  {
    id: '7',
    title: 'Injury Prevention',
    description: 'Gelecekteki maç sonuçlarını ve oyuncu performanslarını önceden tahmin ediyoruz',
    image: '/denememe/images/card_injury_prevention.png',
    color: 'from-purple-500 to-indigo-600',
    icon: '🔮',
    benefits: [
      'Gelecek maç tahminleri',
      'Oyuncu değeri projeksiyonları',
      'Risk analizi'
    ]
  },
  {
    id: '8',
    title: 'Live Analysis',
    description: 'Maçlar sırasında gerçek zamanlı analiz ve tahminler sunuyoruz',
    image: '/denememe/images/card_live_analysis.png',
    color: 'from-green-600 to-teal-600',
    icon: '⚡',
    benefits: [
      'Gerçek zamanlı maç analizi',
      'Anlık tahmin güncellemeleri',
      'Live istatistik takibi'
    ]
  },
  {
    id: '9',
    title: 'Match Prediction',
    description: 'Maçlar sırasında gerçek zamanlı analiz ve tahminler sunuyoruz',
    image: '/denememe/images/card_match_prediction.png',
    color: 'from-green-600 to-teal-600',
    icon: '⚡',
    benefits: [
      'Gerçek zamanlı maç analizi',
      'Anlık tahmin güncellemeleri',
      'Live istatistik takibi'
    ]
  },
  {
    id: '10',
    title: 'ML Advanced',
    description: 'Gelişmiş ML algoritmaları ile maç sonuçlarını yüksek doğrulukla tahmin ediyoruz',
    image: '/denememe/images/card_ml_advanced.png',
    color: 'from-blue-500 to-purple-600',
    icon: '🧠',
    benefits: [
      '%78+ tahmin doğruluğu',
      'Sürekli öğrenen algoritmalar',
      'Çoklu model entegrasyonu'
    ]
  },
  {
    id: '11',
    title: 'Performance Tracking',
    description: 'Oyuncu ve takım performanslarını sürekli izleyerek gelişim önerilerinde bulunuyoruz',
    image: '/denememe/images/card_performance_tracking.png',
    color: 'from-red-500 to-pink-600',
    icon: '📈',
    benefits: [
      'Gerçek zamanlı performans takibi',
      'Oyuncu gelişim analizi',
      'Takım dinamikleri değerlendirmesi'
    ]
  },
  {
    id: '12',
    title: 'Predictive Analytics',
    description: 'Gelecekteki maç sonuçlarını ve oyuncu performanslarını önceden tahmin ediyoruz',
    image: '/denememe/images/card_predictive.png',
    color: 'from-purple-500 to-indigo-600',
    icon: '🔮',
    benefits: [
      'Gelecek maç tahminleri',
      'Oyuncu değeri projeksiyonları',
      'Risk analizi'
    ]
  },
  {
    id: '13',
    title: 'Strategy Analysis',
    description: 'Takım stratejilerini derinlemesine analiz ederek taktiksel öngörüler sağlıyoruz',
    image: '/denememe/images/card_strategy_chess.png',
    color: 'from-amber-500 to-orange-600',
    icon: '♟️',
    benefits: [
      'Taktiksel analiz',
      'Formation değerlendirmesi',
      'Oyuncu performans analizi'
    ]
  },
  {
    id: '14',
    title: 'Training Optimization',
    description: 'Neural network modelleri ile karmaşık futbol verilerini işleyip öngörüler üretiyoruz',
    image: '/denememe/images/card_training_optimization.png',
    color: 'from-cyan-500 to-blue-600',
    icon: '🔬',
    benefits: [
      'Derin neural network modelleri',
      'Kompleks veri ilişkileri',
      'Gelişmiş pattern recognition'
    ]
  },
  {
    id: '15',
    title: 'Transfer Market',
    description: 'Oyuncu ve takım performanslarını sürekli izleyerek gelişim önerilerinde bulunuyoruz',
    image: '/denememe/images/card_transfer_market.png',
    color: 'from-red-500 to-pink-600',
    icon: '📈',
    benefits: [
      'Gerçek zamanlı performans takibi',
      'Oyuncu gelişim analizi',
      'Takım dinamikleri değerlendirmesi'
    ]
  },
  {
    id: '16',
    title: 'Video Analytics',
    description: 'Gelecekteki maç sonuçlarını ve oyuncu performanslarını önceden tahmin ediyoruz',
    image: '/denememe/images/card_video_analytics.png',
    color: 'from-purple-500 to-indigo-600',
    icon: '🔮',
    benefits: [
      'Gelecek maç tahminleri',
      'Oyuncu değeri projeksiyonları',
      'Risk analizi'
    ]
  }
]

export const getFeatureById = (id: string) => {
  return aiFeatures.find(feature => feature.id === id)
}