export interface League {
  id: string
  name: string
  country: string
  logo: string
  color: string
  description: string
}

import premierLeagueLogo from '/images/premier_league_pro.png';
import superLigLogo from '/images/super_lig_pro.png';
import championsLeagueLogo from '/images/champions_league_pro.png';
import bundesligaLogo from '/images/bundesliga_pro.png';
import serieALogo from '/images/serie_a_pro.png';
import laLigaLogo from '/images/la_liga_pro.png';
import ligue1Logo from '/images/ligue_1_pro.png';
import europaLeagueLogo from '/images/europa_league_pro.png';

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
    logo: './images/premier_league_pro.png',
    color: 'from-purple-600 to-blue-600',
    description: 'Dünyanın en rekabetçi futbol ligi'
  },
  {
    id: 'super-lig',
    name: 'Süper Lig',
    country: 'Türkiye',
    logo: './images/super_lig_pro.png',
    color: 'from-red-600 to-yellow-600',
    description: 'Türkiye\'nin en üst düzey futbol ligi'
  },
  {
    id: 'champions-league',
    name: 'Şampiyonlar Ligi',
    country: 'Avrupa',
    logo: './images/champions_league_pro.png',
    color: 'from-blue-700 to-blue-900',
    description: 'Avrupa\'nın en prestijli kulüp turnuvası'
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    country: 'Almanya',
    logo: './images/bundesliga_pro.png',
    color: 'from-red-600 to-black',
    description: 'Almanya\'nın birinci futbol ligi'
  },
  {
    id: 'serie-a',
    name: 'Seri A',
    country: 'İtalya',
    logo: './images/serie_a_pro.png',
    color: 'from-green-600 to-red-600',
    description: 'İtalya\'nın en üst düzey futbol ligi'
  },
  {
    id: 'la-liga',
    name: 'La Liga',
    country: 'İspanya',
    logo: './images/la_liga_pro.png',
    color: 'from-yellow-500 to-red-600',
    description: 'İspanya\'nın birinci futbol ligi'
  },
  {
    id: 'ligue-1',
    name: 'Lig 1',
    country: 'Fransa',
    logo: './images/ligue_1_pro.png',
    color: 'from-blue-600 to-red-600',
    description: 'Fransa\'nın en üst düzey futbol ligi'
  },
  {
    id: 'europa-league',
    name: 'Europa League',
    country: 'Avrupa',
    logo: './images/europa_league_pro.png',
    color: 'from-orange-500 to-yellow-500',
    description: 'UEFA\'nın ikinci seviye kulüp turnuvası'
  }
]

export const getLeagueById = (id: string) => {
  return leagues.find(league => league.id === id)
}

export const getLeaguesByCountry = (country: string) => {
  return leagues.filter(league => league.country === country)
}