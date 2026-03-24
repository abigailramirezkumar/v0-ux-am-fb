"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { useProfileContext } from "@/lib/profile-context"
import { useLibraryContext } from "@/lib/library-context"
import { VIDEO_POOL } from "@/lib/mock-datasets"
import { findTeamById, mockClips } from "@/lib/games-context"
import type { ClipData } from "@/types/library"
import type { Game } from "@/types/game"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

function formatTime(seconds: number) {
  if (!seconds) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// ---------------------------------------------------------------------------
// Mini Video Player (simplified version)
// ---------------------------------------------------------------------------

function MiniVideoPlayer({
  videoUrl,
  sourceLabel,
}: {
  videoUrl: string
  sourceLabel: string
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(180) // Mock 3 min duration

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative group">
      {/* Video placeholder */}
      <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
        >
          <Icon name={isPlaying ? "pause" : "play"} className="w-5 h-5 fill-current" />
        </button>
      </div>

      {/* Source badge */}
      <div className="absolute top-2 left-2 z-10">
        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-foreground/80 text-background">
          {sourceLabel}
        </span>
      </div>

      {/* Progress bar on hover */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration}
          step={1}
          onValueChange={(v) => setCurrentTime(v[0])}
          className="cursor-pointer"
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-white/90 font-medium tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="h-full w-full flex flex-col bg-background rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center h-10 px-3 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
          Video
        </span>
      </div>

      {/* Body placeholder */}
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        <p>Select a game or playlist to view video</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Game Video View
// ---------------------------------------------------------------------------

function GameVideoView({ game }: { game: Game }) {
  const router = useRouter()
  const { setPendingPreviewClips } = useLibraryContext()
  const [selectedClipIndex, setSelectedClipIndex] = useState(0)
  
  // Get clips for the game
  const gameClips = useMemo(() => {
    return mockClips.filter(clip => clip.gameId === game.id)
  }, [game.id])

  const selectedClip = gameClips[selectedClipIndex]
  
  const videoUrl = useMemo(() => {
    if (selectedClip) {
      const h = hashString(selectedClip.id)
      return VIDEO_POOL[h % VIDEO_POOL.length]
    }
    const h = hashString(game.id)
    return VIDEO_POOL[h % VIDEO_POOL.length]
  }, [game.id, selectedClip])

  const homeTeam = findTeamById(game.homeTeamId)
  const awayTeam = findTeamById(game.awayTeamId)
  const gameLabel = homeTeam && awayTeam 
    ? `${awayTeam.abbreviation} @ ${homeTeam.abbreviation}`
    : "Game"

  const handleOpenInWatch = useCallback(() => {
    if (gameClips.length > 0) {
      const clipsData: ClipData[] = gameClips.map((clip, idx) => ({
        id: clip.id,
        playNumber: idx + 1,
        game: gameLabel,
        gameId: game.id,
        quarter: clip.quarter || 1,
        down: clip.down || 1,
        distance: clip.distance || 10,
        playType: clip.playType || "Pass",
      }))
      setPendingPreviewClips(clipsData)
    }
    router.push("/watch")
  }, [gameClips, gameLabel, game.id, setPendingPreviewClips, router])

  return (
    <div className="h-full w-full flex flex-col bg-background rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center h-10 px-3 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
          Video
        </span>
      </div>
      
      {/* Game label sub-header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 shrink-0">
        <Icon name="game" className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium truncate">{gameLabel}</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Video Player */}
        <div className="px-4 pt-4 pb-2">
          <MiniVideoPlayer videoUrl={videoUrl} sourceLabel="GAME" />
        </div>

        {/* Clips List */}
        <div className="px-4 pt-2 pb-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Clips ({gameClips.length})
          </h4>
          {gameClips.length > 0 ? (
            <div className="space-y-2">
              {gameClips.map((clip, index) => (
                <button
                  key={clip.id}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left",
                    selectedClipIndex === index 
                      ? "bg-primary/10 border border-primary/30" 
                      : "bg-muted/30 hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedClipIndex(index)}
                >
                  <div className="w-12 h-8 bg-muted rounded flex items-center justify-center shrink-0">
                    <Icon name="play" className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      Q{clip.quarter || 1} - {clip.playType || "Play"} {clip.down && `(${clip.down}&${clip.distance})`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {clip.yards !== undefined ? `${clip.yards} yards` : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              No clips available for this game
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3 shrink-0">
        <Button 
          className="w-full font-semibold" 
          size="sm"
          onClick={handleOpenInWatch}
        >
          Open in Watch
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Playlist Video View
// ---------------------------------------------------------------------------

function PlaylistVideoView({ playlist }: { playlist: any }) {
  const router = useRouter()
  const { setPendingPreviewClips } = useLibraryContext()
  const [selectedClipIndex, setSelectedClipIndex] = useState(0)
  
  const clips = playlist.clips || []
  const selectedClip = clips[selectedClipIndex]

  const videoUrl = useMemo(() => {
    if (selectedClip?.videoUrl) {
      return selectedClip.videoUrl
    }
    const id = selectedClip?.id || playlist.id
    const h = hashString(id)
    return VIDEO_POOL[h % VIDEO_POOL.length]
  }, [playlist.id, selectedClip])

  const handleOpenPlaylist = useCallback(() => {
    if (clips.length > 0) {
      setPendingPreviewClips(clips)
    }
    router.push("/watch")
  }, [clips, setPendingPreviewClips, router])

  const getClipLabel = (clip: ClipData, index: number) => {
    if (clip.game) {
      const parts = []
      if (clip.quarter) parts.push(`Q${clip.quarter}`)
      if (clip.down && clip.distance) parts.push(`${clip.down}&${clip.distance}`)
      if (clip.playType) parts.push(clip.playType)
      return parts.length > 0 ? parts.join(" - ") : `Clip ${index + 1}`
    }
    return `Clip ${index + 1}`
  }

  return (
    <div className="h-full w-full flex flex-col bg-background rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center h-10 px-3 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
          Video
        </span>
      </div>
      
      {/* Playlist label sub-header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 shrink-0">
        <Icon name="playlist" className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium truncate">{playlist.name}</span>
        <span className="text-muted-foreground text-xs shrink-0">
          {clips.length} clips
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Video Player */}
        <div className="px-4 pt-4 pb-2">
          <MiniVideoPlayer videoUrl={videoUrl} sourceLabel="PLAYLIST" />
        </div>

        {/* Clips List */}
        <div className="px-4 pt-2 pb-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Clips ({clips.length})
          </h4>
          {clips.length > 0 ? (
            <div className="space-y-2">
              {clips.map((clip: ClipData, index: number) => (
                <button
                  key={clip.id}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left",
                    selectedClipIndex === index 
                      ? "bg-primary/10 border border-primary/30" 
                      : "bg-muted/30 hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedClipIndex(index)}
                >
                  <div className="w-12 h-8 bg-muted rounded flex items-center justify-center shrink-0">
                    <Icon name="play" className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {getClipLabel(clip, index)}
                    </p>
                    {clip.game && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {clip.game}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              This playlist is empty
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3 shrink-0">
        <Button 
          className="w-full font-semibold" 
          size="sm"
          onClick={handleOpenPlaylist}
        >
          Open Playlist
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main VideoModule Component
// ---------------------------------------------------------------------------

export function VideoModule() {
  const { videoContent, clearVideoContent } = useProfileContext()

  if (!videoContent) {
    return <EmptyState />
  }

  if (videoContent.type === "game" && videoContent.game) {
    return <GameVideoView game={videoContent.game} />
  }

  if (videoContent.type === "playlist" && videoContent.playlist) {
    return <PlaylistVideoView playlist={videoContent.playlist} />
  }

  return <EmptyState />
}
