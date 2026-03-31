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
import { useExploreFilters } from "@/hooks/use-explore-filters"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import type { ImperativePanelHandle } from "react-resizable-panels"
import { useLibraryContext } from "@/lib/library-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import type { ClipData } from "@/types/library"
import type { PlayData } from "@/lib/mock-datasets"
import type { Game, GameLeague } from "@/types/game"
import type { Team } from "@/lib/sports-data"
import type { Athlete } from "@/types/athlete"
import { useExploreContext, type ExploreTab, type ExploreFilterState } from "@/lib/explore-context"

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
    <Button variant="ghost" size="sm" onClick={handlePreview} className="flex items-center gap-1.5 text-sm">
      <Icon name="play" className="w-3.5 h-3.5" />
      Preview Clips
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
    filteredPlays,
    uniqueGames,
    activeFilterCount,
    isFiltering,
    setFilters,
  } = useExploreFilters(allClipsDataset.plays)

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

  useEffect(() => {
    const count = activeTab === "games" || activeTab === "teams" || activeTab === "athletes" ? gamesFilterCount : activeFilterCount
    setActiveFilterCount(count)
  }, [activeFilterCount, gamesFilterCount, activeTab, setActiveFilterCount])

  const filteredDataset = useMemo(
    () => ({ ...allClipsDataset, plays: filteredPlays }),
    [allClipsDataset, filteredPlays]
  )

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
                  hideTeamFilter={activeTab === "teams"}
                  hideSeasonFilter={activeTab === "teams"}
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
                  uniqueGames={uniqueGames}
                  activeFilterCount={activeFilterCount}
                  totalCount={allClipsDataset.plays.length}
                  filteredCount={filteredPlays.length}
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
                  {/* Tabs */}
                  <div className="flex items-center gap-2 px-3 pt-3 pb-2 bg-background rounded-t-lg">
                    {exploreTabs.map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                          "px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200",
                          activeTab === tab.value
                            ? "bg-foreground text-background shadow-sm"
                            : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  {activeTab === "clips" ? (
                    <div className="flex-1 bg-background rounded-b-lg overflow-hidden relative">
                      <GridModule
                        showTabs={false}
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
