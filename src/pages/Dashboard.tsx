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
  CreditCard
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

  // Kullanıcı giriş yapmamışsa auth sayfasına yönlendir
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) {
      loadDashboardData()
      loadUserLimits()
    }
  }, [user])

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

  const handlePredictionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!predictionForm.homeTeam || !predictionForm.awayTeam) {
      toast.error('Ev sahibi ve deplasman takımları gerekli')
      return
    }

    const matchId = `custom_${Date.now()}`
    const predictionResult = await getPrediction({
      matchId,
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

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Auth kontrolü
  if (!user) {
    return null
  }

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
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Futbol analizlerinizi yönetin ve AI tahminlerini keşfedin
          </p>
        </div>

        {/* User Limits & Stats */}
        {userLimits && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plan Durumu: {userLimits.planType.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Günlük Limit</div>
                  <div className="text-2xl font-bold">{userLimits.dailyLimit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Kullanılan</div>
                  <div className="text-2xl font-bold">{userLimits.currentUsage}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Kalan</div>
                  <div className="text-2xl font-bold">{userLimits.remainingPredictions}</div>
                </div>
              </div>
              <Progress 
                value={(userLimits.currentUsage / userLimits.dailyLimit) * 100} 
                className="mt-4" 
              />
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugünkü Maçlar</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayMatches}</div>
              <p className="text-xs text-muted-foreground">Analiz için hazır</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Tahminler</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePredictions}</div>
              <p className="text-xs text-muted-foreground">Süren tahminler</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doğruluk Oranı</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">%{stats.accuracyRate}</div>
              <Progress value={stats.accuracyRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ligler</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeagues}</div>
              <p className="text-xs text-muted-foreground">Desteklenen lig</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/ai-analytics')}>
            <CardContent className="p-6 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="font-semibold mb-2">AI Analitik</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gelişmiş yapay zeka analizlerini keşfedin
              </p>
              <Button variant="outline" size="sm">
                Keşfet <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold mb-2">Performans Raporu</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tahmin performansınızı detaylı inceleyin
              </p>
              <Button variant="outline" size="sm">
                Görüntüle <Eye className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Play className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="font-semibold mb-2">Canlı Maçlar</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gerçek zamanlı maç analizlerini takip edin
              </p>
              <Button variant="outline" size="sm">
                İzle <Play className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Matches Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Maç Tahminleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today">Bugün</TabsTrigger>
                <TabsTrigger value="live">Canlı</TabsTrigger>
                <TabsTrigger value="finished">Tamamlanan</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTab} className="mt-6">
                <div className="space-y-4">
                  {filteredMatches.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Bu kategoride maç bulunmuyor</p>
                    </div>
                  ) : (
                    filteredMatches.map((match) => (
                      <Card 
                        key={match.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/match/${match.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{match.league}</Badge>
                              <Badge className={getStatusColor(match.status)}>
                                {getStatusText(match.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {match.date}
                              <Clock className="h-4 w-4 ml-2" />
                              {match.time}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-2xl mb-1">{match.homeLogo}</div>
                                <div className="font-medium text-sm">{match.homeTeam}</div>
                              </div>
                              
                              <div className="text-2xl font-bold text-muted-foreground">VS</div>
                              
                              <div className="text-center">
                                <div className="text-2xl mb-1">{match.awayLogo}</div>
                                <div className="font-medium text-sm">{match.awayTeam}</div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground mb-1">AI Güven</div>
                              <div className="text-lg font-bold text-primary">
                                %{match.prediction.confidence}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Ev Sahibi</div>
                              <div className="font-semibold">%{match.prediction.homeWin}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Beraberlik</div>
                              <div className="font-semibold">%{match.prediction.draw}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Deplasman</div>
                              <div className="font-semibold">%{match.prediction.awayWin}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Risk:</span>
                              <Badge className={getRiskColor(match.aiAnalysis.riskLevel)}>
                                {match.aiAnalysis.riskLevel === 'low' ? 'Düşük' : 
                                 match.aiAnalysis.riskLevel === 'medium' ? 'Orta' : 'Yüksek'}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="sm">
                              Detaylar <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard