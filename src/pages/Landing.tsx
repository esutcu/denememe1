import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  BarChart3, 
  Target, 
  Brain, 
  Shield, 
  Zap, 
  Trophy,
  ArrowRight,
  Check,
  Star,
  Users,
  TrendingUp,
  Clock,
  Globe
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { SUBSCRIPTION_PLANS, formatPrice } from '../constants/subscriptions'

const Landing = () => {
  const [activePlan, setActivePlan] = useState<keyof typeof SUBSCRIPTION_PLANS>('BASIC')

  const features = [
    {
      icon: Brain,
      title: 'AI Tahmin Sistemi',
      description: 'OpenRouter ve 12 farklı LLM modeli ile gelişmiş tahmin analizi'
    },
    {
      icon: Target,
      title: 'Yüksek Doğruluk',
      description: 'Son 5 maç verisi ve detaylı istatistiklerle %75+ doğruluk oranı'
    },
    {
      icon: Zap,
      title: 'Gerçek Zamanlı',
      description: 'API-Football ile anlık maç verileri ve canlı güncellemeler'
    },
    {
      icon: Shield,
      title: 'Risk Analizi',
      description: 'Detaylı risk faktörleri ve güven skorları ile bilinçli bahis'
    },
    {
      icon: Globe,
      title: 'Tüm Ligler',
      description: 'Süper Lig\'den Premier League\'e 180+ lig desteği'
    },
    {
      icon: Clock,
      title: '7/24 Analiz',
      description: 'Haftalık otomatik tahmin üretimi ve cache sistemi'
    }
  ]

  const stats = [
    { label: 'Aktif Kullanıcı', value: '2,500+' },
    { label: 'Tahmin Doğruluğu', value: '%78' },
    { label: 'Desteklenen Lig', value: '180+' },
    { label: 'Günlük Tahmin', value: '500+' }
  ]

  const testimonials = [
    {
      name: 'Mehmet K.',
      role: 'Profesyonel Bahisçi',
      content: 'ScoreResultsAI sayesinde bahis stratejimi tamamen değiştirdim. Risk analizi harika!',
      rating: 5
    },
    {
      name: 'Ayşe M.',
      role: 'Futbol Analisti',
      content: 'LLM tabanlı tahmin sistemi gerçekten etkileyici. Sürekli kullanıyorum.',
      rating: 5
    },
    {
      name: 'Can D.',
      role: 'Spor Blogger',
      content: 'Blog yazılarım için mükemmel veri kaynağı. Detaylı analizler harika.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                ScoreResultsAI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth/login">
                <Button variant="ghost">Giriş Yap</Button>
              </Link>
              <Link to="/auth/register">
                <Button>Hemen Başla</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-background to-muted">
        <div className="container mx-auto text-center">
          <Badge variant="outline" className="mb-6">
            🚀 Yapay Zeka Destekli Futbol Analizi
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Futbol Bahislerinizi{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              AI ile Güçlendirin
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            OpenRouter LLM modelleri ve API-Football verileri ile desteklenen gelişmiş tahmin sistemi. 
            180+ ligden gerçek zamanlı verilerle %75+ doğruluk oranı.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button size="lg" className="text-lg px-8">
                Ücretsiz Dene
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="#pricing">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Fiyatları İncele
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Neden ScoreResultsAI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Modern teknolojiler ve yapay zeka ile futbol tahminlerinde yeni dönem
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              3 basit adımda profesyonel futbol analizine ulaşın
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Kayıt Olun</h3>
              <p className="text-muted-foreground">
                Hızlı kayıt işlemi ile hesabınızı oluşturun ve paketinizi seçin
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Maç Seçin</h3>
              <p className="text-muted-foreground">
                İstediğiniz ligden maç seçin ve AI analizi talep edin
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Tahmin Alın</h3>
              <p className="text-muted-foreground">
                Detaylı AI analizi, risk faktörleri ve güven skorları ile tahmin
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Size Uygun Paketi Seçin
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              İhtiyacınıza göre esnek paket seçenekleri
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => (
              <Card 
                key={planId} 
                className={`relative ${plan.id === 'basic' ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.id === 'basic' && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Popüler
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price === 0 ? 'Ücretsiz' : formatPrice(plan.price)}
                    {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/ay</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={plan.price === 0 ? "/auth/register" : "/subscription/pricing"}>
                    <Button 
                      className="w-full" 
                      variant={plan.id === 'basic' ? 'default' : 'outline'}
                    >
                      {plan.price === 0 ? 'Hemen Başla' : 'Satın Al'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kullanıcılarımız Ne Diyor?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Futbol Bahislerinizi Bir Sonraki Seviyeye Taşıyın
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Yapay zeka destekli analizlerle daha bilinçli bahisler yapın
          </p>
          <Link to="/auth/register">
            <Button size="lg" className="text-lg px-8">
              Hemen Ücretsiz Deneyin
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold">ScoreResultsAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI destekli futbol tahmin platformu
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Ürün</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#features" className="hover:text-foreground">Özellikler</Link></li>
                <li><Link to="#pricing" className="hover:text-foreground">Fiyatlar</Link></li>
                <li><Link to="/auth/register" className="hover:text-foreground">Ücretsiz Deneme</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Destek</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:support@scoreresultsai.com" className="hover:text-foreground">İletişim</a></li>
                <li><Link to="/help" className="hover:text-foreground">Yardım</Link></li>
                <li><Link to="/docs" className="hover:text-foreground">Dokümantasyon</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Yasal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground">Gizlilik</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">Şartlar</Link></li>
                <li><Link to="/cookies" className="hover:text-foreground">Çerezler</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 ScoreResultsAI. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing