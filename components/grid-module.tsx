"use client"

import { useWatchContext } from "@/components/watch/watch-context"
import { useLibraryContext } from "@/lib/library-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import type { LibraryItemData } from "@/components/library-item"
import type { Dataset } from "@/lib/mock-datasets"
import type { ClipData } from "@/types/library"

interface GridModuleProps {
  showTabs?: boolean
  selectionActions?: React.ReactNode | null
  dataset?: Dataset | null
  /** Optional clip data passed directly, decoupled from WatchContext. */
  clips?: ClipData[] | null
  onClearFilters?: () => void
}

export function GridModule({ showTabs = true, selectionActions, dataset: datasetProp, clips: clipsProp, onClearFilters }: GridModuleProps) {
  const { 
    tabs, 
    activeTabId, 
    playingTabId, 
    activeDataset: contextDataset, 
    currentPlay, 
    activateTab, 
    closeTab, 
    seekToPlay,
    selectedPlayIds,
    togglePlaySelection,
    selectAllPlays,
    clearPlaySelection
  } = useWatchContext()
  const { openCreatePlaylistModal } = useLibraryContext()

  // Bridge: if clipsProp is provided, wrap it into a Dataset shape so the
  // rest of the component works unchanged. This decouples GridModule from
  // WatchContext when used in Library/Explore views.
  const clipsAsDataset: Dataset | null = clipsProp
    ? {
        id: "clips-prop",
        name: "Clips",
        plays: clipsProp.map((clip, idx) => ({
          id: clip.id,
          playNumber: clip.playNumber ?? idx + 1,
          odk: clip.odk ?? "O",
          quarter: clip.quarter ?? 1,
          down: clip.down ?? 1,
          distance: clip.distance ?? 10,
          yardLine: clip.yardLine ?? "",
          hash: clip.hash ?? "M",
          yards: clip.yards ?? 0,
          result: clip.result ?? "",
          gainLoss: clip.gainLoss ?? "Gn",
          defFront: clip.defFront ?? "",
          defStr: clip.defStr ?? "",
          coverage: clip.coverage ?? "",
          blitz: clip.blitz ?? "",
          game: clip.game ?? "",
          playType: clip.playType ?? "Pass",
          passResult: clip.passResult,
          runDirection: clip.runDirection,
          personnelO: clip.personnelO ?? "11",
          personnelD: clip.personnelD ?? "Base",
          isTouchdown: clip.isTouchdown ?? false,
          isFirstDown: clip.isFirstDown ?? false,
          isPenalty: clip.isPenalty ?? false,
          penaltyType: clip.penaltyType,
        })),
      }
    : null

  // Use prop if provided, otherwise context
  const activeDataset = clipsAsDataset || datasetProp || contextDataset

  const handleSaveAsPlaylist = () => {
    if (!activeDataset) return

    // Convert PlayData to ClipData for the create modal
    const clips: ClipData[] = activeDataset.plays.map((play) => ({
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

    openCreatePlaylistModal(undefined, clips)
  }

  if (!activeDataset) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-background rounded-xl border border-border">
        No Data Selected
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col bg-background rounded-xl border border-border shadow-sm overflow-hidden pt-0 border-none">
      {showTabs && (
        <div className="flex items-center gap-1 p-1 bg-muted/30 border-b border-border overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            const isPlaying = tab.id === playingTabId

            return (
              <div
                key={tab.id}
                onClick={() => activateTab(tab.id)}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-all min-w-[140px] max-w-[200px] border select-none relative",
                  isActive
                    ? "bg-background text-foreground border-border shadow-sm"
                    : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50",
                )}
              >
                {/* Playing Indicator - Green dot */}
                <div
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0 transition-colors",
                    isPlaying ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-transparent",
                  )}
                />

                <span className="truncate flex-1">{tab.name}</span>

                {/* Close Button (Visible on Hover or Active) */}
                <button
                  className={cn(
                    "w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center hover:bg-muted/80",
                    isActive && "opacity-100",
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground" />
                  </svg>
                </button>

                {/* Active Stripe Bottom */}
                {isActive && <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-t-full" />}
              </div>
            )
          })}
        </div>
      )}

      <div className="px-4 py-2 border-b border-border flex items-center bg-background">
        {selectedPlayIds.size > 0 ? (
          <div className="flex items-center gap-3">
            <button
              onClick={clearPlaySelection}
              className="w-6 h-6 rounded flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors"
              aria-label="Clear selection"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground" />
              </svg>
            </button>
            <span className="text-sm font-medium text-[#0273e3]">
              {selectedPlayIds.size} Selected
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground/50">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {selectionActions}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-muted-foreground">{activeDataset.plays.length} Events</span>
            {activeDataset.isUnsaved && activeDataset.plays.length > 0 && (
              <Button size="sm" onClick={handleSaveAsPlaylist} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save Playlist
              </Button>
            )}
          </div>
        )}
      </div>

      {/* --- GRID TABLE or EMPTY STATE --- */}
      <div className="flex-1 overflow-auto bg-background">
        {activeDataset.plays.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
            {onClearFilters ? (
              <>
                <p className="text-sm">No clips match these filters</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                >
                  Clear all filters
                </Button>
              </>
            ) : (
              <>
                <Icon name="playlist" className="w-12 h-12 opacity-20" />
                <p>This playlist is empty</p>
                <p className="text-xs opacity-60">Add clips from the Library to build your playlist.</p>
              </>
            )}
          </div>
        ) : (
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="w-[40px] text-center">
                <Checkbox
                  checked={activeDataset.plays.length > 0 && selectedPlayIds.size === activeDataset.plays.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      selectAllPlays()
                    } else {
                      clearPlaySelection()
                    }
                  }}
                />
              </TableHead>
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                #
              </TableHead>
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                ODK
              </TableHead>
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Qtr
              </TableHead>
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Dn
              </TableHead>
              <TableHead className="w-[60px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Dist
              </TableHead>
              <TableHead className="w-[70px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Yard Ln
              </TableHead>
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Hash
              </TableHead>
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Yds
              </TableHead>
              <TableHead className="w-[80px] text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Result
              </TableHead>
              <TableHead className="w-[60px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Gn/Ls
              </TableHead>
              <TableHead className="w-[80px] text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Def Front
              </TableHead>
              <TableHead className="w-[70px] text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Def Str
              </TableHead>
              <TableHead className="w-[80px] text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Coverage
              </TableHead>
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Blitz
              </TableHead>
              <TableHead className="min-w-[120px] text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Game
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeDataset.plays.map((play) => {
              const isPlaying = currentPlay?.id === play.id && activeTabId === playingTabId

              return (
                <TableRow
                  key={play.id}
                  className={cn(
                    "cursor-pointer transition-colors border-b border-border/50",
                    isPlaying ? "bg-[#0273e3] hover:bg-[#0273e3] text-white" : "hover:bg-muted/50",
                  )}
                  onClick={() => seekToPlay(play)}
                >
                  <TableCell className="text-center py-1.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedPlayIds.has(play.id)}
                      onCheckedChange={() => togglePlaySelection(play.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center font-medium py-1.5">{play.playNumber}</TableCell>
                  <TableCell className="text-center py-1.5">{play.odk}</TableCell>
                  <TableCell className="text-center py-1.5">{play.quarter}</TableCell>
                  <TableCell className="text-center py-1.5">{play.down}</TableCell>
                  <TableCell className="text-center py-1.5">{play.distance}</TableCell>
                  <TableCell className="text-center py-1.5">{play.yardLine}</TableCell>
                  <TableCell className="text-center py-1.5">{play.hash}</TableCell>
                  <TableCell className="text-center py-1.5">{play.yards}</TableCell>
                  <TableCell className="py-1.5">{play.result}</TableCell>
                  <TableCell
                    className={cn(
                      "text-center py-1.5",
                      play.gainLoss === "Gn" ? "text-green-600" : "text-red-500",
                      isPlaying && "text-white",
                    )}
                  >
                    {play.gainLoss}
                  </TableCell>
                  <TableCell className="py-1.5">{play.defFront}</TableCell>
                  <TableCell className="py-1.5">{play.defStr}</TableCell>
                  <TableCell className="py-1.5">{play.coverage}</TableCell>
                  <TableCell className="text-center py-1.5">{play.blitz}</TableCell>
                  <TableCell className="py-1.5 text-xs opacity-70">{play.game}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        )}
      </div>
    </div>
  )
}
