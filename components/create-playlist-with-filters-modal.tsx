"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FiltersModule } from "@/components/filters-module"
import { filterPlays } from "@/lib/filters/filter-engine"
import { getAllUniqueClips } from "@/lib/mock-datasets"
import type { FilterState, RangeFilterState, AnyFilterCategory, RangeCategory } from "@/types/filters"
import type { ClipData } from "@/types/library"
import { useRouter } from "next/navigation"
import { useLibraryContext } from "@/lib/library-context"
import { AlertCircle } from "lucide-react"

interface CreatePlaylistWithFiltersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pre-populate filters for a specific athlete */
  athleteId?: string
  athleteName?: string
  /** Pre-populate filters for a specific team */
  teamId?: string
  teamName?: string
  /** Pre-populate filters for a specific league */
  league?: "NFL" | "College" | "HighSchool"
}

export function CreatePlaylistWithFiltersModal({
  open,
  onOpenChange,
  athleteId,
  athleteName,
  teamId,
  teamName,
  league,
}: CreatePlaylistWithFiltersModalProps) {
  const router = useRouter()
  const { setPendingPreviewClips } = useLibraryContext()
  
  // Initialize filters with pre-populated values
  const getInitialFilters = (): FilterState => {
    const initial: FilterState = {}
    if (athleteId) {
      initial.athlete = new Set([athleteId])
    }
    if (teamId) {
      initial.team = new Set([teamId])
    }
    if (league) {
      initial.league = new Set([league])
    }
    return initial
  }
  
  const [filters, setFilters] = useState<FilterState>(getInitialFilters)
  const [rangeFilters, setRangeFilters] = useState<RangeFilterState>({})

  // Get all plays data
  const allPlays = useMemo(() => getAllUniqueClips().plays, [])
  
  // Get unique games for the filter module
  const uniqueGames = useMemo(() => {
    const games = new Set<string>()
    allPlays.forEach(play => {
      if (play.game) games.add(play.game)
    })
    return Array.from(games)
  }, [allPlays])

  // Filter plays based on current filters
  const filteredPlays = useMemo(() => {
    return filterPlays(allPlays, filters, rangeFilters)
  }, [allPlays, filters, rangeFilters])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    for (const [, values] of Object.entries(filters)) {
      if (values && values.size > 0) count += values.size
    }
    for (const [,] of Object.entries(rangeFilters)) {
      count += 1
    }
    return count
  }, [filters, rangeFilters])

  const handleToggle = (category: AnyFilterCategory, value: string) => {
    setFilters((prev) => {
      const current = prev[category] || new Set<string>()
      const next = new Set(current)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      if (next.size === 0) {
        const { [category]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [category]: next }
    })
  }

  const handleToggleAll = (category: AnyFilterCategory, allValues: string[]) => {
    setFilters((prev) => {
      const current = prev[category] || new Set<string>()
      const allSelected = allValues.every((v) => current.has(v))
      if (allSelected) {
        const { [category]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [category]: new Set(allValues) }
    })
  }

  const handleRangeChange = (category: RangeCategory, value: [number, number], defaultRange: [number, number]) => {
    setRangeFilters((prev) => {
      if (value[0] === defaultRange[0] && value[1] === defaultRange[1]) {
        const { [category]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [category]: value }
    })
  }

  const handleSetFilter = (category: AnyFilterCategory, value: string | null) => {
    setFilters((prev) => {
      if (value === null) {
        const { [category]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [category]: new Set([value]) }
    })
  }

  const handleClear = () => {
    // Reset to initial filters (keeping athlete/team/league pre-populated)
    setFilters(getInitialFilters())
    setRangeFilters({})
  }

  const handleCreatePlaylist = () => {
    if (filteredPlays.length === 0) return

    // Convert PlayData to ClipData format
    const clips: ClipData[] = filteredPlays.map((play, idx) => ({
      id: play.id,
      playNumber: play.playNumber || idx + 1,
      quarter: play.quarter,
      down: play.down,
      distance: play.distance,
      playType: play.playType as "Pass" | "Run",
      game: play.game,
      yards: play.yards,
      odk: play.odk,
      yardLine: play.yardLine,
      hash: play.hash,
      result: play.result,
      gainLoss: play.gainLoss,
      defFront: play.defFront,
      defStr: play.defStr,
      coverage: play.coverage,
      blitz: play.blitz,
      passResult: play.passResult,
      runDirection: play.runDirection,
      personnelO: play.personnelO,
      personnelD: play.personnelD,
      isTouchdown: play.isTouchdown,
      isFirstDown: play.isFirstDown,
      isPenalty: play.isPenalty,
      penaltyType: play.penaltyType,
    }))

    // Set pending preview clips and navigate to watch
    setPendingPreviewClips(clips)
    onOpenChange(false)
    router.push("/watch")
  }

  // Reset filters when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFilters(getInitialFilters())
      setRangeFilters({})
    }
    onOpenChange(newOpen)
  }

  // Build context string for the modal title
  const contextString = athleteName 
    ? `for ${athleteName}` 
    : teamName 
    ? `for ${teamName}` 
    : ""

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 flex flex-col h-[85vh] max-h-[800px]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Create Playlist {contextString}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Apply filters to find clips, then create a playlist
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Matching clips:</span>
            <span className="font-semibold text-foreground">{filteredPlays.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <FiltersModule
                filters={filters}
                rangeFilters={rangeFilters}
                onToggle={handleToggle}
                onToggleAll={handleToggleAll}
                onRangeChange={handleRangeChange}
                onSetFilter={handleSetFilter}
                onClear={handleClear}
                uniqueGames={uniqueGames}
                activeFilterCount={activeFilterCount}
                totalCount={allPlays.length}
                filteredCount={filteredPlays.length}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border mt-auto bg-background">
          <div className="flex items-center gap-2">
            {filteredPlays.length === 0 && activeFilterCount > 0 && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">No clips match your filters. Try adjusting your criteria.</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePlaylist} 
              disabled={filteredPlays.length === 0}
              className="bg-primary text-primary-foreground"
            >
              Create Playlist ({filteredPlays.length} clips)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
