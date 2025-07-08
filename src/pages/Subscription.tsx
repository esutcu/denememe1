// src/pages/Subscription.tsx - New subscription management page
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../contexts/AuthContext'
import { 
  Crown, 
  Check, 
  X, 
  TrendingUp, 
  Zap, 
  Shield,
  CreditCard,
  Calendar,
  Users,
  Star
} from 'lucide-react'

const Subscription = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { 
    loading, 
    subscription, 
    limits, 
    plans, 
    loadSubscriptionData, 
    upgradeSubscription 
  } = useSubscription()

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) {
      loadSubscriptionData()
    }
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Abonelik bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const currentPlan = subscription?.plan_type || 'free'
  
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Abonelik Yönetimi</h1>
          <p className="text-xl text-muted-foreground">
            ScoreResultsAI'nın tüm özelliklerini keşfedin
          </p>
        </div>

        {/* Current Subscription Status */}
        {limits && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Mevcut Plan: {plans[currentPlan]?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{limits.daily_limit}</div>
                  <div className="text-sm text-muted-foreground">Günlük Limit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{limits.current_usage}</div>
                  <div className="text-sm text-muted-foreground">Bugün Kullanılan</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{limits.remaining_predictions}</div>
                  <div className="text-sm text-muted-foreground">Kalan Tahmin</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((limits.current_usage / limits.daily_limit) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Kullanım Oranı</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Günlük Kullanım</span>
                  <span>{limits.current_usage} / {limits.daily_limit}</span>
                </div>
                <Progress 
                  value={(limits.current_usage / limits.daily_limit) * 100} 
                  className="h-3" 
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(plans).map(([planKey, plan]) => {
            const isCurrentPlan = currentPlan === planKey
            const isPopular = planKey === 'basic'
            
            return (
              <Card 
                key={planKey} 
                className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''} ${
                  isPopular ? 'border-orange-200 dark:border-orange-800' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Popüler
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-3">
                    <Badge variant="default">Mevcut Plan</Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {planKey === 'pro' && <Crown className="h-5 w-5 text-yellow-500" />}
                    {planKey === 'basic' && <TrendingUp className="h-5 w-5 text-blue-500" />}
                    {planKey === 'free' && <Users className="h-5 w-5 text-gray-500" />}
                    {plan.name}
                  </CardTitle>
                  <CardDescription>
                    <div className="text-3xl font-bold">
                      {plan.price === 0 ? 'Ücretsiz' : `₺${plan.price}`}
                      {plan.price > 0 && <span className="text-sm font-normal">/{plan.interval}</span>}
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    {isCurrentPlan ? (
                      <Button variant="outline" className="w-full" disabled>
                        Mevcut Planınız
                      </Button>
                    ) : planKey === 'free' ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          // Downgrade logic would go here
                        }}
                      >
                        Bu Plana Geç
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => upgradeSubscription(planKey)}
                        disabled={loading}
                      >
                        {currentPlan === 'free' ? 'Yükselt' : 'Plan Değiştir'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Özellik Karşılaştırması</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Özellik</th>
                    <th className="text-center p-4">Ücretsiz</th>
                    <th className="text-center p-4">Temel</th>
                    <th className="text-center p-4">Profesyonel</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Günlük Tahmin Sayısı</td>
                    <td className="text-center p-4">5</td>
                    <td className="text-center p-4">25</td>
                    <td className="text-center p-4">100</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Lig Erişimi</td>
                    <td className="text-center p-4">5 Lig</td>
                    <td className="text-center p-4">Tüm Ligler</td>
                    <td className="text-center p-4">Tüm Ligler</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">AI Analiz</td>
                    <td className="text-center p-4">
                      <X className="h-4 w-4 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Gerçek Zamanlı Bildirimler</td>
                    <td className="text-center p-4">
                      <X className="h-4 w-4 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <X className="h-4 w-4 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Öncelikli Destek</td>
                    <td className="text-center p-4">
                      <X className="h-4 w-4 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <X className="h-4 w-4 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Sıkça Sorulan Sorular</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Planımı istediğim zaman değiştirebilir miyim?</h4>
              <p className="text-muted-foreground">
                Evet, planınızı istediğiniz zaman yükseltebilir veya düşürebilirsiniz. 
                Değişiklikler bir sonraki fatura döneminde geçerli olur.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Ödeme güvenli mi?</h4>
              <p className="text-muted-foreground">
                Tüm ödemeler Stripe üzerinden güvenli bir şekilde işlenir. 
                Kredi kartı bilgileriniz şifrelenir ve güvenle saklanır.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Günlük limitim dolduğunda ne olur?</h4>
              <p className="text-muted-foreground">
                Günlük limitiniz dolduğunda ertesi gün yeniden tahmin alabilirsiniz 
                veya planınızı yükselterek limitinizi artırabilirsiniz.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Subscription

// src/components/SubscriptionAlert.tsx - Component to show subscription alerts
import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Crown, TrendingUp } from 'lucide-react'

interface SubscriptionAlertProps {
  limits: {
    plan_type: string
    daily_limit: number
    current_usage: number
    remaining_predictions: number
  }
}

export const SubscriptionAlert: React.FC<SubscriptionAlertProps> = ({ limits }) => {
  const navigate = useNavigate()
  
  const usagePercentage = (limits.current_usage / limits.daily_limit) * 100
  
  if (limits.remaining_predictions <= 0) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-100">
                  Günlük Limitiniz Doldu
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Daha fazla tahmin için planınızı yükseltin
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/subscription')}
              className="bg-red-600 hover:bg-red-700"
            >
              Planı Yükselt
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (usagePercentage >= 80) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                  Limitinize Yaklaştınız
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {limits.remaining_predictions} tahmin hakkınız kaldı
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate('/subscription')}
              className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
            >
              Planları Gör
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (limits.plan_type === 'free') {
    return (
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  Daha Fazla Özellik Keşfedin
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Premium planlarla sınırsız tahmin ve AI analizi
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/subscription')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Yükselt
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return null
}