"use client"

import { useState, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { getAllGames, filterGames, type Game, type GamesFilterState } from "@/lib/games-data"
import type { League } from "@/lib/sports-data"

interface GamesBrowserProps {
  filters?: GamesFilterState
  onSelectGame?: (game: Game) => void
  activeGameId?: string | null
}

export function GamesBrowser({ filters, onSelectGame, activeGameId }: GamesBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const allGames = useMemo(() => getAllGames(), [])
  
  // Apply filters
  const filteredGames = useMemo(() => {
    let games = allGames
    
    // Apply sidebar filters
    if (filters) {
      games = filterGames(games, filters)
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      games = games.filter((game) =>
        game.homeTeam.name.toLowerCase().includes(query) ||
        game.awayTeam.name.toLowerCase().includes(query) ||
        game.homeTeam.abbreviation.toLowerCase().includes(query) ||
        game.awayTeam.abbreviation.toLowerCase().includes(query)
      )
    }
    
    return games
  }, [allGames, filters, searchQuery])
  
  // Group games by season
  const gamesBySeasonAndLeague = useMemo(() => {
    const grouped: Record<string, Record<League, Game[]>> = {}
    
    for (const game of filteredGames) {
      if (!grouped[game.season]) {
        grouped[game.season] = {
          NFL: [],
          "NCAA (FBS)": [],
          "High School": [],
        }
      }
      grouped[game.season][game.league].push(game)
    }
    
    // Sort seasons descending
    const sortedSeasons = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))
    
    return sortedSeasons.map((season) => ({
      season,
      leagues: grouped[season],
    }))
  }, [filteredGames])
  
  const getLeagueLabel = (league: League) => {
    if (league === "NCAA (FBS)") return "College"
    if (league === "High School") return "High School"
    return league
  }

  const renderGameCard = (game: Game) => {
    const isActive = activeGameId === game.id
    const homeWon = game.homeScore > game.awayScore
    const awayWon = game.awayScore > game.homeScore
    
    return (
      <button
        key={game.id}
        onClick={() => onSelectGame?.(game)}
        className={cn(
          "w-full flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-card transition-all duration-150 text-left",
          "hover:border-[#0273e3]/50 hover:bg-[#0273e3]/5",
          isActive && "border-[#0273e3] bg-[#0273e3]/15"
        )}
      >
        {/* Date */}
        <div className="flex flex-col items-center w-16 shrink-0">
          <span className="text-xs text-muted-foreground">{game.date}</span>
          {game.isPlayoff && (
            <span className="text-[10px] font-medium text-amber-500 uppercase">Playoff</span>
          )}
          {game.week && (
            <span className="text-[10px] text-muted-foreground">Week {game.week}</span>
          )}
        </div>
        
        {/* Teams and Score */}
        <div className="flex-1 min-w-0">
          {/* Away Team */}
          <div className={cn(
            "flex items-center gap-2 mb-1",
            awayWon && "font-semibold"
          )}>
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0"
              style={{ backgroundColor: game.awayTeam.logoColor }}
            >
              {game.awayTeam.abbreviation.slice(0, 3)}
            </div>
            <span className="text-sm truncate flex-1">{game.awayTeam.name}</span>
            <span className={cn(
              "text-sm tabular-nums w-6 text-right",
              awayWon ? "font-semibold" : "text-muted-foreground"
            )}>
              {game.awayScore}
            </span>
          </div>
          
          {/* Home Team */}
          <div className={cn(
            "flex items-center gap-2",
            homeWon && "font-semibold"
          )}>
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0"
              style={{ backgroundColor: game.homeTeam.logoColor }}
            >
              {game.homeTeam.abbreviation.slice(0, 3)}
            </div>
            <span className="text-sm truncate flex-1">{game.homeTeam.name}</span>
            <span className={cn(
              "text-sm tabular-nums w-6 text-right",
              homeWon ? "font-semibold" : "text-muted-foreground"
            )}>
              {game.homeScore}
            </span>
          </div>
        </div>
        
        {/* Clip count */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xs text-muted-foreground">{game.clipCount} clips</span>
        </div>
      </button>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with search */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">All Games</span>
          <span className="text-xs text-muted-foreground">({filteredGames.length})</span>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-muted/50 border border-border/50 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0273e3]/50 focus:border-[#0273e3]"
          />
        </div>
      </div>

      {/* Games list grouped by season and league */}
      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <div className="p-4">
          {filteredGames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Icon name="search" className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No games found{searchQuery && ` matching "${searchQuery}"`}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {gamesBySeasonAndLeague.map(({ season, leagues }) => (
                <div key={season}>
                  {/* Season header */}
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
                    <h2 className="text-sm font-semibold text-foreground">{season} Season</h2>
                  </div>
                  
                  {/* Leagues within season */}
                  <div className="space-y-4">
                    {(Object.keys(leagues) as League[]).map((league) => {
                      const leagueGames = leagues[league]
                      if (leagueGames.length === 0) return null
                      
                      return (
                        <div key={`${season}-${league}`}>
                          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
                            {getLeagueLabel(league)} ({leagueGames.length})
                          </h3>
                          <div className="space-y-2">
                            {leagueGames.map(renderGameCard)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer with total count */}
      <div className="px-4 py-2 border-t border-border/50 bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Showing {filteredGames.length} games across {gamesBySeasonAndLeague.length} season{gamesBySeasonAndLeague.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}
