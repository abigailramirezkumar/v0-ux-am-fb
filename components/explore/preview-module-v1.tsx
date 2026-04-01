"use client"

/**
 * PreviewModuleV1 - Preview Module with Back/Forward Navigation
 * 
 * Navigation uses browser-style back/forward chevrons instead of breadcrumbs.
 * Clicking through game -> team -> athlete builds up history that can be
 * navigated with back/forward buttons.
 */

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import type { PlayData } from "@/lib/mock-datasets"
import type { Athlete } from "@/types/athlete"
import type { Game } from "@/types/game"
import type { Team } from "@/lib/sports-data"
import type { MediaItemData } from "@/types/library"
import { findTeamById } from "@/lib/games-context"
import type { WatchBreadcrumbItem } from "@/lib/library-context"

// Import the individual preview components from the main preview module
import { PreviewModule } from "@/components/preview-module"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PreviewItemType = "game" | "team" | "athlete" | "clip" | "playlist"

export interface BreadcrumbItem {
  type: PreviewItemType
  label: string
  data: PlayData | Game | Team | (Athlete & { id?: string }) | MediaItemData
}

interface PreviewModuleV1Props {
  play?: PlayData
  game?: Game
  team?: Team
  athlete?: Athlete & { id?: string }
  playlist?: MediaItemData
  onClose: () => void
  /** Breadcrumb trail to display in watch app when opening items from this preview */
  watchBreadcrumb?: WatchBreadcrumbItem[]
}

// ---------------------------------------------------------------------------
// Clip label helpers
// ---------------------------------------------------------------------------

/** Deterministic hash from a string to pick consistent data per play. */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

/** Generate a game context label for a clip: "OFF vs DEF · Week · Score · Q# MM:SS" */
function getClipContextLabel(play: PlayData): string {
  const h = hashString(play.id)
  
  // Generate clock time
  const clockMin = (h % 12) + 1
  const clockSec = h % 60
  const clock = `${clockMin}:${clockSec.toString().padStart(2, "0")}`
  
  // Generate score (only for games, not practice/scout)
  const g = play.game.toLowerCase()
  const isGame = !g.includes("practice") && !g.includes("drill") && !g.includes("scout")
  
  let scorePart = ""
  if (isGame) {
    const gameParts = play.game.split(" vs ")
    const team1 = gameParts[0]?.split(" ")[0] || "HOME"
    const team2 = gameParts[1]?.split(" ")[0] || "AWAY"
    const score1 = 10 + (h % 28)
    const score2 = 3 + ((h + 5) % 31)
    scorePart = `${team1} ${score1} - ${score2} · `
  }
  
  // Extract week/context from game string
  const gameContext = play.game.split(" ")[0] || "Week"
  
  return `${play.offensiveTeam} vs ${play.defensiveTeam} · ${gameContext} · ${scorePart}Q${play.quarter} ${clock}`
}

// ---------------------------------------------------------------------------
// Hierarchy helpers
// ---------------------------------------------------------------------------

const HIERARCHY_ORDER: Record<PreviewItemType, number> = {
  game: 0,
  team: 1,
  athlete: 2,
  clip: 3,
  playlist: 0, // Playlist is at the same level as game - can navigate to clips
}

/**
 * Check if navigation from one type to another is valid according to hierarchy.
 * We allow drilling down (higher to lower in hierarchy) or lateral moves for clip<->athlete.
 */
export function isValidNavigation(from: PreviewItemType, to: PreviewItemType): boolean {
  // Clip and Athlete can navigate to each other (lateral)
  if ((from === "clip" && to === "athlete") || (from === "athlete" && to === "clip")) {
    return true
  }
  // Otherwise, can only drill down (from higher to lower)
  return HIERARCHY_ORDER[from] < HIERARCHY_ORDER[to]
}

/**
 * Get a display label for a breadcrumb item
 */
function getBreadcrumbLabel(item: BreadcrumbItem): string {
  switch (item.type) {
    case "clip":
      return getClipContextLabel(item.data as PlayData)
    case "game": {
      const game = item.data as Game
      const homeTeam = findTeamById(game.homeTeamId)
      const awayTeam = findTeamById(game.awayTeamId)
      const homeTeamName = homeTeam?.name || game.homeTeamId
      const awayTeamName = awayTeam?.name || game.awayTeamId
      
      // If game is final, show score: "Team A 24 - 17 Team B"
      if (game.status === "final" && game.score) {
        return `${homeTeamName} ${game.score.home} \u2013 ${game.score.away} ${awayTeamName}`
      }
      
      // If game is in progress or upcoming, show "Team A vs. Team B"
      return `${homeTeamName} vs. ${awayTeamName}`
    }
    case "team":
      return (item.data as Team).name || "Team"
    case "athlete":
      return (item.data as Athlete).name || "Athlete"
    case "playlist":
      return (item.data as MediaItemData).name || "Playlist"
    default:
      return item.label
  }
}

/**
 * Get icon name for item type
 */
function getItemIcon(type: PreviewItemType): string {
  switch (type) {
    case "game": return "calendar"
    case "team": return "team"
    case "athlete": return "user"
    case "clip": return "play"
    case "playlist": return "playlist"
    default: return "file"
  }
}

// ---------------------------------------------------------------------------
// Navigation Header Component with Back/Forward Chevrons
// ---------------------------------------------------------------------------

interface NavigationHeaderProps {
  currentItem: BreadcrumbItem | null
  canGoBack: boolean
  canGoForward: boolean
  onBack: () => void
  onForward: () => void
  onClose: () => void
}

function NavigationHeader({ currentItem, canGoBack, canGoForward, onBack, onForward, onClose }: NavigationHeaderProps) {
  const hasNavigation = canGoBack || canGoForward

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0 gap-2">
      {/* Left side: Navigation chevrons + Title */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Back/Forward chevrons - only show if there's any navigation history */}
        {hasNavigation && (
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onBack}
              disabled={!canGoBack}
              className={cn(
                "h-7 w-7 shrink-0",
                canGoBack 
                  ? "text-muted-foreground hover:text-foreground" 
                  : "text-muted-foreground/50 cursor-not-allowed"
              )}
            >
              <Icon name="chevronLeft" className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onForward}
              disabled={!canGoForward}
              className={cn(
                "h-7 w-7 shrink-0",
                canGoForward 
                  ? "text-muted-foreground hover:text-foreground" 
                  : "text-muted-foreground/50 cursor-not-allowed"
              )}
            >
              <Icon name="chevronRight" className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {/* Current item title */}
        <span className="text-sm font-semibold text-foreground truncate">
          {currentItem ? getBreadcrumbLabel(currentItem) : "Preview"}
        </span>
      </div>
      
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
      >
        <Icon name="close" className="w-4 h-4" />
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PreviewModuleV1 - Main Component with Back/Forward Navigation
// ---------------------------------------------------------------------------

export function PreviewModuleV1({ 
  play, 
  game, 
  team, 
  athlete, 
  playlist,
  onClose,
  watchBreadcrumb,
}: PreviewModuleV1Props) {
  // Back history stack - items we can go back to
  const [backStack, setBackStack] = useState<BreadcrumbItem[]>([])
  
  // Forward history stack - items we can go forward to (populated when going back)
  const [forwardStack, setForwardStack] = useState<BreadcrumbItem[]>([])

  // Current preview state - what's currently being shown
  const [currentPreview, setCurrentPreview] = useState<{
    type: PreviewItemType
    data: PlayData | Game | Team | (Athlete & { id?: string }) | MediaItemData
  } | null>(() => {
    if (playlist) return { type: "playlist", data: playlist }
    if (game) return { type: "game", data: game }
    if (team) return { type: "team", data: team }
    if (athlete) return { type: "athlete", data: athlete }
    if (play) return { type: "clip", data: play }
    return null
  })

  // Reset navigation when the root item changes from parent
  const rootItemKey = useMemo(() => {
    if (playlist) return `playlist-${playlist.id}`
    if (game) return `game-${game.id}`
    if (team) return `team-${team.id}`
    if (athlete) return `athlete-${athlete.id || athlete.name}`
    if (play) return `clip-${play.id}`
    return null
  }, [playlist, game, team, athlete, play])

  // When root item changes, reset stacks and set current preview
  useMemo(() => {
    if (playlist) {
      setCurrentPreview({ type: "playlist", data: playlist })
      setBackStack([])
      setForwardStack([])
    } else if (game) {
      setCurrentPreview({ type: "game", data: game })
      setBackStack([])
      setForwardStack([])
    } else if (team) {
      setCurrentPreview({ type: "team", data: team })
      setBackStack([])
      setForwardStack([])
    } else if (athlete) {
      setCurrentPreview({ type: "athlete", data: athlete })
      setBackStack([])
      setForwardStack([])
    } else if (play) {
      setCurrentPreview({ type: "clip", data: play })
      setBackStack([])
      setForwardStack([])
    }
  }, [rootItemKey])

  // Navigate to a new item (drill down) - clears forward stack
  const navigateTo = useCallback((type: PreviewItemType, data: PlayData | Game | Team | (Athlete & { id?: string }) | MediaItemData, label: string) => {
    const newItem = { type, label, data }
    
    // Push current item to back stack before navigating
    if (currentPreview) {
      const currentItem: BreadcrumbItem = {
        type: currentPreview.type,
        label: getBreadcrumbLabel({ type: currentPreview.type, label: "", data: currentPreview.data }),
        data: currentPreview.data
      }
      setBackStack(prev => [...prev, currentItem])
    }
    
    // Clear forward stack when navigating to new item
    setForwardStack([])
    setCurrentPreview({ type, data })
  }, [currentPreview])

  // Navigate back one step
  const handleBack = useCallback(() => {
    if (backStack.length === 0) {
      onClose()
      return
    }
    
    // Pop from back stack
    const newBackStack = [...backStack]
    const previousItem = newBackStack.pop()!
    setBackStack(newBackStack)
    
    // Push current item to forward stack
    if (currentPreview) {
      const currentItem: BreadcrumbItem = {
        type: currentPreview.type,
        label: getBreadcrumbLabel({ type: currentPreview.type, label: "", data: currentPreview.data }),
        data: currentPreview.data
      }
      setForwardStack(prev => [...prev, currentItem])
    }
    
    setCurrentPreview({ type: previousItem.type, data: previousItem.data })
  }, [backStack, currentPreview, onClose])

  // Navigate forward one step
  const handleForward = useCallback(() => {
    if (forwardStack.length === 0) return
    
    // Pop from forward stack
    const newForwardStack = [...forwardStack]
    const nextItem = newForwardStack.pop()!
    setForwardStack(newForwardStack)
    
    // Push current item to back stack
    if (currentPreview) {
      const currentItem: BreadcrumbItem = {
        type: currentPreview.type,
        label: getBreadcrumbLabel({ type: currentPreview.type, label: "", data: currentPreview.data }),
        data: currentPreview.data
      }
      setBackStack(prev => [...prev, currentItem])
    }
    
    setCurrentPreview({ type: nextItem.type, data: nextItem.data })
  }, [forwardStack, currentPreview])

  // Handle navigation callbacks from child previews
  const handleNavigateToTeam = useCallback((teamData: Team) => {
    navigateTo("team", teamData, teamData.name || "Team")
  }, [navigateTo])

  const handleNavigateToAthlete = useCallback((athleteData: Athlete & { id?: string }) => {
    navigateTo("athlete", athleteData, athleteData.name || "Athlete")
  }, [navigateTo])

  const handleNavigateToGame = useCallback((gameData: Game) => {
    navigateTo("game", gameData, gameData.name || "Game")
  }, [navigateTo])

  const handleNavigateToClip = useCallback((playData: PlayData) => {
    navigateTo("clip", playData, getClipContextLabel(playData))
  }, [navigateTo])

  const handleNavigateToPlaylist = useCallback((playlistData: MediaItemData) => {
    navigateTo("playlist", playlistData, playlistData.name || "Playlist")
  }, [navigateTo])

  if (!currentPreview) return null

  // Render the appropriate preview based on current state
  // We pass a dummy onClose that does nothing since we handle closing in our header
  const renderPreview = () => {
    switch (currentPreview.type) {
      case "game":
        return (
          <PreviewModule
            game={currentPreview.data as Game}
            onClose={() => {}} // Handled by our header
            onNavigateToTeam={handleNavigateToTeam}
            hideHeader
            watchBreadcrumb={currentWatchBreadcrumb}
          />
        )
      case "team":
        return (
          <PreviewModule
            team={currentPreview.data as Team}
            onClose={() => {}} // Handled by our header
            onNavigateToAthlete={handleNavigateToAthlete}
            onNavigateToGame={handleNavigateToGame}
            hideHeader
            watchBreadcrumb={currentWatchBreadcrumb}
          />
        )
      case "athlete":
        return (
          <PreviewModule
            athlete={currentPreview.data as Athlete & { id?: string }}
            onClose={() => {}} // Handled by our header
            onNavigateToTeam={handleNavigateToTeam}
            hideHeader
            watchBreadcrumb={currentWatchBreadcrumb}
          />
        )
      case "clip":
        return (
          <PreviewModule
            play={currentPreview.data as PlayData}
            onClose={() => {}} // Handled by our header
            onNavigateToAthlete={handleNavigateToAthlete}
            hideHeader
            watchBreadcrumb={currentWatchBreadcrumb}
          />
        )
      case "playlist":
        return (
          <PreviewModule
            playlist={currentPreview.data as MediaItemData}
            onClose={() => {}} // Handled by our header
            onNavigateToClip={handleNavigateToClip}
            hideHeader
            watchBreadcrumb={currentWatchBreadcrumb}
          />
        )
      default:
        return null
    }
  }

  // Get current item for display
  const currentItem = useMemo((): BreadcrumbItem | null => {
    if (!currentPreview) return null
    return {
      type: currentPreview.type,
      label: getBreadcrumbLabel({ type: currentPreview.type, label: "", data: currentPreview.data }),
      data: currentPreview.data
    }
  }, [currentPreview])

  // Build the full breadcrumb trail for watch app navigation
  // This combines the incoming watchBreadcrumb with the navigation stack
  const currentWatchBreadcrumb: WatchBreadcrumbItem[] = useMemo(() => {
    const base = watchBreadcrumb || []
    
    // Add items from the back stack (navigation history)
    const stackItems: WatchBreadcrumbItem[] = backStack.map(item => ({
      label: getBreadcrumbLabel(item),
    }))
    
    return [...base, ...stackItems]
  }, [watchBreadcrumb, backStack])

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Navigation Header with Back/Forward Chevrons */}
      <NavigationHeader
        currentItem={currentItem}
        canGoBack={backStack.length > 0}
        canGoForward={forwardStack.length > 0}
        onBack={handleBack}
        onForward={handleForward}
        onClose={onClose}
      />
      
      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        {renderPreview()}
      </div>
    </div>
  )
}
