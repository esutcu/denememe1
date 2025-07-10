export interface PlanDetails {
  id: string
  name: string
  price: number
  currency: string
  features: string[]
  dailyPredictions: number
  popular?: boolean
}

export const SUBSCRIPTION_PLANS: PlanDetails[] = [
  {
    id: 'free',
    name: 'Ücretsiz',
    price: 0,
    currency: 'TRY',
    features: [
      'Günlük 5 tahmin',
      'Temel ligler',
      'Basit analiz',
      'Reklam gösterimi'
    ],
    dailyPredictions: 5
  },
  {
    id: 'basic',
    name: 'Temel',
    price: 29,
    currency: 'TRY',
    features: [
      'Günlük 25 tahmin',
      '5 major lig',
      'Detaylı AI analiz',
      'Email bildirimleri',
      'Reklamsız'
    ],
    dailyPredictions: 25
  },
  {
    id: 'pro',
    name: 'Profesyonel',
    price: 79,
    currency: 'TRY',
    features: [
      'Günlük 100 tahmin',
      'Tüm ligler (180+)',
      'Premium AI analiz',
      'Gerçek zamanlı bildirim',
      'API erişimi',
      'Priority destek'
    ],
    dailyPredictions: 100,
    popular: true
  }
]

export function getPlanDetails(planId: string): PlanDetails | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null
}