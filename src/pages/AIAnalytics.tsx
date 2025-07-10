// src/pages/AIAnalytics.tsx - Güncel ve tam dosya
import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  Brain, 
  BarChart3, 
  Target, 
  Zap, 
  Eye, 
  TrendingUp,
  ChevronRight,
  Play,
  Pause,
  Activity,
  Cpu,
  Database,
  ArrowRight,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Network
} from 'lucide-react'
import { aiFeatures } from '../constants/features'
import './AIAnalytics.css'
import { useNavigate } from 'react-router-dom'

// Performance metrics - component dışında tanımlandı
const performanceMetrics = [
  { 
    label: 'Genel Doğruluk', 
    value: 78, 
    progressClass: 'progress-green',
    dotClass: 'dot-green',
    widthClass: 'progress-width-78'
  },
  { 
    label: 'Premier League', 
    value: 85, 
    progressClass: 'progress-blue',
    dotClass: 'dot-blue',
    widthClass: 'progress-width-85'
  },
  { 
    label: 'Süper Lig', 
    value: 82, 
    progressClass: 'progress-red',
    dotClass: 'dot-red',
    widthClass: 'progress-width-82'
  },
  { 
    label: 'Bundesliga', 
    value: 80, 
    progressClass: 'progress-yellow',
    dotClass: 'dot-yellow',
    widthClass: 'progress-width-80'
  },
  { 
    label: 'Serie A', 
    value: 77, 
    progressClass: 'progress-green-dark',
    dotClass: 'dot-green-dark',
    widthClass: 'progress-width-77'
  },
  { 
    label: 'La Liga', 
    value: 79, 
    progressClass: 'progress-orange',
    dotClass: 'dot-orange',
    widthClass: 'progress-width-79'
  }
]

// Target widths - component dışında sabit değer
const TARGET_WIDTHS = [78, 85, 82, 80, 77, 79]

const AIAnalytics = () => {
  const [selectedFeature, setSelectedFeature] = useState(aiFeatures[0])
  const [activeTab, setActiveTab] = useState('overview')
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [progressWidthClasses, setProgressWidthClasses] = useState<string[]>(
    Array(6).fill('progress-width-0')
  )
  const videoRef = useRef<HTMLVideoElement>(null)
  const navigate = useNavigate()

  // Progress bar animasyonu için
  React.useEffect(() => {
    if (activeTab === 'performance') {
      console.log('📊 Performance tab açıldı, progress bar animasyonu başlıyor...')
      
      // İlk başta tüm bar'ları 0 yap
      setProgressWidthClasses(Array(6).fill('progress-width-0'))
      
      // 300ms gecikme ile başlat, sonra sırayla doldur
      setTimeout(() => {
        TARGET_WIDTHS.forEach((width, index) => {
          setTimeout(() => {
            console.log(`🎯 Bar ${index + 1} dolduruluyor: ${width}% (${`progress-width-${width}`})`)
            setProgressWidthClasses(prev => {
              const newClasses = [...prev]
              newClasses[index] = `progress-width-${width}`
              return newClasses
            })
          }, index * 150) // Her bar 150ms arayla dolsun
        })
      }, 300) // İlk gecikmesi
    }
  }, [activeTab]) // activeTab dependency'si yeterli
  React.useEffect(() => {
    console.log('🎨 AI Analytics renkleri yükleniyor...')
    console.log('📊 Metrikler:', performanceMetrics)
    
    const styleElement = document.createElement('style')
    styleElement.innerHTML = `
      .performance-metrics [data-color="progress-green"],
      .progress-green { 
        background: linear-gradient(90deg, #10b981, #059669) !important; 
        background-color: #10b981 !important;
        background-image: linear-gradient(90deg, #10b981, #059669) !important;
      }
      .performance-metrics [data-color="progress-blue"],
      .progress-blue { 
        background: linear-gradient(90deg, #3b82f6, #2563eb) !important; 
        background-color: #3b82f6 !important;
        background-image: linear-gradient(90deg, #3b82f6, #2563eb) !important;
      }
      .performance-metrics [data-color="progress-red"],
      .progress-red { 
        background: linear-gradient(90deg, #ef4444, #dc2626) !important; 
        background-color: #ef4444 !important;
        background-image: linear-gradient(90deg, #ef4444, #dc2626) !important;
      }
      .performance-metrics [data-color="progress-yellow"],
      .progress-yellow { 
        background: linear-gradient(90deg, #eab308, #ca8a04) !important; 
        background-color: #eab308 !important;
        background-image: linear-gradient(90deg, #eab308, #ca8a04) !important;
      }
      .performance-metrics [data-color="progress-green-dark"],
      .progress-green-dark { 
        background: linear-gradient(90deg, #059669, #047857) !important; 
        background-color: #059669 !important;
        background-image: linear-gradient(90deg, #059669, #047857) !important;
      }
      .performance-metrics [data-color="progress-orange"],
      .progress-orange { 
        background: linear-gradient(90deg, #f97316, #ea580c) !important; 
        background-color: #f97316 !important;
        background-image: linear-gradient(90deg, #f97316, #ea580c) !important;
      }
      .dot-green { background-color: #10b981 !important; }
      .dot-blue { background-color: #3b82f6 !important; }
      .dot-red { background-color: #ef4444 !important; }
      .dot-yellow { background-color: #eab308 !important; }
      .dot-green-dark { background-color: #059669 !important; }
      .dot-orange { background-color: #f97316 !important; }
    `
    document.head.appendChild(styleElement)
    console.log('✅ Stil eklendi:', styleElement.innerHTML.length, 'karakter')
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement)
      }
    }
  }, [])

  const aiCapabilities = [
    {
      title: 'Neural Network Modelleri',
      description: '12 farklı LLM modeli ile gelişmiş tahmin sistemi',
      icon: Brain,
      metrics: ['Model Sayısı: 12', 'Doğruluk: %68+', 'Hız: <100ms']
    },
    {
      title: 'Gerçek Zamanlı Analiz',
      description: 'Maç sırasında anlık veri işleme ve tahmin güncelleme',
      icon: Activity,
      metrics: ['Gecikme: <50ms', 'Güncelleme: 30sn', 'Kapsam: 20+ lig']
    },
    {
      title: 'Büyük Veri İşleme',
      description: 'Milyonlarca veri noktasını süratle analiz etme kapasitesi',
      icon: Database,
      metrics: ['Veri Noktası: 10M+', 'İşleme: 1M/sn', 'Depolama: 500TB']
    },
    {
      title: 'Akıllı Algoritmalar',
      description: 'Öğrenen ve gelişen AI algoritmalari ile sürekli iyileşme',
      icon: Cpu,
      metrics: ['Öğrenme: Sürekli', 'Optimizasyon: Otomatik', 'Uyarlama: Dinamik']
    }
  ]

  const performanceMetrics = [
    { 
      label: 'Genel Doğruluk', 
      value: 78, 
      progressClass: 'progress-green',
      dotClass: 'dot-green',
      progressColor: 'linear-gradient(90deg, #10b981, #059669)',
      dotColor: '#10b981'
    },
    { 
      label: 'Premier League', 
      value: 85, 
      progressClass: 'progress-blue',
      dotClass: 'dot-blue',
      progressColor: 'linear-gradient(90deg, #3b82f6, #2563eb)',
      dotColor: '#3b82f6'
    },
    { 
      label: 'Süper Lig', 
      value: 82, 
      progressClass: 'progress-red',
      dotClass: 'dot-red',
      progressColor: 'linear-gradient(90deg, #ef4444, #dc2626)',
      dotColor: '#ef4444'
    },
    { 
      label: 'Bundesliga', 
      value: 80, 
      progressClass: 'progress-yellow',
      dotClass: 'dot-yellow',
      progressColor: 'linear-gradient(90deg, #eab308, #ca8a04)',
      dotColor: '#eab308'
    },
    { 
      label: 'Serie A', 
      value: 77, 
      progressClass: 'progress-green-dark',
      dotClass: 'dot-green-dark',
      progressColor: 'linear-gradient(90deg, #059669, #047857)',
      dotColor: '#059669'
    },
    { 
      label: 'La Liga', 
      value: 79, 
      progressClass: 'progress-orange',
      dotClass: 'dot-orange',
      progressColor: 'linear-gradient(90deg, #f97316, #ea580c)',
      dotColor: '#f97316'
    }
  ]

  const handlePlayDemo = () => {
    setShowVideo(true)
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play()
        setIsVideoPlaying(true)
      }
    }, 100)
  }

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause()
        setIsVideoPlaying(false)
      } else {
        videoRef.current.play()
        setIsVideoPlaying(true)
      }
    }
  }

  const handleCloseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
    setIsVideoPlaying(false)
    setShowVideo(false)
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-slate-700 dark:text-slate-300" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              AI Analitik Merkezi
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Yapay zeka teknolojimizin gücünü keşfedin. Gelişmiş algoritmalar ve makine öğrenimi 
            modelleri ile futbol analizlerinde çığır açan çözümler.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="features">AI Özellikleri</TabsTrigger>
            <TabsTrigger value="performance">Performans</TabsTrigger>
            <TabsTrigger value="technology">Teknoloji</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src="/images/header_main_panoramic.png" 
                alt="AI Analytics" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold mb-4">Yapay Zeka Destekli Futbol Analizi</h2>
                  <p className="text-lg mb-6">Gelişmiş algoritmalarmız her gün milyonlarca veri noktasını analiz ediyor</p>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={handlePlayDemo}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Demo İzle
                  </Button>
                </div>
              </div>
            </div>

            {/* AI Capabilities */}
            <div className="grid md:grid-cols-2 gap-6">
              {aiCapabilities.map((capability, index) => {
                const Icon = capability.icon
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        {capability.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {capability.description}
                      </p>
                      <div className="space-y-2">
                        {capability.metrics.map((metric, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-sm">{metric}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Feature List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">AI Özellikleri</h3>
                {aiFeatures.map((feature) => (
                  <Card 
                    key={feature.id}
                    className={`cursor-pointer transition-all ${
                      selectedFeature.id === feature.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                    onClick={() => setSelectedFeature(feature)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white text-xl flex-shrink-0`}>
                          {feature.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">{feature.description}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Feature Details */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${selectedFeature.color} flex items-center justify-center text-white text-2xl`}>
                        {selectedFeature.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{selectedFeature.title}</CardTitle>
                        <p className="text-muted-foreground mt-1">{selectedFeature.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Feature Image - FIX: Resmi kare içine tam oturtma */}
                    <div className="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video">
                      <img 
                        src={selectedFeature.image} 
                        alt={selectedFeature.title}
                        className="w-full h-full object-contain" /* object-cover yerine object-contain */
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.png'; // Fallback image
                        }}
                      />
                    </div>

                    {/* Benefits */}
                    <div>
                      <h4 className="font-semibold mb-3">Temel Avantajlar</h4>
                      <div className="space-y-2">
                        {selectedFeature.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full" onClick={() => navigate('/dashboard')}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Şimdi Dene
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-8">
            {/* Performance Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Genel Doğruluk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">%78.4</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    +2.3% bu ay
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    İşlenen Maç
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">12,458</div>
                  <div className="text-sm text-muted-foreground">Son 30 gün</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Ortalama Hız
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">89ms</div>
                  <div className="text-sm text-muted-foreground">Tahmin süresi</div>
                </CardContent>
              </Card>
            </div>

            {/* League Performance - GÜNCELLENMIŞ BÖLÜM */}
            <Card className="progress-bar-container performance-metrics">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Lig Bazında Performans
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Her lig için tahmin doğruluk oranları
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-base">{metric.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xl">%{metric.value}</span>
                          <div className={`w-3 h-3 rounded-full ${metric.dotClass}`} />
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full progress-bar-glow relative progress-transition ${metric.progressClass} ${progressWidthClasses[index]}`}
                          data-color={metric.progressClass}
                        >
                          {/* İç gölge efekti */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
                        </div>
                      </div>
                      
                      {/* Ek metrik bilgisi */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Hedef: %75</span>
                        <div className="flex items-center gap-1">
                          {metric.value >= 75 ? (
                            <>
                              <span className="text-green-600 font-medium">Hedef Aşıldı</span>
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            </>
                          ) : (
                            <>
                              <span className="text-orange-600 font-medium">Hedef Altında</span>
                              <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Performans özeti */}
                <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {performanceMetrics.filter(m => m.value >= 80).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Mükemmel</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {performanceMetrics.filter(m => m.value >= 75 && m.value < 80).length}
                      </div>
                      <div className="text-xs text-muted-foreground">İyi</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {performanceMetrics.filter(m => m.value < 75).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Geliştirilmeli</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(performanceMetrics.reduce((acc, m) => acc + m.value, 0) / performanceMetrics.length)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Ortalama</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technology Tab */}
          <TabsContent value="technology" className="space-y-8">
            {/* Tech Stack */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Makine Öğrenimi Modelleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">LLM Topluluğu</div>
                      <div className="text-sm text-muted-foreground">12 farklı dil modeli kombinasyonu</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Yapay Sinir Ağı Sınıflandırıcısı</div>
                      <div className="text-sm text-muted-foreground">Derin öğrenme sınıflandırıcısı</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Rastgele Orman Regresyon Modeli</div>
                      <div className="text-sm text-muted-foreground">Model öğrenme algoritması</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Aşamalı Artırma (Gradient Boosting) Yöntemi</div>
                      <div className="text-sm text-muted-foreground">Adaptif artyrılmış öğrenme</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Veri Kaynakları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">API-Football</div>
                      <div className="text-sm text-muted-foreground">Gerçek zamanlı maç verileri</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Tarihsel Veritabanı</div>
                      <div className="text-sm text-muted-foreground">10+ yıllık geçmiş verileri</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Oyuncu İstatistikleri</div>
                      <div className="text-sm text-muted-foreground">Oyuncu performans metrikleri</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Takım Analitiği</div>
                      <div className="text-sm text-muted-foreground">Takım taktik analizleri</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Architecture Diagram */}
            <Card>
              <CardHeader>
                <CardTitle>Sistem Mimarisi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                      <Database className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold">Veri Toplama</h4>
                    <p className="text-sm text-muted-foreground">API-Football ve geçmiş veri kaynaklarından gerçek zamanlı veri toplama</p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                      <Brain className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold">AI İşleme</h4>
                    <p className="text-sm text-muted-foreground">LLM modelleri ve makine öğrenimi algoritmaları ile veri analizi</p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold">Tahmin Üretimi</h4>
                    <p className="text-sm text-muted-foreground">Yüksek doğrulukla maç sonucu tahminleri ve güvenilirlik skorları</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Video Modal */}
        {showVideo && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  controls
                  poster="/images/video-thumbnail.jpg"
                >
                  <source src="/videos/ai_analytics_demo.mp4" type="video/mp4" />
                  Tarayıcınız video elementini desteklemiyor.
                </video>
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleVideoToggle}
                    className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                  >
                    {isVideoPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8" />
                    )}
                  </Button>
                </div>
                
                {/* Close Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCloseVideo}
                  className="absolute top-4 right-4 bg-black/50 text-white border-white/30 hover:bg-black/70"
                >
                  ✕
                </Button>
              </div>
              
              <div className="text-center mt-4">
                <h3 className="text-white text-lg font-semibold mb-2">
                  AI Analytics Demo
                </h3>
                <p className="text-gray-300 text-sm">
                  Yapay zeka destekli futbol analiz sistemimizin çalışma prensiplerini görün
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIAnalytics