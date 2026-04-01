"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { WatchProvider, useWatchContext } from "@/components/watch/watch-context"
import { GridModule } from "@/components/grid-module"
import { FiltersModule } from "@/components/filters-module"
import { GamesFiltersModule } from "@/components/games-filters-module"
import { GamesModule } from "@/components/games-module"
import { TeamsModule } from "@/components/teams-module"
import { AthletesModule } from "@/components/athletes-module"
import { PreviewModuleV1 } from "@/components/explore/preview-module-v1"
import { getAllUniqueClips } from "@/lib/mock-datasets"
import { AddToPlaylistMenu } from "@/components/add-to-playlist-menu"
import { useExploreFilters, type RangeCategory, type FilterState, type RangeFilterState } from "@/hooks/use-explore-filters"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import type { ImperativePanelHandle } from "react-resizable-panels"
import { useLibraryContext, type WatchBreadcrumbItem } from "@/lib/library-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import type { ClipData } from "@/types/library"
import type { PlayData } from "@/lib/mock-datasets"
import type { Game, GameLeague } from "@/types/game"
import type { Team } from "@/lib/sports-data"
import type { Athlete } from "@/types/athlete"
import { useExploreContext, type ExploreTab, type ExploreFilterState, type ActiveFilterChip } from "@/lib/explore-context"
import { FilterChips } from "@/components/explore/filter-chips"
import { FILTER_SECTIONS } from "@/lib/filter-config"
import { athletes } from "@/lib/athletes-data"

const exploreTabs = [
  { value: "clips", label: "Clips" },
  { value: "games", label: "Games" },
  { value: "teams", label: "Teams" },
  { value: "athletes", label: "Athletes" },
] as const

function PreviewClipsButton() {
  const { selectedPlayIds, activeDataset, clearPlaySelection } = useWatchContext()
  const { setPendingPreviewClips } = useLibraryContext()
  const router = useRouter()

  if (selectedPlayIds.size === 0 || !activeDataset) return null

  const handlePreview = () => {
    const selectedPlays = activeDataset.plays.filter((p) => selectedPlayIds.has(p.id))
    const clips: ClipData[] = selectedPlays.map((play) => ({
      id: play.id,
      playNumber: play.playNumber,
      odk: play.odk,
      quarter: play.quarter,
      down: play.down,
      distance: play.distance,
      yardLine: play.yardLine,
      hash: play.hash,
      yards: play.yards,
      result: play.result,
      gainLoss: play.gainLoss,
      defFront: play.defFront,
      defStr: play.defStr,
      coverage: play.coverage,
      blitz: play.blitz,
      game: play.game,
      playType: play.playType,
      passResult: play.passResult,
      runDirection: play.runDirection,
      personnelO: play.personnelO,
      personnelD: play.personnelD,
      isTouchdown: play.isTouchdown,
      isFirstDown: play.isFirstDown,
      isPenalty: play.isPenalty,
      penaltyType: play.penaltyType,
    }))

    setPendingPreviewClips(clips)
    clearPlaySelection()
    router.push("/watch")
  }

  return (
    <Button variant="outline" size="sm" onClick={handlePreview} className="gap-2">
      <Icon name="play" className="w-4 h-4" />
      Watch Clips
    </Button>
  )
}

function EmptyTabState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
      <Icon name="folder" className="w-10 h-10 opacity-40" />
      <p className="text-sm">{label} content coming soon</p>
    </div>
  )
}

/**
 * V1 - Preview Module Breadcrumbs
 * 
 * This is the baseline version with the original explore page behavior.
 * Customize this version to implement breadcrumb navigation in the preview module.
 */
export function ExploreV1() {
const { 
    showFilters, 
    setShowFilters, 
    setActiveFilterCount, 
    activeTab, 
    setActiveTab,
    sharedFilters,
    setSharedFilters,
    decodeFiltersFromUrl,
    highlightedFilter,
    setHighlightedFilter,
  } = useExploreContext()
  const searchParams = useSearchParams()
  
  // Sync activeTab and filters with URL parameters on mount
  useEffect(() => {
    const tabParam = searchParams.get("tab") as ExploreTab | null
    if (tabParam && ["clips", "games", "teams", "athletes"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
    
    // Restore filters from URL if present
    const filtersParam = searchParams.get("filters")
    if (filtersParam) {
      const decodedFilters = decodeFiltersFromUrl(filtersParam)
      setSharedFilters(decodedFilters)
      // Update local state from decoded filters
      setSelectedLeagues(decodedFilters.leagues)
      setSelectedSeasons(decodedFilters.seasons)
      setSelectedTeams(decodedFilters.teams)
      setSelectedCompetitions(decodedFilters.competitions)
    }
  }, []) // Only run on mount
  
  const [previewPlay, setPreviewPlay] = useState<PlayData | null>(null)
  const [previewGame, setPreviewGame] = useState<Game | null>(null)
  const [previewTeam, setPreviewTeam] = useState<Team | null>(null)
  const [previewAthlete, setPreviewAthlete] = useState<(Athlete & { id: string }) | null>(null)
  const previewPanelRef = useRef<ImperativePanelHandle>(null)
  const filterPanelRef = useRef<ImperativePanelHandle>(null)
  
  // Games/Athletes/Teams tab filter state - initialize from context
  const [selectedLeagues, setSelectedLeagues] = useState<GameLeague[]>(sharedFilters.leagues)
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(sharedFilters.seasons)
  const [selectedTeams, setSelectedTeams] = useState<string[]>(sharedFilters.teams)
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>(sharedFilters.competitions)
  
  // Sync local state to context whenever it changes
  useEffect(() => {
    setSharedFilters({
      leagues: selectedLeagues,
      seasons: selectedSeasons,
      teams: selectedTeams,
      competitions: selectedCompetitions,
    })
  }, [selectedLeagues, selectedSeasons, selectedTeams, selectedCompetitions, setSharedFilters])

  const handleLeagueToggle = useCallback((league: GameLeague) => {
    setSelectedLeagues((prev) =>
      prev.includes(league) ? prev.filter((l) => l !== league) : [...prev, league]
    )
  }, [])

  const handleSeasonToggle = useCallback((season: string) => {
    setSelectedSeasons((prev) =>
      prev.includes(season) ? prev.filter((s) => s !== season) : [...prev, season]
    )
  }, [])

  const handleTeamToggle = useCallback((team: string) => {
    setSelectedTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    )
  }, [])

  const handleCompetitionToggle = useCallback((competition: string) => {
    setSelectedCompetitions((prev) =>
      prev.includes(competition) ? prev.filter((c) => c !== competition) : [...prev, competition]
    )
  }, [])

  const clearGamesFilters = useCallback(() => {
    setSelectedLeagues([])
    setSelectedSeasons([])
    setSelectedTeams([])
    setSelectedCompetitions([])
  }, [])

  const gamesFilterCount = selectedLeagues.length + selectedSeasons.length + selectedTeams.length + selectedCompetitions.length

  useEffect(() => {
    if (previewPlay || previewGame || previewTeam || previewAthlete) {
      previewPanelRef.current?.resize(50)
      setShowFilters(false)
    } else {
      previewPanelRef.current?.collapse()
      setShowFilters(true)
    }
  }, [previewPlay, previewGame, previewTeam, previewAthlete])

  const handleGameClick = (game: Game) => {
    setPreviewPlay(null)
    setPreviewTeam(null)
    setPreviewAthlete(null)
    setPreviewGame(game)
  }

  const handleClipClick = (play: PlayData) => {
    setPreviewGame(null)
    setPreviewTeam(null)
    setPreviewAthlete(null)
    setPreviewPlay(play)
  }

  const handleTeamClick = (team: Team) => {
    setPreviewPlay(null)
    setPreviewGame(null)
    setPreviewAthlete(null)
    setPreviewTeam(team)
  }

  const handleAthleteClick = (athlete: Athlete & { id: string }) => {
    setPreviewPlay(null)
    setPreviewGame(null)
    setPreviewTeam(null)
    setPreviewAthlete(athlete)
  }

  const handleClosePreview = () => {
    setPreviewPlay(null)
    setPreviewGame(null)
    setPreviewTeam(null)
    setPreviewAthlete(null)
  }

  useEffect(() => {
    if (showFilters) {
      filterPanelRef.current?.expand()
    } else {
      filterPanelRef.current?.collapse()
    }
  }, [showFilters])

  const allClipsDataset = useMemo(() => getAllUniqueClips(), [])

  const {
    filters,
    rangeFilters,
    toggleFilter: baseToggleFilter,
    toggleAllInCategory,
    setFilter,
    setRangeFilter,
    clearFilters: baseClearFilters,
    clearRangeFilter,
    filteredPlays,
    uniqueGames,
  activeFilterCount,
  isFiltering,
  setFilters,
  setRangeFilters,
} = useExploreFilters(allClipsDataset.plays)

  // Apply a saved filter set
  const applySavedFilter = useCallback((savedFilters: FilterState, savedRangeFilters: RangeFilterState) => {
    // Set both filter states
    setFilters(savedFilters)
    setRangeFilters(savedRangeFilters)
    
    // Also sync shared filters for the shared state system (excluding athletes which is clips-only)
    const newLeagues = savedFilters.league ? Array.from(savedFilters.league) as GameLeague[] : []
    const newTeams = savedFilters.team ? Array.from(savedFilters.team) : []
    const newCompetitions = savedFilters.competition ? Array.from(savedFilters.competition) : []
    const newSeasons = savedFilters.season ? Array.from(savedFilters.season) : []
    
    // Update local state which will sync to shared filters via useEffect
    setSelectedLeagues(newLeagues)
    setSelectedTeams(newTeams)
    setSelectedCompetitions(newCompetitions)
    setSelectedSeasons(newSeasons)
  }, [setFilters, setRangeFilters])

  // Sync shared filters (league, team, competition, season) from GamesFiltersModule state to FiltersModule state
  useEffect(() => {
    setFilters((prev: Record<string, Set<string>>) => {
      const next = { ...prev }
      
      // Sync league
      if (selectedLeagues.length > 0) {
        next.league = new Set(selectedLeagues)
      } else {
        delete next.league
      }
      
      // Sync team
      if (selectedTeams.length > 0) {
        next.team = new Set(selectedTeams)
      } else {
        delete next.team
      }
      
      // Sync competition
      if (selectedCompetitions.length > 0) {
        next.competition = new Set(selectedCompetitions)
      } else {
        delete next.competition
      }
      
      // Sync season
      if (selectedSeasons.length > 0) {
        next.season = new Set(selectedSeasons)
      } else {
        delete next.season
      }
      
      return next
    })
  }, [selectedLeagues, selectedTeams, selectedCompetitions, selectedSeasons, setFilters])

  // Wrap toggleFilter to also update shared state when toggling shared filters
  const toggleFilter = useCallback((category: string, value: string) => {
    // For shared filters, update both systems
    if (category === "league") {
      handleLeagueToggle(value as GameLeague)
    } else if (category === "team") {
      handleTeamToggle(value)
    } else if (category === "competition") {
      handleCompetitionToggle(value)
    } else if (category === "season") {
      handleSeasonToggle(value)
    }
    // Always update the clips filter state
    baseToggleFilter(category, value)
  }, [baseToggleFilter, handleLeagueToggle, handleTeamToggle, handleCompetitionToggle, handleSeasonToggle])

// Wrap clearFilters to handle both clearing modes
  const clearFilters = useCallback(() => {
  // Clear shared filters
  clearGamesFilters()
  // Clear all clips filters
  baseClearFilters()
  }, [clearGamesFilters, baseClearFilters])

  // Helper function to find which section a filter category belongs to
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
          // Check for special filter types
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
    return 'scope' // default
  }, [])

  // Helper to format filter value for display
  const formatFilterValue = useCallback((category: string, value: string): string => {
    // Format down values
    if (category === 'down') {
      const suffixes: Record<string, string> = { '1': '1st', '2': '2nd', '3': '3rd', '4': '4th' }
      return suffixes[value] || value
    }
    // Format league values
    if (category === 'league') {
      if (value === 'College') return 'NCAA'
      if (value === 'HighSchool') return 'High School'
      return value
    }
    // Format athlete values (show name instead of ID)
    if (category === 'athlete') {
      const athlete = athletes.find(a => a.id === value)
      return athlete?.name || value
    }
    return value
  }, [])

  // Helper to format category label for display
  const formatCategoryLabel = useCallback((category: string): string => {
    const labels: Record<string, string> = {
      league: 'League',
      season: 'Season',
      team: 'Team',
      athlete: 'Athlete',
      competition: 'Competition',
      down: 'Down',
      hash: 'Hash',
      distanceType: 'Distance',
      playType: 'Play Type',
      passResult: 'Pass Result',
      runDirection: 'Run Direction',
      gainLoss: 'Rush Result',
      personnelO: 'Personnel (O)',
      personnelD: 'Personnel (D)',
      formationName: 'Formation',
    }
    return labels[category] || category.charAt(0).toUpperCase() + category.slice(1)
  }, [])

  // Range filter labels mapping
  const rangeFilterLabels: Record<string, string> = {
    distanceRange: 'Distance',
    yardLine: 'Yard Line',
    yardsAfterContactRange: 'YAC',
    puntReturnRange: 'Punt Return',
    kickoffReturnRange: 'Kickoff Return',
    epaRange: 'EPA',
  }

  // Plural labels for count display when > 5 values
  const categoryPluralLabels: Record<string, string> = {
    league: 'Leagues',
    season: 'Seasons',
    team: 'Teams',
    competition: 'Competitions',
    down: 'Downs',
    hash: 'Hashes',
    playType: 'Play Types',
    passResult: 'Pass Results',
    runDirection: 'Run Directions',
    gainLoss: 'Rush Results',
    personnelO: 'Personnel (O)',
    personnelD: 'Personnel (D)',
    formationName: 'Formations',
  }

  // Helper to format chip label - show count if > 5 values
  const formatChipLabel = useCallback((category: string, values: string[], formattedValues: string[]): string => {
    const categoryLabel = formatCategoryLabel(category)
    if (values.length > 5) {
      const pluralLabel = categoryPluralLabels[category] || `${categoryLabel}s`
      return `${values.length} ${pluralLabel}`
    }
    return `${categoryLabel} > ${formattedValues.join(', ')}`
  }, [formatCategoryLabel, categoryPluralLabels])

  // Mapping of toggle categories to their corresponding range categories
  // These are paired filters where the toggle chips control the slider
  const toggleToRangeMapping: Record<string, string> = {
    distanceType: 'distanceRange',
    yardsAfterContact: 'yardsAfterContactRange',
    puntReturnYards: 'puntReturnRange',
    kickoffReturnYards: 'kickoffReturnRange',
  }

  // Generate active filter chips from current filter state
  const activeFilterChips = useMemo((): ActiveFilterChip[] => {
    const chips: ActiveFilterChip[] = []
    
    // For non-clips tabs, use shared filters (league, season, team, competition)
    if (activeTab === 'games' || activeTab === 'teams' || activeTab === 'athletes') {
      // Group leagues into single chip
      if (selectedLeagues.length > 0) {
        const formattedValues = selectedLeagues.map(l => formatFilterValue('league', l))
        chips.push({
          id: 'league',
          category: 'league',
          values: selectedLeagues,
          label: formatChipLabel('league', selectedLeagues, formattedValues),
          sectionKey: 'scope',
        })
      }
      // Group seasons into single chip
      if (selectedSeasons.length > 0) {
        chips.push({
          id: 'season',
          category: 'season',
          values: selectedSeasons,
          label: formatChipLabel('season', selectedSeasons, selectedSeasons),
          sectionKey: 'scope',
        })
      }
      // Group teams into single chip
      if (selectedTeams.length > 0) {
        chips.push({
          id: 'team',
          category: 'team',
          values: selectedTeams,
          label: formatChipLabel('team', selectedTeams, selectedTeams),
          sectionKey: 'scope',
        })
      }
      // Group competitions into single chip
      if (selectedCompetitions.length > 0) {
        chips.push({
          id: 'competition',
          category: 'competition',
          values: selectedCompetitions,
          label: formatChipLabel('competition', selectedCompetitions, selectedCompetitions),
          sectionKey: 'scope',
        })
      }
    } else {
      // For clips tab, use the detailed filters state
      // Group by category - one chip per category with comma-separated values
      // Skip toggle categories that have a corresponding range filter active (they're unified)
      Object.entries(filters).forEach(([category, values]) => {
        if (values && values.size > 0) {
          // Check if this toggle category has a corresponding range category
          const correspondingRangeCategory = toggleToRangeMapping[category]
          if (correspondingRangeCategory && rangeFilters[correspondingRangeCategory as keyof typeof rangeFilters]) {
            // Skip - the range filter chip will represent this filter
            return
          }
          
          const sectionKey = findSectionForCategory(category)
          const valuesArray = Array.from(values)
          const formattedValues = valuesArray.map(v => formatFilterValue(category, v))
          chips.push({
            id: category,
            category,
            values: valuesArray,
            label: formatChipLabel(category, valuesArray, formattedValues),
            sectionKey,
          })
        }
      })
      
      // Add range filters (sliders)
      Object.entries(rangeFilters).forEach(([category, range]) => {
        if (range) {
          const label = rangeFilterLabels[category] || category
          const sectionKey = findSectionForCategory(category)
          chips.push({
            id: category,
            category,
            values: [`${range[0]}`, `${range[1]}`],
            label: `${label} > ${range[0]}-${range[1]}`,
            sectionKey,
            isRange: true,
          })
        }
      })
    }
    
    return chips
  }, [activeTab, selectedLeagues, selectedSeasons, selectedTeams, selectedCompetitions, filters, rangeFilters, findSectionForCategory, formatChipLabel, formatFilterValue, rangeFilterLabels, toggleToRangeMapping])

  // Handle chip click - open filters panel and scroll to the filter
  const handleChipClick = useCallback((chip: ActiveFilterChip) => {
    // Open the filters panel if not already open
    setShowFilters(true)
    // Set the highlighted filter so the filter module can scroll to it (use category:firstValue format for compatibility)
    setHighlightedFilter(`${chip.category}:${chip.values[0]}`)
    // Clear the highlight after a delay
    setTimeout(() => setHighlightedFilter(null), 2000)
  }, [setShowFilters, setHighlightedFilter])

  // Handle chip remove - clear all values in the category
// Reverse mapping: range category -> toggle category
  const rangeToToggleMapping: Record<string, string> = {
    distanceRange: 'distanceType',
    yardsAfterContactRange: 'yardsAfterContact',
    puntReturnRange: 'puntReturnYards',
    kickoffReturnRange: 'kickoffReturnYards',
  }

  const handleChipRemove = useCallback((chip: ActiveFilterChip) => {
  if (chip.isRange) {
  // Clear range filter
  clearRangeFilter(chip.category as RangeCategory)
  // Also clear corresponding toggle filter if it exists
  const correspondingToggleCategory = rangeToToggleMapping[chip.category]
  if (correspondingToggleCategory) {
    const toggleValues = filters[correspondingToggleCategory as keyof typeof filters]
    if (toggleValues && toggleValues.size > 0) {
      toggleValues.forEach(v => toggleFilter(correspondingToggleCategory, v))
    }
  }
  return
  }
  
  if (activeTab === 'games' || activeTab === 'teams' || activeTab === 'athletes') {
  // Use the shared filter handlers - clear all values in this category
  if (chip.category === 'league') {
  chip.values.forEach(v => handleLeagueToggle(v as GameLeague))
  } else if (chip.category === 'season') {
  chip.values.forEach(v => handleSeasonToggle(v))
  } else if (chip.category === 'team') {
  chip.values.forEach(v => handleTeamToggle(v))
  } else if (chip.category === 'competition') {
  chip.values.forEach(v => handleCompetitionToggle(v))
  }
  } else {
  // Use the clips filter toggle - clear all values in this category
  chip.values.forEach(v => toggleFilter(chip.category, v))
  }
  }, [activeTab, handleLeagueToggle, handleSeasonToggle, handleTeamToggle, handleCompetitionToggle, toggleFilter, clearRangeFilter, filters, rangeToToggleMapping])
  
  useEffect(() => {
  const count = activeTab === "games" || activeTab === "teams" || activeTab === "athletes" ? gamesFilterCount : activeFilterCount
  setActiveFilterCount(count)
  }, [activeFilterCount, gamesFilterCount, activeTab, setActiveFilterCount])

  const filteredDataset = useMemo(
    () => ({ ...allClipsDataset, plays: filteredPlays }),
    [allClipsDataset, filteredPlays]
  )

  // Build breadcrumb for watch app navigation based on current preview
  const watchBreadcrumb: WatchBreadcrumbItem[] = useMemo(() => {
    const baseBreadcrumb: WatchBreadcrumbItem[] = [
      { label: "Explore", href: "/explore", icon: "explore" },
    ]
    
    if (previewGame) {
      // If previewing a game, add game to breadcrumb
      return [
        ...baseBreadcrumb,
        { label: "Games", href: "/explore?tab=games" },
      ]
    }
    
    if (previewTeam) {
      return [
        ...baseBreadcrumb,
        { label: "Teams", href: "/explore?tab=teams" },
        { label: previewTeam.name, href: `/teams/${previewTeam.id}` },
      ]
    }
    
    if (previewAthlete) {
      return [
        ...baseBreadcrumb,
        { label: "Athletes", href: "/explore?tab=athletes" },
        { label: previewAthlete.name, href: `/athletes/${previewAthlete.id}` },
      ]
    }
    
    if (previewPlay) {
      return [
        ...baseBreadcrumb,
        { label: "Clips", href: "/explore?tab=clips" },
      ]
    }
    
    return baseBreadcrumb
  }, [previewGame, previewTeam, previewAthlete, previewPlay])

  return (
    <WatchProvider initialTabs={[allClipsDataset]}>
      <div className="flex flex-col h-full w-full bg-sidebar">
        <ResizablePanelGroup direction="horizontal" className="flex-1 [&>div]:transition-all [&>div]:duration-300 [&>div]:ease-in-out">
          {/* Filters Panel */}
          <ResizablePanel
            ref={filterPanelRef}
            defaultSize={22}
            minSize={18}
            maxSize={35}
            collapsible
            collapsedSize={0}
            onCollapse={() => setShowFilters(false)}
            onExpand={() => setShowFilters(true)}
          >
            <div className="h-full pl-3 py-3">
              {activeTab === "games" || activeTab === "teams" || activeTab === "athletes" ? (
<GamesFiltersModule
  selectedLeagues={selectedLeagues}
  selectedSeasons={selectedSeasons}
  selectedTeams={selectedTeams}
  selectedCompetitions={selectedCompetitions}
  onLeagueToggle={handleLeagueToggle}
  onSeasonToggle={handleSeasonToggle}
  onTeamToggle={handleTeamToggle}
  onCompetitionToggle={handleCompetitionToggle}
  onClear={clearGamesFilters}
  onApplySavedFilter={applySavedFilter}
  hideTeamFilter={activeTab === "teams"}
  hideSeasonFilter={activeTab === "teams"}
  highlightedFilter={highlightedFilter}
  />
              ) : (
<FiltersModule
  filters={filters}
  rangeFilters={rangeFilters}
  onToggle={toggleFilter}
  onToggleAll={toggleAllInCategory}
  onRangeChange={setRangeFilter}
  onSetFilter={setFilter}
  onClear={clearFilters}
  onApplySavedFilter={applySavedFilter}
  uniqueGames={uniqueGames}
  activeFilterCount={activeFilterCount}
  totalCount={allClipsDataset.plays.length}
  filteredCount={filteredPlays.length}
  highlightedFilter={highlightedFilter}
  />
              )}
            </div>
          </ResizablePanel>
          <ResizableHandle className="w-[8px] bg-transparent border-0 after:hidden before:hidden [&>div]:hidden" />

          {/* Main Content + Preview */}
          <ResizablePanel defaultSize={78}>
            <ResizablePanelGroup direction="horizontal" className="h-full [&>div]:transition-all [&>div]:duration-300 [&>div]:ease-in-out">
              <ResizablePanel defaultSize={100} minSize={40} id="explore-main-v1" order={1}>
                <div className={cn("h-full flex flex-col py-3", !previewPlay && !previewGame && !previewTeam && !previewAthlete && "pr-3")}>
{/* Tabs + Filter Chips */}
  <div className="flex items-center gap-2 px-3 pt-3 pb-2 bg-background rounded-t-lg overflow-x-auto">
  {exploreTabs.map((tab) => (
  <button
  key={tab.value}
  onClick={() => setActiveTab(tab.value)}
  className={cn(
  "px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 shrink-0",
  activeTab === tab.value
  ? "bg-foreground text-background shadow-sm"
  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
  )}
  >
  {tab.label}
  </button>
  ))}
  <FilterChips 
    chips={activeFilterChips}
    onChipClick={handleChipClick}
    onChipRemove={handleChipRemove}
    onClearAll={clearFilters}
  />
  </div>

                  {/* Tab Content */}
                  {activeTab === "clips" ? (
                    <div className="flex-1 bg-background rounded-b-lg overflow-hidden relative">
                      <GridModule
                        showTabs={false}
                        variant="explore"
                        selectionActions={
                          <div className="flex items-center gap-1">
                            <AddToPlaylistMenu />
                            <PreviewClipsButton />
                          </div>
                        }
                        dataset={filteredDataset}
                        onClearFilters={clearFilters}
                        onClickPlay={handleClipClick}
                        activePlayId={previewPlay?.id}
                      />
                      {isFiltering && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center pointer-events-none z-10">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>Filtering...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : activeTab === "games" ? (
                    <div className="flex-1 bg-background rounded-b-lg overflow-hidden">
                      <GamesModule
                        selectedLeagues={selectedLeagues}
                        selectedSeasons={selectedSeasons}
                        selectedTeams={selectedTeams}
                        selectedCompetitions={selectedCompetitions}
                        onClickGame={handleGameClick}
                        activeGameId={previewGame?.id}
                      />
                    </div>
                  ) : activeTab === "teams" ? (
                    <div className="flex-1 bg-background rounded-b-lg overflow-hidden">
                      <TeamsModule
                        selectedLeagues={selectedLeagues}
                        selectedSeasons={selectedSeasons}
                        selectedTeams={selectedTeams}
                        selectedCompetitions={selectedCompetitions}
                        onClickTeam={handleTeamClick}
                        activeTeamId={previewTeam?.id}
                      />
                    </div>
                  ) : activeTab === "athletes" ? (
                    <div className="flex-1 bg-background rounded-b-lg overflow-hidden">
                      <AthletesModule
                        selectedLeagues={selectedLeagues}
                        selectedSeasons={selectedSeasons}
                        selectedTeams={selectedTeams}
                        selectedCompetitions={selectedCompetitions}
                        onClickAthlete={handleAthleteClick}
                        activeAthleteId={previewAthlete?.id}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 bg-background rounded-b-lg overflow-hidden">
                      <EmptyTabState label="Content" />
                    </div>
                  )}
                </div>
              </ResizablePanel>

              {/* Preview Panel */}
              <ResizableHandle className="w-[8px] bg-transparent border-0 after:hidden before:hidden [&>div]:hidden" />
              <ResizablePanel
                ref={previewPanelRef}
                defaultSize={0}
                minSize={30}
                maxSize={55}
                collapsible
                collapsedSize={0}
                id="explore-preview-v1"
                order={2}
              >
                <div className="h-full pr-3 py-3 pl-0">
                  {(previewPlay || previewGame || previewTeam || previewAthlete) && (
<PreviewModuleV1
  play={previewPlay || undefined}
  game={previewGame || undefined}
  team={previewTeam || undefined}
  athlete={previewAthlete || undefined}
  onClose={handleClosePreview}
  watchBreadcrumb={watchBreadcrumb}
  />
                  )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </WatchProvider>
  )
}
