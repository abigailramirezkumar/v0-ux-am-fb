"use client"

import { useState, useMemo } from "react"
import { mockGames, mockClips, findTeamById as getTeamById } from "@/lib/games-context"
import { sportsData, type League } from "@/lib/sports-data"
import { Input } from "@/components/ui/input"
import { TeamLogo } from "@/components/team-logo"
import { cn } from "@/lib/utils"
import { Search, Check } from "lucide-react"
import type { Game, GameLeague } from "@/types/game"
import { useLibraryContext } from "@/lib/library-context"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GamesModuleProps {
  selectedLeagues: GameLeague[]
  selectedSeasons: string[]
  selectedTeams: string[]
  selectedCompetitions: string[]
  onClickGame?: (game: Game) => void
  activeGameId?: string
}

// Map GameLeague to sports-data League key
const leagueToSportsDataKey: Record<GameLeague, League> = {
  NFL: "NFL",
  College: "NCAA (FBS)",
  HighSchool: "HighSchool",
}

// Helper to check if a team is in any of the selected competitions
function isTeamInCompetitions(teamId: string, selectedCompetitions: string[]): boolean {
  if (selectedCompetitions.length === 0) return true
  
  for (const leagueKey of Object.values(leagueToSportsDataKey)) {
    const leagueData = sportsData[leagueKey]
    if (!leagueData) continue
    
    for (const conference of leagueData.conferences) {
      // Check subdivisions (NFL divisions)
      if (conference.subdivisions && conference.subdivisions.length > 0) {
        for (const subdivision of conference.subdivisions) {
          if (selectedCompetitions.includes(subdivision.id)) {
            if (subdivision.teams.some(t => t.id === teamId)) {
              return true
            }
          }
        }
      }
      // Check conference teams directly (NCAA/HighSchool)
      if (selectedCompetitions.includes(conference.id)) {
        if (conference.teams.some(t => t.id === teamId)) {
          return true
        }
      }
    }
  }
  return false
}

interface GamesBySeasonAndLeague {
  season: string
  leagues: {
    league: GameLeague
    games: Game[]
  }[]
}

// ---------------------------------------------------------------------------
// Helper: Format date to MM/DD/YY
// ---------------------------------------------------------------------------
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`
}

// ---------------------------------------------------------------------------
// Helper: Get clip count for a game
// ---------------------------------------------------------------------------
function getClipCountForGame(gameId: string): number {
  return mockClips.filter((clip) => clip.gameId === gameId).length
}

// ---------------------------------------------------------------------------
// Helper: Get week display text
// ---------------------------------------------------------------------------
function getWeekDisplay(game: Game): { text: string; isPlayoff: boolean } {
  if (game.gameType === "playoff" || game.gameType === "super-bowl") {
    return { text: "PLAYOFF", isPlayoff: true }
  }
  return { text: `Week ${game.week}`, isPlayoff: false }
}

// ---------------------------------------------------------------------------
// Team Badge Component
// ---------------------------------------------------------------------------
function TeamBadge({ teamId, className }: { teamId: string; className?: string }) {
  const team = getTeamById(teamId)
  if (!team) return null

  return (
    <TeamLogo
      teamId={teamId}
      abbreviation={team.abbreviation}
      logoColor={team.logoColor}
      size="sm"
      className={cn("w-9 h-6 rounded", className)}
    />
  )
}

// ---------------------------------------------------------------------------
// Game Tile Component
// ---------------------------------------------------------------------------
function GameTile({ 
  game, 
  onClick, 
  isActive,
  isInLibrary,
}: { 
  game: Game
  onClick?: () => void
  isActive?: boolean
  isInLibrary?: boolean
}) {
  const homeTeam = getTeamById(game.homeTeamId)
  const awayTeam = getTeamById(game.awayTeamId)
  const clipCount = getClipCountForGame(game.id)
  const weekDisplay = getWeekDisplay(game)

  if (!homeTeam || !awayTeam) return null

  // Determine winner (if game is final)
  const homeWins = game.score && game.score.home > game.score.away
  const awayWins = game.score && game.score.away > game.score.home

  return (
    <div 
      className={cn(
        "flex items-center bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg px-4 py-3 cursor-pointer border",
        isActive ? "border-primary ring-1 ring-primary" : "border-border/50"
      )}
      onClick={onClick}
    >
      {/* Left: Date and Week */}
      <div className="w-[72px] shrink-0 text-left pr-3">
        <div className="text-xs text-muted-foreground">{formatDate(game.date)}</div>
        <div className={cn(
          "text-xs font-medium",
          weekDisplay.isPlayoff ? "text-red-500" : "text-muted-foreground"
        )}>
          {weekDisplay.text}
        </div>
      </div>

      {/* Middle: Teams */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        {/* Away Team (top row) */}
        <div className="flex items-center gap-2">
          <TeamBadge teamId={game.awayTeamId} />
          <span className={cn(
            "text-sm truncate",
            awayWins ? "font-semibold text-foreground" : "text-muted-foreground"
          )}>
            {awayTeam.name}
          </span>
        </div>
        {/* Home Team (bottom row) */}
        <div className="flex items-center gap-2">
          <TeamBadge teamId={game.homeTeamId} />
          <span className={cn(
            "text-sm truncate",
            homeWins ? "font-semibold text-foreground" : "text-muted-foreground"
          )}>
            {homeTeam.name}
          </span>
        </div>
      </div>

      {/* Right: Scores */}
      <div className="w-[40px] shrink-0 text-right flex flex-col gap-1">
        {game.score ? (
          <>
            <span className={cn(
              "text-sm",
              awayWins ? "font-semibold text-foreground" : "text-muted-foreground"
            )}>
              {game.score.away}
            </span>
            <span className={cn(
              "text-sm",
              homeWins ? "font-semibold text-foreground" : "text-muted-foreground"
            )}>
              {game.score.home}
            </span>
          </>
        ) : (
          <>
            <span className="text-sm text-muted-foreground">-</span>
            <span className="text-sm text-muted-foreground">-</span>
          </>
        )}
      </div>

      {/* Far Right: Clip Count and Library Badge */}
      <div className="w-[100px] shrink-0 text-right flex flex-col items-end gap-1 pl-2">
        <span className="text-xs text-muted-foreground">{clipCount} clips</span>
        {isInLibrary && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-md border border-primary/20">
            <Check className="w-3 h-3" />
            Saved
          </span>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// League Section Component
// ---------------------------------------------------------------------------
function LeagueSection({ 
  league, 
  games,
  onClickGame,
  activeGameId,
  libraryGameIds,
}: { 
  league: GameLeague
  games: Game[]
  onClickGame?: (game: Game) => void
  activeGameId?: string
  libraryGameIds: Set<string>
}) {
  const leagueLabel = league === "HighSchool" ? "High School" : league

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">
        {leagueLabel} ({games.length})
      </h4>
      <div className="space-y-2">
        {games.map((game) => (
          <GameTile 
            key={game.id} 
            game={game} 
            onClick={() => onClickGame?.(game)}
            isActive={game.id === activeGameId}
            isInLibrary={libraryGameIds.has(game.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Games Module
// ---------------------------------------------------------------------------
export function GamesModule({
  selectedLeagues,
  selectedSeasons,
  selectedTeams,
  selectedCompetitions,
  onClickGame,
  activeGameId,
}: GamesModuleProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { mediaItems } = useLibraryContext()
  
  // Get set of game IDs that are in the library
  const libraryGameIds = useMemo(() => {
    const gameIds = new Set<string>()
    mediaItems.forEach((item) => {
      if (item.gameId) {
        gameIds.add(item.gameId)
      }
    })
    return gameIds
  }, [mediaItems])

  // Filter and organize games
  const organizedGames = useMemo(() => {
    let filtered = mockGames

    // Filter by selected leagues (if any selected, otherwise show all)
    if (selectedLeagues.length > 0) {
      filtered = filtered.filter((g) => selectedLeagues.includes(g.league))
    }

    // Filter by selected seasons (if any)
    if (selectedSeasons.length > 0) {
      filtered = filtered.filter((g) => selectedSeasons.includes(g.season))
    }

    // Filter by selected teams (if any)
    if (selectedTeams.length > 0) {
      filtered = filtered.filter((g) => 
        selectedTeams.includes(g.homeTeamId) || selectedTeams.includes(g.awayTeamId)
      )
    }

    // Filter by selected competitions (if any)
    if (selectedCompetitions.length > 0) {
      filtered = filtered.filter((g) => 
        isTeamInCompetitions(g.homeTeamId, selectedCompetitions) || 
        isTeamInCompetitions(g.awayTeamId, selectedCompetitions)
      )
    }

    // Filter by search query (team names or matchup display)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((g) => {
        const homeTeam = getTeamById(g.homeTeamId)
        const awayTeam = getTeamById(g.awayTeamId)
        return (
          g.matchupDisplay.toLowerCase().includes(query) ||
          homeTeam?.name.toLowerCase().includes(query) ||
          awayTeam?.name.toLowerCase().includes(query) ||
          homeTeam?.abbreviation.toLowerCase().includes(query) ||
          awayTeam?.abbreviation.toLowerCase().includes(query)
        )
      })
    }

    // Sort by date (newest first)
    filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Organize by season, then by league
    const bySeasonMap = new Map<string, Map<GameLeague, Game[]>>()

    filtered.forEach((game) => {
      if (!bySeasonMap.has(game.season)) {
        bySeasonMap.set(game.season, new Map())
      }
      const leagueMap = bySeasonMap.get(game.season)!
      if (!leagueMap.has(game.league)) {
        leagueMap.set(game.league, [])
      }
      leagueMap.get(game.league)!.push(game)
    })

    // Convert to array structure
    const result: GamesBySeasonAndLeague[] = []
    // Sort seasons descending
    const sortedSeasons = Array.from(bySeasonMap.keys()).sort((a, b) => b.localeCompare(a))
    
    sortedSeasons.forEach((season) => {
      const leagueMap = bySeasonMap.get(season)!
      const leagueOrder: GameLeague[] = ["NFL", "College", "HighSchool"]
      const leagues = leagueOrder
        .filter((l) => leagueMap.has(l))
        .map((l) => ({
          league: l,
          games: leagueMap.get(l)!,
        }))

      if (leagues.length > 0) {
        result.push({ season, leagues })
      }
    })

    return result
  }, [selectedLeagues, selectedSeasons, selectedTeams, selectedCompetitions, searchQuery])

  // Count total games
  const totalGames = organizedGames.reduce(
    (sum, s) => sum + s.leagues.reduce((lSum, l) => lSum + l.games.length, 0),
    0
  )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with count and search */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">All Games</span>
          <span className="text-sm text-muted-foreground">({totalGames})</span>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-border/50 text-sm"
          />
        </div>
      </div>

      {/* Games List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pl-4 pr-2 py-4 space-y-6">
          {organizedGames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">No games found</p>
              <p className="text-xs mt-1">Try adjusting your filters or search query</p>
            </div>
          ) : (
            organizedGames.map((seasonGroup) => (
              <div key={seasonGroup.season} className="space-y-4">
                {/* Season Header */}
                <h3 className="text-base font-semibold text-foreground">
                  {seasonGroup.season} Season
                </h3>
                {/* League Sections */}
                <div className="space-y-4">
                  {seasonGroup.leagues.map((leagueGroup) => (
                    <LeagueSection
                      key={`${seasonGroup.season}-${leagueGroup.league}`}
                      league={leagueGroup.league}
                      games={leagueGroup.games}
                      onClickGame={onClickGame}
                      activeGameId={activeGameId}
                      libraryGameIds={libraryGameIds}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
