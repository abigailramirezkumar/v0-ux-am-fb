"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { WatchProvider, useWatchContext } from "@/components/watch/watch-context"
import { GridModule } from "@/components/grid-module"
import { FiltersModule } from "@/components/filters-module"
import { PreviewModule } from "@/components/preview-module"
import { getAllUniqueClips } from "@/lib/mock-datasets"
import { AddToPlaylistMenu } from "@/components/add-to-playlist-menu"
import { useExploreFilters } from "@/hooks/use-explore-filters"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import type { ImperativePanelHandle } from "react-resizable-panels"
import { useLibraryContext } from "@/lib/library-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import type { ClipData } from "@/types/library"
import type { PlayData } from "@/lib/mock-datasets"

const exploreTabs = [
  { value: "clips", label: "Clips" },
  { value: "practice", label: "Practice" },
  { value: "games", label: "Games" },
  { value: "teams", label: "Teams" },
] as const

type ExploreTab = (typeof exploreTabs)[number]["value"]

function PreviewClipsButton() {
  const { selectedPlayIds, activeDataset, clearPlaySelection } = useWatchContext()
  const { setPendingPreviewClips } = useLibraryContext()
  const router = useRouter()

  if (selectedPlayIds.size === 0 || !activeDataset) return null

  const handlePreview = () => {
    // Collect the selected plays as ClipData
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

const FilterIcon = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M1.75 2.625H12.25" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M3.5 5.25H10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M5.25 7.875H8.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M6.125 10.5H7.875" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
)

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<ExploreTab>("clips")
  const [previewPlay, setPreviewPlay] = useState<PlayData | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  const previewPanelRef = useRef<ImperativePanelHandle>(null)
  const filterPanelRef = useRef<ImperativePanelHandle>(null)

  // Expand/collapse the preview panel when previewPlay changes
  useEffect(() => {
    if (previewPlay) {
      previewPanelRef.current?.expand()
    } else {
      previewPanelRef.current?.collapse()
    }
  }, [previewPlay])

  const handleToggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev)
  }, [])

  // Sync the imperative panel with the showFilters state (matches watch page pattern)
  useEffect(() => {
    if (showFilters) {
      filterPanelRef.current?.expand()
    } else {
      filterPanelRef.current?.collapse()
    }
  }, [showFilters])

  // Memoize the base dataset so it's only computed once (mock data is static)
  const allClipsDataset = useMemo(() => getAllUniqueClips(), [])
  
  // Use hook to filter clips
  const { filters, rangeFilters, toggleFilter, toggleAllInCategory, setRangeFilter, clearFilters, filteredPlays, uniqueGames, activeFilterCount, isFiltering } = useExploreFilters(allClipsDataset.plays)

  // Memoize the filtered dataset so children only re-render when filteredPlays changes
  const filteredDataset = useMemo(
    () => ({ ...allClipsDataset, plays: filteredPlays }),
    [allClipsDataset, filteredPlays]
  )

  return (
    <WatchProvider initialTabs={[allClipsDataset]}>
      <div className="flex flex-col h-full w-full bg-sidebar">
        <ResizablePanelGroup direction="horizontal" className="flex-1 [&>div]:transition-all [&>div]:duration-300 [&>div]:ease-in-out">
          {/* Filters - collapsible full height left panel */}
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
            <div className="h-full pl-3 pr-1 py-3">
              <FiltersModule
                filters={filters}
                rangeFilters={rangeFilters}
                onToggle={toggleFilter}
                onToggleAll={toggleAllInCategory}
                onRangeChange={setRangeFilter}
                onClear={clearFilters}
                uniqueGames={uniqueGames}
                activeFilterCount={activeFilterCount}
                totalCount={allClipsDataset.plays.length}
                filteredCount={filteredPlays.length}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle className="w-1 bg-transparent border-0 after:hidden before:hidden [&>div]:hidden" />

          {/* Right panel: Tabs + Content + Preview */}
          <ResizablePanel defaultSize={78}>
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Main content area */}
              <ResizablePanel defaultSize={100} minSize={40} id="explore-main" order={1}>
                <div className="h-full flex flex-col pl-1 pr-3 py-3">
                  {/* Explore Tabs + Filter Toggle */}
                  <div className="flex items-center gap-2 px-3 pt-3 pb-2 bg-background rounded-t-lg">
                    {/* Filter toggle button – matches Watch toolbar ToggleBtn style */}
                    <button
                      onClick={handleToggleFilters}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-md transition-colors h-10 w-10 gap-1 shrink-0",
                        showFilters
                          ? "bg-foreground/90 text-background dark:bg-white/90 dark:text-sidebar"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                      aria-label={showFilters ? "Hide filters" : "Show filters"}
                    >
                      <FilterIcon className="w-4 h-4" />
                      <span className="text-[10px] font-medium leading-none">Filters</span>
                    </button>

                    <div className="w-px h-6 bg-border/50 shrink-0" />

                    {exploreTabs.map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                          "px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200",
                          activeTab === tab.value
                            ? "bg-foreground text-background shadow-sm"
                            : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted",
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
                        onDoubleClickPlay={(play) => setPreviewPlay(play)}
                      />
                      {/* Subtle overlay while deferred filter computation catches up */}
                      {isFiltering && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center pointer-events-none z-10">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>Filtering...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : activeTab === "practice" ? (
                    <div className="flex-1 bg-background rounded-b-lg overflow-hidden">
                      <EmptyTabState label="Practice" />
                    </div>
                  ) : activeTab === "games" ? (
                    <div className="flex-1 bg-background rounded-b-lg overflow-hidden">
                      <EmptyTabState label="Games" />
                    </div>
                  ) : (
                    <div className="flex-1 bg-background rounded-b-lg overflow-hidden">
                      <EmptyTabState label="Teams" />
                    </div>
                  )}
                </div>
              </ResizablePanel>

              {/* Preview Panel (collapsible right) */}
              <ResizableHandle className="w-1 bg-transparent border-0 after:hidden before:hidden [&>div]:hidden" />
              <ResizablePanel
                ref={previewPanelRef}
                defaultSize={0}
                minSize={25}
                maxSize={50}
                collapsible
                collapsedSize={0}
                id="explore-preview"
                order={2}
              >
                <div className="h-full pr-3 py-3">
                  {previewPlay && (
                    <PreviewModule
                      play={previewPlay}
                      onClose={() => setPreviewPlay(null)}
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
