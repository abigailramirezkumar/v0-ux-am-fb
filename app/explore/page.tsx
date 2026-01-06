"use client"

import { useState, useMemo } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import { FilterSidebar } from "@/components/explore/filter-sidebar"
import { ClipsDataGrid } from "@/components/explore/clips-data-grid"
import { ClipViewer } from "@/components/explore/clip-viewer"
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
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="border-b border-border">
        {/* Secondary Navigation */}
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

        {/* Global Context Bar */}
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              <Icon name="flag" className="w-3 h-3 mr-1" />
              NFL
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Icon name="calendar" className="w-3 h-3 mr-1" />
              2024 Season
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Icon name="teams" className="w-3 h-3 mr-1" />
              All Teams
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{filteredClips.length} clips</span>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setFilters({ downs: [], quarters: [], playTypes: [], personnel: [] })}
              >
                Clear filters ({activeFilterCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Resizable Split Pane */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Pane - Filters */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="border-r border-border">
          <FilterSidebar filters={filters} onFilterChange={setFilters} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Pane - Data Grid */}
        <ResizablePanel defaultSize={80}>
          <ClipsDataGrid
            clips={filteredClips}
            onClipDoubleClick={handleClipDoubleClick}
            selectedClipId={selectedClip?.id || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Clip Viewer Sheet */}
      <ClipViewer clip={selectedClip} open={clipViewerOpen} onOpenChange={setClipViewerOpen} />
    </div>
  )
}
