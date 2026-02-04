"use client"

import { WatchProvider } from "@/components/watch/watch-context"
import { GridModule } from "@/components/grid-module"
import { FiltersModule } from "@/components/filters-module"
import { getAllUniqueClips } from "@/lib/mock-datasets"
import { AddToPlaylistMenu } from "@/components/add-to-playlist-menu"
import { useExploreFilters } from "@/hooks/use-explore-filters"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

export default function ExplorePage() {
  // Get all unique clips combined into one dataset
  const allClipsDataset = getAllUniqueClips()
  
  // Use hook to filter clips
  const { filters, toggleFilter, clearFilters, filteredPlays, uniqueGames, activeFilterCount } = useExploreFilters(allClipsDataset.plays)

  // Construct filtered dataset to pass to Grid
  const filteredDataset = {
    ...allClipsDataset,
    plays: filteredPlays
  }

  return (
    <WatchProvider initialTabs={[allClipsDataset]}>
      <div className="flex flex-col h-full w-full bg-muted/30">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={22} minSize={18} maxSize={35}>
            <div className="h-full p-3 pr-0">
              <FiltersModule
                filters={filters}
                onToggle={toggleFilter}
                onClear={clearFilters}
                uniqueGames={uniqueGames}
                activeFilterCount={activeFilterCount}
                totalCount={allClipsDataset.plays.length}
                filteredCount={filteredPlays.length}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={78}>
            <div className="h-full overflow-hidden p-3 pl-0">
              <div className="h-full bg-background rounded-lg border border-border overflow-hidden">
                <GridModule 
                  showTabs={false} 
                  selectionActions={<AddToPlaylistMenu />} 
                  dataset={filteredDataset}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </WatchProvider>
  )
}
