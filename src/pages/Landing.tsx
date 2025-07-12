import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ArrowRight, TrendingUp, Users, Trophy, Target, Star } from 'lucide-react'
import { leagues } from '../constants/leagues'
import { aiFeatures } from '../constants/features'

const headerMainPanoramic = '/images/header_main_panoramic.png'
const headerMinimal = '/images/header_minimal.png'

const Landing = () => {
  const navigate = useNavigate()

  const stats = [
    {
      label: 'Aktif Kullanıcı',
      value: '2,500+',
      icon: Users,
      color: 'text-foreground' // Dark enough for contrast
    },
    {
      label: 'Tahmin Doğruluğu',
      value: '%68',
      icon: Target,
      color: 'text-green-600'
    },
    {
      label: 'Desteklenen Lig',
      value: '180+',
      icon: Trophy,
      color: 'text-amber-600'
    },
    {
      label: 'Günlük Tahmin',
      value: '500+',
      icon: TrendingUp,
      color: 'text-foreground' // Dark enough for contrast
    }
  ]

  const testimonials = [
    {
      name: 'Ahmet Kolak',
      role: 'Futbol Analisti',
      content: 'ScoreResultsAI kullanıyorum evet tahminlerimin doğruluğu %52\'ye çıktı. Başarılı bir platform.',
      rating: 5
    },
    {
      name: 'Nazım Merter',
      role: 'Spor Bahis Uzmanı',
      content: 'AI analizleri çok detaylı ve güvenilir. Özellikle maç tahminleri başarılı.',
      rating: 5
    },
    {
      name: 'Pınar Demir',
      role: 'Kadın Futbol Antrenörü',
      content: 'Takımımın stratejisini geliştirmek için kullanıyorum, faydalı olduğunu düşünüyorum.',
      rating: 4
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-slate-50/95" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${headerMainPanoramic})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 backdrop-blur-sm" />
        
        <div className="relative container mx-auto text-center">
          <div className="glass-medium rounded-2xl px-6 py-3 inline-block mb-6">
            <Badge className="text-sm px-4 py-2 bg-white/80 border-slate-200 text-foreground">
              Yapay Zeka Destekli Futbol Analizi
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground drop-shadow-sm">
            Futbol Bahislerinizi{' '}
            <span className="text-foreground font-bold">
              AI ile Güçlendirin
            </span>
          </h1>
          
          <p className="text-xl text-foreground mb-8 max-w-3xl mx-auto font-medium">
            LLM modelleri ve API-Football verileri ile desteklenen gelişmiş tahmin sistemi.
            20+ ligden gerçek zamanlı verilerle %68+ doğruluk oranı.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="text-lg px-8 py-4 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Ücretsiz Dene
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/ai-analytics')}
              className="text-lg px-8 py-4 glass-button rounded-xl text-foreground border-border hover:border-muted-foreground transition-all duration-300 hover:scale-105"
            >
              AI Özellikleri
            </Button>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="glass-card rounded-2xl p-2 mx-auto max-w-4xl shadow-2xl">
              <img
                src={headerMinimal}
                alt="ScoreResultsAI Dashboard"
                className="w-full rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-background border-y border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center space-y-3 glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                  <div className="glass-medium rounded-xl p-3 inline-block">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Neden ScoreResultsAI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Modern teknolojiler ve yapay zeka ile futbol tahminlerinde yeni dönem
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiFeatures.slice(0, 6).map((feature) => (
              <Card key={feature.id} className="group glass-card hover:glass-card-hover transition-all duration-300 overflow-hidden border-white/20">
                <CardHeader className="pb-4">
                  <div className="relative h-40 mb-4 rounded-xl overflow-hidden glass-medium flex items-center justify-center">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-white/5" />
                  </div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <span className="text-2xl">{feature.icon}</span>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-medium">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.benefits.slice(0, 2).map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-foreground">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/ai-analytics')}
              className="glass-button rounded-xl text-slate-700 border-slate-300 hover:border-slate-400 transition-all duration-300 hover:scale-105 px-8 py-3"
            >
              Tüm AI Özelliklerini Gör
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Leagues Section */}
      <section id="leagues" className="scroll-mt-16 py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Desteklenen Ligler
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Dünyaçapında 20+ ligden gerçek zamanlı veriler
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {leagues.map((league) => (
              <Card
                key={league.id}
                className="group cursor-pointer glass-card hover:glass-card-hover transition-all duration-300 border-white/20"
                onClick={() => navigate(`/league/${league.id}`)}
              >
                <CardContent className="p-6 text-center">
                  <div className="relative h-24 mb-4 glass-medium rounded-xl p-3 flex items-center justify-center">
                    <img
                      src={league.logo}
                      alt={league.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold mb-1 text-foreground">{league.name}</h3>
                  <p className="text-sm text-muted-foreground">{league.country}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Kullanıcılarımız Ne Diyor?
            </h2>
            <p className="text-xl text-muted-foreground font-medium">
              Binlerce memnun kullanıcının deneyimleri
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative glass-card border-white/20 hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic font-medium">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden bg-slate-800">
        <div className="absolute inset-0" />
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Hemen Başlayın!
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            ScoreResultsAI ile futbol tahminlerinizi bir sonraki seviyeye taşıyın.
            Ücretsiz hesabınızı oluşturun ve AI'nın gücünü keşfedin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              onClick={() => navigate('/dashboard')}
              className="bg-white text-slate-900 rounded-xl hover:bg-slate-50 border border-slate-200 transition-all duration-300 hover:scale-105 shadow-xl px-8 py-4 font-semibold"
            >
              Ücretsiz Başla
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="xl"
              onClick={() => navigate('/about')}
              className="border border-white/30 text-white rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 px-8 py-4"
            >
              Daha Fazla Bilgi
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing