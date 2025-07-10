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
  ArrowRight
} from 'lucide-react'
import { aiFeatures } from '../constants/features'
import './AIAnalytics.css'
import { useNavigate } from 'react-router-dom'
const AIAnalytics = () => {
  const [selectedFeature, setSelectedFeature] = useState(aiFeatures[0])
  const [activeTab, setActiveTab] = useState('overview')
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const navigate = useNavigate()

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
    { label: 'Genel Doğruluk', value: 78, color: 'bg-green-500' },
    { label: 'Premier League', value: 85, color: 'bg-blue-500' },
    { label: 'Süper Lig', value: 82, color: 'bg-red-500' },
    { label: 'Bundesliga', value: 80, color: 'bg-yellow-500' },
    { label: 'Serie A', value: 77, color: 'bg-green-600' },
    { label: 'La Liga', value: 79, color: 'bg-orange-500' }
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
                        ? 'ring-2 ring-blue-500 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedFeature(feature)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{feature.icon}</span>
                        <div>
                          <h4 className="font-medium">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {feature.description}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Feature Detail */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedFeature.icon}</span>
                      <div>
                        <CardTitle>{selectedFeature.title}</CardTitle>
                        <p className="text-muted-foreground">{selectedFeature.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Feature Image */}
                    <div className="relative rounded-lg overflow-hidden">
                      <img 
                        src={selectedFeature.image} 
                        alt={selectedFeature.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/20" />
                    </div>

                    {/* Benefits */}
                    <div>
                      <h4 className="font-semibold mb-3">Temel Avantajlar</h4>
                      <div className="space-y-3">
                        {selectedFeature.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-green-600 rounded-full" />
                            </div>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
    className="w-full"
    onClick={() => navigate('/auth')}
  >
    Bu Özelliği Deneyin
    <ArrowRight className="ml-2 h-4 w-4" />
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

            // src/pages/AIAnalytics.tsx içindeki League Performance bölümünü güncelleyin

{/* League Performance */}
<Card>
  <CardHeader>
    <CardTitle>Lig Bazında Performans</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {performanceMetrics.map((metric, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{metric.label}</span>
            <span className="font-bold text-lg">%{metric.value}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`${metric.color} performance-progress-bar`}
              style={{
                '--progress-width': `${metric.value}%`,
                '--animation-delay': `${index * 0.2}s`
              } as React.CSSProperties}
            />
          </div>
          {/* Ek metrik bilgisi */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Hedef: %75</span>
            <span className={metric.value >= 75 ? 'text-green-600' : 'text-orange-600'}>
              {metric.value >= 75 ? 'Hedef Aşıldı ✓' : 'Hedef Altında'}
            </span>
          </div>
        </div>
      ))}
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
                      <div className="font-medium">LLM Topluluğu / Toplu Model Sistemi</div>
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
                      <div className="font-medium">Takım Analitiği / Takım Bazlı Analizler</div>
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
                <div className="relative">
                  <img 
                    src="/images/card_data_analysis_3d.png" 
                    alt="System Architecture" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-slate-900/50 rounded-lg flex items-end">
                    <div className="p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">Mikroservis Mimarisi</h3>
                      <p className="text-sm opacity-90">
                        Ölçeklenebilir, hızlı ve güvenilir AI analiz sistemi
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Video Modal */}
        {showVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  controls
                  onEnded={() => setIsVideoPlaying(false)}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                >
                  <source src="/videos/ai_analytics_demo.mp4" type="video/mp4" />
                  Tarayıcınız video oynatmayı desteklemiyor.
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