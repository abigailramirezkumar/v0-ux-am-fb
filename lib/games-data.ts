import type { League, Team } from "./sports-data"
import { sportsData } from "./sports-data"

export interface Game {
  id: string
  date: string
  homeTeam: Team
  awayTeam: Team
  homeScore: number
  awayScore: number
  league: League
  season: string
  week?: number
  isPlayoff?: boolean
  venue?: string
  clipCount: number
}

// Helper to get all teams from a league
function getAllTeamsFromLeague(league: League): Team[] {
  const teams: Team[] = []
  const data = sportsData[league]
  
  for (const conference of data.conferences) {
    if (conference.subdivisions) {
      for (const division of conference.subdivisions) {
        teams.push(...division.teams)
      }
    }
    teams.push(...conference.teams)
  }
  
  return teams
}

// Seeded random for consistent data
function createSeededRandom(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Generate games for a league
function generateGames(league: League, count: number, seed: number): Game[] {
  const random = createSeededRandom(seed)
  const teams = getAllTeamsFromLeague(league)
  const seasons = sportsData[league].seasons
  const games: Game[] = []
  
  if (teams.length < 2) return games
  
  const venues = [
    "Home Stadium",
    "Away Stadium", 
    "Neutral Site",
    "Bowl Game",
    "Championship Field"
  ]
  
  for (let i = 0; i < count; i++) {
    const homeIndex = Math.floor(random() * teams.length)
    let awayIndex = Math.floor(random() * teams.length)
    while (awayIndex === homeIndex) {
      awayIndex = Math.floor(random() * teams.length)
    }
    
    const homeTeam = teams[homeIndex]
    const awayTeam = teams[awayIndex]
    const season = seasons[Math.floor(random() * seasons.length)]
    const week = Math.floor(random() * 17) + 1
    const isPlayoff = random() > 0.85
    
    // Generate realistic football scores
    const homeScore = Math.floor(random() * 35) + 7
    const awayScore = Math.floor(random() * 35) + 7
    
    // Generate date within the season
    const month = random() > 0.5 ? (random() > 0.5 ? 9 : 10) : (random() > 0.5 ? 11 : 12)
    const day = Math.floor(random() * 28) + 1
    const date = `${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}/${season.slice(-2)}`
    
    games.push({
      id: `game-${league.toLowerCase().replace(/[^a-z]/g, "")}-${i}`,
      date,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      league,
      season,
      week: isPlayoff ? undefined : week,
      isPlayoff,
      venue: venues[Math.floor(random() * venues.length)],
      clipCount: Math.floor(random() * 80) + 20,
    })
  }
  
  // Sort by date descending (most recent first)
  return games.sort((a, b) => {
    const [aMonth, aDay, aYear] = a.date.split("/").map(Number)
    const [bMonth, bDay, bYear] = b.date.split("/").map(Number)
    if (aYear !== bYear) return bYear - aYear
    if (aMonth !== bMonth) return bMonth - aMonth
    return bDay - aDay
  })
}

// Generate games for all leagues
export const gamesData: Record<League, Game[]> = {
  NFL: generateGames("NFL", 48, 12345),
  "NCAA (FBS)": generateGames("NCAA (FBS)", 60, 67890),
  "High School": generateGames("High School", 40, 11111),
}

// Get all games across all leagues
export function getAllGames(): Game[] {
  const allGames: Game[] = []
  for (const league of Object.keys(gamesData) as League[]) {
    allGames.push(...gamesData[league])
  }
  return allGames
}

// Get games filtered by various criteria
export interface GamesFilterState {
  leagues: Set<League>
  seasons: Set<string>
  teams: Set<string>
}

export function filterGames(games: Game[], filters: GamesFilterState): Game[] {
  return games.filter((game) => {
    // League filter
    if (filters.leagues.size > 0 && !filters.leagues.has(game.league)) {
      return false
    }
    
    // Season filter
    if (filters.seasons.size > 0 && !filters.seasons.has(game.season)) {
      return false
    }
    
    // Team filter (match if either team matches)
    if (filters.teams.size > 0) {
      const hasTeam = filters.teams.has(game.homeTeam.id) || filters.teams.has(game.awayTeam.id)
      if (!hasTeam) return false
    }
    
    return true
  })
}
