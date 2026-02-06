"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Icon } from "@/components/icon"
import { useLibraryContext, type RecentPlaylist } from "@/lib/library-context"
import { useWatchContext } from "@/components/watch/watch-context"
import { cn } from "@/lib/utils"
import type { FolderData } from "@/components/folder"
import type { LibraryItemData } from "@/components/library-item"
import type { ClipData } from "@/types/library"

export function AddToPlaylistMenu() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { folders, rootItems, recentPlaylists, addToPlaylist, mediaItems, addClipsToPlaylist, openCreatePlaylistModal } = useLibraryContext()
  const { selectedPlayIds, clearPlaySelection, activeDataset } = useWatchContext()

  // Gather all playlists from folders and root items
  const allPlaylists = useMemo(() => {
    const playlists: Array<{ id: string; name: string; folderId: string | null }> = []

    // Add root level playlists
    rootItems.forEach(item => {
      if (item.type === "playlist") {
        playlists.push({ id: item.id, name: item.name, folderId: null })
      }
    })

    // Recursively find playlists in folders
    const findPlaylists = (nodes: FolderData[], parentId: string | null) => {
      nodes.forEach(node => {
        if (node.items) {
          node.items.forEach(item => {
            if (item.type === "playlist") {
              playlists.push({ id: item.id, name: item.name, folderId: node.id })
            }
          })
        }
        if (node.children) {
          findPlaylists(node.children, node.id)
        }
      })
    }
    findPlaylists(folders, null)

    // Also include playlists from the flat mediaItems list (segregated model)
    mediaItems.forEach((mi) => {
      if (mi.type === "playlist" && !playlists.some((p) => p.id === mi.id)) {
        playlists.push({ id: mi.id, name: mi.name, folderId: mi.parentId })
      }
    })

    return playlists
  }, [folders, rootItems, mediaItems])

  // Filter playlists by search
  const filteredPlaylists = useMemo(() => {
    if (!searchQuery.trim()) return allPlaylists
    const query = searchQuery.toLowerCase()
    return allPlaylists.filter(p => p.name.toLowerCase().includes(query))
  }, [allPlaylists, searchQuery])

  const handleAddToPlaylist = (playlistId: string) => {
    const clipIds = Array.from(selectedPlayIds)

    // Resolve the selected play IDs into full ClipData from the active dataset
    if (activeDataset) {
      const selectedPlays = activeDataset.plays.filter((p) => clipIds.includes(p.id))
      if (selectedPlays.length > 0) {
        const clipsToAdd = selectedPlays.map((play) => ({
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
        addClipsToPlaylist(playlistId, clipsToAdd)
      }
    }

    // Also track in recent playlists via legacy function
    addToPlaylist(playlistId, clipIds)
    clearPlaySelection()
    setOpen(false)
    setSearchQuery("")
  }

  if (selectedPlayIds.size === 0) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Icon name="plus" className="w-4 h-4" />
          Add to Playlist
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="p-3 border-b border-border">
          <Input
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>

        <div className="max-h-64 overflow-y-auto">
          {/* Recent Playlists */}
          {recentPlaylists.length > 0 && !searchQuery && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                Recent
              </div>
              {recentPlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted text-left"
                >
                  <Icon name="playlist" className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{playlist.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* All Playlists */}
          <div className="p-2">
            {!searchQuery && recentPlaylists.length > 0 && (
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                All Playlists
              </div>
            )}
            {filteredPlaylists.length > 0 ? (
              filteredPlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted text-left"
                >
                  <Icon name="playlist" className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{playlist.name}</span>
                </button>
              ))
            ) : (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                {searchQuery ? "No playlists found" : "No playlists available"}
              </div>
            )}
          </div>
        </div>

        {/* Create New Playlist */}
        <div className="p-2 border-t border-border">
          <button
            onClick={() => {
              setOpen(false)
              setSearchQuery("")
              openCreatePlaylistModal()
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted text-left text-primary"
          >
            <Icon name="plus" className="w-4 h-4" />
            <span>Create New Playlist</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
