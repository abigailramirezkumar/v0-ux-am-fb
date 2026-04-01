"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { FilterState, RangeFilterState, AnyFilterCategory, RangeCategory } from "@/types/filters"
import { getRangeValue } from "@/types/filters"
import {
  FILTER_SECTIONS,
  DEFAULT_OPEN_SECTIONS,
  type FilterDef,
  type ToggleFilterDef,
  type ToggleWithRangeFilterDef,
  type RangeFilterDef,
  type SelectFilterDef,
  type DynamicTeamSelectFilterDef,
  type DynamicCompetitionSelectFilterDef,
} from "@/lib/filter-config"
import { sportsData, type League } from "@/lib/sports-data"
import { ToggleGroup } from "@/components/filters/toggle-group"
import { ToggleGroupWithRange } from "@/components/filters/toggle-group-with-range"
import { RangeSlider } from "@/components/filters/range-slider"
import { FilterRow } from "@/components/filters/filter-row"
import { SubsectionHeader } from "@/components/filters/subsection-header"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Map filter league values to sportsData league keys
const leagueFilterToSportsDataKey: Record<string, League> = {
  NFL: "NFL",
  College: "NCAA (FBS)",
  HighSchool: "HighSchool",
}

// Helper to get all teams for given leagues (or all if none selected)
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

interface FiltersModuleProps {
  filters: FilterState
  rangeFilters: RangeFilterState
  onToggle: (category: AnyFilterCategory, value: string) => void
  onToggleAll: (category: AnyFilterCategory, allValues: string[]) => void
  onRangeChange: (category: RangeCategory, value: [number, number], defaultRange: [number, number]) => void
  onSetFilter: (category: AnyFilterCategory, value: string | null) => void
  onClear: () => void
  uniqueGames: string[]
  activeFilterCount: number
  totalCount: number
  filteredCount: number
  highlightedFilter?: string | null // category:value format to highlight and scroll to
}

// ---------------------------------------------------------------------------
// Renders a single FilterDef driven by its `type`.
// ---------------------------------------------------------------------------
function ConfigDrivenFilter({
  def,
  filters,
  rangeFilters,
  onToggle,
  onToggleAll,
  onRangeChange,
  onSetFilter,
  resetRange,
  teamFilterCleared,
  competitionFilterCleared,
}: {
  def: FilterDef
  filters: FilterState
  rangeFilters: RangeFilterState
  onToggle: (category: AnyFilterCategory, value: string) => void
  onToggleAll: (category: AnyFilterCategory, allValues: string[]) => void
  onRangeChange: (category: RangeCategory, value: [number, number], defaultRange: [number, number]) => void
  onSetFilter: (category: AnyFilterCategory, value: string | null) => void
  resetRange: (category: RangeCategory, defaultRange: [number, number]) => void
  teamFilterCleared: boolean
  competitionFilterCleared: boolean
}) {
  switch (def.type) {
    case "boolean":
      return (
        <FilterRow
          label={def.label}
          count={def.count}
          filters={filters}
          onToggle={onToggle}
        />
      )

    case "toggle": {
      const d = def as ToggleFilterDef
      return (
        <FilterRow
          label={d.label}
          count={d.count}
          category={d.category}
          allValues={d.allValues}
          filters={filters}
          onToggleAll={onToggleAll}
        >
          {d.groups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "pt-1" : undefined}>
              <ToggleGroup
                items={group}
                category={d.category}
                filters={filters}
                onToggle={onToggle}
              />
            </div>
          ))}
        </FilterRow>
      )
    }

    case "toggleWithRange": {
      const d = def as ToggleWithRangeFilterDef
      return (
        <FilterRow
          label={d.label}
          count={d.count}
          category={d.category}
          allValues={d.allValues}
          filters={filters}
          rangeFilters={rangeFilters}
          rangeCategory={d.rangeCategory}
          rangeDefault={d.rangeDefault}
          onToggleAll={onToggleAll}
          onRangeReset={resetRange}
        >
          <ToggleGroupWithRange
            items={d.groups[0]}
            category={d.category}
            filters={filters}
            onToggle={onToggle}
            rangeMap={d.rangeMap}
            onRangeChange={onRangeChange}
            rangeCategory={d.rangeCategory}
            rangeDefault={d.rangeDefault}
          />
          <RangeSlider
            min={d.rangeMin}
            max={d.rangeMax}
            value={getRangeValue(rangeFilters, d.rangeCategory, d.rangeDefault)}
            onChange={(v) => onRangeChange(d.rangeCategory, v, d.rangeDefault)}
          />
        </FilterRow>
      )
    }

    case "range": {
      const d = def as RangeFilterDef
      return (
        <FilterRow
          label={d.label}
          count={d.count}
          filters={filters}
          onToggle={onToggle}
          rangeFilters={rangeFilters}
          rangeCategory={d.rangeCategory}
          rangeDefault={d.rangeDefault}
          onRangeReset={resetRange}
        >
          <RangeSlider
            min={d.rangeMin}
            max={d.rangeMax}
            value={getRangeValue(rangeFilters, d.rangeCategory, d.rangeDefault)}
            onChange={(v) => onRangeChange(d.rangeCategory, v, d.rangeDefault)}
          />
        </FilterRow>
      )
    }

    case "dynamicTeamSelect": {
      const d = def as DynamicTeamSelectFilterDef
      // Get selected leagues and competitions from filters to determine which teams to show
      const selectedLeagues = Array.from(filters.league || [])
      const selectedCompetitions = Array.from(filters.competition || [])
      const teamOptions = getTeamsForLeaguesAndCompetitions(selectedLeagues, selectedCompetitions)
      
      // Get currently selected teams (multi-select)
      const selectedTeamSet = filters.team
      const selectedTeams = selectedTeamSet ? Array.from(selectedTeamSet) : []
      const allTeamValues = teamOptions.map(opt => opt.value)
      
      // Build display text for selected teams
      const getDisplayText = () => {
        if (selectedTeams.length === 0) return null
        if (selectedTeams.length === 1) {
          const team = teamOptions.find(t => t.value === selectedTeams[0])
          return team?.label || selectedTeams[0]
        }
        return `${selectedTeams.length} teams selected`
      }
      
      return (
        <FilterRow
          label={d.label}
          count={d.count}
          category="team"
          allValues={allTeamValues}
          filters={filters}
          onToggleAll={onToggleAll}
        >
          <MultiSelectDropdown
            options={teamOptions}
            selectedValues={selectedTeams}
            onToggle={(value) => onToggle("team", value)}
            placeholder={d.placeholder}
            displayText={getDisplayText()}
            className={teamFilterCleared ? "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/30" : ""}
          />
        </FilterRow>
      )
    }

    case "dynamicCompetitionSelect": {
      const d = def as DynamicCompetitionSelectFilterDef
      // Get selected leagues from filters to determine which competitions to show
      const selectedLeagues = Array.from(filters.league || [])
      const competitionOptions = getCompetitionsForLeagues(selectedLeagues)
      
      // Get currently selected competitions (multi-select)
      const selectedCompetitionSet = filters.competition
      const selectedCompetitions = selectedCompetitionSet ? Array.from(selectedCompetitionSet) : []
      const allCompetitionValues = competitionOptions.map(opt => opt.value)
      
      // Build display text for selected competitions
      const getDisplayText = () => {
        if (selectedCompetitions.length === 0) return null
        if (selectedCompetitions.length === 1) {
          const comp = competitionOptions.find(c => c.value === selectedCompetitions[0])
          return comp?.label || selectedCompetitions[0]
        }
        return `${selectedCompetitions.length} competitions selected`
      }
      
      return (
        <FilterRow
          label={d.label}
          count={d.count}
          category="competition"
          allValues={allCompetitionValues}
          filters={filters}
          onToggleAll={onToggleAll}
        >
          <MultiSelectDropdown
            options={competitionOptions}
            selectedValues={selectedCompetitions}
            onToggle={(value) => onToggle("competition", value)}
            placeholder={d.placeholder}
            displayText={getDisplayText()}
            className={competitionFilterCleared ? "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/30" : ""}
          />
        </FilterRow>
      )
    }

    case "select": {
      const d = def as SelectFilterDef
      // Check if this is the Season filter to make it multi-select
      if (d.label === "Season") {
        const selectedSeasonSet = filters.season
        const selectedSeasons = selectedSeasonSet ? Array.from(selectedSeasonSet) : []
        const allSeasonValues = d.options.map(opt => opt.value)
        
        // Build display text for selected seasons
        const getDisplayText = () => {
          if (selectedSeasons.length === 0) return null
          if (selectedSeasons.length === 1) {
            const season = d.options.find(s => s.value === selectedSeasons[0])
            return season?.label || selectedSeasons[0]
          }
          return `${selectedSeasons.length} seasons selected`
        }
        
        return (
          <FilterRow
            label={d.label}
            count={d.count}
            category="season"
            allValues={allSeasonValues}
            filters={filters}
            onToggleAll={onToggleAll}
          >
            <MultiSelectDropdown
              options={d.options}
              selectedValues={selectedSeasons}
              onToggle={(value) => onToggle("season", value)}
              placeholder={d.placeholder}
              displayText={getDisplayText()}
            />
          </FilterRow>
        )
      }
      
      // Default select behavior for other selects
      return (
        <FilterRow
          label={d.label}
          count={d.count}
          filters={filters}
          onToggle={onToggle}
        >
          <Select>
            <SelectTrigger className="w-full h-9 text-sm border-border text-muted-foreground">
              <SelectValue placeholder={d.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {d.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterRow>
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Main export — now data-driven via FILTER_SECTIONS
// ---------------------------------------------------------------------------
export function FiltersModule({
  filters,
  rangeFilters,
  onToggle,
  onToggleAll,
  onRangeChange,
  onSetFilter,
  onClear,
  activeFilterCount,
  highlightedFilter,
}: FiltersModuleProps) {
  // Track filter cleared state for visual feedback
  const [teamFilterCleared, setTeamFilterCleared] = useState(false)
  const [competitionFilterCleared, setCompetitionFilterCleared] = useState(false)
  const prevLeaguesRef = useRef<string[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [openSections, setOpenSections] = useState<string[]>(DEFAULT_OPEN_SECTIONS)
  
  // Helper to find which section a filter category belongs to
  const findSectionForCategory = useCallback((category: string): string => {
    for (const section of FILTER_SECTIONS) {
      for (const subsection of section.subsections) {
        for (const filter of subsection.filters) {
          if ('category' in filter && filter.category === category) {
            return section.key
          }
          // Check for range filters
          if ('rangeCategory' in filter && filter.rangeCategory === category) {
            return section.key
          }
          if (filter.type === 'dynamicTeamSelect' && category === 'team') {
            return section.key
          }
          if (filter.type === 'dynamicCompetitionSelect' && category === 'competition') {
            return section.key
          }
          if (filter.type === 'select' && filter.label === 'Season' && category === 'season') {
            return section.key
          }
        }
      }
    }
    return 'scope'
  }, [])

  // Handle highlighted filter - expand section and scroll to filter
  useEffect(() => {
    if (!highlightedFilter) return
    
    const [category] = highlightedFilter.split(':')
    const sectionKey = findSectionForCategory(category)
    
    // Expand the section if not already open
    setOpenSections((prev) => {
      if (prev.includes(sectionKey)) return prev
      return [...prev, sectionKey]
    })
    
    // Scroll to the filter after a short delay to allow accordion to expand
    setTimeout(() => {
      const filterElement = document.querySelector(`[data-filter-category="${category}"]`)
      if (filterElement && scrollAreaRef.current) {
        filterElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 150)
  }, [highlightedFilter, findSectionForCategory])
  
  // Watch for league changes and clear teams/competitions that are no longer valid
  useEffect(() => {
    const currentLeagues = Array.from(filters.league || [])
    const selectedTeamSet = filters.team
    const selectedTeams = selectedTeamSet ? Array.from(selectedTeamSet) : []
    const selectedCompetitionSet = filters.competition
    const selectedCompetitions = selectedCompetitionSet ? Array.from(selectedCompetitionSet) : []
    
    const prevLeagues = prevLeaguesRef.current
    const leaguesChanged = prevLeagues.length !== currentLeagues.length || 
      !prevLeagues.every(l => currentLeagues.includes(l))
    
    if (leaguesChanged && currentLeagues.length > 0) {
      // Check teams (against both leagues AND competitions)
      if (selectedTeams.length > 0) {
        const invalidTeams = selectedTeams.filter(team => !isTeamInLeaguesAndCompetitions(team, currentLeagues, selectedCompetitions))
        
        if (invalidTeams.length > 0) {
          invalidTeams.forEach(team => onToggle("team", team))
          setTeamFilterCleared(true)
          setTimeout(() => setTeamFilterCleared(false), 1500)
        }
      }
      
      // Check competitions
      if (selectedCompetitions.length > 0) {
        const invalidCompetitions = selectedCompetitions.filter(comp => !isCompetitionInLeagues(comp, currentLeagues))
        
        if (invalidCompetitions.length > 0) {
          invalidCompetitions.forEach(comp => onToggle("competition", comp))
          setCompetitionFilterCleared(true)
          setTimeout(() => setCompetitionFilterCleared(false), 1500)
        }
      }
    }
    
    prevLeaguesRef.current = currentLeagues
  }, [filters.league, filters.team, filters.competition, onToggle])

  // Watch for competition changes and clear teams that are no longer valid
  const prevCompetitionsRef = useRef<string[]>([])
  useEffect(() => {
    const currentLeagues = Array.from(filters.league || [])
    const selectedTeams = Array.from(filters.team || [])
    const currentCompetitions = Array.from(filters.competition || [])
    
    const prevCompetitions = prevCompetitionsRef.current
    const competitionsChanged = prevCompetitions.length !== currentCompetitions.length || 
      !prevCompetitions.every(c => currentCompetitions.includes(c))
    
    if (competitionsChanged && currentCompetitions.length > 0 && selectedTeams.length > 0) {
      const invalidTeams = selectedTeams.filter(team => !isTeamInLeaguesAndCompetitions(team, currentLeagues, currentCompetitions))
      
      if (invalidTeams.length > 0) {
        invalidTeams.forEach(team => onToggle("team", team))
        setTeamFilterCleared(true)
        setTimeout(() => setTeamFilterCleared(false), 1500)
      }
    }
    
    prevCompetitionsRef.current = currentCompetitions
  }, [filters.competition, filters.team, filters.league, onToggle])
  
  // Helper to reset a range filter to its default
  const resetRange = useCallback(
    (category: RangeCategory, defaultRange: [number, number]) => {
      onRangeChange(category, defaultRange, defaultRange)
    },
    [onRangeChange]
  )

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

      {/* Filter Sections — data-driven */}
      <ScrollArea className="flex-1 overflow-hidden" ref={scrollAreaRef}>
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={setOpenSections}
          className="px-4"
        >
          {FILTER_SECTIONS.map((section, sIdx) => (
            <AccordionItem
              key={section.key}
              value={section.key}
              className={cn(
                sIdx < FILTER_SECTIONS.length - 1 ? "border-b border-border" : "border-b-0",
                "py-1"
              )}
            >
              <AccordionTrigger className="py-4 hover:no-underline text-sm font-semibold text-foreground [&>svg]:text-muted-foreground">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="pb-5 space-y-4">
                {section.subsections.map((sub, subIdx) => (
                  <div key={subIdx} className="space-y-4">
                    {sub.subsectionLabel && (
                      <SubsectionHeader label={sub.subsectionLabel} />
                    )}
                    {sub.filters.map((def) => {
                      // Get category for data attribute (including range filters)
                      const category = 'category' in def ? def.category : 
                        'rangeCategory' in def ? def.rangeCategory :
                        def.type === 'dynamicTeamSelect' ? 'team' :
                        def.type === 'dynamicCompetitionSelect' ? 'competition' :
                        def.type === 'select' && def.label === 'Season' ? 'season' : undefined
                      const isHighlighted = highlightedFilter && category && highlightedFilter.startsWith(`${category}:`)
                      
                      return (
                        <div 
                          key={def.label}
                          data-filter-category={category}
                          className={cn(
                            "transition-all duration-300 rounded-md p-2 -mx-2",
                            isHighlighted && "ring-2 ring-primary ring-inset bg-primary/5"
                          )}
                        >
                          <ConfigDrivenFilter
                            def={def}
                            filters={filters}
                            rangeFilters={rangeFilters}
                            onToggle={onToggle}
                            onToggleAll={onToggleAll}
                            onRangeChange={onRangeChange}
                            onSetFilter={onSetFilter}
                            resetRange={resetRange}
                            teamFilterCleared={teamFilterCleared}
                            competitionFilterCleared={competitionFilterCleared}
                          />
                        </div>
                      )
                    })}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  )
}
