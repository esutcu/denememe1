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
    title: 'Büyük Veri Analizi',
    description: 'Milyonlarca veri noktasını işleyerek kapsamlı futbol analizleri gerçekleştiriyoruz',
    image: '/images/card_big_data.png',
    color: 'bg-slate-100',
    icon: '🗄️',
    benefits: [
      'Milyonlarca veri noktası',
      'Hızlı veri işleme',
      'Ölçeklenebilir analiz altyapısı'
    ]
  },
  {
    id: '2',
    title: 'Veri Analizi',
    description: 'Kapsamlı futbol verilerini AI ile analiz ederek detaylı içgörüler sunuyoruz',
    image: '/images/card_data_analysis_3d.png',
    color: 'bg-slate-100',
    icon: '📊',
    benefits: [
      'Gerçek zamanlı veri işleme',
      '180+ lig ve binlerce takım verisi',
      'Gelişmiş istatistiksel modeller'
    ]
  },
  {
    id: '3',
    title: 'Derin Öğrenme',
    description: 'Neural network modelleri ile karmaşık futbol verilerini işleyip öngörüler üretiyoruz',
    image: '/images/card_deep_learning.png',
    color: 'bg-slate-100',
    icon: '🔬',
    benefits: [
      'Derin neural network modelleri',
      'Kompleks veri ilişkileri',
      'Gelişmiş pattern recognition'
    ]
  },
  {
    id: '4',
    title: 'Taraftar Etkileşimi',
    description: 'Takım stratejilerini derinlemesine analiz ederek taktiksel öngörüler sağlıyoruz',
    image: '/images/card_fan_engagement.png',
    color: 'bg-slate-100',
    icon: '♟️',
    benefits: [
      'Taktiksel analiz',
      'Formation değerlendirmesi',
      'Oyuncu performans analizi'
    ]
  },
  {
    id: '5',
    title: 'Mali Analiz',
    description: 'Gelişmiş ML algoritmaları ile maç sonuçlarını yüksek doğrulukla tahmin ediyoruz',
    image: '/images/card_financial.png',
    color: 'bg-slate-100',
    icon: '🧠',
    benefits: [
      '%68+ tahmin doğruluğu',
      'Sürekli öğrenen algoritmalar',
      'Çoklu model entegrasyonu'
    ]
  },
  {
    id: '6',
    title: 'Diziliş Analizi',
    description: 'Oyuncu ve takım performanslarını sürekli izleyerek gelişim önerilerinde bulunuyoruz',
    image: '/images/card_formation.png',
    color: 'bg-slate-100',
    icon: '📈',
    benefits: [
      'Gerçek zamanlı performans takibi',
      'Oyuncu gelişim analizi',
      'Takım dinamikleri değerlendirmesi'
    ]
  },
  {
    id: '7',
    title: 'Sakatlık Önleme',
    description: 'Gelecekteki maç sonuçlarını ve oyuncu performanslarını önceden tahmin ediyoruz',
    image: '/images/card_injury_prevention.png',
    color: 'bg-slate-100',
    icon: '🔮',
    benefits: [
      'Gelecek maç tahminleri',
      'Oyuncu değeri projeksiyonları',
      'Risk analizi'
    ]
  },
  {
    id: '8',
    title: 'Canlı Analiz',
    description: 'Maçlar sırasında gerçek zamanlı analiz ve tahminler sunuyoruz',
    image: '/images/card_live_analysis.png',
    color: 'bg-slate-100',
    icon: '⚡',
    benefits: [
      'Gerçek zamanlı maç analizi',
      'Anlık tahmin güncellemeleri',
      'Canlı istatistik takibi'
    ]
  },
  {
    id: '9',
    title: 'Maç Tahmini',
    description: 'Maçlar sırasında gerçek zamanlı analiz ve tahminler sunuyoruz',
    image: '/images/card_match_prediction.png',
    color: 'bg-slate-100',
    icon: '⚡',
    benefits: [
      'Gerçek zamanlı maç analizi',
      'Anlık tahmin güncellemeleri',
      'Canlı istatistik takibi'
    ]
  },
  {
    id: '10',
    title: 'Gelişmiş Makine Öğrenmesi',
    description: 'Gelişmiş ML algoritmaları ile maç sonuçlarını yüksek doğrulukla tahmin ediyoruz',
    image: '/images/card_ml_advanced.png',
    color: 'bg-slate-100',
    icon: '🧠',
    benefits: [
      '%78+ tahmin doğruluğu',
      'Sürekli öğrenen algoritmalar',
      'Çoklu model entegrasyonu'
    ]
  },
  {
    id: '11',
    title: 'Performans Takibi',
    description: 'Oyuncu ve takım performanslarını sürekli izleyerek gelişim önerilerinde bulunuyoruz',
    image: '/images/card_performance_tracking.png',
    color: 'bg-slate-100',
    icon: '📈',
    benefits: [
      'Gerçek zamanlı performans takibi',
      'Oyuncu gelişim analizi',
      'Takım dinamikleri değerlendirmesi'
    ]
  },
  {
    id: '12',
    title: 'Öngörülü Analitik',
    description: 'Gelecekteki maç sonuçlarını ve oyuncu performanslarını önceden tahmin ediyoruz',
    image: '/images/card_predictive.png',
    color: 'bg-slate-100',
    icon: '🔮',
    benefits: [
      'Gelecek maç tahminleri',
      'Oyuncu değeri projeksiyonları',
      'Risk analizi'
    ]
  },
  {
    id: '13',
    title: 'Strateji Analizi',
    description: 'Takım stratejilerini derinlemesine analiz ederek taktiksel öngörüler sağlıyoruz',
    image: '/images/card_strategy_chess.png',
    color: 'bg-slate-100',
    icon: '♟️',
    benefits: [
      'Taktiksel analiz',
      'Formation değerlendirmesi',
      'Oyuncu performans analizi'
    ]
  },
  {
    id: '14',
    title: 'Antrenman Optimizasyonu',
    description: 'Neural network modelleri ile karmaşık futbol verilerini işleyip öngörüler üretiyoruz',
    image: '/images/card_training_optimization.png',
    color: 'bg-slate-100',
    icon: '🔬',
    benefits: [
      'Derin neural network modelleri',
      'Kompleks veri ilişkileri',
      'Gelişmiş pattern recognition'
    ]
  },
  {
    id: '15',
    title: 'Transfer Piyasası',
    description: 'Oyuncu ve takım performanslarını sürekli izleyerek gelişim önerilerinde bulunuyoruz',
    image: '/images/card_transfer_market.png',
    color: 'bg-slate-100',
    icon: '📈',
    benefits: [
      'Gerçek zamanlı performans takibi',
      'Oyuncu gelişim analizi',
      'Takım dinamikleri değerlendirmesi'
    ]
  },
  {
    id: '16',
    title: 'Video Analitikleri',
    description: 'Gelecekteki maç sonuçlarını ve oyuncu performanslarını önceden tahmin ediyoruz',
    image: '/images/card_video_analytics.png',
    color: 'bg-slate-100',
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