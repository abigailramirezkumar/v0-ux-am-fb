"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockGames } from "@/lib/mock-games"
import type { GameLeague } from "@/types/game"
import { ToggleButton } from "@/components/filters/toggle-button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { sportsData, type League } from "@/lib/sports-data"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GamesFiltersModuleProps {
  selectedLeagues: GameLeague[]
  selectedSeasons: string[]
  selectedTeams: string[]
  onLeagueToggle: (league: GameLeague) => void
  onSeasonToggle: (season: string) => void
  onTeamToggle: (team: string) => void
  onClear: () => void
  hideTeamFilter?: boolean
}

// Map filter league values to sportsData league keys
const leagueFilterToSportsDataKey: Record<string, League> = {
  NFL: "NFL",
  College: "NCAA (FBS)",
  HighSchool: "HighSchool",
}

// Helper to get all teams for given leagues (or all if none selected)
function getTeamsForLeagues(selectedLeagues: string[]): { value: string; label: string }[] {
  const allTeams: { value: string; label: string }[] = []
  
  // If no leagues selected, show all teams
  const leaguesToShow = selectedLeagues.length > 0 
    ? selectedLeagues 
    : ["NFL", "College", "HighSchool"]
  
  for (const filterLeague of leaguesToShow) {
    const sportsDataKey = leagueFilterToSportsDataKey[filterLeague]
    if (!sportsDataKey) continue
    
    const leagueData = sportsData[sportsDataKey]
    if (!leagueData) continue
    
    for (const conference of leagueData.conferences) {
      // Add direct teams
      for (const team of conference.teams) {
        allTeams.push({ value: team.id, label: team.name })
      }
      // Add subdivision teams
      if (conference.subdivisions) {
        for (const subdivision of conference.subdivisions) {
          for (const team of subdivision.teams) {
            allTeams.push({ value: team.id, label: team.name })
          }
        }
      }
    }
  }
  
  // Sort alphabetically by label
  return allTeams.sort((a, b) => a.label.localeCompare(b.label))
}

// Helper to check if a team ID exists in the available teams for given leagues
function isTeamInLeagues(teamId: string, selectedLeagues: string[]): boolean {
  const availableTeams = getTeamsForLeagues(selectedLeagues)
  return availableTeams.some(team => team.value === teamId)
}

// ---------------------------------------------------------------------------
// Multi-Select Dropdown Component
// ---------------------------------------------------------------------------
interface MultiSelectDropdownProps {
  options: { value: string; label: string }[]
  selectedValues: string[]
  onToggle: (value: string) => void
  placeholder: string
  displayText: string | null
  className?: string
}

function MultiSelectDropdown({
  options,
  selectedValues,
  onToggle,
  placeholder,
  displayText,
  className,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full h-9 px-3 text-sm border border-border rounded-md flex items-center justify-between transition-all duration-300",
            displayText ? "text-foreground" : "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{displayText || placeholder}</span>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => onToggle(option.value)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function GamesFiltersModule({
  selectedLeagues,
  selectedSeasons,
  selectedTeams,
  onLeagueToggle,
  onSeasonToggle,
  onTeamToggle,
  onClear,
  hideTeamFilter = false,
}: GamesFiltersModuleProps) {
  // Track team filter cleared state for visual feedback
  const [teamFilterCleared, setTeamFilterCleared] = useState(false)
  const prevLeaguesRef = useRef<string[]>([])
  
  // Calculate active filter count (exclude teams if hidden)
  const activeFilterCount = selectedLeagues.length + selectedSeasons.length + (hideTeamFilter ? 0 : selectedTeams.length)

  // Get unique seasons from games
  const seasons = useMemo(() => {
    const seasonSet = new Set(mockGames.map((g) => g.season))
    return Array.from(seasonSet).sort((a, b) => b.localeCompare(a))
  }, [])

  const seasonOptions = seasons.map(s => ({ value: s, label: s }))

  // Get teams based on selected leagues
  const teamOptions = useMemo(() => {
    return getTeamsForLeagues(selectedLeagues)
  }, [selectedLeagues])

  const leagues: { league: GameLeague; label: string }[] = [
    { league: "NFL", label: "NFL" },
    { league: "College", label: "NCAA" },
    { league: "HighSchool", label: "High School" },
  ]

  const allLeagueValues = leagues.map(l => l.league)

  // Check if leagues are selected (for the FilterRow circle)
  const hasLeagueSelected = selectedLeagues.length > 0

  // Toggle all leagues at once
  const handleToggleAllLeagues = () => {
    if (hasLeagueSelected) {
      // Clear all leagues
      leagues.forEach(({ league }) => {
        if (selectedLeagues.includes(league)) {
          onLeagueToggle(league)
        }
      })
    } else {
      // Select all leagues
      leagues.forEach(({ league }) => {
        if (!selectedLeagues.includes(league)) {
          onLeagueToggle(league)
        }
      })
    }
  }

  // Watch for league changes and clear teams that are no longer valid
  useEffect(() => {
    if (selectedTeams.length > 0 && selectedLeagues.length > 0) {
      const prevLeagues = prevLeaguesRef.current
      const leaguesChanged = prevLeagues.length !== selectedLeagues.length || 
        !prevLeagues.every(l => selectedLeagues.includes(l))
      
      if (leaguesChanged) {
        // Find teams that are no longer valid
        const invalidTeams = selectedTeams.filter(team => !isTeamInLeagues(team, selectedLeagues))
        
        if (invalidTeams.length > 0) {
          // Clear invalid teams one by one using toggle
          invalidTeams.forEach(team => onTeamToggle(team))
          // Show visual feedback
          setTeamFilterCleared(true)
          setTimeout(() => setTeamFilterCleared(false), 1500)
        }
      }
    }
    
    prevLeaguesRef.current = [...selectedLeagues]
  }, [selectedLeagues, selectedTeams, onTeamToggle])

  // Display text helpers
  const getSeasonDisplayText = () => {
    if (selectedSeasons.length === 0) return null
    if (selectedSeasons.length === 1) return selectedSeasons[0]
    return `${selectedSeasons.length} seasons selected`
  }

  const getTeamDisplayText = () => {
    if (selectedTeams.length === 0) return null
    if (selectedTeams.length === 1) {
      const team = teamOptions.find(t => t.value === selectedTeams[0])
      return team?.label || selectedTeams[0]
    }
    return `${selectedTeams.length} teams selected`
  }

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

      {/* Filter Sections — using Accordion like FiltersModule */}
      <ScrollArea className="flex-1 overflow-hidden">
        <Accordion
          type="multiple"
          defaultValue={["scope"]}
          className="px-4"
        >
          {/* Scope Section */}
          <AccordionItem value="scope" className="border-b-0">
            <AccordionTrigger className="py-3 hover:no-underline text-sm font-semibold text-foreground [&>svg]:text-muted-foreground">
              Scope
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {/* League Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleAllLeagues}
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        hasLeagueSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-muted-foreground/40 bg-background hover:border-muted-foreground/60"
                      }`}
                    >
                      {hasLeagueSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-background" />
                      )}
                    </button>
                    <span className="text-sm text-foreground">League</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {leagues.map(({ league, label }) => (
                    <ToggleButton
                      key={league}
                      label={label}
                      isSelected={selectedLeagues.includes(league)}
                      onClick={() => onLeagueToggle(league)}
                    />
                  ))}
                </div>
              </div>

              {/* Season Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Toggle all seasons
                        if (selectedSeasons.length > 0) {
                          selectedSeasons.forEach(s => onSeasonToggle(s))
                        } else {
                          seasons.forEach(s => onSeasonToggle(s))
                        }
                      }}
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        selectedSeasons.length > 0
                          ? "border-blue-600 bg-blue-600"
                          : "border-muted-foreground/40 bg-background hover:border-muted-foreground/60"
                      }`}
                    >
                      {selectedSeasons.length > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-background" />
                      )}
                    </button>
                    <span className="text-sm text-foreground">Season</span>
                  </div>
                </div>
                <MultiSelectDropdown
                  options={seasonOptions}
                  selectedValues={selectedSeasons}
                  onToggle={onSeasonToggle}
                  placeholder="Select season"
                  displayText={getSeasonDisplayText()}
                />
              </div>

              {/* Team Filter */}
              {!hideTeamFilter && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Toggle all teams
                          if (selectedTeams.length > 0) {
                            selectedTeams.forEach(t => onTeamToggle(t))
                          } else {
                            teamOptions.forEach(t => onTeamToggle(t.value))
                          }
                        }}
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          selectedTeams.length > 0
                            ? "border-blue-600 bg-blue-600"
                            : "border-muted-foreground/40 bg-background hover:border-muted-foreground/60"
                        }`}
                      >
                        {selectedTeams.length > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-background" />
                        )}
                      </button>
                      <span className="text-sm text-foreground">Team</span>
                    </div>
                  </div>
                  <MultiSelectDropdown
                    options={teamOptions}
                    selectedValues={selectedTeams}
                    onToggle={onTeamToggle}
                    placeholder="Select team"
                    displayText={getTeamDisplayText()}
                    className={teamFilterCleared ? "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/30" : ""}
                  />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  )
}
