import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ArrowRight, TrendingUp, Users, Trophy, Target, Star } from 'lucide-react'
import { leagues } from '../constants/leagues'
import { aiFeatures } from '../constants/features'

const headerMainPanoramic = '/denememe/images/header_main_panoramic.png'
const headerMinimal = '/denememe/images/header_minimal.png'

const Landing = () => {
  const navigate = useNavigate()

  const stats = [
    {
      label: 'Aktif Kullanıcı',
      value: '2,500+',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      label: 'Tahmin Doğruluğu',
      value: '%68',
      icon: Target,
      color: 'text-green-500'
    },
    {
      label: 'Desteklenen Lig',
      value: '180+',
      icon: Trophy,
      color: 'text-purple-500'
    },
    {
      label: 'Günlük Tahmin',
      value: '500+',
      icon: TrendingUp,
      color: 'text-orange-500'
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
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${headerMainPanoramic})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <div className="relative container mx-auto text-center">
          <Badge className="mb-6 text-sm px-4 py-2">
            Yapay Zeka Destekli Futbol Analizi
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Futbol Bahislerinizi{' '}
            <span className="text-slate-900 dark:text-slate-100 font-bold">
              AI ile Güçlendirin
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            LLM modelleri ve API-Football verileri ile desteklenen gelişmiş tahmin sistemi.
            20+ ligden gerçek zamanlı verilerle %68+ doğruluk oranı.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="text-lg px-8 py-3"
            >
              Ücretsiz Dene
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/ai-analytics')}
              className="text-lg px-8 py-3"
            >
              AI Özellikleri
            </Button>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <img
              src={headerMinimal}
              alt="ScoreResultsAI Dashboard"
              className="mx-auto rounded-lg shadow-2xl max-w-4xl w-full"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center space-y-2">
                  <Icon className={`h-8 w-8 mx-auto ${stat.color}`} />
                  <div className="text-3xl md:text-4xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 px-4">
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
            {aiFeatures.slice(0, 6).map((feature) => (
              <Card key={feature.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="relative h-40 mb-4 rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-100/20 dark:bg-slate-800/20" />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{feature.icon}</span>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.benefits.slice(0, 2).map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
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
            >
              Tüm AI Özelliklerini Gör
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Leagues Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Desteklenen Ligler
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Dünyaçapında 20+ ligden gerçek zamanlı veriler
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {leagues.map((league) => (
              <Card
                key={league.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => navigate(`/league/${league.id}`)}
              >
                <CardContent className="p-6 text-center">
                  <div className="relative h-24 mb-4">
                    <img
                      src={league.logo}
                      alt={league.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold mb-1">{league.name}</h3>
                  <p className="text-sm text-muted-foreground">{league.country}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kullanıcılarımız Ne Diyor?
            </h2>
            <p className="text-xl text-muted-foreground">
              Binlerce memnun kullanıcının deneyimleri
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-800 dark:bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Hemen Başlayın!
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            ScoreResultsAI ile futbol tahminlerinizi bir sonraki seviyeye taşıyın.
            Ücretsiz hesabınızı oluşturun ve AI'nın gücünü keşfedin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              variant="secondary"
              onClick={() => navigate('/dashboard')}
            >
              Ücretsiz Başla
              <ArrowRight />
            </Button>
            <Button
              size="xl"
              variant="outline-light"
              onClick={() => navigate('/about')}
            >
              Daha Fazla Bilgi
              <ArrowRight />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing