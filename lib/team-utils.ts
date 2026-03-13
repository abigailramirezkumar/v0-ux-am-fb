import { sportsData, type Team, type League } from "@/lib/sports-data"

// Build a lookup map of team abbreviation -> Team data
function buildTeamLookup(): Map<string, { team: Team; league: League }> {
  const lookup = new Map<string, { team: Team; league: League }>()
  
  for (const [league, data] of Object.entries(sportsData) as [League, typeof sportsData[League]][]) {
    for (const conference of data.conferences) {
      // Handle conferences with direct teams
      for (const team of conference.teams) {
        lookup.set(team.abbreviation, { team, league })
      }
      // Handle conferences with subdivisions (like NFL)
      if (conference.subdivisions) {
        for (const subdivision of conference.subdivisions) {
          for (const team of subdivision.teams) {
            lookup.set(team.abbreviation, { team, league })
          }
        }
      }
    }
  }
  
  return lookup
}

const TEAM_LOOKUP = buildTeamLookup()

/**
 * Get a Team object and its league from an abbreviation
 */
export function getTeamByAbbreviation(abbr: string): { team: Team; league: League } | null {
  return TEAM_LOOKUP.get(abbr) || null
}

/**
 * Get just the Team object from an abbreviation
 */
export function getTeamFromAbbreviation(abbr: string): Team | null {
  const result = TEAM_LOOKUP.get(abbr)
  return result?.team || null
}

/**
 * Get the league for a team abbreviation
 */
export function getLeagueByTeamAbbreviation(abbr: string): League | null {
  const result = TEAM_LOOKUP.get(abbr)
  return result?.league || null
}
