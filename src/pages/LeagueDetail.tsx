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
  ArrowRight,
  Loader2
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
          <div className="glass-medium rounded-2xl p-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-white/80">Lig detayları yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!league) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="glass-card border-white/20 rounded-2xl p-8 max-w-md">
            <h1 className="text-2xl font-bold text-white mb-4">Lig Bulunamadı</h1>
            <p className="text-white/70 mb-6">Aradığınız lig mevcut değil veya kaldırılmış olabilir.</p>
            <Button 
              onClick={() => navigate('/')}
              className="glass-medium border-white/30 text-white hover:border-white/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </div>
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
            className="glass-button border-white/30 text-white/90 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </div>

        {/* League Header */}
        <div className="relative overflow-hidden rounded-2xl glass-card border-white/20">
          <div className="h-64 glass-strong flex items-center justify-center relative">
            <div className="relative z-10 text-center text-white">
              <div className="glass-medium rounded-3xl p-6 w-28 h-28 flex items-center justify-center mx-auto mb-6">
                <img 
                  src={league.logo} 
                  alt={league.name}
                  className="h-16 w-16 drop-shadow-lg"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">{league.name}</h1>
              <p className="text-xl text-white/90">{league.country} • {league.description}</p>
            </div>
          </div>
        </div>

        {/* League Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="glass-card border-white/20 hover:glass-card-hover transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Takım Sayısı</CardTitle>
              <div className="glass-medium rounded-lg p-2">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{leagueStats.totalTeams}</div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20 hover:glass-card-hover transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Toplam Maç</CardTitle>
              <div className="glass-medium rounded-lg p-2">
                <Calendar className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{leagueStats.totalMatches}</div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20 hover:glass-card-hover transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Maç Başı Gol</CardTitle>
              <div className="glass-medium rounded-lg p-2">
                <Target className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{leagueStats.avgGoalsPerMatch}</div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20 hover:glass-card-hover transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">En İyi Golcü</CardTitle>
              <div className="glass-medium rounded-lg p-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white">{leagueStats.topScorer}</div>
              <div className="text-sm text-white/70">{leagueStats.topScorerGoals} gol</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 glass-medium border border-white/20">
            <TabsTrigger 
              value="overview"
              className="text-white/70 data-[state=active]:glass-button data-[state=active]:text-white data-[state=active]:border-white/30"
            >
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger 
              value="table"
              className="text-white/70 data-[state=active]:glass-button data-[state=active]:text-white data-[state=active]:border-white/30"
            >
              Puan Durumu
            </TabsTrigger>
            <TabsTrigger 
              value="matches"
              className="text-white/70 data-[state=active]:glass-button data-[state=active]:text-white data-[state=active]:border-white/30"
            >
              Maçlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Lig Hakkında</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">
                  {league.description} olarak bilinen {league.name}, {league.country} futbolunun en üst seviyesini temsil eder.
                  Dünya çapında milyonlarca taraftarı bulunan bu lig, yetenekli oyuncuları ve rekabetçi maçlarıyla ünlüdür.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-white">Lig Özellikleri</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2 glass-medium rounded-lg p-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-white/90">Yüksek kaliteli futbol</span>
                      </li>
                      <li className="flex items-center gap-2 glass-medium rounded-lg p-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-white/90">Uluslararası yıldız oyuncular</span>
                      </li>
                      <li className="flex items-center gap-2 glass-medium rounded-lg p-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-white/90">Rekabetçi maçlar</span>
                      </li>
                      <li className="flex items-center gap-2 glass-medium rounded-lg p-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-white/90">Geniş taraftar kitlesi</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-white">AI Tahmin Avantajları</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2 glass-medium rounded-lg p-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-white/90">Zengin veri arşivi</span>
                      </li>
                      <li className="flex items-center gap-2 glass-medium rounded-lg p-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-white/90">Yüksek tahmin doğruluğu</span>
                      </li>
                      <li className="flex items-center gap-2 glass-medium rounded-lg p-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-white/90">Detaylı takım analizleri</span>
                      </li>
                      <li className="flex items-center gap-2 glass-medium rounded-lg p-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-white/90">Gerçek zamanlı güncellemeler</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="glass-medium rounded-lg p-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                  </div>
                  Puan Durumu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left p-2 text-white/80">#</th>
                        <th className="text-left p-2 text-white/80">Takım</th>
                        <th className="text-center p-2 text-white/80">O</th>
                        <th className="text-center p-2 text-white/80">G</th>
                        <th className="text-center p-2 text-white/80">B</th>
                        <th className="text-center p-2 text-white/80">M</th>
                        <th className="text-center p-2 text-white/80">AG</th>
                        <th className="text-center p-2 text-white/80">YG</th>
                        <th className="text-center p-2 text-white/80">AVG</th>
                        <th className="text-center p-2 font-semibold text-white">P</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leagueTable.map((team, index) => (
                        <tr key={index} className="border-b border-white/10 hover:glass-medium/50">
                          <td className="p-2">
                            <div className="flex items-center gap-2 text-white">
                              {team.position}
                              {team.position <= 4 && (
                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                              )}
                            </div>
                          </td>
                          <td className="p-2 font-medium text-white">{team.team}</td>
                          <td className="text-center p-2 text-white/90">{team.played}</td>
                          <td className="text-center p-2 text-white/90">{team.won}</td>
                          <td className="text-center p-2 text-white/90">{team.drawn}</td>
                          <td className="text-center p-2 text-white/90">{team.lost}</td>
                          <td className="text-center p-2 text-white/90">{team.gf}</td>
                          <td className="text-center p-2 text-white/90">{team.ga}</td>
                          <td className="text-center p-2 text-white/90">{team.gd > 0 ? '+' : ''}{team.gd}</td>
                          <td className="text-center p-2 font-bold text-blue-400">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex items-center gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    Avrupa kupaları için uygun
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            {matches.length === 0 ? (
              <Card className="glass-card border-white/20">
                <CardContent className="p-8 text-center">
                  <div className="glass-medium rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-white/50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Henüz Maç Yok</h3>
                  <p className="text-white/70 mb-4">
                    Bu lig için henüz analiz edilecek maç bulunmuyor.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                    className="glass-button border-white/30 text-white/90 hover:text-white"
                  >
                    Diğer Maçları Gör
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card 
                    key={match.id} 
                    className="cursor-pointer glass-card border-white/20 hover:glass-card-hover transition-all duration-300"
                    onClick={() => navigate(`/match/${match.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(match.status)} text-white`}>
                            {getStatusText(match.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Calendar className="h-4 w-4" />
                          {match.date} - {match.time}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="glass-medium rounded-2xl p-3 w-16 h-16 flex items-center justify-center mx-auto mb-2">
                              <div className="text-xl">{match.homeLogo}</div>
                            </div>
                            <div className="font-medium text-sm text-white">{match.homeTeam}</div>
                          </div>
                          
                          <div className="text-2xl font-bold text-white/60">VS</div>
                          
                          <div className="text-center">
                            <div className="glass-medium rounded-2xl p-3 w-16 h-16 flex items-center justify-center mx-auto mb-2">
                              <div className="text-xl">{match.awayLogo}</div>
                            </div>
                            <div className="font-medium text-sm text-white">{match.awayTeam}</div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="glass-medium rounded-xl p-4">
                            <div className="text-sm text-white/70 mb-1">AI Güven</div>
                            <div className="text-lg font-bold text-blue-400">
                              %{match.prediction.confidence}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="glass-button text-white/80 hover:text-white group-hover:translate-x-1 transition-transform"
                        >
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