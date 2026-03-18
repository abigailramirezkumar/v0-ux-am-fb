"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { mockGames } from "@/lib/mock-games"
import type { GameLeague } from "@/types/game"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GamesFiltersModuleProps {
  selectedLeagues: GameLeague[]
  selectedSeason: string | null
  onLeagueToggle: (league: GameLeague) => void
  onSeasonChange: (season: string | null) => void
  onClear: () => void
}

// ---------------------------------------------------------------------------
// League chip button
// ---------------------------------------------------------------------------
function LeagueChip({
  league,
  label,
  isSelected,
  count,
  onClick,
}: {
  league: GameLeague
  label: string
  isSelected: boolean
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1.5",
        isSelected
          ? "bg-foreground text-background shadow-sm"
          : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {label}
      <span className={cn(
        "text-xs",
        isSelected ? "opacity-70" : "opacity-50"
      )}>
        ({count})
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function GamesFiltersModule({
  selectedLeagues,
  selectedSeason,
  onLeagueToggle,
  onSeasonChange,
  onClear,
}: GamesFiltersModuleProps) {
  // Calculate active filter count
  const activeFilterCount = selectedLeagues.length + (selectedSeason ? 1 : 0)

  // Get unique seasons from games
  const seasons = useMemo(() => {
    const seasonSet = new Set(mockGames.map((g) => g.season))
    return Array.from(seasonSet).sort((a, b) => b.localeCompare(a))
  }, [])

  // Get game counts by league (considering season filter)
  const leagueCounts = useMemo(() => {
    let filtered = mockGames
    if (selectedSeason) {
      filtered = filtered.filter((g) => g.season === selectedSeason)
    }
    return {
      NFL: filtered.filter((g) => g.league === "NFL").length,
      College: filtered.filter((g) => g.league === "College").length,
      HighSchool: filtered.filter((g) => g.league === "HighSchool").length,
    }
  }, [selectedSeason])

  const leagues: { league: GameLeague; label: string }[] = [
    { league: "NFL", label: "NFL" },
    { league: "College", label: "College" },
    { league: "HighSchool", label: "High School" },
  ]

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Sections */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="px-4 py-4 space-y-6">
          {/* Season Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Season</label>
            <Select
              value={selectedSeason || "all"}
              onValueChange={(value) => onSeasonChange(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-full h-9 text-sm border-border">
                <SelectValue placeholder="All Seasons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                {seasons.map((season) => (
                  <SelectItem key={season} value={season}>
                    {season} Season
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* League Chips */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">League</label>
            <div className="flex flex-wrap gap-2">
              {leagues.map(({ league, label }) => (
                <LeagueChip
                  key={league}
                  league={league}
                  label={label}
                  isSelected={selectedLeagues.includes(league)}
                  count={leagueCounts[league]}
                  onClick={() => onLeagueToggle(league)}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
