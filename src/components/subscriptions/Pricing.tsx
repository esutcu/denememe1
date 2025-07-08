import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// ...existing c
import { useToast } from "../../lib/hooks/use-toast";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const navigate = useNavigate()

  const plans = [
    {
      id: 'free',
      name: 'Ücretsiz',
      price: 0,
      features: [
        '5 tahmin/gün',
        'Temel analiz',
        'Sadece Süper Lig',
        'Email destek'
      ]
    },
    {
      id: 'basic',
      name: 'Temel',
      price: 99,
      popular: true,
      features: [
        '50 tahmin/ay',
        'Detaylı analiz',
        'Süper Lig + 2 Avrupa Ligi',
        'Risk faktörleri',
        'Email destek'
      ]
    },
    {
      id: 'premium',
      name: 'Orta',
      price: 199,
      features: [
        '200 tahmin/ay',
        'Gelişmiş AI analizi',
        '5 Major Avrupa Ligi',
        'Detaylı risk analizi',
        'Öncelikli destek'
      ]
    },
    {
      id: 'advanced',
      name: 'Gelişmiş',
      price: 399,
      features: [
        'Sınırsız tahmin',
        'Premium AI analizi',
        'Tüm dünya ligleri',
        'Derin risk analizi',
        'WhatsApp destek'
      ]
    }
  ]

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      navigate('/auth/register')
      return
    }

    setIsLoading(planId)
    
    // Simulated loading
    setTimeout(() => {
      setIsLoading(null)
      alert('Stripe entegrasyonu geliştirme aşamasında...')
    }, 1500)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getDiscountedPrice = (price: number) => {
    return isYearly ? Math.round(price * 10) : price // 2 months free
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span className="mr-2">←</span>
            Ana Sayfaya Dön
          </button>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Size Uygun Paketi Seçin
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            AI destekli futbol tahmin sistemimiz ile bahis stratejinizi güçlendirin
          </p>

          {/* Yearly/Monthly Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={!isYearly ? 'font-semibold' : 'text-gray-500'}>
              Aylık
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              aria-label={isYearly ? "Aylık fiyata geç" : "Yıllık fiyata geç"}
              title={isYearly ? "Aylık fiyata geç" : "Yıllık fiyata geç"}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={isYearly ? 'font-semibold' : 'text-gray-500'}>
              Yıllık
            </span>
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              2 Ay Ücretsiz
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {plans.map((plan) => {
            const discountedPrice = getDiscountedPrice(plan.price)
            const yearlyPrice = isYearly && plan.price > 0 ? discountedPrice : plan.price
            
            return (
              <div 
                key={plan.id}
                className={`relative bg-white rounded-lg shadow-lg p-6 ${
                  plan.popular 
                    ? 'border-2 border-blue-500 scale-105 shadow-xl' 
                    : 'border border-gray-200'
                } hover:shadow-xl transition-all`}
              >
                                {plan.popular && (
                                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                                    En Popüler
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                }
                
                export default Pricing