import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Calendar, 
  Clock, 
  BarChart3,
  Users,
  ArrowRight,
  Play,
  Eye,
  Brain,
  Loader2,
  Plus,
  CreditCard,
  Activity,
  Zap,
  Filter,
  Search,
  Settings,
  ChevronRight
} from 'lucide-react'
import { mockMatches, type Match } from '../constants/matches'
import { leagues } from '../constants/leagues'
import { type DashboardStats } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { usePrediction } from '../hooks/usePrediction'
import { toast } from 'sonner'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { loading: predictionLoading, prediction, getPrediction, checkUserLimits } = usePrediction()
  
  const [stats, setStats] = useState<DashboardStats>({
    todayMatches: 0,
    activePredictions: 0,
    accuracyRate: 0,
    totalLeagues: 0
  })
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedTab, setSelectedTab] = useState('today')
  const [userLimits, setUserLimits] = useState<any>(null)
  const [showPredictionDialog, setShowPredictionDialog] = useState(false)
  
  // Tahmin formu
  const [predictionForm, setPredictionForm] = useState({
    homeTeam: '',
    awayTeam: '',
    leagueName: '',
    matchDate: ''
  })

  // Kullanıcı kontrolü kaldırıldı - demo için herkes erişebilir
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     navigate('/auth')
  //   }
  // }, [user, authLoading, navigate])

  useEffect(() => {
    // Demo için her zaman data yükle - kullanıcı girişi olmasa da
    loadDashboardData()
    loadUserLimits()
  }, [])

  const loadDashboardData = () => {
    setStats({
      todayMatches: mockMatches.filter(m => m.status === 'scheduled').length,
      activePredictions: 45,
      accuracyRate: 78,
      totalLeagues: leagues.length
    })
    setMatches(mockMatches)
  }

  const loadUserLimits = async () => {
    const limits = await checkUserLimits()
    setUserLimits(limits)
  }

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'live': return 'bg-green-500'
      case 'finished': return 'bg-gray-500'
      default: return 'bg-blue-500'
    }
  }

  const getStatusText = (status: Match['status']) => {
    switch (status) {
      case 'live': return 'Canlı'
      case 'finished': return 'Bitti'
      default: return 'Yakında'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

// Dashboard.tsx içinde tahmin formu handling'i güncelleyin

const handlePredictionSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!predictionForm.homeTeam || !predictionForm.awayTeam) {
    toast.error('Ev sahibi ve deplasman takımları gerekli')
    return
  }

  const predictionResult = await getPrediction({
    homeTeam: predictionForm.homeTeam,
    awayTeam: predictionForm.awayTeam,
    leagueName: predictionForm.leagueName || 'Bilinmiyor',
    matchDate: predictionForm.matchDate || new Date().toISOString()
  })

  if (predictionResult) {
    setShowPredictionDialog(false)
    setPredictionForm({ homeTeam: '', awayTeam: '', leagueName: '', matchDate: '' })
    await loadUserLimits() // Limitleri güncelle
  }
}

  // Loading state kaldırıldı - demo için direkt içerik göster
  // if (authLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="glass-medium rounded-2xl p-8 inline-block">
  //           <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
  //           <p className="text-muted-foreground text-sm">Dashboard yükleniyor...</p>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  // Auth kontrolü kaldırıldı - demo için herkes erişebilir
  // if (!user) {
  //   return null
  // }

  const filteredMatches = matches.filter(match => {
    switch (selectedTab) {
      case 'live':
        return match.status === 'live'
      case 'finished':
        return match.status === 'finished'
      default:
        return match.status === 'scheduled'
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        {/* Enhanced Header */}
        <div className="py-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-xl p-3">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground text-sm lg:text-base">
                    Hoş geldin, {user?.email?.split('@')[0] || 'Kullanıcı'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="glass-button border-border text-muted-foreground hover:text-foreground"
                onClick={() => setShowPredictionDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Tahmin
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="glass-button text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced User Limits with Better Visual Hierarchy */}
        {userLimits && (
          <div className="mb-8">
            <Card className="glass-card border-white/20 overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <div className="glass-medium rounded-lg p-2">
                      <CreditCard className="h-4 w-4 text-blue-400" />
                    </div>
                    Plan: {userLimits.planType.toUpperCase()}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => navigate('/subscription')}
                  >
                    Planı Yükselt
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="glass-medium rounded-xl p-4 mb-3">
                      <div className="text-2xl font-bold text-foreground mb-1">{userLimits.dailyLimit}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Günlük Limit</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="glass-medium rounded-xl p-4 mb-3">
                      <div className="text-2xl font-bold text-foreground mb-1">{userLimits.currentUsage}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Kullanılan</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="glass-medium rounded-xl p-4 mb-3">
                      <div className="text-2xl font-bold text-green-400 mb-1">{userLimits.remainingPredictions}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Kalan</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Kullanım Oranı</span>
                    <span>{Math.round((userLimits.currentUsage / userLimits.dailyLimit) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(userLimits.currentUsage / userLimits.dailyLimit) * 100} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Stats Grid with Better Visual Design */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Card className="glass-card border-white/20 hover:glass-card-hover group transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="glass-medium rounded-lg sm:rounded-xl p-2 sm:p-3 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.todayMatches}</div>
                    <div className="text-xs text-blue-400 font-medium">+12% bu hafta</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-foreground mb-1">Bugünkü Maçlar</h3>
                  <p className="text-xs text-muted-foreground">Analiz için hazır</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 hover:glass-card-hover group transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="glass-medium rounded-lg sm:rounded-xl p-2 sm:p-3 group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.activePredictions}</div>
                    <div className="text-xs text-green-400 font-medium">5 canlı</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-foreground mb-1">Aktif Tahminler</h3>
                  <p className="text-xs text-muted-foreground">Süren tahminler</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 hover:glass-card-hover group transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="glass-medium rounded-lg sm:rounded-xl p-2 sm:p-3 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-foreground">%{stats.accuracyRate}</div>
                    <div className="text-xs text-purple-400 font-medium">+5% bu ay</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-foreground mb-1">Doğruluk Oranı</h3>
                  <div className="mt-2">
                    <Progress value={stats.accuracyRate} className="h-1.5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 hover:glass-card-hover group transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="glass-medium rounded-lg sm:rounded-xl p-2 sm:p-3 group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalLeagues}</div>
                    <div className="text-xs text-yellow-400 font-medium">8 premium</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-foreground mb-1">Ligler</h3>
                  <p className="text-xs text-muted-foreground">Desteklenen lig</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Quick Actions Hub */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Hızlı İşlemler</h2>
              <p className="text-sm text-muted-foreground">En çok kullanılan özellikler</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* AI Analytics Action */}
            <Card 
              className="cursor-pointer glass-card border-white/20 hover:glass-card-hover group transition-all duration-300" 
              onClick={() => navigate('/ai-analytics')}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="glass-medium rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground text-sm mb-1">AI Analitik</h3>
                    <p className="text-xs text-muted-foreground">Gelişmiş analizler</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>

            {/* Performance Report Action */}
            <Card className="cursor-pointer glass-card border-white/20 hover:glass-card-hover group transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="glass-medium rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground text-sm mb-1">Performans</h3>
                    <p className="text-xs text-muted-foreground">Detaylı raporlar</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>

            {/* Live Matches Action */}
            <Card className="cursor-pointer glass-card border-white/20 hover:glass-card-hover group transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="glass-medium rounded-xl p-3 group-hover:scale-110 transition-transform duration-300 relative">
                    <Play className="h-6 w-6 text-red-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground text-sm mb-1">Canlı Maçlar</h3>
                    <p className="text-xs text-muted-foreground">3 maç canlı</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>

            {/* New Prediction Action */}
            <Card 
              className="cursor-pointer glass-card border-white/20 hover:glass-card-hover group transition-all duration-300 border-dashed border-blue-400/50" 
              onClick={() => setShowPredictionDialog(true)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="glass-medium rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground text-sm mb-1">Yeni Tahmin</h3>
                    <p className="text-xs text-muted-foreground">Hızlı oluştur</p>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Matches Section */}
        <Card className="glass-card border-white/20">
          <CardHeader className="border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="glass-medium rounded-lg p-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Maç Tahminleri</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{filteredMatches.length} maç bulundu</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="glass-button text-muted-foreground hover:text-foreground">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele
                </Button>
                <Button variant="ghost" size="sm" className="glass-button text-muted-foreground hover:text-foreground">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <div className="p-6 pb-0">
                <TabsList className="grid w-full grid-cols-3 glass-medium border border-white/20">
                  <TabsTrigger 
                    value="today" 
                    className="text-muted-foreground data-[state=active]:glass-button data-[state=active]:text-foreground data-[state=active]:border-border"
                  >
                    Bugün ({matches.filter(m => m.status === 'scheduled').length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="live"
                    className="text-muted-foreground data-[state=active]:glass-button data-[state=active]:text-foreground data-[state=active]:border-border"
                  >
                    Canlı ({matches.filter(m => m.status === 'live').length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="finished"
                    className="text-muted-foreground data-[state=active]:glass-button data-[state=active]:text-foreground data-[state=active]:border-border"
                  >
                    Biten ({matches.filter(m => m.status === 'finished').length})
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value={selectedTab} className="p-6 pt-4">
                {filteredMatches.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="glass-medium rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Hiç maç bulunamadı</h3>
                    <p className="text-muted-foreground mb-6">Bu kategoride gösterilecek maç yok</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPredictionDialog(true)}
                      className="glass-button border-border text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Tahmin Oluştur
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMatches.map((match) => (
                      <Card 
                        key={match.id} 
                        className="cursor-pointer glass-card border-white/20 hover:glass-card-hover group transition-all duration-300"
                        onClick={() => navigate(`/match/${match.id}`)}
                      >
                        <CardContent className="p-0">
                          {/* Match Header */}
                          <div className="p-4 border-b border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="glass-button border-border text-muted-foreground">
                                  {match.league}
                                </Badge>
                                <Badge className={`${getStatusColor(match.status)} text-foreground text-xs`}>
                                  {getStatusText(match.status)}
                                </Badge>
                                {match.status === 'live' && (
                                  <div className="flex items-center gap-1 text-red-400">
                                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                                    <span className="text-xs font-medium">CANLI</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {match.date}
                                <Clock className="h-4 w-4 ml-2" />
                                {match.time}
                              </div>
                            </div>
                          </div>

                          {/* Teams and Prediction */}
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                              {/* Teams */}
                              <div className="flex items-center gap-8 flex-1">
                                <div className="text-center flex-1">
                                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{match.homeLogo}</div>
                                  <div className="font-medium text-foreground text-sm">{match.homeTeam}</div>
                                  <div className="text-xs text-muted-foreground mt-1">Ev Sahibi</div>
                                </div>
                                
                                <div className="text-center px-4">
                                  <div className="text-lg font-bold text-muted-foreground mb-1">VS</div>
                                  <div className="text-xs text-muted-foreground">{match.status === 'live' ? 'CANLI' : 'Maç'}</div>
                                </div>
                                
                                <div className="text-center flex-1">
                                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{match.awayLogo}</div>
                                  <div className="font-medium text-foreground text-sm">{match.awayTeam}</div>
                                  <div className="text-xs text-muted-foreground mt-1">Deplasman</div>
                                </div>
                              </div>
                              
                              {/* AI Confidence */}
                              <div className="text-right ml-6">
                                <div className="glass-medium rounded-xl p-4">
                                  <div className="text-xs text-muted-foreground mb-1">AI Güven</div>
                                  <div className="text-2xl font-bold text-blue-400">
                                    %{match.prediction.confidence}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">Yüksek</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Prediction Odds */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              <div className="glass-medium rounded-lg p-3 text-center">
                                <div className="text-xs text-muted-foreground mb-1">1</div>
                                <div className="text-lg font-bold text-foreground">%{match.prediction.homeWin}</div>
                              </div>
                              <div className="glass-medium rounded-lg p-3 text-center">
                                <div className="text-xs text-muted-foreground mb-1">X</div>
                                <div className="text-lg font-bold text-foreground">%{match.prediction.draw}</div>
                              </div>
                              <div className="glass-medium rounded-lg p-3 text-center">
                                <div className="text-xs text-muted-foreground mb-1">2</div>
                                <div className="text-lg font-bold text-foreground">%{match.prediction.awayWin}</div>
                              </div>
                            </div>
                            
                            {/* Match Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">Risk Seviyesi:</span>
                                <Badge className={`${getRiskColor(match.aiAnalysis.riskLevel)} text-xs`}>
                                  {match.aiAnalysis.riskLevel === 'low' ? 'Düşük' : 
                                   match.aiAnalysis.riskLevel === 'medium' ? 'Orta' : 'Yüksek'}
                                </Badge>
                              </div>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground group-hover:translate-x-1 transition-transform">
                                Detaylı Analiz <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Prediction Dialog */}
        <Dialog open={showPredictionDialog} onOpenChange={setShowPredictionDialog}>
          <DialogContent className="glass-card border-white/20 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Yeni Tahmin Oluştur
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Maç bilgilerini girin ve AI tahminini alın
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handlePredictionSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="homeTeam" className="text-foreground text-sm">Ev Sahibi Takım</Label>
                <Input
                  id="homeTeam"
                  placeholder="örn: Manchester City"
                  value={predictionForm.homeTeam}
                  onChange={(e) => setPredictionForm(prev => ({ ...prev, homeTeam: e.target.value }))}
                  className="glass-input border-border text-foreground placeholder:text-muted-foreground/70"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="awayTeam" className="text-foreground text-sm">Deplasman Takım</Label>
                <Input
                  id="awayTeam"
                  placeholder="örn: Liverpool"
                  value={predictionForm.awayTeam}
                  onChange={(e) => setPredictionForm(prev => ({ ...prev, awayTeam: e.target.value }))}
                  className="glass-input border-border text-foreground placeholder:text-muted-foreground/70"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leagueName" className="text-foreground text-sm">Lig (Opsiyonel)</Label>
                <Input
                  id="leagueName"
                  placeholder="örn: Premier League"
                  value={predictionForm.leagueName}
                  onChange={(e) => setPredictionForm(prev => ({ ...prev, leagueName: e.target.value }))}
                  className="glass-input border-border text-foreground placeholder:text-muted-foreground/70"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPredictionDialog(false)}
                  className="flex-1 glass-button text-muted-foreground hover:text-foreground"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={predictionLoading}
                  className="flex-1 glass-medium border-border text-foreground hover:border-muted-foreground"
                >
                  {predictionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Tahmin Oluştur
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 lg:hidden">
          <Button
            onClick={() => setShowPredictionDialog(true)}
            className="w-14 h-14 rounded-full glass-medium border-border text-foreground shadow-2xl hover:scale-110 transition-all duration-300"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard