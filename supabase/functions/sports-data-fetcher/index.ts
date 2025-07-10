// supabase/functions/sports-data-fetcher/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface APIFootballFixture {
  fixture: {
    id: number
    referee: string
    timezone: string
    date: string
    timestamp: number
    status: {
      long: string
      short: string
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string
    season: number
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
    }
    away: {
      id: number
      name: string
      logo: string
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: {
      home: number | null
      away: number | null
    }
    fulltime: {
      home: number | null
      away: number | null
    }
  }
}

interface TeamStats {
  team: {
    id: number
    name: string
  }
  fixtures: {
    played: {
      home: number
      away: number
      total: number
    }
    wins: {
      home: number
      away: number
      total: number
    }
    draws: {
      home: number
      away: number
      total: number
    }
    loses: {
      home: number
      away: number
      total: number
    }
  }
  goals: {
    for: {
      total: {
        home: number
        away: number
        total: number
      }
    }
    against: {
      total: {
        home: number
        away: number
        total: number
      }
    }
  }
}

// Supported leagues configuration
const SUPPORTED_LEAGUES = {
  39: { name: 'Premier League', country: 'England', league_id: 'premier-league' },
  140: { name: 'La Liga', country: 'Spain', league_id: 'la-liga' },
  78: { name: 'Bundesliga', country: 'Germany', league_id: 'bundesliga' },
  135: { name: 'Serie A', country: 'Italy', league_id: 'serie-a' },
  61: { name: 'Ligue 1', country: 'France', league_id: 'ligue-1' },
  203: { name: 'Süper Lig', country: 'Turkey', league_id: 'super-lig' },
  2: { name: 'Champions League', country: 'Europe', league_id: 'champions-league' },
  3: { name: 'Europa League', country: 'Europe', league_id: 'europa-league' }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const apiFootballKey = Deno.env.get('API_FOOTBALL_KEY')
    if (!apiFootballKey) {
      throw new Error('API-Football key not configured')
    }

    console.log('Starting weekly sports data fetch...')

    // Calculate date range (next 7 days)
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const fromDate = today.toISOString().split('T')[0]
    const toDate = nextWeek.toISOString().split('T')[0]

    let totalFetched = 0
    let totalSaved = 0
    let errors: string[] = []

    // Fetch fixtures for each supported league
    for (const [leagueId, leagueInfo] of Object.entries(SUPPORTED_LEAGUES)) {
      try {
        console.log(`Fetching fixtures for ${leagueInfo.name}...`)
        
        // Get current season
        const currentYear = new Date().getFullYear()
        const season = currentYear

        // Fetch fixtures
        const fixturesUrl = `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${leagueId}&season=${season}&from=${fromDate}&to=${toDate}`
        
        const fixturesResponse = await fetch(fixturesUrl, {
          headers: {
            'X-RapidAPI-Key': apiFootballKey,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
          }
        })

        if (!fixturesResponse.ok) {
          throw new Error(`API-Football error: ${fixturesResponse.status}`)
        }

        const fixturesData = await fixturesResponse.json()
        const fixtures: APIFootballFixture[] = fixturesData.response || []
        
        totalFetched += fixtures.length
        console.log(`Found ${fixtures.length} fixtures for ${leagueInfo.name}`)

        // Process each fixture
        for (const fixture of fixtures) {
          try {
            // Get team statistics and recent form
            const [homeTeamForm, awayTeamForm] = await Promise.all([
              getTeamRecentForm(fixture.teams.home.id, parseInt(leagueId), season, apiFootballKey),
              getTeamRecentForm(fixture.teams.away.id, parseInt(leagueId), season, apiFootballKey)
            ])

            // Save or update fixture in database
            const { error: upsertError } = await supabaseClient
              .from('sports_fixtures')
              .upsert({
                api_match_id: fixture.fixture.id.toString(),
                home_team: fixture.teams.home.name,
                away_team: fixture.teams.away.name,
                league_name: leagueInfo.name,
                league_id: leagueInfo.league_id,
                match_date: fixture.fixture.date,
                status: mapFixtureStatus(fixture.fixture.status.short),
                home_team_form: homeTeamForm,
                away_team_form: awayTeamForm,
                home_team_stats: {
                  team_id: fixture.teams.home.id,
                  logo: fixture.teams.home.logo
                },
                away_team_stats: {
                  team_id: fixture.teams.away.id,
                  logo: fixture.teams.away.logo
                },
                last_updated: new Date().toISOString()
              }, {
                onConflict: 'api_match_id'
              })

            if (upsertError) {
              console.error(`Failed to save fixture ${fixture.fixture.id}:`, upsertError)
              errors.push(`Fixture ${fixture.fixture.id}: ${upsertError.message}`)
            } else {
              totalSaved++
            }

            // Rate limiting - wait 100ms between requests
            await new Promise(resolve => setTimeout(resolve, 100))

          } catch (fixtureError) {
            console.error(`Error processing fixture ${fixture.fixture.id}:`, fixtureError)
            errors.push(`Fixture ${fixture.fixture.id}: ${fixtureError.message}`)
          }
        }

        // Rate limiting between leagues - wait 1 second
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (leagueError) {
        console.error(`Error fetching league ${leagueId}:`, leagueError)
        errors.push(`League ${leagueId}: ${leagueError.message}`)
      }
    }

    // Log batch process
    const { error: logError } = await supabaseClient
      .from('batch_process_log')
      .insert({
        process_type: 'sports_data_fetch',
        status: errors.length > 0 ? 'completed_with_errors' : 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        processed_matches: totalFetched,
        successful_predictions: totalSaved,
        failed_predictions: errors.length,
        error_details: errors.length > 0 ? { errors } : null
      })

    if (logError) {
      console.error('Failed to log batch process:', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sports data fetch completed',
        stats: {
          total_fetched: totalFetched,
          total_saved: totalSaved,
          errors: errors.length,
          leagues_processed: Object.keys(SUPPORTED_LEAGUES).length
        },
        errors: errors.slice(0, 10) // Return first 10 errors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Sports data fetch error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function getTeamRecentForm(
  teamId: number, 
  leagueId: number, 
  season: number, 
  apiKey: string
): Promise<any[]> {
  try {
    // Get last 5 fixtures for the team
    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?team=${teamId}&league=${leagueId}&season=${season}&last=5`
    
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      console.error(`Failed to fetch team form for ${teamId}`)
      return []
    }

    const data = await response.json()
    const fixtures: APIFootballFixture[] = data.response || []

    return fixtures.map(fixture => ({
      date: fixture.fixture.date.split('T')[0],
      opponent: teamId === fixture.teams.home.id 
        ? fixture.teams.away.name 
        : fixture.teams.home.name,
      venue: teamId === fixture.teams.home.id ? 'home' : 'away',
      result: getMatchResult(fixture, teamId),
      score: `${fixture.goals.home || 0}-${fixture.goals.away || 0}`,
      goals_for: teamId === fixture.teams.home.id 
        ? fixture.goals.home || 0 
        : fixture.goals.away || 0,
      goals_against: teamId === fixture.teams.home.id 
        ? fixture.goals.away || 0 
        : fixture.goals.home || 0
    }))

  } catch (error) {
    console.error(`Error fetching team form for ${teamId}:`, error)
    return []
  }
}

function getMatchResult(fixture: APIFootballFixture, teamId: number): string {
  if (fixture.goals.home === null || fixture.goals.away === null) {
    return 'NS' // Not Started
  }

  const isHomeTeam = teamId === fixture.teams.home.id
  const teamGoals = isHomeTeam ? fixture.goals.home : fixture.goals.away
  const opponentGoals = isHomeTeam ? fixture.goals.away : fixture.goals.home

  if (teamGoals > opponentGoals) return 'W'
  if (teamGoals < opponentGoals) return 'L'
  return 'D'
}

function mapFixtureStatus(apiStatus: string): string {
  switch (apiStatus) {
    case 'NS': return 'scheduled'
    case '1H':
    case 'HT':
    case '2H':
    case 'ET':
    case 'BT':
    case 'P':
      return 'live'
    case 'FT':
    case 'AET':
    case 'PEN':
      return 'finished'
    case 'SUSP':
    case 'PST':
    case 'CANC':
      return 'postponed'
    default:
      return 'scheduled'
  }
}

// supabase/functions/weekly-data-sync/index.ts
// Orchestrator function that runs sports data fetch then prediction generation
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting weekly data synchronization...')

    // 1. First fetch sports data
    console.log('Step 1: Fetching sports data...')
    const sportsDataResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/sports-data-fetcher`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      }
    })

    const sportsDataResult = await sportsDataResponse.json()
    console.log('Sports data fetch result:', sportsDataResult)

    // 2. Wait a bit then generate predictions
    console.log('Step 2: Waiting 5 seconds before generating predictions...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    console.log('Step 3: Generating predictions...')
    const predictionsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/weekly-prediction-generator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      }
    })

    const predictionsResult = await predictionsResponse.json()
    console.log('Predictions generation result:', predictionsResult)

    // 3. Clean up expired cache
    console.log('Step 4: Cleaning up expired cache...')
    const { error: cleanupError } = await supabaseClient
      .from('match_predictions')
      .update({ is_valid: false })
      .lt('cache_expires_at', new Date().toISOString())

    if (cleanupError) {
      console.error('Cache cleanup error:', cleanupError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Weekly data synchronization completed',
        results: {
          sports_data: sportsDataResult,
          predictions: predictionsResult,
          cache_cleanup: cleanupError ? 'failed' : 'success'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Weekly sync error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})