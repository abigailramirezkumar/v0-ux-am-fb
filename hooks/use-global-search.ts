import { useState, useMemo } from "react"
import { useLibraryContext } from "@/lib/library-context"
import { searchLibrary, type SearchResult } from "@/lib/search-utils"
import { mockClips, type Clip } from "@/lib/mock-clips"
import { athletes } from "@/lib/athletes-data"
import type { Athlete } from "@/types/athlete"
import { sportsData, type Team } from "@/lib/sports-data"

// Extend Athlete type with id for search results
export type AthleteSearchResult = Athlete & { id: string }

// Team search result with league info
export interface TeamSearchResult extends Team {
  league: string
  conference: string
}

export interface GlobalSearchResults {
  folders: SearchResult[]
  items: SearchResult[]
  clips: Clip[]
  athletes: AthleteSearchResult[]
  teams: TeamSearchResult[]
}

// Get all teams from sports data with their league/conference info
function getAllTeamsFromSportsData(): TeamSearchResult[] {
  const teams: TeamSearchResult[] = []
  
  for (const [league, data] of Object.entries(sportsData)) {
    for (const conference of data.conferences) {
      // Direct teams in conference
      for (const team of conference.teams) {
        teams.push({ ...team, league, conference: conference.name })
      }
      // Teams in subdivisions
      if (conference.subdivisions) {
        for (const subdivision of conference.subdivisions) {
          for (const team of subdivision.teams) {
            teams.push({ ...team, league, conference: subdivision.name })
          }
        }
      }
    }
  }
  
  return teams
}

const allTeams = getAllTeamsFromSportsData()

export function useGlobalSearch() {
  const { folders } = useLibraryContext()
  const [query, setQuery] = useState("")

  const results = useMemo<GlobalSearchResults>(() => {
    if (!query || query.length < 2) return { folders: [], items: [], clips: [], athletes: [], teams: [] }

    const lowerQ = query.toLowerCase()
    
    // 1. Search Library (Folders & Files)
    const libraryResults = searchLibrary(folders, query)
    const folderResults = libraryResults.filter(r => r.type === "folder")
    const itemResults = libraryResults.filter(r => r.type === "item")

    // 2. Search Clips (NLP Simulation)
    // Extract "3rd down", "long", "redzone", teams
    const is3rdDown = lowerQ.includes("3rd") || lowerQ.includes("third")
    const is1stDown = lowerQ.includes("1st") || lowerQ.includes("first")
    const is2ndDown = lowerQ.includes("2nd") || lowerQ.includes("second")
    const is4thDown = lowerQ.includes("4th") || lowerQ.includes("fourth")
    const isLong = lowerQ.includes("long")
    const isShort = lowerQ.includes("short")
    const isPass = lowerQ.includes("pass")
    const isRun = lowerQ.includes("run")
    const isTouchdown = lowerQ.includes("touchdown") || lowerQ.includes("td")
    const isRedzone = lowerQ.includes("redzone") || lowerQ.includes("red zone")
    
    // Simple team detection (naive)
    const teamTerms = ["rams", "chiefs", "bills", "eagles", "49ers", "cowboys", "packers", "bears", "gb", "chi", "kc", "bal", "sf", "dal", "phi", "det", "min"]
    const matchedTeam = teamTerms.find(t => lowerQ.includes(t))

    const clipResults = mockClips.filter(clip => {
      let score = 0
      
      // Text match (basic)
      if (clip.matchup.toLowerCase().includes(lowerQ) || clip.gameId.includes(query)) score += 10

      // Semantic match - Teams
      if (matchedTeam && clip.matchup.toLowerCase().includes(matchedTeam)) score += 5

      // Down matching
      if (is1stDown && clip.down === 1) score += 5
      if (is2ndDown && clip.down === 2) score += 5
      if (is3rdDown && clip.down === 3) score += 5
      if (is4thDown && clip.down === 4) score += 5

      // Distance matching
      if (isLong && clip.distance > 7) score += 5
      if (isShort && clip.distance <= 3) score += 5

      // Play type matching
      if (isPass && clip.passing) score += 3
      if (isRun && clip.rushing) score += 3

      // Situation matching
      if (isTouchdown && clip.playResult.touchdown) score += 5
      if (isRedzone && clip.yardLine >= 80) score += 5

      return score > 0
    }).slice(0, 5) // Limit clip results

    // 3. Search Athletes
    const athleteResults = athletes.filter(athlete => {
      const nameMatch = athlete.name.toLowerCase().includes(lowerQ)
      const teamMatch = athlete.team.toLowerCase().includes(lowerQ)
      const positionMatch = athlete.position.toLowerCase() === lowerQ
      const collegeMatch = athlete.college?.toLowerCase().includes(lowerQ)
      return nameMatch || teamMatch || positionMatch || collegeMatch
    }).slice(0, 5)

    // 4. Search Teams
    const teamResults = allTeams.filter(team => {
      const nameMatch = team.name.toLowerCase().includes(lowerQ)
      const abbrevMatch = team.abbreviation.toLowerCase().includes(lowerQ)
      const conferenceMatch = team.conference.toLowerCase().includes(lowerQ)
      return nameMatch || abbrevMatch || conferenceMatch
    }).slice(0, 5)

    return {
      folders: folderResults.slice(0, 5),
      items: itemResults.slice(0, 5),
      clips: clipResults,
      athletes: athleteResults,
      teams: teamResults
    }
  }, [query, folders])

  return { query, setQuery, results }
}
