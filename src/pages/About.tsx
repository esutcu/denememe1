import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { 
  Brain, 
  BarChart3, 
  Users, 
  Zap, 
  Target, 
  Globe,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'

const About = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Brain,
      title: 'Yapay Zeka Teknolojisi',
      description: '12 farklı LLM modeli ve gelişmiş makine öğrenimi algoritmaları',
      color: 'text-blue-500'
    },
    {
      icon: BarChart3,
      title: 'Veri Analizi',
      description: 'Milyonlarca veri noktasını gerçek zamanlı olarak işleme kapasitesi',
      color: 'text-green-500'
    },
    {
      icon: Target,
      title: 'Yüksek Doğruluk',
      description: '%78+ tahmin doğruluğu ile güvenilir sonuçlar',
      color: 'text-red-500'
    },
    {
      icon: Globe,
      title: 'Küresel Kapsam',
      description: '180+ lig ve binlerce takımdan kapsamlı veri',
      color: 'text-purple-500'
    },
    {
      icon: Clock,
      title: 'Gerçek Zamanlı',
      description: 'Maç sırasında anlık tahmin güncellemeleri',
      color: 'text-orange-500'
    },
    {
      icon: Shield,
      title: 'Güvenli Platform',
      description: 'Veri güvenliği ve gizlilik en yüksek seviyede',
      color: 'text-teal-500'
    }
  ]

  const team = [
    {
      name: 'Dr. Ahmet Yılmaz',
      role: 'Kurucu & CTO',
      expertise: 'Makine Öğrenimi, Veri Bilimi',
      description: '15+ yıl AI/ML deneyimi'
    },
    {
      name: 'Ayşe Demir',
      role: 'Baş Veri Bilimci',
      expertise: 'Spor Analitiği, Neural Networks',
      description: 'FIFA ve UEFA projelerinde çalıştı'
    },
    {
      name: 'Mehmet Kaya',
      role: 'Futbol Analisti',
      expertise: 'Taktik Analiz, Performans Ölçüm',
      description: 'Eski profesyonel futbolcu'
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
      title: '180+ Lig Desteği',
      description: 'Küresel ölçekte lig desteğini genişlettik'
    },
    {
      year: '2025',
      title: '%78 Doğruluk Oranı',
      description: 'Sektörün en yüksek tahmin doğruluğuna ulaştık'
    }
  ]

  const stats = [
    { value: '2,500+', label: 'Aktif Kullanıcı' },
    { value: '%78', label: 'Ortalama Doğruluk' },
    { value: '180+', label: 'Desteklenen Lig' },
    { value: '500+', label: 'Günlük Tahmin' }
  ]

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-800 dark:text-blue-200 text-sm font-medium">
            <Star className="h-4 w-4" />
            Yapay Zeka Destekli Futbol Analizi
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="text-slate-900 dark:text-slate-100 font-bold">
              ScoreResultsAI
            </span>{' '}
            Hakkında
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Futbol dünyasını daha iyi anlamak ve tahmin etmek için 
            en gelişmiş yapay zeka teknolojilerini kullanıyoruz.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Misyonumuz</h2>
            <div className="space-y-4 text-muted-foreground">
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
              <div className="flex flex-wrap gap-2 mt-6">
                <Badge>Yapay Zeka</Badge>
                <Badge>Veri Bilimi</Badge>
                <Badge>Futbol Analizi</Badge>
                <Badge>Makine Öğrenimi</Badge>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="/images/card_data_analysis_3d.png" 
              alt="AI Analysis" 
              className="rounded-lg shadow-2xl"
            />
            <div className="absolute inset-0 bg-slate-900/20 rounded-lg" />
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Temel Özelliklerimiz</h2>
            <p className="text-xl text-muted-foreground">
              Platformumuzu diğerlerinden ayıran özellikler
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
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

        {/* Technology Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Teknoloji Altyapımız</h2>
            <p className="text-xl text-muted-foreground">
              En son teknolojilerle güçlendirilmiş platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">OpenRouter LLM Modelleri</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">API-Football Veri Entegrasyonu</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Neural Network Analizleri</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Gerçek Zamanlı İşleme</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Büyük Veri Altyapısı</span>
                </div>
              </div>
              
              <Button onClick={() => navigate('/ai-analytics')} size="lg">
                AI Teknolojimizi Keşfedin
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative">
              <img 
                src="/images/card_ml_advanced.png" 
                alt="Machine Learning" 
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-slate-900/20 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ekibimiz</h2>
            <p className="text-xl text-muted-foreground">
              Deneyimli uzmanlardan oluşan güçlü takımımız
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="w-16 h-16 bg-slate-700 dark:bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-center">{member.name}</CardTitle>
                  <p className="text-center text-muted-foreground">{member.role}</p>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <p className="font-medium">{member.expertise}</p>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Yolculuğumuz</h2>
            <p className="text-xl text-muted-foreground">
              ScoreResultsAI'ın gelişim hikayesi
            </p>
          </div>
          
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="w-20 text-center">
                  <div className="w-12 h-12 bg-slate-700 dark:bg-slate-600 rounded-full flex items-center justify-center text-white font-bold mx-auto">
                    {milestone.year.slice(-2)}
                  </div>
                </div>
                <Card className="flex-1">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-bold">Bizimle Başlayın</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ScoreResultsAI'nın gücünü keşfedin ve futbol tahminlerinizi 
            bir sonraki seviyeye taşıyın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              Hemen Başla
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/ai-analytics')}>
              AI Özelliklerini İncele
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About