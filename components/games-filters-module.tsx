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
  selectedCompetitions: string[]
  onLeagueToggle: (league: GameLeague) => void
  onSeasonToggle: (season: string) => void
  onTeamToggle: (team: string) => void
  onCompetitionToggle: (competition: string) => void
  onClear: () => void
  hideTeamFilter?: boolean
  hideSeasonFilter?: boolean
  highlightedFilter?: string | null // category:value format to highlight and scroll to
}

// Map filter league values to sportsData league keys
const leagueFilterToSportsDataKey: Record<string, League> = {
  NFL: "NFL",
  College: "NCAA (FBS)",
  HighSchool: "HighSchool",
}

// Helper to get all teams for given leagues and competitions (or all if none selected)
function getTeamsForLeaguesAndCompetitions(selectedLeagues: string[], selectedCompetitions: string[]): { value: string; label: string }[] {
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
      // Check if conference is selected (when no competitions selected, include all)
      const conferenceSelected = selectedCompetitions.length === 0 || selectedCompetitions.includes(conference.id)
      
      // Add direct teams if conference is selected
      if (conferenceSelected) {
        for (const team of conference.teams) {
          allTeams.push({ value: team.id, label: team.name })
        }
      }
      
      // Add subdivision teams
      if (conference.subdivisions) {
        for (const subdivision of conference.subdivisions) {
          // Check if subdivision is selected
          const subdivisionSelected = selectedCompetitions.length === 0 || selectedCompetitions.includes(subdivision.id)
          if (subdivisionSelected) {
            for (const team of subdivision.teams) {
              allTeams.push({ value: team.id, label: team.name })
            }
          }
        }
      }
    }
  }
  
  // Sort alphabetically by label
  return allTeams.sort((a, b) => a.label.localeCompare(b.label))
}

// Helper to check if a team ID exists in the available teams for given leagues and competitions
function isTeamInLeaguesAndCompetitions(teamId: string, selectedLeagues: string[], selectedCompetitions: string[]): boolean {
  const availableTeams = getTeamsForLeaguesAndCompetitions(selectedLeagues, selectedCompetitions)
  return availableTeams.some(team => team.value === teamId)
}

// Helper to get all competitions (conferences/divisions) for given leagues
function getCompetitionsForLeagues(selectedLeagues: string[]): { value: string; label: string }[] {
  const allCompetitions: { value: string; label: string }[] = []
  
  // If no leagues selected, show all competitions
  const leaguesToShow = selectedLeagues.length > 0 
    ? selectedLeagues 
    : ["NFL", "College", "HighSchool"]
  
  for (const filterLeague of leaguesToShow) {
    const sportsDataKey = leagueFilterToSportsDataKey[filterLeague]
    if (!sportsDataKey) continue
    
    const leagueData = sportsData[sportsDataKey]
    if (!leagueData) continue
    
    for (const conference of leagueData.conferences) {
      // For NFL, we want the subdivisions (AFC North, NFC East, etc.)
      if (conference.subdivisions && conference.subdivisions.length > 0) {
        for (const subdivision of conference.subdivisions) {
          allCompetitions.push({ value: subdivision.id, label: subdivision.name })
        }
      } else {
        // For NCAA and HighSchool, we want the conferences directly
        allCompetitions.push({ value: conference.id, label: conference.name })
      }
    }
  }
  
  // Sort alphabetically by label
  return allCompetitions.sort((a, b) => a.label.localeCompare(b.label))
}

// Helper to check if a competition ID exists in the available competitions for given leagues
function isCompetitionInLeagues(competitionId: string, selectedLeagues: string[]): boolean {
  const availableCompetitions = getCompetitionsForLeagues(selectedLeagues)
  return availableCompetitions.some(comp => comp.value === competitionId)
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
  selectedCompetitions,
  onLeagueToggle,
  onSeasonToggle,
  onTeamToggle,
  onCompetitionToggle,
  onClear,
  hideTeamFilter = false,
  hideSeasonFilter = false,
  highlightedFilter,
}: GamesFiltersModuleProps) {
  // Track filter cleared state for visual feedback
  const [teamFilterCleared, setTeamFilterCleared] = useState(false)
  const [competitionFilterCleared, setCompetitionFilterCleared] = useState(false)
  const prevLeaguesRef = useRef<string[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Handle highlighted filter - scroll to the filter
  useEffect(() => {
    if (!highlightedFilter) return
    
    const [category] = highlightedFilter.split(':')
    
    // Scroll to the filter after a short delay
    setTimeout(() => {
      const filterElement = document.querySelector(`[data-games-filter-category="${category}"]`)
      if (filterElement && scrollAreaRef.current) {
        filterElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 150)
  }, [highlightedFilter])
  
  // Helper to check if a category is highlighted
  const isHighlighted = (category: string) => {
    return highlightedFilter && highlightedFilter.startsWith(`${category}:`)
  }
  
  // Calculate active filter count (exclude hidden filters)
  const activeFilterCount = selectedLeagues.length + 
    (hideSeasonFilter ? 0 : selectedSeasons.length) + 
    (hideTeamFilter ? 0 : selectedTeams.length) + 
    selectedCompetitions.length

  // Get unique seasons from games
  const seasons = useMemo(() => {
    const seasonSet = new Set(mockGames.map((g) => g.season))
    return Array.from(seasonSet).sort((a, b) => b.localeCompare(a))
  }, [])

  const seasonOptions = seasons.map(s => ({ value: s, label: s }))

  // Get teams based on selected leagues and competitions
  const teamOptions = useMemo(() => {
    return getTeamsForLeaguesAndCompetitions(selectedLeagues, selectedCompetitions)
  }, [selectedLeagues, selectedCompetitions])

  // Get competitions based on selected leagues
  const competitionOptions = useMemo(() => {
    return getCompetitionsForLeagues(selectedLeagues)
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

  // Watch for league/competition changes and clear teams/competitions that are no longer valid
  useEffect(() => {
    const prevLeagues = prevLeaguesRef.current
    const leaguesChanged = prevLeagues.length !== selectedLeagues.length || 
      !prevLeagues.every(l => selectedLeagues.includes(l))
    
    if (leaguesChanged && selectedLeagues.length > 0) {
      // Find teams that are no longer valid (check against both leagues AND competitions)
      if (selectedTeams.length > 0) {
        const invalidTeams = selectedTeams.filter(team => !isTeamInLeaguesAndCompetitions(team, selectedLeagues, selectedCompetitions))
        
        if (invalidTeams.length > 0) {
          // Clear invalid teams one by one using toggle
          invalidTeams.forEach(team => onTeamToggle(team))
          // Show visual feedback
          setTeamFilterCleared(true)
          setTimeout(() => setTeamFilterCleared(false), 1500)
        }
      }
      
      // Find competitions that are no longer valid
      if (selectedCompetitions.length > 0) {
        const invalidCompetitions = selectedCompetitions.filter(comp => !isCompetitionInLeagues(comp, selectedLeagues))
        
        if (invalidCompetitions.length > 0) {
          // Clear invalid competitions one by one using toggle
          invalidCompetitions.forEach(comp => onCompetitionToggle(comp))
          // Show visual feedback
          setCompetitionFilterCleared(true)
          setTimeout(() => setCompetitionFilterCleared(false), 1500)
        }
      }
    }
    
    prevLeaguesRef.current = [...selectedLeagues]
  }, [selectedLeagues, selectedTeams, selectedCompetitions, onTeamToggle, onCompetitionToggle])

  // Watch for competition changes and clear teams that are no longer valid
  const prevCompetitionsRef = useRef<string[]>([])
  useEffect(() => {
    const prevCompetitions = prevCompetitionsRef.current
    const competitionsChanged = prevCompetitions.length !== selectedCompetitions.length || 
      !prevCompetitions.every(c => selectedCompetitions.includes(c))
    
    if (competitionsChanged && selectedCompetitions.length > 0 && selectedTeams.length > 0) {
      const invalidTeams = selectedTeams.filter(team => !isTeamInLeaguesAndCompetitions(team, selectedLeagues, selectedCompetitions))
      
      if (invalidTeams.length > 0) {
        invalidTeams.forEach(team => onTeamToggle(team))
        setTeamFilterCleared(true)
        setTimeout(() => setTeamFilterCleared(false), 1500)
      }
    }
    
    prevCompetitionsRef.current = [...selectedCompetitions]
  }, [selectedCompetitions, selectedTeams, selectedLeagues, onTeamToggle])

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

  const getCompetitionDisplayText = () => {
    if (selectedCompetitions.length === 0) return null
    if (selectedCompetitions.length === 1) {
      const comp = competitionOptions.find(c => c.value === selectedCompetitions[0])
      return comp?.label || selectedCompetitions[0]
    }
    return `${selectedCompetitions.length} competitions selected`
  }

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
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
      <ScrollArea className="flex-1 overflow-hidden" ref={scrollAreaRef}>
        <Accordion
          type="multiple"
          defaultValue={["scope"]}
          className="px-4"
        >
          {/* Scope Section */}
          <AccordionItem value="scope" className="border-b-0 py-1">
            <AccordionTrigger className="py-4 hover:no-underline text-sm font-semibold text-foreground [&>svg]:text-muted-foreground">
              Scope
            </AccordionTrigger>
            <AccordionContent className="pb-5 space-y-4">
              {/* League Filter */}
              <div 
                data-games-filter-category="league"
                className={cn(
                  "space-y-2 transition-all duration-300 rounded-md",
                  isHighlighted("league") && "ring-2 ring-primary bg-primary/5 p-2 -m-2"
                )}
              >
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

              {/* Competition Filter */}
              <div 
                data-games-filter-category="competition"
                className={cn(
                  "space-y-2 transition-all duration-300 rounded-md",
                  isHighlighted("competition") && "ring-2 ring-primary bg-primary/5 p-2 -m-2"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Toggle all competitions
                        if (selectedCompetitions.length > 0) {
                          selectedCompetitions.forEach(c => onCompetitionToggle(c))
                        } else {
                          competitionOptions.forEach(c => onCompetitionToggle(c.value))
                        }
                      }}
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        selectedCompetitions.length > 0
                          ? "border-blue-600 bg-blue-600"
                          : "border-muted-foreground/40 bg-background hover:border-muted-foreground/60"
                      }`}
                    >
                      {selectedCompetitions.length > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-background" />
                      )}
                    </button>
                    <span className="text-sm text-foreground">Competition</span>
                  </div>
                </div>
                <MultiSelectDropdown
                  options={competitionOptions}
                  selectedValues={selectedCompetitions}
                  onToggle={onCompetitionToggle}
                  placeholder="Select competition"
                  displayText={getCompetitionDisplayText()}
                  className={competitionFilterCleared ? "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/30" : ""}
                />
              </div>

              {/* Season Filter */}
              {!hideSeasonFilter && (
                <div 
                  data-games-filter-category="season"
                  className={cn(
                    "space-y-2 transition-all duration-300 rounded-md",
                    isHighlighted("season") && "ring-2 ring-primary bg-primary/5 p-2 -m-2"
                  )}
                >
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
              )}

              {/* Team Filter */}
              {!hideTeamFilter && (
                <div 
                  data-games-filter-category="team"
                  className={cn(
                    "space-y-2 transition-all duration-300 rounded-md",
                    isHighlighted("team") && "ring-2 ring-primary bg-primary/5 p-2 -m-2"
                  )}
                >
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
