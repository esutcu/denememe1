import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Check, 
  X, 
  ArrowLeft, 
  Crown, 
  Zap, 
  Shield, 
  Star,
  Info,
  Users,
  TrendingUp
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Switch } from '../../components/ui/switch'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { SUBSCRIPTION_PLANS, formatPrice, SUPPORTED_LEAGUES } from '../../constants/subscriptions'
import { useToast } from '../../hooks/use-toast'

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      navigate('/auth/register')
      return
    }

    setIsLoading(planId)
    try {
      // TODO: Stripe checkout integration
      toast({
        title: "Yönlendiriliyor...",
        description: "Stripe ödeme sayfasına yönlendiriliyorsunuz.",
      })
      
      // Simulated redirect
      setTimeout(() => {
        setIsLoading(null)
        navigate('/subscription/checkout', { 
          state: { planId, isYearly } 
        })
      }, 1500)
      
    } catch (error) {
      setIsLoading(null)
      toast({
        title: "Hata",
        description: "Ödeme sayfasına yönlendirme başarısız.",
        variant: "destructive",
      })
    }
  }

  const getDiscountedPrice = (price: number) => {
    return isYearly ? Math.round(price * 10) : price // 2 months free
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return Users
      case 'basic': return Star
      case 'premium': return Zap
      case 'advanced': return Crown
      default: return Star
    }
  }

  const getLeagueCount = (planId: string) => {
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]
    if (plan.limits.leagues.includes('all')) return '180+'
    return plan.limits.leagues.length
  }

  const comparisonFeatures = [
    {
      category: 'Tahmin Limitleri',
      features: [
        {
          name: 'Aylık Tahmin Sayısı',
          free: '150 (5/gün)',
          basic: '50',
          premium: '200',
          advanced: 'Sınırsız'
        },
        {
          name: 'Analiz Derinliği',
          free: 'Temel',
          basic: 'Detaylı',
          premium: 'Gelişmiş',
          advanced: 'Premium'
        }
      ]
    },
    {
      category: 'Lig Erişimi',
      features: [
        {
          name: 'Desteklenen Lig Sayısı',
          free: '1 (Süper Lig)',
          basic: '3',
          premium: '6',
          advanced: '180+'
        },
        {
          name: 'Avrupa Ligleri',
          free: false,
          basic: true,
          premium: true,
          advanced: true
        },
        {
          name: 'Dünya Ligleri',
          free: false,
          basic: false,
          premium: false,
          advanced: true
        }
      ]
    },
    {
      category: 'AI Özellikleri',
      features: [
        {
          name: 'Risk Faktörleri',
          free: false,
          basic: true,
          premium: true,
          advanced: true
        },
        {
          name: 'Güven Skorları',
          free: true,
          basic: true,
          premium: true,
          advanced: true
        },
        {
          name: 'Özel Analiz Raporları',
          free: false,
          basic: false,
          premium: false,
          advanced: true
        }
      ]
    },
    {
      category: 'Destek & Ekstralar',
      features: [
        {
          name: 'Email Destek',
          free: true,
          basic: true,
          premium: true,
          advanced: true
        },
        {
          name: 'Öncelikli Destek',
          free: false,
          basic: false,
          premium: true,
          advanced: true
        },
        {
          name: 'WhatsApp Destek',
          free: false,
          basic: false,
          premium: false,
          advanced: true
        },
        {
          name: 'Beta Özellikler',
          free: false,
          basic: false,
          premium: false,
          advanced: true
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Size Uygun Paketi Seçin
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            AI destekli futbol tahmin sistemimiz ile bahis stratejinizi güçlendirin
          </p>

          {/* Yearly/Monthly Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={!isYearly ? 'font-semibold' : 'text-muted-foreground'}>
              Aylık
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span className={isYearly ? 'font-semibold' : 'text-muted-foreground'}>
              Yıllık
            </span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              2 Ay Ücretsiz
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => {
            const Icon = getPlanIcon(planId)
            const discountedPrice = getDiscountedPrice(plan.price)
            const yearlyPrice = isYearly && plan.price > 0 ? discountedPrice : plan.price
            
            return (
              <Card 
                key={planId} 
                className={`relative ${plan.id === 'basic' ? 'border-primary shadow-lg scale-105' : ''} hover:shadow-lg transition-all`}
              >
                {plan.id === 'basic' && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    En Popüler
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {yearlyPrice === 0 ? (
                        'Ücretsiz'
                      ) : (
                        <>
                          {formatPrice(yearlyPrice)}
                          <span className="text-sm font-normal text-muted-foreground">
                            /{isYearly ? 'yıl' : 'ay'}
                          </span>
                        </>
                      )}
                    </div>
                    {isYearly && plan.price > 0 && (
                      <div className="text-sm text-muted-foreground line-through">
                        {formatPrice(plan.price * 12)}/yıl
                      </div>
                    )}
                  </div>
                  <CardDescription>
                    {plan.limits.predictions_per_month === -1 
                      ? 'Sınırsız tahmin' 
                      : `${plan.limits.predictions_per_month} tahmin/ay`
                    } • {getLeagueCount(planId)} lig
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.id === 'basic' ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(planId)}
                    disabled={isLoading === planId}
                  >
                    {isLoading === planId ? (
                      'Yönlendiriliyor...'
                    ) : (
                      plan.price === 0 ? 'Hemen Başla' : 'Satın Al'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Detaylı Özellik Karşılaştırması
          </h2>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Özellikler</th>
                    <th className="px-6 py-4 text-center font-semibold">Ücretsiz</th>
                    <th className="px-6 py-4 text-center font-semibold">Temel</th>
                    <th className="px-6 py-4 text-center font-semibold">Orta</th>
                    <th className="px-6 py-4 text-center font-semibold">Gelişmiş</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((category, categoryIndex) => (
                    <>
                      <tr key={`category-${categoryIndex}`} className="bg-muted/30">
                        <td colSpan={5} className="px-6 py-3 font-semibold text-sm uppercase tracking-wider">
                          {category.category}
                        </td>
                      </tr>
                      {category.features.map((feature, featureIndex) => (
                        <tr key={`feature-${categoryIndex}-${featureIndex}`} className="border-t">
                          <td className="px-6 py-4 font-medium">{feature.name}</td>
                          <td className="px-6 py-4 text-center">
                            {typeof feature.free === 'boolean' ? (
                              feature.free ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              feature.free
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {typeof feature.basic === 'boolean' ? (
                              feature.basic ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              feature.basic
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {typeof feature.premium === 'boolean' ? (
                              feature.premium ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              feature.premium
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {typeof feature.advanced === 'boolean' ? (
                              feature.advanced ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              feature.advanced
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Sıkça Sorulan Sorular
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Ücretsiz plan ile ne kadar tahmin alabilirim?</h3>
                <p className="text-muted-foreground text-sm">
                  Ücretsiz plan ile günde 5 tahmine kadar erişebilirsiniz. Sadece Türkiye Süper Lig maçları için geçerlidir.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Tahmin doğruluğu ne kadar?</h3>
                <p className="text-muted-foreground text-sm">
                  AI modellerimiz %75+ doğruluk oranına sahiptir. Detaylı istatistikler dashboard'unuzda mevcuttur.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Hangi ligler destekleniyor?</h3>
                <p className="text-muted-foreground text-sm">
                  180+ lig destekliyoruz. Paket seviyenize göre erişim değişir. Gelişmiş pakette tüm liglere erişim vardır.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">İptal etme politikası nedir?</h3>
                <p className="text-muted-foreground text-sm">
                  İstediğiniz zaman iptal edebilirsiniz. Mevcut dönemin sonuna kadar hizmet almaya devam edersiniz.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Ödeme yöntemleri nelerdir?</h3>
                <p className="text-muted-foreground text-sm">
                  Kredi kartı, banka kartı ve kripto para ile ödeme yapabilirsiniz. Tüm ödemeler Stripe ile güvence altındadır.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Müşteri desteği nasıl alınır?</h3>
                <p className="text-muted-foreground text-sm">
                  Tüm kullanıcılar email desteği alır. Premium+ paketlerde WhatsApp desteği de mevcuttur.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-muted/30 rounded-lg p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Güvenli Ödeme</h3>
              <p className="text-sm text-muted-foreground">Stripe ile SSL korumalı</p>
            </div>
            <div>
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">%78 Doğruluk</h3>
              <p className="text-sm text-muted-foreground">Kanıtlanmış başarı oranı</p>
            </div>
            <div>
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">2500+ Kullanıcı</h3>
              <p className="text-sm text-muted-foreground">Güvenilir topluluk</p>
            </div>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Tüm paketlerde 7 günlük para iade garantisi vardır. Memnun kalmazsanız tam iade alabilirsiniz.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

export default Pricing