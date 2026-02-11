"use client"

import { useState } from "react"
import { WatchProvider, useWatchContext } from "@/components/watch/watch-context"
import { GridModule } from "@/components/grid-module"
import { FiltersModule } from "@/components/filters-module"
import { getAllUniqueClips } from "@/lib/mock-datasets"
import { AddToPlaylistMenu } from "@/components/add-to-playlist-menu"
import { useExploreFilters } from "@/hooks/use-explore-filters"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { useLibraryContext } from "@/lib/library-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import type { ClipData } from "@/types/library"

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

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<ExploreTab>("clips")

  // Get all unique clips combined into one dataset
  const allClipsDataset = getAllUniqueClips()
  
  // Use hook to filter clips
  const { filters, rangeFilters, toggleFilter, toggleAllInCategory, setRangeFilter, clearFilters, filteredPlays, uniqueGames, activeFilterCount } = useExploreFilters(allClipsDataset.plays)

  // Construct filtered dataset to pass to Grid
  const filteredDataset = {
    ...allClipsDataset,
    plays: filteredPlays
  }

  return (
    <WatchProvider initialTabs={[allClipsDataset]}>
        <div className="flex flex-col h-full w-full bg-sidebar">
        {/* Explore Tabs */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2 bg-background">
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
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={22} minSize={18} maxSize={35}>
              <div className="h-full pr-1 pb-3">
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
            <ResizablePanel defaultSize={78}>
              <div className="h-full overflow-hidden pl-1 pb-3 pr-3">
                <div className="h-full bg-background rounded-lg overflow-hidden">
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
                  />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : activeTab === "practice" ? (
          <div className="flex-1 px-3 pb-3">
            <div className="h-full bg-background rounded-lg overflow-hidden">
              <EmptyTabState label="Practice" />
            </div>
          </div>
        ) : activeTab === "games" ? (
          <div className="flex-1 px-3 pb-3">
            <div className="h-full bg-background rounded-lg overflow-hidden">
              <EmptyTabState label="Games" />
            </div>
          </div>
        ) : (
          <div className="flex-1 px-3 pb-3">
            <div className="h-full bg-background rounded-lg overflow-hidden">
              <EmptyTabState label="Teams" />
            </div>
          </div>
        )}
      </div>
    </WatchProvider>
  )
}
