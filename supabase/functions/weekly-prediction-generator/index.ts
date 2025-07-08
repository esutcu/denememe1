import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// API-Football configuration
const API_FOOTBALL_BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3'

interface Fixture {
  fixture: {
    id: number
    date: string
    status: { short: string }
  }
  league: {
    id: number
    name: string
    country: string
  }
  teams: {
    home: { id: number; name: string }
    away: { id: number; name: string }
  }
}

interface TeamStats {
  team_id: number
  team_name: string
  last_5_matches: any[]
  season_stats: any
  injuries: any[]
}

interface BatchJob {
  id: string
  job_type: string
  status: string
  config: any
}

// Major leagues to process (expandable)
const SUPPORTED_LEAGUES = [
  { id: 39, name: 'Premier League', country: 'England' },
  { id: 203, name: 'Süper Lig', country: 'Turkey' },
  { id: 78, name: 'Bundesliga', country: 'Germany' },
  { id: 135, name: 'Serie A', country: 'Italy' },
  { id: 140, name: 'LaLiga', country: 'Spain' },
  { id: 61, name: 'Ligue 1', country: 'France' },
  { id: 2, name: 'Champions League', country: 'Europe' },
  { id: 3, name: 'Europa League', country: 'Europe' }
]

// Fetch fixtures for the upcoming week
async function fetchWeeklyFixtures(apiKey: string): Promise<Fixture[]> {
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const dateFrom = today.toISOString().split('T')[0]
  const dateTo = nextWeek.toISOString().split('T')[0]
  
  const allFixtures: Fixture[] = []
  
  for (const league of SUPPORTED_LEAGUES) {
    try {
      console.log(`Fetching fixtures for ${league.name} (${league.id})`)
      
      const response = await fetch(
        `${API_FOOTBALL_BASE_URL}/fixtures?league=${league.id}&season=2025&from=${dateFrom}&to=${dateTo}`,
        {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
          }
        }
      )
      
      if (!response.ok) {
        console.error(`API-Football error for league ${league.id}:`, response.status)
        continue
      }
      
      const data = await response.json()
      
      if (data.response && Array.isArray(data.response)) {
        // Filter only upcoming matches
        const upcomingFixtures = data.response.filter((fixture: Fixture) => 
          fixture.fixture.status.short === 'NS' // Not Started
        )
        
        allFixtures.push(...upcomingFixtures)
        console.log(`Found ${upcomingFixtures.length} upcoming fixtures for ${league.name}`)
      }
      
      // Rate limiting - API-Football has limits
      await new Promise(resolve => setTimeout(resolve, 200))
      
    } catch (error) {
      console.error(`Error fetching ${league.name} fixtures:`, error)
    }
  }
  
  console.log(`Total fixtures found: ${allFixtures.length}`)
  return allFixtures
}

// Fetch team statistics and recent form
async function fetchTeamData(teamId: number, leagueId: number, apiKey: string): Promise<TeamStats | null> {
  try {
    // Get last 5 matches
    const fixturesResponse = await fetch(
      `${API_FOOTBALL_BASE_URL}/fixtures?team=${teamId}&last=5`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
      }
    )
    
    let last5Matches = []
    if (fixturesResponse.ok) {
      const fixturesData = await fixturesResponse.json()
      last5Matches = fixturesData.response?.slice(0, 5) || []
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Get team statistics
    const statsResponse = await fetch(
      `${API_FOOTBALL_BASE_URL}/teams/statistics?league=${leagueId}&season=2025&team=${teamId}`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
      }
    )
    
    let seasonStats = {}
    if (statsResponse.ok) {
      const statsData = await statsResponse.json()
      seasonStats = statsData.response || {}
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Get injuries
    const injuriesResponse = await fetch(
      `${API_FOOTBALL_BASE_URL}/injuries?team=${teamId}`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
      }
    )
    
    let injuries = []
    if (injuriesResponse.ok) {
      const injuriesData = await injuriesResponse.json()
      injuries = injuriesData.response?.slice(0, 10) || [] // Limit to 10 injuries
    }
    
    return {
      team_id: teamId,
      team_name: '', // Will be filled from fixture data
      last_5_matches: last5Matches,
      season_stats: seasonStats,
      injuries: injuries
    }
    
  } catch (error) {
    console.error(`Error fetching team data for ${teamId}:`, error)
    return null
  }
}

// Process single fixture and generate prediction
async function processFixture(
  fixture: Fixture, 
  supabase: any, 
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const matchId = `api_${fixture.fixture.id}`
    
    // Check if prediction already exists and is still valid
    const { data: existingPrediction } = await supabase
      .from('match_predictions')
      .select('id')
      .eq('match_id', matchId)
      .eq('is_active', true)
      .gt('cache_expires_at', new Date().toISOString())
      .single()
    
    if (existingPrediction) {
      console.log(`Prediction already exists for match ${matchId}`)
      return { success: true }
    }
    
    // Fetch team data
    console.log(`Fetching data for ${fixture.teams.home.name} vs ${fixture.teams.away.name}`)
    
    const [homeTeamData, awayTeamData] = await Promise.all([
      fetchTeamData(fixture.teams.home.id, fixture.league.id, apiKey),
      fetchTeamData(fixture.teams.away.id, fixture.league.id, apiKey)
    ])
    
    // Prepare match data for LLM
    const matchData = {
      match_id: matchId,
      home_team: fixture.teams.home.name,
      away_team: fixture.teams.away.name,
      league_name: fixture.league.name,
      match_date: fixture.fixture.date,
      home_last_5: homeTeamData?.last_5_matches?.map(match => ({
        result: match.teams.home.id === fixture.teams.home.id 
          ? (match.goals.home > match.goals.away ? 'W' : match.goals.home === match.goals.away ? 'D' : 'L')
          : (match.goals.away > match.goals.home ? 'W' : match.goals.away === match.goals.home ? 'D' : 'L'),
        goals_for: match.teams.home.id === fixture.teams.home.id ? match.goals.home : match.goals.away,
        goals_against: match.teams.home.id === fixture.teams.home.id ? match.goals.away : match.goals.home,
        opponent: match.teams.home.id === fixture.teams.home.id ? match.teams.away.name : match.teams.home.name
      })) || [],
      away_last_5: awayTeamData?.last_5_matches?.map(match => ({
        result: match.teams.away.id === fixture.teams.away.id 
          ? (match.goals.away > match.goals.home ? 'W' : match.goals.away === match.goals.home ? 'D' : 'L')
          : (match.goals.home > match.goals.away ? 'W' : match.goals.home === match.goals.away ? 'D' : 'L'),
        goals_for: match.teams.away.id === fixture.teams.away.id ? match.goals.away : match.goals.home,
        goals_against: match.teams.away.id === fixture.teams.away.id ? match.goals.home : match.goals.away,
        opponent: match.teams.away.id === fixture.teams.away.id ? match.teams.home.name : match.teams.away.name
      })) || [],
      head_to_head: [], // TODO: Fetch H2H data
      league_stats: {
        home_team_stats: homeTeamData?.season_stats || {},
        away_team_stats: awayTeamData?.season_stats || {},
        home_injuries: homeTeamData?.injuries || [],
        away_injuries: awayTeamData?.injuries || []
      }
    }
    
    // Call LLM processor
    console.log(`Generating prediction for ${fixture.teams.home.name} vs ${fixture.teams.away.name}`)
    
    const llmResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/llm-query-processor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ matchData })
    })
    
    if (!llmResponse.ok) {
      const errorText = await llmResponse.text()
      console.error(`LLM processor failed for match ${matchId}:`, llmResponse.status, errorText)
      return { success: false, error: `LLM failed: ${errorText}` }
    }
    
    const llmResult = await llmResponse.json()
    
    if (!llmResult.success) {
      console.error(`LLM prediction failed for match ${matchId}:`, llmResult.error)
      return { success: false, error: llmResult.error }
    }
    
    console.log(`Successfully generated prediction for ${matchId}`)
    return { success: true }
    
  } catch (error) {
    console.error(`Error processing fixture ${fixture.fixture.id}:`, error)
    return { success: false, error: error.message }
  }
}

// Clean up expired cache entries
async function cleanupExpiredCache(supabase: any): Promise<number> {
  const { data, error } = await supabase
    .from('match_predictions')
    .update({ is_active: false })
    .lt('cache_expires_at', new Date().toISOString())
    .eq('is_active', true)
    .select('id')
  
  if (error) {
    console.error('Failed to cleanup expired cache:', error)
    return 0
  }
  
  console.log(`Cleaned up ${data?.length || 0} expired cache entries`)
  return data?.length || 0
}

// Main batch processing function
serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      })
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get API-Football key
    const apiFootballKey = Deno.env.get('API_FOOTBALL_KEY')
    if (!apiFootballKey) {
      return new Response('API-Football key not configured', { status: 500 })
    }

    // Create batch job record
    const { data: batchJob, error: jobError } = await supabase
      .from('batch_jobs')
      .insert({
        job_type: 'weekly_predictions',
        status: 'running',
        config: {
          leagues: SUPPORTED_LEAGUES.map(l => l.id),
          triggered_by: 'manual' // or 'cron'
        },
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (jobError) {
      console.error('Failed to create batch job:', jobError)
      return new Response('Failed to create batch job', { status: 500 })
    }

    console.log(`Starting weekly batch job ${batchJob.id}`)

    let processedItems = 0
    let successfulItems = 0
    let failedItems = 0
    const errors: string[] = []

    try {
      // Step 1: Clean up expired cache
      const cleanedUp = await cleanupExpiredCache(supabase)
      console.log(`Cleaned up ${cleanedUp} expired entries`)

      // Step 2: Fetch upcoming fixtures
      console.log('Fetching upcoming fixtures...')
      const fixtures = await fetchWeeklyFixtures(apiFootballKey)
      
      if (fixtures.length === 0) {
        console.log('No upcoming fixtures found')
        
        // Update job as completed
        await supabase
          .from('batch_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            processed_items: 0,
            successful_items: 0,
            failed_items: 0
          })
          .eq('id', batchJob.id)

        return new Response(
          JSON.stringify({
            success: true,
            message: 'No fixtures to process',
            job_id: batchJob.id,
            stats: { processed: 0, successful: 0, failed: 0 }
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        )
      }

      console.log(`Processing ${fixtures.length} fixtures...`)

      // Step 3: Process each fixture
      for (const fixture of fixtures) {
        processedItems++
        
        const result = await processFixture(fixture, supabase, apiFootballKey)
        
        if (result.success) {
          successfulItems++
        } else {
          failedItems++
          if (result.error) {
            errors.push(`${fixture.teams.home.name} vs ${fixture.teams.away.name}: ${result.error}`)
          }
        }

        // Update progress periodically
        if (processedItems % 10 === 0) {
          await supabase
            .from('batch_jobs')
            .update({
              processed_items: processedItems,
              successful_items: successfulItems,
              failed_items: failedItems,
              errors: errors
            })
            .eq('id', batchJob.id)
          
          console.log(`Progress: ${processedItems}/${fixtures.length} processed`)
        }

        // Rate limiting to avoid overwhelming APIs
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Final job update
      await supabase
        .from('batch_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          processed_items: processedItems,
          successful_items: successfulItems,
          failed_items: failedItems,
          errors: errors
        })
        .eq('id', batchJob.id)

      console.log(`Batch job completed. Processed: ${processedItems}, Success: ${successfulItems}, Failed: ${failedItems}`)

      return new Response(
        JSON.stringify({
          success: true,
          job_id: batchJob.id,
          message: 'Weekly predictions generated successfully',
          stats: {
            processed: processedItems,
            successful: successfulItems,
            failed: failedItems,
            cleanedUp
          },
          errors: errors.slice(0, 10) // Limit error list
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )

    } catch (batchError) {
      console.error('Batch processing error:', batchError)
      
      // Update job as failed
      await supabase
        .from('batch_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          processed_items: processedItems,
          successful_items: successfulItems,
          failed_items: failedItems,
          errors: [...errors, batchError.message]
        })
        .eq('id', batchJob.id)

      throw batchError
    }

  } catch (error) {
    console.error('Weekly Prediction Generator Error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})