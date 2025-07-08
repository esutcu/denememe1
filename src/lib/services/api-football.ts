// Enhanced API-Football entegrasyonu
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3'

const headers = {
  'X-RapidAPI-Key': API_KEY,
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
}

// Rate limiting ve cache için
const requestQueue: Array<() => Promise<any>> = []
let isProcessing = false
const RATE_LIMIT_DELAY = 1000 // 1 second between requests