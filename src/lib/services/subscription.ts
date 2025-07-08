// Subscription paket tanımları
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Ücretsiz',
    price: 0,
    currency: 'TRY',
    interval: 'ay',
    features: [
      '5 tahmin/gün',
      'Temel analiz',
      'Sadece Süper Lig',
      'Email destek'
    ],
    limits: {
      predictions_per_month: 150, // 5 x 30 gün
      leagues: ['super-lig'],
      analysis_depth: 'basic'
    }
  },
  BASIC: {
    id: 'basic',
    name: 'Temel',
    price: 99,
    currency: 'TRY',
    interval: 'ay',
    priceId: 'price_basic_monthly',
    features: [
      '50 tahmin/ay',
      'Detaylı analiz',
      'Süper Lig + 2 Avrupa Ligi',
      'Risk faktörleri',
      'Email destek'
    ],
    limits: {
      predictions_per_month: 50,
      leagues: ['super-lig', 'premier-league', 'la-liga'],
      analysis_depth: 'detailed'
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Orta',
    price: 199,
    currency: 'TRY',
    interval: 'ay',
    priceId: 'price_premium_monthly',
    features: [
      '200 tahmin/ay',
      'Gelişmiş AI analizi',
      '5 Major Avrupa Ligi',
      'Detaylı risk analizi',
      'Öncelikli destek',
      'Maç öncesi bildirimler'
    ],
    limits: {
      predictions_per_month: 200,
      leagues: ['super-lig', 'premier-league', 'la-liga', 'serie-a', 'bundesliga', 'ligue-1'],
      analysis_depth: 'advanced'
    }
  },
  ADVANCED: {
    id: 'advanced',
    name: 'Gelişmiş',
    price: 399,
    currency: 'TRY',
    interval: 'ay',
    priceId: 'price_advanced_monthly',
    features: [
      'Sınırsız tahmin',
      'Premium AI analizi',
      'Tüm dünya ligleri',
      'Derin risk analizi',
      'WhatsApp destek',
      'Özel analiz raporları',
      'Beta özellikler'
    ],
    limits: {
      predictions_per_month: -1, // Unlimited
      leagues: ['all'],
      analysis_depth: 'premium'
    }
  }
} as const

export const SUPPORTED_LEAGUES = {
  'super-lig': {
    id: 203,
    name: 'Türkiye Süper Lig',
    country: 'Turkey',
    flag: '🇹🇷',
    tier: 1
  },
  'premier-league': {
    id: 39,
    name: 'Premier League',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    tier: 1
  },
  'la-liga': {
    id: 140,
    name: 'La Liga',
    country: 'Spain',
    flag: '🇪🇸',
    tier: 1
  },
  'serie-a': {
    id: 135,
    name: 'Serie A',
    country: 'Italy',
    flag: '🇮🇹',
    tier: 1
  },
  'bundesliga': {
    id: 78,
    name: 'Bundesliga',
    country: 'Germany',
    flag: '🇩🇪',
    tier: 1
  },
  'ligue-1': {
    id: 61,
    name: 'Ligue 1',
    country: 'France',
    flag: '🇫🇷',
    tier: 1
  },
  'champions-league': {
    id: 2,
    name: 'UEFA Champions League',
    country: 'Europe',
    flag: '🏆',
    tier: 0
  },
  'europa-league': {
    id: 3,
    name: 'UEFA Europa League',
    country: 'Europe',
    flag: '🥈',
    tier: 2
  }
} as const

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS
export type LeagueId = keyof typeof SUPPORTED_LEAGUES

export const formatPrice = (price: number, currency: string = 'TRY') => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(price)
}