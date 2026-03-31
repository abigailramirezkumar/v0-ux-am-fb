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
} from "@/lib/filter-config"
import { sportsData, type League } from "@/lib/sports-data"
import { ToggleGroup } from "@/components/filters/toggle-group"
import { ToggleGroupWithRange } from "@/components/filters/toggle-group-with-range"
import { RangeSlider } from "@/components/filters/range-slider"
import { FilterRow } from "@/components/filters/filter-row"
import { SubsectionHeader } from "@/components/filters/subsection-header"

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
      // Get selected leagues from filters to determine which teams to show
      const selectedLeagues = Array.from(filters.league || [])
      const teamOptions = getTeamsForLeagues(selectedLeagues)
      
      // Get currently selected team
      const selectedTeamSet = filters.team
      const selectedTeam = selectedTeamSet && selectedTeamSet.size > 0 
        ? Array.from(selectedTeamSet)[0] 
        : undefined
      
      return (
        <FilterRow
          label={d.label}
          count={d.count}
          filters={filters}
          onToggle={onToggle}
        >
          <Select
            value={selectedTeam || ""}
            onValueChange={(value) => {
              onSetFilter("team", value || null)
            }}
          >
            <SelectTrigger 
              className={`w-full h-9 text-sm border-border transition-all duration-300 ${
                selectedTeam ? "text-foreground" : "text-muted-foreground"
              } ${teamFilterCleared ? "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/30" : ""}`}
            >
              <SelectValue placeholder={d.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {teamOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterRow>
      )
    }

    case "select": {
      const d = def as SelectFilterDef
      // Check if this is the Season filter to make it controlled
      if (d.label === "Season") {
        const selectedSeasonSet = filters.season
        const selectedSeason = selectedSeasonSet && selectedSeasonSet.size > 0 
          ? Array.from(selectedSeasonSet)[0] 
          : undefined
        
        return (
          <FilterRow
            label={d.label}
            count={d.count}
            filters={filters}
            onToggle={onToggle}
          >
            <Select
              value={selectedSeason || ""}
              onValueChange={(value) => {
                onSetFilter("season", value || null)
              }}
            >
              <SelectTrigger className={`w-full h-9 text-sm border-border ${selectedSeason ? "text-foreground" : "text-muted-foreground"}`}>
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
}: FiltersModuleProps) {
  // Track team filter cleared state for visual feedback
  const [teamFilterCleared, setTeamFilterCleared] = useState(false)
  const prevLeaguesRef = useRef<string[]>([])
  
  // Watch for league changes and clear team if it's no longer valid
  useEffect(() => {
    const currentLeagues = Array.from(filters.league || [])
    const selectedTeamSet = filters.team
    const selectedTeam = selectedTeamSet && selectedTeamSet.size > 0 
      ? Array.from(selectedTeamSet)[0] 
      : undefined
    
    // Only check if there's a team selected and leagues have changed
    if (selectedTeam && currentLeagues.length > 0) {
      const prevLeagues = prevLeaguesRef.current
      const leaguesChanged = prevLeagues.length !== currentLeagues.length || 
        !prevLeagues.every(l => currentLeagues.includes(l))
      
      if (leaguesChanged && !isTeamInLeagues(selectedTeam, currentLeagues)) {
        // Clear the team filter
        onSetFilter("team", null)
        // Show visual feedback
        setTeamFilterCleared(true)
        setTimeout(() => setTeamFilterCleared(false), 1500)
      }
    }
    
    prevLeaguesRef.current = currentLeagues
  }, [filters.league, filters.team, onSetFilter])
  
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

      {/* Filter Sections — data-driven */}
      <ScrollArea className="flex-1 overflow-hidden">
        <Accordion
          type="multiple"
          defaultValue={DEFAULT_OPEN_SECTIONS}
          className="px-4"
        >
          {FILTER_SECTIONS.map((section, sIdx) => (
            <AccordionItem
              key={section.key}
              value={section.key}
              className={sIdx < FILTER_SECTIONS.length - 1 ? "border-b border-border" : "border-b-0"}
            >
              <AccordionTrigger className="py-3 hover:no-underline text-sm font-semibold text-foreground [&>svg]:text-muted-foreground">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-3">
                {section.subsections.map((sub, subIdx) => (
                  <div key={subIdx} className="space-y-3">
                    {sub.subsectionLabel && (
                      <SubsectionHeader label={sub.subsectionLabel} />
                    )}
                    {sub.filters.map((def) => (
                      <ConfigDrivenFilter
                        key={def.label}
                        def={def}
                        filters={filters}
                        rangeFilters={rangeFilters}
                        onToggle={onToggle}
                        onToggleAll={onToggleAll}
                        onRangeChange={onRangeChange}
                        onSetFilter={onSetFilter}
                        resetRange={resetRange}
                        teamFilterCleared={teamFilterCleared}
                      />
                    ))}
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
