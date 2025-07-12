// src/pages/AIAnalytics.tsx - Güncel ve tam dosya
import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  BarChart3, 
  Target, 
  TrendingUp,
  ChevronRight,
  Play,
  Pause,
  Activity,
  Database,
  ArrowRight,
  CheckCircle,
  Network,
  Layers,
  Settings,
  Monitor,
  Gauge,
  PieChart,
  LineChart,
  Workflow,
  Shield,
  Server
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
      console.log(' Performance tab açıldı, progress bar animasyonu başlıyor...')
      
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
    console.log(' AI Analytics renkleri yükleniyor...')
    console.log(' Metrikler:', performanceMetrics)
    
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
      title: 'Derin Öğrenme Modelleri',
      description: '12 farklı LLM modeli ile gelişmiş tahmin sistemi',
      icon: Layers,
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
      title: 'Makine Öğrenimi Algoritmaları',
      description: 'Öğrenen ve gelişen AI algoritmaları ile sürekli iyileşme',
      icon: Settings,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Enhanced Professional Header */}
        <div className="py-6 sm:py-8 lg:py-12 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 glass-medium rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 max-w-full">
            <div className="bg-slate-100 rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0">
              <Layers className="h-6 w-6 sm:h-8 sm:w-8 text-slate-700" />
            </div>
            <div className="text-left min-w-0">
              <h1 className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-800 leading-tight">
                Yapay Zeka Analiz Merkezi
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm truncate">AI Analytics Center</p>
            </div>
          </div>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
            Gelişmiş makine öğrenimi modelleri ve büyük veri analizi ile 
            futbol tahminlerinde yeni nesil çözümler sunuyoruz.
          </p>
        </div>

        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 glass-card-light border-border rounded-lg overflow-hidden">
              <TabsTrigger 
                value="overview"
                className="text-slate-700 data-[state=active]:glass-medium-light data-[state=active]:text-slate-900 data-[state=active]:border-white/40 text-xs sm:text-sm lg:text-base font-medium px-2 py-2 truncate"
              >
                <span className="hidden sm:inline">Genel Bakış</span>
                <span className="sm:hidden">Genel</span>
              </TabsTrigger>
              <TabsTrigger 
                value="features"
                className="text-slate-700 data-[state=active]:glass-medium-light data-[state=active]:text-slate-900 data-[state=active]:border-white/40 text-xs sm:text-sm lg:text-base font-medium px-2 py-2 truncate"
              >
                <span className="hidden sm:inline">AI Özellikleri</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger 
                value="performance"
                className="text-slate-700 data-[state=active]:glass-medium-light data-[state=active]:text-slate-900 data-[state=active]:border-white/40 text-xs sm:text-sm lg:text-base font-medium px-2 py-2 truncate"
              >
                Performans
              </TabsTrigger>
              <TabsTrigger 
                value="technology"
                className="text-slate-700 data-[state=active]:glass-medium-light data-[state=active]:text-slate-900 data-[state=active]:border-white/40 text-xs sm:text-sm lg:text-base font-medium px-2 py-2 truncate"
              >
                <span className="hidden sm:inline">Teknoloji</span>
                <span className="sm:hidden">Tek</span>
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Modern Hero Section */}
              <div className="relative glass-card-light border-border rounded-2xl overflow-hidden shadow-lg">
                <div className="absolute inset-0">
                  <img 
                    src="/images/header_main_panoramic.png" 
                    alt="AI Analytics" 
                    className="w-full h-full object-cover opacity-30"
                  />
                  <div className="absolute inset-0 bg-slate-800/20" />
                </div>
                <div className="relative z-10 p-4 sm:p-6 lg:p-12 text-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 inline-block mb-4 sm:mb-6 max-w-full mx-2">
                    <Monitor className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-slate-700 mx-auto mb-3 sm:mb-4" />
                    <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-3 sm:mb-4 text-slate-800 leading-tight px-2">
                      Yapay Zeka Destekli Futbol Analizi
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 max-w-2xl px-2 leading-relaxed">
                      Gelişmiş makine öğrenimi modelleri her gün milyonlarca veri noktasını analiz ederek
                      %68+ doğruluk oranıyla tahminler üretiyor
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
                      <Button 
                        onClick={handlePlayDemo}
                        className="bg-slate-800 text-foreground hover:bg-slate-700 transition-all duration-300 w-full sm:w-auto"
                        size="default"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        <span className="truncate">Demoyu İzle</span>
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/dashboard')}
                        className="border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-300 w-full sm:w-auto"
                        size="default"
                      >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        <span className="truncate">Hemen Başlayın</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced AI Capabilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {aiCapabilities.map((capability, index) => {
                  const Icon = capability.icon
                  return (
                    <Card key={index} className="glass-card-light border-border hover:glass-card-hover-light group transition-all duration-300">
                      <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="flex items-center gap-2 sm:gap-3 text-slate-800 text-base sm:text-lg">
                          <div className="glass-medium-light rounded-lg sm:rounded-xl p-2 sm:p-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" />
                          </div>
                          <span className="leading-tight">{capability.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                          {capability.description}
                        </p>
                        <div className="space-y-2 sm:space-y-3">
                          {capability.metrics.map((metric, idx) => (
                            <div key={idx} className="flex items-center gap-2 sm:gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">{metric}</span>
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
            <TabsContent value="features" className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Feature List */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-slate-800">AI Özellikleri</h3>
                  {aiFeatures.map((feature) => (
                    <Card 
                      key={feature.id}
                      className={`cursor-pointer transition-all ${
                        selectedFeature.id === feature.id 
                          ? 'ring-2 ring-emerald-400 glass-medium-light' 
                          : 'glass-card-light hover:glass-card-hover-light border-border'
                      }`}
                      onClick={() => setSelectedFeature(feature)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${feature.color} flex items-center justify-center text-slate-700 text-lg sm:text-xl flex-shrink-0`}>
                            {feature.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base truncate text-slate-800">{feature.title}</h4>
                            <p className="text-xs sm:text-sm text-slate-600 truncate">{feature.description}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Selected Feature Details */}
                <div className="lg:col-span-2">
                  <Card className="h-full glass-card-light border-border">
                    <CardHeader className="pb-3 sm:pb-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl bg-gradient-to-r ${selectedFeature.color} flex items-center justify-center text-foreground text-xl sm:text-2xl flex-shrink-0`}>
                          {selectedFeature.icon}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-lg sm:text-xl lg:text-2xl text-slate-800 leading-tight">{selectedFeature.title}</CardTitle>
                          <p className="text-slate-600 mt-1 text-sm sm:text-base leading-relaxed">{selectedFeature.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6 pt-0">
                      {/* Feature Image - FIX: Resmi kare içine tam oturtma */}
                      <div className="relative rounded-lg overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
                        <img 
                          src={selectedFeature.image} 
                          alt={selectedFeature.title}
                          className="max-w-full max-h-full object-contain" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder.png';
                          }}
                        />
                      </div>

                      {/* Benefits */}
                      <div>
                        <h4 className="font-semibold mb-2 sm:mb-3 text-slate-800 text-sm sm:text-base">Temel Avantajlar</h4>
                        <div className="space-y-2">
                          {selectedFeature.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full" onClick={() => navigate('/dashboard')}>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Şimdi Deneyin
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-8">
              {/* Performance Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="glass-card-light border-border hover:glass-card-hover-light group transition-all duration-300">
                  <CardHeader className="pb-2 sm:pb-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-slate-800 text-sm sm:text-base">
                        <div className="glass-medium-light rounded-lg p-2 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                          <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        </div>
                        <span className="truncate">Genel Doğruluk</span>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">%78.4</div>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                      +2.3% bu ay
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card-light border-border hover:glass-card-hover-light group transition-all duration-300">
                  <CardHeader className="pb-2 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-slate-800 text-sm sm:text-base">
                      <div className="glass-medium-light rounded-lg p-2 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                      </div>
                      <span className="truncate">İşlenen Maç</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">12,458</div>
                    <div className="text-xs sm:text-sm text-slate-600">Son 30 gün</div>
                  </CardContent>
                </Card>

                <Card className="glass-card-light border-border hover:glass-card-hover-light group transition-all duration-300 sm:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-2 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-slate-800 text-sm sm:text-base">
                      <div className="glass-medium-light rounded-lg p-2 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                      </div>
                      <span className="truncate">Ortalama Hız</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1 sm:mb-2">89ms</div>
                    <div className="text-xs sm:text-sm text-slate-600">Tahmin süresi</div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced League Performance */}
              <Card className="progress-bar-container performance-metrics glass-card-light border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <div className="glass-medium-light rounded-lg p-2">
                      <PieChart className="h-5 w-5 text-emerald-600" />
                    </div>
                    Lig Bazında Performans
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-2">
                    Her lig için tahmin doğruluk oranları
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {performanceMetrics.map((metric, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-base text-slate-800">{metric.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xl text-slate-800">%{metric.value}</span>
                            <div className={`w-3 h-3 rounded-full ${metric.dotClass}`} />
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full progress-bar-glow relative progress-transition ${metric.progressClass} ${progressWidthClasses[index]}`}
                            data-color={metric.progressClass}
                          >
                            {/* İç gölge efekti */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10 rounded-full" />
                          </div>
                        </div>
                        
                        {/* Ek metrik bilgisi */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Hedef: %75</span>
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
                  <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-slate-50 rounded-lg">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                          {performanceMetrics.filter(m => m.value >= 80).length}
                        </div>
                        <div className="text-xs text-slate-600">Mükemmel</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                          {performanceMetrics.filter(m => m.value >= 75 && m.value < 80).length}
                        </div>
                        <div className="text-xs text-slate-600">İyi</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-orange-600">
                          {performanceMetrics.filter(m => m.value < 75).length}
                        </div>
                        <div className="text-xs text-slate-600">Geliştirilmeli</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-purple-600">
                          {Math.round(performanceMetrics.reduce((acc, m) => acc + m.value, 0) / performanceMetrics.length)}%
                        </div>
                        <div className="text-xs text-slate-600">Ortalama</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Technology Tab */}
            <TabsContent value="technology" className="space-y-8">
              {/* Tech Stack */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <Card className="glass-card-light border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800 text-base sm:text-lg">
                      <div className="glass-medium-light rounded-lg p-2 flex-shrink-0">
                        <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-700" />
                      </div>
                      <span className="truncate">Makine Öğrenimi Modelleri</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="glass-medium-light rounded-lg sm:rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
                        <div className="font-medium text-slate-800 mb-1 text-sm sm:text-base">LLM Topluluğu</div>
                        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">12 farklı büyük dil modeli kombinasyonu</div>
                      </div>
                      <div className="glass-medium-light rounded-lg sm:rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
                        <div className="font-medium text-slate-800 mb-1 text-sm sm:text-base">Derin Sinir Ağları</div>
                        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">Gelişmiş derin öğrenme mimarisi</div>
                      </div>
                      <div className="glass-medium-light rounded-lg sm:rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
                        <div className="font-medium text-slate-800 mb-1 text-sm sm:text-base">Ensemble Modelleri</div>
                        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">Birleşik model öğrenme algoritması</div>
                      </div>
                      <div className="glass-medium-light rounded-lg sm:rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
                        <div className="font-medium text-slate-800 mb-1 text-sm sm:text-base">Gradient Boosting</div>
                        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">Adaptif artırmalı öğrenme yöntemi</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card-light border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800 text-base sm:text-lg">
                      <div className="glass-medium-light rounded-lg p-2 flex-shrink-0">
                        <Database className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" />
                      </div>
                      <span className="truncate">Veri Kaynakları</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="glass-medium-light rounded-lg sm:rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
                        <div className="font-medium text-slate-800 mb-1 text-sm sm:text-base">API-Football</div>
                        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">Gerçek zamanlı maç verileri ve canlı skorlar</div>
                      </div>
                      <div className="glass-medium-light rounded-lg sm:rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
                        <div className="font-medium text-slate-800 mb-1 text-sm sm:text-base">Tarihsel Veritabanı</div>
                        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">10+ yıllık kapsamlı maç geçmişi</div>
                      </div>
                      <div className="glass-medium-light rounded-lg sm:rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
                        <div className="font-medium text-slate-800 mb-1 text-sm sm:text-base">Oyuncu Metrikleri</div>
                        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">Detaylı performans ve İstatistik verileri</div>
                      </div>
                      <div className="glass-medium-light rounded-lg sm:rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
                        <div className="font-medium text-slate-800 mb-1 text-sm sm:text-base">Taktik Analizi</div>
                        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">Takım stratejileri ve oyun tarzları</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Architecture Diagram */}
              <Card className="glass-card-light border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <div className="glass-medium-light rounded-lg p-2">
                      <Workflow className="h-5 w-5 text-orange-600" />
                    </div>
                    Sistem Mimarisi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-center">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="glass-medium-light rounded-xl sm:rounded-2xl p-4 sm:p-6 mx-auto inline-block hover:scale-105 transition-transform duration-300">
                        <Database className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600 mx-auto" />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-base sm:text-lg">Veri Toplama</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed px-2">
                        API-Football ve geçmiş veri kaynaklarından 
                        gerçek zamanlı veri toplama
                      </p>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="glass-medium-light rounded-xl sm:rounded-2xl p-4 sm:p-6 mx-auto inline-block hover:scale-105 transition-transform duration-300">
                        <Layers className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 mx-auto" />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-base sm:text-lg">Yapay Zeka İşleme</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed px-2">
                        LLM modelleri ve makine öğrenimi 
                        algoritmaları ile veri analizi
                      </p>
                    </div>
                    <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
                      <div className="glass-medium-light rounded-xl sm:rounded-2xl p-4 sm:p-6 mx-auto inline-block hover:scale-105 transition-transform duration-300">
                        <Target className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600 mx-auto" />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-base sm:text-lg">Tahmin Üretimi</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed px-2">
                        Yüksek doğrulukla maç sonucu tahminleri 
                        ve güvenilirlik skorları
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enhanced Video Modal */}
        {showVideo && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative max-w-5xl w-full">
              <div className="glass-card border-white/20 rounded-2xl overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  controls
                  poster="/images/header_minimal.png"
                >
                  <source src="/videos/ai_analytics_demo.mp4" type="video/mp4" />
                  Tarayıcınız video elementini desteklemiyor.
                </video>
                
                {/* Enhanced Overlay Controls */}
                <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    onClick={handleVideoToggle}
                    className="glass-medium border-border text-foreground hover:scale-110 transition-all duration-300"
                    size="lg"
                  >
                    {isVideoPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8" />
                    )}
                  </Button>
                </div>
                
                {/* Modern Close Button */}
                <Button
                  onClick={handleCloseVideo}
                  className="absolute top-4 right-4 glass-strong text-foreground border-border hover:scale-110 transition-all duration-300 w-10 h-10 p-0"
                >
                  ✕
                </Button>
              </div>
              
              <div className="text-center mt-6 glass-medium rounded-xl p-4">
                <h3 className="text-foreground text-xl font-semibold mb-2">
                  Yapay Zeka Analiz Demosu
                </h3>
                <p className="text-foreground/80 text-sm">
                  Yapay zeka destekli futbol analiz sistemimizin çalışma prensiplerini inceleyin
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