"use client"

/**
 * PreviewModuleV1 - Preview Module with Breadcrumb Navigation
 * 
 * Hierarchy (top to bottom):
 * 1. Game (highest)
 * 2. Team (within Game)
 * 3. Athlete (within Team)
 * 4. Clip (lowest, but can link to Athletes)
 * 
 * Valid navigation trails:
 * - Clip -> Athlete (Clip / Athlete)
 * - Game -> Team (Game / Team)
 * - Game -> Team -> Athlete (Game / Team / Athlete)
 * - Athlete -> Clip (Athlete / Clip)
 * 
 * Invalid trails (hierarchy violations):
 * - Team / Game, Athlete / Team, Athlete / Game
 */

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import type { PlayData } from "@/lib/mock-datasets"
import type { Athlete } from "@/types/athlete"
import type { Game } from "@/types/game"
import type { Team } from "@/lib/sports-data"

// Import the individual preview components from the main preview module
// We'll re-export the existing previews but wrap them with breadcrumb logic
import { PreviewModule } from "@/components/preview-module"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PreviewItemType = "game" | "team" | "athlete" | "clip"

export interface BreadcrumbItem {
  type: PreviewItemType
  label: string
  data: PlayData | Game | Team | (Athlete & { id?: string })
}

interface PreviewModuleV1Props {
  play?: PlayData
  game?: Game
  team?: Team
  athlete?: Athlete & { id?: string }
  onClose: () => void
  // Callback to navigate to different preview types
  onNavigateToTeam?: (team: Team, fromItem?: BreadcrumbItem) => void
  onNavigateToAthlete?: (athlete: Athlete & { id?: string }, fromItem?: BreadcrumbItem) => void
  onNavigateToGame?: (game: Game, fromItem?: BreadcrumbItem) => void
  onNavigateToClip?: (play: PlayData, fromItem?: BreadcrumbItem) => void
}

// ---------------------------------------------------------------------------
// Hierarchy helpers
// ---------------------------------------------------------------------------

const HIERARCHY_ORDER: Record<PreviewItemType, number> = {
  game: 0,
  team: 1,
  athlete: 2,
  clip: 3,
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
      return `Clip ${(item.data as PlayData).playNumber}`
    case "game":
      return (item.data as Game).name || "Game"
    case "team":
      return (item.data as Team).name || "Team"
    case "athlete":
      return (item.data as Athlete).name || "Athlete"
    default:
      return item.label
  }
}

// ---------------------------------------------------------------------------
// Breadcrumb Navigation Bar
// ---------------------------------------------------------------------------

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  onNavigate: (index: number) => void
  onBack: () => void
}

function BreadcrumbNav({ items, onNavigate, onBack }: BreadcrumbNavProps) {
  if (items.length <= 1) return null

  return (
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-muted/50 border-b border-border/50 shrink-0">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onBack}
        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
      >
        <Icon name="chevronLeft" className="w-4 h-4" />
      </Button>
      <div className="flex items-center gap-1 min-w-0 overflow-x-auto flex-1">
        {items.map((item, index) => (
          <div key={`${item.type}-${index}`} className="flex items-center gap-1 shrink-0">
            {index > 0 && (
              <Icon name="chevronRight" className="w-3 h-3 text-muted-foreground/60" />
            )}
            <button
              onClick={() => onNavigate(index)}
              className={cn(
                "text-sm px-2 py-1 rounded-md transition-colors truncate max-w-[140px]",
                index === items.length - 1
                  ? "font-semibold text-foreground bg-background/80"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              disabled={index === items.length - 1}
            >
              {getBreadcrumbLabel(item)}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PreviewModuleV1 - Main Component with Breadcrumb State
// ---------------------------------------------------------------------------

export function PreviewModuleV1({ 
  play, 
  game, 
  team, 
  athlete, 
  onClose,
}: PreviewModuleV1Props) {
  // Breadcrumb stack - tracks navigation history
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>(() => {
    // Initialize with the current item
    if (game) return [{ type: "game", label: game.name || "Game", data: game }]
    if (team) return [{ type: "team", label: team.name || "Team", data: team }]
    if (athlete) return [{ type: "athlete", label: athlete.name || "Athlete", data: athlete }]
    if (play) return [{ type: "clip", label: `Clip ${play.playNumber}`, data: play }]
    return []
  })

  // Current preview state - what's currently being shown
  const [currentPreview, setCurrentPreview] = useState<{
    type: PreviewItemType
    data: PlayData | Game | Team | (Athlete & { id?: string })
  } | null>(() => {
    if (game) return { type: "game", data: game }
    if (team) return { type: "team", data: team }
    if (athlete) return { type: "athlete", data: athlete }
    if (play) return { type: "clip", data: play }
    return null
  })

  // Reset breadcrumbs when the root item changes from parent
  const rootItemKey = useMemo(() => {
    if (game) return `game-${game.id}`
    if (team) return `team-${team.id}`
    if (athlete) return `athlete-${athlete.id || athlete.name}`
    if (play) return `clip-${play.id}`
    return null
  }, [game, team, athlete, play])

  // When root item changes, reset the breadcrumb stack
  useMemo(() => {
    if (game) {
      setBreadcrumbs([{ type: "game", label: game.name || "Game", data: game }])
      setCurrentPreview({ type: "game", data: game })
    } else if (team) {
      setBreadcrumbs([{ type: "team", label: team.name || "Team", data: team }])
      setCurrentPreview({ type: "team", data: team })
    } else if (athlete) {
      setBreadcrumbs([{ type: "athlete", label: athlete.name || "Athlete", data: athlete }])
      setCurrentPreview({ type: "athlete", data: athlete })
    } else if (play) {
      setBreadcrumbs([{ type: "clip", label: `Clip ${play.playNumber}`, data: play }])
      setCurrentPreview({ type: "clip", data: play })
    }
  }, [rootItemKey])

  // Navigate to a new item (drill down)
  const navigateTo = useCallback((type: PreviewItemType, data: PlayData | Game | Team | (Athlete & { id?: string }), label: string) => {
    const currentType = currentPreview?.type
    if (currentType && !isValidNavigation(currentType, type)) {
      // Invalid navigation - reset breadcrumbs to just the new item
      setBreadcrumbs([{ type, label, data }])
    } else {
      // Valid navigation - add to breadcrumb trail
      setBreadcrumbs(prev => [...prev, { type, label, data }])
    }
    setCurrentPreview({ type, data })
  }, [currentPreview])

  // Navigate back one step
  const handleBack = useCallback(() => {
    if (breadcrumbs.length <= 1) {
      onClose()
      return
    }
    const newBreadcrumbs = breadcrumbs.slice(0, -1)
    const lastItem = newBreadcrumbs[newBreadcrumbs.length - 1]
    setBreadcrumbs(newBreadcrumbs)
    setCurrentPreview({ type: lastItem.type, data: lastItem.data })
  }, [breadcrumbs, onClose])

  // Navigate to a specific breadcrumb index
  const handleBreadcrumbClick = useCallback((index: number) => {
    if (index >= breadcrumbs.length - 1) return // Already at this item
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1)
    const targetItem = newBreadcrumbs[index]
    setBreadcrumbs(newBreadcrumbs)
    setCurrentPreview({ type: targetItem.type, data: targetItem.data })
  }, [breadcrumbs])

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
    navigateTo("clip", playData, `Clip ${playData.playNumber}`)
  }, [navigateTo])

  if (!currentPreview) return null

  // Render the appropriate preview based on current state
  const renderPreview = () => {
    switch (currentPreview.type) {
      case "game":
        return (
          <PreviewModule
            game={currentPreview.data as Game}
            onClose={onClose}
            onNavigateToTeam={handleNavigateToTeam}
          />
        )
      case "team":
        return (
          <PreviewModule
            team={currentPreview.data as Team}
            onClose={onClose}
            onNavigateToAthlete={handleNavigateToAthlete}
          />
        )
      case "athlete":
        return (
          <PreviewModule
            athlete={currentPreview.data as Athlete & { id?: string }}
            onClose={onClose}
          />
        )
      case "clip":
        return (
          <PreviewModule
            play={currentPreview.data as PlayData}
            onClose={onClose}
            onNavigateToAthlete={handleNavigateToAthlete}
          />
        )
      default:
        return null
    }
  }

  const hasBreadcrumbs = breadcrumbs.length > 1

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Breadcrumb Navigation - only shown when navigating */}
      {hasBreadcrumbs && (
        <BreadcrumbNav
          items={breadcrumbs}
          onNavigate={handleBreadcrumbClick}
          onBack={handleBack}
        />
      )}
      
      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        {renderPreview()}
      </div>
    </div>
  )
}
