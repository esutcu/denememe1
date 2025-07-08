import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  ArrowLeft, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  BarChart3,
  Users,
  Target,
  ArrowRight
} from 'lucide-react'
import { getLeagueById, type League } from '../constants/leagues'
import { getMatchesByLeague, type Match } from '../constants/matches'

const LeagueDetail = () => {
  const { leagueId } = useParams<{ leagueId: string }>()
  const navigate = useNavigate()
  const [league, setLeague] = useState<League | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (leagueId) {
      const foundLeague = getLeagueById(leagueId)
      const leagueMatches = getMatchesByLeague(leagueId)
      setLeague(foundLeague || null)
      setMatches(leagueMatches)
      setLoading(false)
    }
  }, [leagueId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Lig detayları yüklüyor...</p>
        </div>
      </div>
    )
  }

  if (!league) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lig Bulunamadı</h1>
          <p className="text-muted-foreground mb-6">Aradığınız lig mevcut değil veya kaldırılmış olabilir.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    )
  }

  // Mock league statistics
  const leagueStats = {
    totalTeams: leagueId === 'champions-league' ? 32 : 20,
    totalMatches: leagueId === 'champions-league' ? 125 : 380,
    avgGoalsPerMatch: 2.8,
    topScorer: leagueId === 'premier-league' ? 'Erling Haaland' : 
               leagueId === 'super-lig' ? 'Icardi' :
               leagueId === 'bundesliga' ? 'Harry Kane' : 'Kylian Mbappe',
    topScorerGoals: leagueId === 'premier-league' ? 25 : 
                    leagueId === 'super-lig' ? 22 :
                    leagueId === 'bundesliga' ? 28 : 24
  }

  // Mock table data
  const leagueTable = [
    { position: 1, team: leagueId === 'premier-league' ? 'Liverpool' : 
                       leagueId === 'super-lig' ? 'Galatasaray' :
                       leagueId === 'bundesliga' ? 'Bayern Munich' : 'PSG', 
      played: 20, won: 15, drawn: 3, lost: 2, gf: 48, ga: 18, gd: 30, points: 48 },
    { position: 2, team: leagueId === 'premier-league' ? 'Arsenal' : 
                       leagueId === 'super-lig' ? 'Fenerbahçe' :
                       leagueId === 'bundesliga' ? 'Bayer Leverkusen' : 'Monaco', 
      played: 20, won: 13, drawn: 4, lost: 3, gf: 42, ga: 22, gd: 20, points: 43 },
    { position: 3, team: leagueId === 'premier-league' ? 'Chelsea' : 
                       leagueId === 'super-lig' ? 'Beşiktaş' :
                       leagueId === 'bundesliga' ? 'RB Leipzig' : 'Marseille', 
      played: 20, won: 12, drawn: 5, lost: 3, gf: 38, ga: 25, gd: 13, points: 41 },
  ]

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

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </div>

        {/* League Header */}
        <div className="relative overflow-hidden rounded-xl">
          <div className="h-64 bg-slate-700 dark:bg-slate-800 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 text-center text-white">
              <img 
                src={league.logo} 
                alt={league.name}
                className="h-20 w-20 mx-auto mb-4 drop-shadow-lg"
              />
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{league.name}</h1>
              <p className="text-xl opacity-90">{league.country} • {league.description}</p>
            </div>
          </div>
        </div>

        {/* League Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Takım Sayısı</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leagueStats.totalTeams}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Maç</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leagueStats.totalMatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maç Başı Gol</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leagueStats.avgGoalsPerMatch}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En İyi Golcü</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{leagueStats.topScorer}</div>
              <div className="text-sm text-muted-foreground">{leagueStats.topScorerGoals} gol</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="table">Puan Durumu</TabsTrigger>
            <TabsTrigger value="matches">Maçlar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lig Hakkında</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {league.description} olarak bilinen {league.name}, {league.country} futbolunun en üst seviyesini temsil eder.
                  Dünya çapında milyonlarca taraftarı bulunan bu lig, yetenekli oyuncuları ve rekabetçi maçlarıyla ünlüdür.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold mb-3">Lig Özellikleri</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        Yüksek kaliteli futbol
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        Uluslararası yıldız oyuncular
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        Rekabetçi maçlar
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        Geniş taraftar kitlesi
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">AI Tahmin Avantajları</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Zengin veri arşivi
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Yüksek tahmin doğruluğu
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Detaylı takım analizleri
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Gerçek zamanlı güncellemeler
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Puan Durumu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">#</th>
                        <th className="text-left p-2">Takım</th>
                        <th className="text-center p-2">O</th>
                        <th className="text-center p-2">G</th>
                        <th className="text-center p-2">B</th>
                        <th className="text-center p-2">M</th>
                        <th className="text-center p-2">AG</th>
                        <th className="text-center p-2">YG</th>
                        <th className="text-center p-2">AVG</th>
                        <th className="text-center p-2 font-semibold">P</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leagueTable.map((team, index) => (
                        <tr key={index} className="border-b hover:bg-muted/30">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {team.position}
                              {team.position <= 4 && (
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                              )}
                            </div>
                          </td>
                          <td className="p-2 font-medium">{team.team}</td>
                          <td className="text-center p-2">{team.played}</td>
                          <td className="text-center p-2">{team.won}</td>
                          <td className="text-center p-2">{team.drawn}</td>
                          <td className="text-center p-2">{team.lost}</td>
                          <td className="text-center p-2">{team.gf}</td>
                          <td className="text-center p-2">{team.ga}</td>
                          <td className="text-center p-2">{team.gd > 0 ? '+' : ''}{team.gd}</td>
                          <td className="text-center p-2 font-bold">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Avrupa kupaları için uygun
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            {matches.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Henüz Maç Yok</h3>
                  <p className="text-muted-foreground mb-4">
                    Bu lig için henüz analiz edilecek maç bulunmuyor.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Diğer Maçları Gör
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card 
                    key={match.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/match/${match.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(match.status)}>
                            {getStatusText(match.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {match.date} - {match.time}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
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
                      
                      <div className="flex justify-end mt-4">
                        <Button variant="ghost" size="sm">
                          Detaylar <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default LeagueDetail