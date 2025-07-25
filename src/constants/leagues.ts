export interface League {
  id: string
  name: string
  country: string
  logo: string
  color: string
  description: string
}

export const leagues: League[] = [
  {
    id: 'premier-league',
    name: 'Premier League',
    country: 'İngiltere',
    logo: '/images/premier_league_pro.png',
    color: 'bg-slate-100',
    description: 'Dünyanın en rekabetçi futbol ligi'
  },
  {
    id: 'super-lig',
    name: 'Süper Lig',
    country: 'Türkiye',
    logo: '/images/super_lig_pro.png',
    color: 'bg-slate-100',
    description: 'Türkiye\'nin en üst düzey futbol ligi'
  },
  {
    id: 'champions-league',
    name: 'Şampiyonlar Ligi',
    country: 'Avrupa',
    logo: '/images/champions_league_pro.png',
    color: 'bg-slate-100',
    description: 'Avrupa\'nın en prestijli kulüp turnuvası'
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    country: 'Almanya',
    logo: '/images/bundesliga_pro.png',
    color: 'bg-slate-100',
    description: 'Almanya\'nın birinci futbol ligi'
  },
  {
    id: 'serie-a',
    name: 'Seri A',
    country: 'İtalya',
    logo: '/images/serie_a_pro.png',
    color: 'bg-slate-100',
    description: 'İtalya\'nın en üst düzey futbol ligi'
  },
  {
    id: 'la-liga',
    name: 'La Liga',
    country: 'İspanya',
    logo: '/images/la_liga_pro.png',
    color: 'bg-slate-100',
    description: 'İspanya\'nın birinci futbol ligi'
  },
  {
    id: 'ligue-1',
    name: 'Lig 1',
    country: 'Fransa',
    logo: '/images/ligue_1_pro.png',
    color: 'bg-slate-100',
    description: 'Fransa\'nın en üst düzey futbol ligi'
  },
  {
    id: 'europa-league',
    name: 'Europa League',
    country: 'Avrupa',
    logo: '/images/europa_league_pro.png',
    color: 'bg-slate-100',
    description: 'UEFA\'nın ikinci seviye kulüp turnuvası'
  }
]

export const getLeagueById = (id: string) => {
  return leagues.find(league => league.id === id)
}

export const getLeaguesByCountry = (country: string) => {
  return leagues.filter(league => league.country === country)
}