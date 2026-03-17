"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { sportsData, type League } from "@/lib/sports-data"
import type { GamesFilterState } from "@/lib/games-data"

interface GamesFiltersModuleProps {
  filters: GamesFilterState
  onToggleLeague: (league: League) => void
  onToggleSeason: (season: string) => void
  onClear: () => void
  activeFilterCount: number
}

export function GamesFiltersModule({
  filters,
  onToggleLeague,
  onToggleSeason,
  onClear,
  activeFilterCount,
}: GamesFiltersModuleProps) {
  const leagues: League[] = ["NFL", "NCAA (FBS)", "High School"]
  
  // Collect all unique seasons across leagues
  const allSeasons = Array.from(
    new Set(
      leagues.flatMap((league) => sportsData[league].seasons)
    )
  ).sort((a, b) => Number(b) - Number(a))

  const getLeagueLabel = (league: League) => {
    if (league === "NCAA (FBS)") return "College"
    if (league === "High School") return "High School"
    return league
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold bg-[#0273e3] text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs">
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Sections */}
      <ScrollArea className="flex-1">
        <Accordion type="multiple" defaultValue={["league", "season"]} className="px-4 py-2">
          {/* League Filter */}
          <AccordionItem value="league" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              <span className="text-sm font-medium">League</span>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="space-y-2">
                {leagues.map((league) => {
                  const isSelected = filters.leagues.has(league)
                  return (
                    <button
                      key={league}
                      onClick={() => onToggleLeague(league)}
                      className={cn(
                        "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors",
                        isSelected
                          ? "bg-[#0273e3]/10 text-[#0273e3]"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <Checkbox checked={isSelected} className="pointer-events-none" />
                      <span>{getLeagueLabel(league)}</span>
                    </button>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Season Filter */}
          <AccordionItem value="season" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              <span className="text-sm font-medium">Season</span>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="space-y-2">
                {allSeasons.map((season) => {
                  const isSelected = filters.seasons.has(season)
                  return (
                    <button
                      key={season}
                      onClick={() => onToggleSeason(season)}
                      className={cn(
                        "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors",
                        isSelected
                          ? "bg-[#0273e3]/10 text-[#0273e3]"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <Checkbox checked={isSelected} className="pointer-events-none" />
                      <span>{season}</span>
                    </button>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  )
}

export type { GamesFilterState }
