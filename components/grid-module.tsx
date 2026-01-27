"use client"

import { useWatchContext } from "@/components/watch/watch-context"
import { useLibraryContext } from "@/lib/library-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import type { LibraryItemData } from "@/components/library-item"

export function GridModule() {
  const { tabs, activeTabId, playingTabId, activeDataset, currentPlay, activateTab, closeTab, seekToPlay } =
    useWatchContext()
  const { openCreatePlaylistModal } = useLibraryContext()

  const handleSaveAsPlaylist = () => {
    if (!activeDataset) return

    // Convert PlayData back to LibraryItemData structure
    const itemsToSave: LibraryItemData[] = activeDataset.plays.map((play) => ({
      id: play.id,
      name: play.description || "Untitled Clip",
      type: "video",
      thumbnailUrl: play.thumbnailUrl,
      duration: "0:10",
      createdDate: new Date().toLocaleDateString(),
    }))

    openCreatePlaylistModal(itemsToSave)
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
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-muted",
                  isActive && "opacity-100",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
              >
                <Icon name="x" className="w-3 h-3" />
              </Button>

              {/* Active Stripe Bottom */}
              {isActive && <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-t-full" />}
            </div>
          )
        })}
      </div>

      <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-background">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          {activeDataset.name}
          {activeTabId === playingTabId && activeDataset.plays.length > 0 && (
            <span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-bold border border-green-500/20">
              LIVE
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {activeDataset.isUnsaved && activeDataset.plays.length > 0 && (
            <Button size="sm" variant="outline" onClick={handleSaveAsPlaylist}>
              Save as Playlist
            </Button>
          )}
          <span className="text-xs text-muted-foreground">{activeDataset.plays.length} Events</span>
        </div>
      </div>

      {/* --- GRID TABLE or EMPTY STATE --- */}
      <div className="flex-1 overflow-auto bg-background">
        {activeDataset.plays.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Icon name="playlist" className="w-12 h-12 opacity-20" />
            <p>This playlist is empty</p>
            <p className="text-xs opacity-60">Add clips from the Library to build your playlist.</p>
          </div>
        ) : (
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow className="hover:bg-transparent border-b border-border/50">
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
