import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart3, 
  Users, 
  Target, 
  Globe,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle,
  Star,
  Layers,
  Database,
  Monitor,
  Settings,
  Network,
  TrendingUp,
  Award,
  Building
} from 'lucide-react'

const About = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Layers,
      title: 'Yapay Zeka Teknolojisi',
      description: '12 farklı LLM modeli ve gelişmiş makine öğrenimi algoritmaları',
      color: 'text-blue-400'
    },
    {
      icon: BarChart3,
      title: 'Veri Analizi',
      description: 'Milyonlarca veri noktasını gerçek zamanlı olarak işleme kapasitesi',
      color: 'text-green-400'
    },
    {
      icon: Target,
      title: 'Yüksek Doğruluk',
      description: '%78+ tahmin doğruluğu ile güvenilir sonuçlar',
      color: 'text-purple-400'
    },
    {
      icon: Globe,
      title: 'Küresel Kapsam',
      description: '180+ lig ve binlerce takımdan kapsamlı veri',
      color: 'text-blue-400'
    },
    {
      icon: Clock,
      title: 'Gerçek Zamanlı',
      description: 'Maç sırasında anlık tahmin güncellemeleri',
      color: 'text-orange-400'
    },
    {
      icon: Shield,
      title: 'Güvenli Platform',
      description: 'Veri güvenliği ve gizlilik en yüksek seviyede',
      color: 'text-green-400'
    }
  ]

  const team = [
    {
      name: 'Hasan Devecioğlu',
      role: 'Kurucu & CTO',
      expertise: 'Proje Yönetimi, Startup Geliştirme',
      description: '30+ yıl IT ve yazılım sektörü deneyimi'
    },
    {
      name: 'Erol Doğan',
      role: 'Baş Veri Bilimci',
      expertise: 'Makine Öğrenimi, Veri Bilimi',
      description: '5+ yıl AI/ML deneyimi'
    },
    {
      name: 'Anıl Kaya',
      role: 'Futbol Analisti',
      expertise: 'Taktik Analiz, Performans Ölçüm',
      description: 'Eski futbolcu'
    }
  ]

  const milestones = [
    {
      year: '2022',
      title: 'ScoreResultsAI Kuruldu',
      description: 'İlk AI futbol tahmin modelimizi geliştirdik'
    },
    {
      year: '2023',
      title: '10,000 Kullanıcı',
      description: 'Platform hızla büyüdü ve 10 bin kullanıcıya ulaştı'
    },
    {
      year: '2024',
      title: '20+ Lig Desteği',
      description: 'Küresel ölçekte lig desteğini genişlettik'
    },
    {
      year: '2025',
      title: '%68 Doğruluk Oranı',
      description: 'Sektörün en yüksek tahmin doğruluğuna ulaştık'
    }
  ]

  const stats = [
    { value: '2,500+', label: 'Aktif Kullanıcı' },
    { value: '%68', label: 'Ortalama Doğruluk' },
    { value: '20+', label: 'Desteklenen Lig' },
    { value: '500+', label: 'Günlük Tahmin' }
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 space-y-16">
        {/* Enhanced Hero Section */}
        <div className="py-16 text-center space-y-8">
          <div className="glass-medium rounded-2xl px-6 py-3 inline-block">
            <Badge className="bg-transparent border-border text-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Yapay Zeka Destekli Futbol Analizi
            </Badge>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground drop-shadow-2xl">
              <span className="text-transparent bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-200 dark:to-green-200 bg-clip-text">
                ScoreResultsAI
              </span>{' '}
              Hakkında
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
              Futbol dünyasını daha iyi anlamak ve tahmin etmek için 
              en gelişmiş yapay zeka teknolojilerini kullanıyoruz.
              <br />
              Veri bilimi ve makine öğrenimi ile futbol analizlerinde yeni standartlar belirliyoruz.
            </p>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center glass-card border-white/20 hover:scale-105 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm lg:text-base font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="glass-medium rounded-xl p-3">
                <Building className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Misyonumuz</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed font-medium">
              <p>
                ScoreResultsAI olarak, futbol severlere en doğru ve güvenilir 
                tahminleri sunmak için son teknoloji yapay zeka çözümlerini 
                geliştiriyoruz.
              </p>
              <p>
                Amacımız, futbol analizlerinde geleneksel yöntemleri 
                moderne taşıyarak, kullanıcılarımıza veri odaklı 
                içgörüler sağlamaktır.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Badge className="glass-button border-white/30 text-muted-foreground">Yapay Zeka</Badge>
                <Badge className="glass-button border-white/30 text-muted-foreground">Veri Bilimi</Badge>
                <Badge className="glass-button border-white/30 text-muted-foreground">Futbol Analizi</Badge>
                <Badge className="glass-button border-white/30 text-muted-foreground">Makine Öğrenimi</Badge>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="glass-card rounded-2xl p-2">
              <img 
                src="/images/card_data_analysis_3d.png" 
                alt="AI Analysis" 
                className="rounded-xl w-full"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Temel Özelliklerimiz</h2>
            <p className="text-xl text-muted-foreground">
              Platformumuzu diğerlerinden ayıran özellikler
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="glass-card border-white/20 hover:glass-card-hover group transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      <div className="glass-medium rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Enhanced Technology Section */}
        <div className="space-y-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="glass-medium rounded-xl p-3">
                <Settings className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Teknoloji Altyapımız</h2>
            </div>
            <p className="text-xl text-muted-foreground">
              En son teknolojilerle güçlendirilmiş platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4 glass-medium rounded-xl p-4">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-foreground">OpenRouter LLM Modelleri</span>
                </div>
                <div className="flex items-center gap-4 glass-medium rounded-xl p-4">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-foreground">API-Football Veri Entegrasyonu</span>
                </div>
                <div className="flex items-center gap-4 glass-medium rounded-xl p-4">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-foreground">Derin Öğrenme Analizleri</span>
                </div>
                <div className="flex items-center gap-4 glass-medium rounded-xl p-4">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-foreground">Gerçek Zamanlı İşleme</span>
                </div>
                <div className="flex items-center gap-4 glass-medium rounded-xl p-4">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-foreground">Büyük Veri Altyapısı</span>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/ai-analytics')} 
                size="lg"
                className="glass-medium border-white/30 text-foreground hover:border-white/50 transition-all duration-300 hover:scale-105"
              >
                AI Teknolojimizi Keşfedin
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="glass-card rounded-2xl p-2">
                <img 
                  src="/images/card_ml_advanced.png" 
                  alt="Machine Learning" 
                  className="rounded-xl w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Team Section */}
        <div className="space-y-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="glass-medium rounded-xl p-3">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Ekibimiz</h2>
            </div>
            <p className="text-xl text-muted-foreground">
              Deneyimli uzmanlardan oluşan güçlü takımımız
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="glass-card border-white/20 hover:glass-card-hover group transition-all duration-300">
                <CardHeader>
                  <div className="w-20 h-20 glass-medium rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-10 w-10 text-blue-400" />
                  </div>
                  <CardTitle className="text-center text-foreground">{member.name}</CardTitle>
                  <p className="text-center text-blue-400 font-medium">{member.role}</p>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <p className="font-medium text-foreground">{member.expertise}</p>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced Timeline Section */}
        <div className="space-y-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="glass-medium rounded-xl p-3">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Yolculuğumuz</h2>
            </div>
            <p className="text-xl text-muted-foreground">
              ScoreResultsAI'ın gelişim hikayesi
            </p>
          </div>
          
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6 items-start group">
                <div className="w-20 text-center">
                  <div className="w-14 h-14 glass-medium rounded-2xl flex items-center justify-center text-foreground font-bold mx-auto group-hover:scale-110 transition-transform duration-300">
                    {milestone.year.slice(-2)}
                  </div>
                </div>
                <Card className="flex-1 glass-card border-white/20 hover:glass-card-hover transition-all duration-300">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center space-y-8 py-16">
          <div className="glass-card border-white/20 rounded-3xl p-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Bizimle Başlayın</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              ScoreResultsAI'nın gücünü keşfedin ve futbol tahminlerinizi 
              bir sonraki seviyeye taşıyın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/dashboard')}
                className="glass-medium border-white/30 text-foreground hover:border-white/50 transition-all duration-300 hover:scale-105 px-8 py-3"
              >
                Hemen Başla
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/ai-analytics')}
                className="glass-button border-white/30 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 px-8 py-3"
              >
                AI Özelliklerini İncele
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About