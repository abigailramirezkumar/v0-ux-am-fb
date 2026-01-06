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

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Top Module: Header & Global Filters */}
      <div className="rounded-xl bg-background shadow-sm overflow-hidden shrink-0">
        <div className="px-4 py-2 border-b border-border/50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent p-0 gap-1 h-auto">
              <TabsTrigger
                value="games"
                className="data-[state=active]:bg-muted px-3 py-1.5 text-xs font-medium rounded-md"
              >
                Games
              </TabsTrigger>
              <TabsTrigger
                value="plays"
                className="data-[state=active]:bg-muted px-3 py-1.5 text-xs font-medium rounded-md"
              >
                Plays
              </TabsTrigger>
              <TabsTrigger
                value="players"
                className="data-[state=active]:bg-muted px-3 py-1.5 text-xs font-medium rounded-md"
              >
                Players
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <GlobalFilters />
      </div>

      {/* Main Layout: Split Panes with Module Design */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        {/* Left Module: Filters */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-transparent">
          <div className="h-full rounded-xl bg-background shadow-sm overflow-hidden flex flex-col">
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
          </div>
        </ResizablePanel>

        {/* Gap 1 */}
        <ResizableHandle className="w-2 bg-transparent transition-colors hover:bg-primary/10" />

        {/* Middle Module: Data Grid */}
        <ResizablePanel defaultSize={selectedClip ? 50 : 80} minSize={30} className="bg-transparent">
          <div className="h-full rounded-xl bg-background shadow-sm overflow-hidden flex flex-col">
            <ClipsDataGrid
              clips={filteredClips}
              onClipDoubleClick={(clip) => setSelectedClip(clip)}
              selectedClipId={selectedClip?.id || null}
            />
          </div>
        </ResizablePanel>

        {/* Right Module: Clip Viewer (Conditional) */}
        {selectedClip && (
          <>
            {/* Gap 2 */}
            <ResizableHandle className="w-2 bg-transparent transition-colors hover:bg-primary/10" />

            <ResizablePanel defaultSize={30} minSize={20} maxSize={50} className="bg-transparent">
              <div className="h-full rounded-xl bg-background shadow-sm overflow-hidden">
                <ClipViewer clip={selectedClip} onClose={() => setSelectedClip(null)} />
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
