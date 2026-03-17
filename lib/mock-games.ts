/**
 * Mock Games Data
 * 
 * Contains realistic NFL game data that clips can reference.
 * Games serve as the parent container for clips.
 */

import type { Game, GameStatus, GameWeather, BroadcastInfo, GameScore } from "@/types/game"

// ---------------------------------------------------------------------------
// Mock Games
// ---------------------------------------------------------------------------

export const mockGames: Game[] = [
  // Week 11 Games (2024 Season)
  {
    id: "game-001",
    homeTeamId: "kc",
    awayTeamId: "buf",
    date: "2024-11-17",
    kickoffTime: "16:25",
    season: "2024",
    week: 11,
    gameType: "regular",
    status: "final",
    score: {
      home: 21,
      away: 30,
      quarters: {
        q1: { home: 7, away: 10 },
        q2: { home: 7, away: 6 },
        q3: { home: 0, away: 7 },
        q4: { home: 7, away: 7 },
      },
    },
    venue: "GEHA Field at Arrowhead Stadium",
    city: "Kansas City, MO",
    weather: {
      temperature: 45,
      condition: "cloudy",
      windSpeed: 12,
      humidity: 65,
    },
    attendance: 76416,
    broadcast: {
      network: "CBS",
      announcers: ["Jim Nantz", "Tony Romo"],
    },
    matchupDisplay: "BUF @ KC",
  },
  {
    id: "game-002",
    homeTeamId: "chi",
    awayTeamId: "gb",
    date: "2024-11-17",
    kickoffTime: "13:00",
    season: "2024",
    week: 11,
    gameType: "regular",
    status: "final",
    score: {
      home: 19,
      away: 38,
      quarters: {
        q1: { home: 3, away: 14 },
        q2: { home: 10, away: 10 },
        q3: { home: 0, away: 7 },
        q4: { home: 6, away: 7 },
      },
    },
    venue: "Soldier Field",
    city: "Chicago, IL",
    weather: {
      temperature: 38,
      condition: "windy",
      windSpeed: 22,
      humidity: 55,
    },
    attendance: 61500,
    broadcast: {
      network: "FOX",
      announcers: ["Kevin Burkhardt", "Tom Brady"],
    },
    matchupDisplay: "GB @ CHI",
  },
  {
    id: "game-003",
    homeTeamId: "bal",
    awayTeamId: "pit",
    date: "2024-11-17",
    kickoffTime: "13:00",
    season: "2024",
    week: 11,
    gameType: "regular",
    status: "final",
    score: {
      home: 28,
      away: 14,
      quarters: {
        q1: { home: 7, away: 7 },
        q2: { home: 14, away: 0 },
        q3: { home: 0, away: 7 },
        q4: { home: 7, away: 0 },
      },
    },
    venue: "M&T Bank Stadium",
    city: "Baltimore, MD",
    weather: {
      temperature: 52,
      condition: "clear",
      windSpeed: 8,
      humidity: 45,
    },
    attendance: 71008,
    broadcast: {
      network: "CBS",
      announcers: ["Ian Eagle", "Charles Davis"],
    },
    matchupDisplay: "PIT @ BAL",
  },
  {
    id: "game-004",
    homeTeamId: "dal",
    awayTeamId: "sf",
    date: "2024-11-17",
    kickoffTime: "20:20",
    season: "2024",
    week: 11,
    gameType: "regular",
    status: "final",
    score: {
      home: 17,
      away: 24,
      quarters: {
        q1: { home: 0, away: 7 },
        q2: { home: 10, away: 10 },
        q3: { home: 0, away: 0 },
        q4: { home: 7, away: 7 },
      },
    },
    venue: "AT&T Stadium",
    city: "Arlington, TX",
    weather: {
      temperature: 72,
      condition: "dome",
    },
    attendance: 93584,
    broadcast: {
      network: "NBC",
      announcers: ["Mike Tirico", "Cris Collinsworth"],
    },
    matchupDisplay: "SF @ DAL",
  },
  {
    id: "game-005",
    homeTeamId: "nyg",
    awayTeamId: "phi",
    date: "2024-11-17",
    kickoffTime: "13:00",
    season: "2024",
    week: 11,
    gameType: "regular",
    status: "final",
    score: {
      home: 7,
      away: 28,
      quarters: {
        q1: { home: 0, away: 14 },
        q2: { home: 7, away: 7 },
        q3: { home: 0, away: 0 },
        q4: { home: 0, away: 7 },
      },
    },
    venue: "MetLife Stadium",
    city: "East Rutherford, NJ",
    weather: {
      temperature: 48,
      condition: "cloudy",
      windSpeed: 10,
      humidity: 60,
    },
    attendance: 82500,
    broadcast: {
      network: "FOX",
      announcers: ["Joe Davis", "Greg Olsen"],
    },
    matchupDisplay: "PHI @ NYG",
  },
  {
    id: "game-006",
    homeTeamId: "min",
    awayTeamId: "det",
    date: "2024-11-17",
    kickoffTime: "13:00",
    season: "2024",
    week: 11,
    gameType: "regular",
    status: "final",
    score: {
      home: 24,
      away: 31,
      quarters: {
        q1: { home: 7, away: 10 },
        q2: { home: 10, away: 7 },
        q3: { home: 0, away: 7 },
        q4: { home: 7, away: 7 },
      },
    },
    venue: "U.S. Bank Stadium",
    city: "Minneapolis, MN",
    weather: {
      temperature: 72,
      condition: "dome",
    },
    attendance: 66860,
    broadcast: {
      network: "FOX",
      announcers: ["Adam Amin", "Mark Schlereth"],
    },
    matchupDisplay: "DET @ MIN",
  },

  // Week 12 Games
  {
    id: "game-007",
    homeTeamId: "det",
    awayTeamId: "chi",
    date: "2024-11-28",
    kickoffTime: "12:30",
    season: "2024",
    week: 12,
    gameType: "regular",
    status: "final",
    score: {
      home: 23,
      away: 20,
      quarters: {
        q1: { home: 6, away: 7 },
        q2: { home: 7, away: 6 },
        q3: { home: 7, away: 0 },
        q4: { home: 3, away: 7 },
      },
    },
    venue: "Ford Field",
    city: "Detroit, MI",
    weather: {
      temperature: 72,
      condition: "dome",
    },
    attendance: 65000,
    broadcast: {
      network: "CBS",
      announcers: ["Jim Nantz", "Tony Romo"],
    },
    matchupDisplay: "CHI @ DET",
  },
  {
    id: "game-008",
    homeTeamId: "mia",
    awayTeamId: "nyj",
    date: "2024-11-24",
    kickoffTime: "13:00",
    season: "2024",
    week: 12,
    gameType: "regular",
    status: "final",
    score: {
      home: 32,
      away: 26,
      quarters: {
        q1: { home: 10, away: 3 },
        q2: { home: 7, away: 10 },
        q3: { home: 8, away: 6 },
        q4: { home: 7, away: 7 },
      },
    },
    venue: "Hard Rock Stadium",
    city: "Miami Gardens, FL",
    weather: {
      temperature: 78,
      condition: "clear",
      windSpeed: 5,
      humidity: 70,
    },
    attendance: 65326,
    broadcast: {
      network: "CBS",
      announcers: ["Ian Eagle", "Charles Davis"],
    },
    matchupDisplay: "NYJ @ MIA",
  },

  // Week 13 - Upcoming games
  {
    id: "game-009",
    homeTeamId: "buf",
    awayTeamId: "sf",
    date: "2024-12-01",
    kickoffTime: "20:20",
    season: "2024",
    week: 13,
    gameType: "regular",
    status: "scheduled",
    venue: "Highmark Stadium",
    city: "Orchard Park, NY",
    weather: {
      temperature: 35,
      condition: "snow",
      windSpeed: 15,
      humidity: 80,
    },
    broadcast: {
      network: "NBC",
      announcers: ["Mike Tirico", "Cris Collinsworth"],
    },
    matchupDisplay: "SF @ BUF",
  },
  {
    id: "game-010",
    homeTeamId: "kc",
    awayTeamId: "lv",
    date: "2024-11-29",
    kickoffTime: "15:00",
    season: "2024",
    week: 13,
    gameType: "regular",
    status: "scheduled",
    venue: "GEHA Field at Arrowhead Stadium",
    city: "Kansas City, MO",
    broadcast: {
      network: "Amazon Prime",
      announcers: ["Al Michaels", "Kirk Herbstreit"],
    },
    matchupDisplay: "LV @ KC",
  },
]

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Get a game by its ID
 */
export function getGameById(gameId: string): Game | undefined {
  return mockGames.find((g) => g.id === gameId)
}

/**
 * Get all games for a specific team
 */
export function getGamesForTeam(teamId: string): Game[] {
  return mockGames.filter(
    (g) => g.homeTeamId === teamId || g.awayTeamId === teamId
  )
}

/**
 * Get all games for a specific week
 */
export function getGamesByWeek(season: string, week: number): Game[] {
  return mockGames.filter((g) => g.season === season && g.week === week)
}

/**
 * Get all games for a specific season
 */
export function getGamesBySeason(season: string): Game[] {
  return mockGames.filter((g) => g.season === season)
}

/**
 * Get games by status
 */
export function getGamesByStatus(status: GameStatus): Game[] {
  return mockGames.filter((g) => g.status === status)
}

/**
 * Get all completed (final) games
 */
export function getCompletedGames(): Game[] {
  return getGamesByStatus("final")
}

/**
 * Get all scheduled (upcoming) games
 */
export function getScheduledGames(): Game[] {
  return getGamesByStatus("scheduled")
}

/**
 * Get matchup between two teams (most recent)
 */
export function getMatchup(teamId1: string, teamId2: string): Game | undefined {
  return mockGames.find(
    (g) =>
      (g.homeTeamId === teamId1 && g.awayTeamId === teamId2) ||
      (g.homeTeamId === teamId2 && g.awayTeamId === teamId1)
  )
}

/**
 * Get all unique weeks available in the data
 */
export function getAvailableWeeks(): { season: string; week: number }[] {
  const weeks = new Map<string, { season: string; week: number }>()
  mockGames.forEach((g) => {
    const key = `${g.season}-${g.week}`
    if (!weeks.has(key)) {
      weeks.set(key, { season: g.season, week: g.week })
    }
  })
  return Array.from(weeks.values()).sort((a, b) => {
    if (a.season !== b.season) return b.season.localeCompare(a.season)
    return a.week - b.week
  })
}

/**
 * Get all unique seasons available in the data
 */
export function getAvailableSeasons(): string[] {
  return [...new Set(mockGames.map((g) => g.season))].sort().reverse()
}
