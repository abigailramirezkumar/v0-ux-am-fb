"use client"

import { useState, useMemo } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterSidebar, type FilterState } from "@/components/explore/filter-sidebar"
import { ClipsDataGrid } from "@/components/explore/clips-data-grid"
import { ClipViewer } from "@/components/explore/clip-viewer"
import { GlobalFilters } from "@/components/explore/global-filters"
import { mockClips, type Clip } from "@/lib/mock-clips"

export default function ExplorePage() {
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)
  const [activeTab, setActiveTab] = useState("plays")
  
  // Initial State matches new schema
  const [filters, setFilters] = useState<FilterState>({
    downs: [],
    distance: [0, 20],
    yardLine: [0, 100],
    hash: [],
    playContext: [],
    playResult: [],
    passing: [],
    rushing: [],
    specialTeams: []
  })

  const filteredClips = useMemo(() => {
    return mockClips.filter((clip) => {
      
      // 1. Game Context (AND logic between Down, Distance, etc)
      if (filters.downs.length > 0 && !filters.downs.includes(clip.down)) return false
      if (clip.distance < filters.distance[0] || clip.distance > filters.distance[1]) return false
      if (clip.yardLine < filters.yardLine[0] || clip.yardLine > filters.yardLine[1]) return false
      if (filters.hash.length > 0 && !filters.hash.includes(clip.hash)) return false

      // 2. Play Context - RPO (OR logic within specific sub-groups)
      const rpoFilters = filters.playContext.filter(f => f.startsWith('rpo-')).map(f => f.split('-')[1])
      if (rpoFilters.length > 0) {
        if (!clip.playDevelopment.rpo || !rpoFilters.includes(clip.playDevelopment.rpo)) return false
      }
      
      // 3. Simple Checkboxes for Play Development
      if (filters.playContext.includes("playAction") && !clip.playDevelopment.playAction) return false
      if (filters.playContext.includes("screen") && !clip.playDevelopment.screen) return false
      if (filters.playContext.includes("designedRollout") && !clip.playDevelopment.designedRollout) return false
      if (filters.playContext.includes("brokenPlay") && !clip.playDevelopment.brokenPlay) return false

      // 4. Play Results - Touchdown (OR within types)
      const tdFilters = filters.playResult.filter(f => f.startsWith('td-')).map(f => f.split('-')[1])
      if (tdFilters.length > 0) {
        if (!clip.playResult.touchdown || !tdFilters.includes(clip.playResult.touchdown)) return false
      }

      // First Down (OR within types)
      const fdFilters = filters.playResult.filter(f => f.startsWith('fd-')).map(f => f.split('-')[1])
      if (fdFilters.length > 0) {
        if (!clip.playResult.firstDown || !fdFilters.includes(clip.playResult.firstDown)) return false
      }

      // Turnover (OR within types)
      const toFilters = filters.playResult.filter(f => f.startsWith('to-')).map(f => f.split('-')[1])
      if (toFilters.length > 0) {
        if (!clip.playResult.turnover || !toFilters.includes(clip.playResult.turnover)) return false
      }

      // 5. Passing filters
      if (filters.passing.length > 0) {
        // Must be a passing play
        if (!clip.passing) return false

        // Pass result filters (OR logic)
        const resultFilters = filters.passing.filter(f => f.startsWith('result-')).map(f => f.replace('result-', ''))
        if (resultFilters.length > 0) {
          if (!clip.passing.result || !resultFilters.includes(clip.passing.result)) return false
        }

        // QB action filters
        if (filters.passing.includes("scramble") && !clip.passing.scramble) return false
        if (filters.passing.includes("sack") && !clip.passing.sack) return false
        if (filters.passing.includes("throwaway") && !clip.passing.throwaway) return false

        // Receiver filters
        if (filters.passing.includes("drop") && !clip.passing.receiver?.drop) return false
        if (filters.passing.includes("contested") && !clip.passing.receiver?.contested) return false

        // Depth filters (OR logic)
        const depthFilters = filters.passing.filter(f => f.startsWith('depth-')).map(f => f.replace('depth-', ''))
        if (depthFilters.length > 0) {
          if (!clip.passing.receiver?.depth || !depthFilters.includes(clip.passing.receiver.depth)) return false
        }
      }

      // 6. Rushing filters
      if (filters.rushing.length > 0) {
        // Check if we have direction filters or other rushing-specific filters
        const dirFilters = filters.rushing.filter(f => f.startsWith('dir-')).map(f => f.replace('dir-', ''))
        const hasAttemptFilters = filters.rushing.some(f => f.startsWith('attempt-'))
        const hasDefenseFilters = filters.rushing.includes('tfl') || filters.rushing.includes('forcedFumble')

        // If any rushing filter is active, must be a rushing play
        if (dirFilters.length > 0 || hasAttemptFilters || hasDefenseFilters) {
          if (!clip.rushing) return false
        }

        // Direction filters (OR logic)
        if (dirFilters.length > 0) {
          if (!clip.rushing?.direction || !dirFilters.includes(clip.rushing.direction)) return false
        }

        // Attempt filters
        if (filters.rushing.includes("attempt-Gain") && clip.rushing?.attempt !== "Gain") return false
        if (filters.rushing.includes("attempt-Loss") && clip.rushing?.attempt !== "Loss / No gain") return false

        // Defense filters
        if (filters.rushing.includes("tfl") && !clip.rushing?.defense?.tfl) return false
        if (filters.rushing.includes("forcedFumble") && !clip.rushing?.defense?.forcedFumble) return false
      }

      // 7. Special Teams filters
      if (filters.specialTeams.length > 0) {
        if (!clip.specialTeams) return false
        
        const typeFilters = filters.specialTeams.filter(f => f.startsWith('type-')).map(f => f.replace('type-', ''))
        if (typeFilters.length > 0) {
          if (!typeFilters.includes(clip.specialTeams.type)) return false
        }
      }

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
