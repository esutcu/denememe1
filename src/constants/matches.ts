export interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  homeLogo: string
  awayLogo: string
  date: string
  time: string
  league: string
  leagueId: string
  homeScore?: number
  awayScore?: number
  status: 'scheduled' | 'live' | 'finished'
  prediction: {
    homeWin: number
    draw: number
    awayWin: number
    confidence: number
  }
  aiAnalysis: {
    summary: string
    keyFactors: string[]
    riskLevel: 'low' | 'medium' | 'high'
  }
}

// Mock data for demo purposes
export const mockMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Manchester City',
    awayTeam: 'Liverpool',
    homeLogo: '🔵',
    awayLogo: '🔴',
    date: '2025-07-10',
    time: '19:00',
    league: 'Premier League',
    leagueId: 'premier-league',
    status: 'scheduled',
    prediction: {
      homeWin: 45,
      draw: 25,
      awayWin: 30,
      confidence: 82
    },
    aiAnalysis: {
      summary: 'Manchester City ev sahipliği avantajıyla öne çıkıyor, ancak Liverpool\'un son formu göz ardı edilmemeli.',
      keyFactors: [
        'Man City son 5 maçta 4 galibiyet',
        'Liverpool deplasmanda güçlü performans',
        'Yaralanma durumu City\'yi etkileyebilir'
      ],
      riskLevel: 'medium'
    }
  },
  {
    id: '2',
    homeTeam: 'Galatasaray',
    awayTeam: 'Fenerbahçe',
    homeLogo: '🟡',
    awayLogo: '🟡',
    date: '2025-07-11',
    time: '20:00',
    league: 'Süper Lig',
    leagueId: 'super-lig',
    status: 'scheduled',
    prediction: {
      homeWin: 55,
      draw: 30,
      awayWin: 15,
      confidence: 75
    },
    aiAnalysis: {
      summary: 'Derbi maçında Galatasaray ev sahipliği avantajıyla favoride görünüyor.',
      keyFactors: [
        'Galatasaray evinde çok güçlü',
        'Fenerbahçe son derbi galibiyetlerini hatırlıyor',
        'Her iki takım da kadro derinliğine sahip'
      ],
      riskLevel: 'high'
    }
  },
  {
    id: '3',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    homeLogo: '🔴',
    awayLogo: '🟡',
    date: '2025-07-12',
    time: '16:30',
    league: 'Bundesliga',
    leagueId: 'bundesliga',
    status: 'scheduled',
    prediction: {
      homeWin: 65,
      draw: 20,
      awayWin: 15,
      confidence: 88
    },
    aiAnalysis: {
      summary: 'Bayern Munich\'in ev sahipliğindeki üstünlüğü ve kadro kalitesi öne çıkıyor.',
      keyFactors: [
        'Bayern\'in ev sahipliği rekoru mükemmel',
        'Dortmund\'un deplasman performansı düşük',
        'Sakat oyuncu sayısı Dortmund\'u etkiliyor'
      ],
      riskLevel: 'low'
    }
  }
]

export const getMatchById = (id: string) => {
  return mockMatches.find(match => match.id === id)
}

export const getMatchesByLeague = (leagueId: string) => {
  return mockMatches.filter(match => match.leagueId === leagueId)
}