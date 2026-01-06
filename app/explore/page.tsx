"use client"

import { useState, useMemo } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterSidebar } from "@/components/explore/filter-sidebar"
import { ClipsDataGrid } from "@/components/explore/clips-data-grid"
import { ClipViewer } from "@/components/explore/clip-viewer"
import { GlobalFilters } from "@/components/explore/global-filters"
import { mockClips, type Clip } from "@/lib/mock-clips"

export default function ExplorePage() {
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)
  const [clipViewerOpen, setClipViewerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("plays")
  const [filters, setFilters] = useState({
    downs: [] as number[],
    quarters: [] as number[],
    playTypes: [] as string[],
    personnel: [] as string[],
  })

  const filteredClips = useMemo(() => {
    return mockClips.filter((clip) => {
      if (filters.downs.length > 0 && !filters.downs.includes(clip.down)) return false
      if (filters.quarters.length > 0 && !filters.quarters.includes(clip.quarter)) return false
      if (filters.playTypes.length > 0 && !filters.playTypes.includes(clip.playType)) return false
      if (filters.personnel.length > 0 && !filters.personnel.includes(clip.personnel.offense)) return false
      return true
    })
  }, [filters])

  const handleClipDoubleClick = (clip: Clip) => {
    setSelectedClip(clip)
    setClipViewerOpen(true)
  }

  const activeFilterCount =
    filters.downs.length + filters.quarters.length + filters.playTypes.length + filters.personnel.length

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Secondary Navigation */}
      <div className="rounded-xl bg-background shadow-sm overflow-hidden shrink-0">
        <div className="px-4 py-2 border-b border-border/50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent p-0 gap-1">
              <TabsTrigger
                value="games"
                className="data-[state=active]:bg-muted px-4 py-1.5 text-xs font-medium rounded"
              >
                Games
              </TabsTrigger>
              <TabsTrigger
                value="plays"
                className="data-[state=active]:bg-muted px-4 py-1.5 text-xs font-medium rounded"
              >
                Plays
              </TabsTrigger>
              <TabsTrigger
                value="players"
                className="data-[state=active]:bg-muted px-4 py-1.5 text-xs font-medium rounded"
              >
                Players
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="data-[state=active]:bg-muted px-4 py-1.5 text-xs font-medium rounded"
              >
                Saved Filters
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <GlobalFilters />
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Module 2: Left Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full rounded-xl bg-background shadow-sm overflow-hidden">
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
          </div>
        </ResizablePanel>

        <ResizableHandle className="w-2 bg-transparent transition-colors hover:bg-primary/20" />

        {/* Module 3: Data Grid */}
        <ResizablePanel defaultSize={80}>
          <div className="h-full rounded-xl bg-background shadow-sm overflow-hidden">
            <ClipsDataGrid
              clips={filteredClips}
              onClipDoubleClick={handleClipDoubleClick}
              selectedClipId={selectedClip?.id || null}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Clip Viewer Sheet */}
      <ClipViewer clip={selectedClip} open={clipViewerOpen} onOpenChange={setClipViewerOpen} />
    </div>
  )
}
