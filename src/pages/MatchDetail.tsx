import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Target, 
  Activity,
  BarChart3,
  Brain,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { getMatchById, type Match } from '../constants/matches'
import { getLeagueById } from '../constants/leagues'

const MatchDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('prediction')

  useEffect(() => {
    if (id) {
      const foundMatch = getMatchById(id)
      setMatch(foundMatch || null)
      setLoading(false)
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Maç detayları yüklüyor...</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Maç Bulunamadı</h1>
          <p className="text-muted-foreground mb-6">Aradığınız maç mevcut değil veya kaldırılmış olabilir.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard'a Dön
          </Button>
        </div>
      </div>
    )
  }

  const league = getLeagueById(match.leagueId)
  
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

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return CheckCircle
      case 'medium': return Info
      case 'high': return AlertTriangle
      default: return Info
    }
  }

  // Mock additional data for demonstration
  const recentForm = {
    home: ['W', 'W', 'D', 'L', 'W'],
    away: ['L', 'W', 'W', 'D', 'W']
  }

  const headToHead = [
    { date: '2024-12-15', homeScore: 2, awayScore: 1, result: 'home' },
    { date: '2024-08-20', homeScore: 1, awayScore: 3, result: 'away' },
    { date: '2024-03-10', homeScore: 0, awayScore: 0, result: 'draw' },
  ]

  const teamStats = {
    home: {
      goalsFor: 45, goalsAgainst: 18, 
      possession: 58, shots: 142, 
      corners: 87, fouls: 156
    },
    away: {
      goalsFor: 38, goalsAgainst: 22, 
      possession: 52, shots: 134, 
      corners: 76, fouls: 134
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{match.league}</Badge>
            <Badge className={getStatusColor(match.status)}>
              {getStatusText(match.status)}
            </Badge>
          </div>
        </div>

        {/* Match Header */}
        <Card>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Home Team */}
              <div className="text-center">
                <div className="text-6xl mb-4">{match.homeLogo}</div>
                <h2 className="text-2xl font-bold mb-2">{match.homeTeam}</h2>
                <p className="text-muted-foreground">Ev Sahibi</p>
              </div>

              {/* Match Info */}
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-muted-foreground">VS</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(match.date).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {match.time}
                  </div>
                </div>
                {league && (
                  <div className="flex items-center justify-center">
                    <img 
                      src={league.logo} 
                      alt={league.name}
                      className="h-8 w-8 mr-2"
                    />
                    <span className="font-medium">{league.name}</span>
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className="text-center">
                <div className="text-6xl mb-4">{match.awayLogo}</div>
                <h2 className="text-2xl font-bold mb-2">{match.awayTeam}</h2>
                <p className="text-muted-foreground">Deplasman</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Prediction Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              AI Tahmin Özeti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  %{match.prediction.homeWin}
                </div>
                <p className="text-sm text-muted-foreground">Ev Sahibi Galibiyeti</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground mb-2">
                  %{match.prediction.draw}
                </div>
                <p className="text-sm text-muted-foreground">Beraberlik</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  %{match.prediction.awayWin}
                </div>
                <p className="text-sm text-muted-foreground">Deplasman Galibiyeti</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  %{match.prediction.confidence}
                </div>
                <p className="text-sm text-muted-foreground">AI Güven Oranı</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-3">
                {(() => {
                  const RiskIcon = getRiskIcon(match.aiAnalysis.riskLevel)
                  return <RiskIcon className="h-5 w-5 mt-0.5 text-current" />
                })()}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">AI Analiz Özeti</span>
                    <Badge className={getRiskColor(match.aiAnalysis.riskLevel)}>
                      {match.aiAnalysis.riskLevel === 'low' ? 'Düşük Risk' : 
                       match.aiAnalysis.riskLevel === 'medium' ? 'Orta Risk' : 'Yüksek Risk'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{match.aiAnalysis.summary}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="prediction">Tahmin Detayı</TabsTrigger>
            <TabsTrigger value="form">Form Analizi</TabsTrigger>
            <TabsTrigger value="stats">Takım İstatistikleri</TabsTrigger>
            <TabsTrigger value="history">Karşılaşma Geçmişi</TabsTrigger>
          </TabsList>

          <TabsContent value="prediction" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detaylı Tahmin Analizi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prediction Visualization */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>{match.homeTeam} Galibiyeti</span>
                      <span className="font-medium">%{match.prediction.homeWin}</span>
                    </div>
                    <Progress value={match.prediction.homeWin} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Beraberlik</span>
                      <span className="font-medium">%{match.prediction.draw}</span>
                    </div>
                    <Progress value={match.prediction.draw} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>{match.awayTeam} Galibiyeti</span>
                      <span className="font-medium">%{match.prediction.awayWin}</span>
                    </div>
                    <Progress value={match.prediction.awayWin} className="h-3" />
                  </div>
                </div>

                {/* Key Factors */}
                <div>
                  <h4 className="font-semibold mb-3">Anahtar Faktörler</h4>
                  <div className="space-y-2">
                    {match.aiAnalysis.keyFactors.map((factor, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{match.homeTeam} - Son 5 Maç</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    {recentForm.home.map((result, index) => (
                      <div 
                        key={index}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          result === 'W' ? 'bg-green-500' :
                          result === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Galibiyet:</span>
                      <span className="font-medium">3/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beraberlik:</span>
                      <span className="font-medium">1/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mağlubiyet:</span>
                      <span className="font-medium">1/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{match.awayTeam} - Son 5 Maç</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    {recentForm.away.map((result, index) => (
                      <div 
                        key={index}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          result === 'W' ? 'bg-green-500' :
                          result === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Galibiyet:</span>
                      <span className="font-medium">3/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beraberlik:</span>
                      <span className="font-medium">1/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mağlubiyet:</span>
                      <span className="font-medium">1/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{match.homeTeam} İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{teamStats.home.goalsFor}</div>
                      <div className="text-sm text-muted-foreground">Gol</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{teamStats.home.goalsAgainst}</div>
                      <div className="text-sm text-muted-foreground">Yenilen Gol</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Top Sahipliği:</span>
                      <span className="font-medium">%{teamStats.home.possession}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Şut:</span>
                      <span className="font-medium">{teamStats.home.shots}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Korner:</span>
                      <span className="font-medium">{teamStats.home.corners}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Faul:</span>
                      <span className="font-medium">{teamStats.home.fouls}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{match.awayTeam} İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{teamStats.away.goalsFor}</div>
                      <div className="text-sm text-muted-foreground">Gol</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{teamStats.away.goalsAgainst}</div>
                      <div className="text-sm text-muted-foreground">Yenilen Gol</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Top Sahipliği:</span>
                      <span className="font-medium">%{teamStats.away.possession}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Şut:</span>
                      <span className="font-medium">{teamStats.away.shots}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Korner:</span>
                      <span className="font-medium">{teamStats.away.corners}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Faul:</span>
                      <span className="font-medium">{teamStats.away.fouls}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Son Karşılaşmalar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {headToHead.map((match, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        {new Date(match.date).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">
                          {match.homeScore} - {match.awayScore}
                        </span>
                        <Badge variant={match.result === 'home' ? 'default' : match.result === 'away' ? 'secondary' : 'outline'}>
                          {match.result === 'home' ? 'Ev Sahibi' : match.result === 'away' ? 'Deplasman' : 'Beraberlik'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default MatchDetail