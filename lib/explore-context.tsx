"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { GameLeague } from "@/types/game"

export type ExploreTab = "clips" | "games" | "teams" | "athletes"

/** Shared filter state that persists across profile navigation */
export interface ExploreFilterState {
  leagues: GameLeague[]
  seasons: string[]
  teams: string[]
  competitions: string[]
}

/** Represents an active filter for display as a chip */
export interface ActiveFilterChip {
  id: string // Unique identifier for the chip (e.g., "league:NFL" or "down:3")
  category: string // Filter category (e.g., "league", "down")
  value: string // Filter value (e.g., "NFL", "3")
  label: string // Display label (e.g., "League > NFL", "Down > 3rd")
  sectionKey: string // Which accordion section this filter belongs to (e.g., "scope", "game-context")
}

interface ExploreContextValue {
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  toggleFilters: () => void
  activeFilterCount: number
  setActiveFilterCount: (count: number) => void
  activeTab: ExploreTab
  setActiveTab: (tab: ExploreTab) => void
  // Shared filter state
  sharedFilters: ExploreFilterState
  setSharedFilters: (filters: ExploreFilterState) => void
  // Helper to encode filters for URL
  encodeFiltersForUrl: () => string
  // Helper to decode filters from URL
  decodeFiltersFromUrl: (encoded: string) => ExploreFilterState
  // Highlighted filter for scrolling/highlighting in filter panel
  highlightedFilter: string | null // category:value format
  setHighlightedFilter: (filter: string | null) => void
}

const ExploreContext = createContext<ExploreContextValue | null>(null)

const DEFAULT_FILTERS: ExploreFilterState = {
  leagues: [],
  seasons: [],
  teams: [],
  competitions: [],
}

export function ExploreProvider({ children }: { children: ReactNode }) {
  const [showFilters, setShowFilters] = useState(true)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const [activeTab, setActiveTab] = useState<ExploreTab>("clips")
  const [sharedFilters, setSharedFilters] = useState<ExploreFilterState>(DEFAULT_FILTERS)
  const [highlightedFilter, setHighlightedFilter] = useState<string | null>(null)

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev)
  }, [])

  // Encode shared filters for URL
  const encodeFiltersForUrl = useCallback(() => {
    const filterData = {
      l: sharedFilters.leagues,
      s: sharedFilters.seasons,
      t: sharedFilters.teams,
      c: sharedFilters.competitions,
    }
    // Only include non-empty arrays
    const filtered = Object.fromEntries(
      Object.entries(filterData).filter(([, v]) => v.length > 0)
    )
    if (Object.keys(filtered).length === 0) return ""
    return encodeURIComponent(JSON.stringify(filtered))
  }, [sharedFilters])

  // Decode filters from URL
  const decodeFiltersFromUrl = useCallback((encoded: string): ExploreFilterState => {
    if (!encoded) return DEFAULT_FILTERS
    try {
      const decoded = JSON.parse(decodeURIComponent(encoded))
      return {
        leagues: decoded.l || [],
        seasons: decoded.s || [],
        teams: decoded.t || [],
        competitions: decoded.c || [],
      }
    } catch {
      return DEFAULT_FILTERS
    }
  }, [])

  return (
    <ExploreContext.Provider
      value={{
        showFilters,
        setShowFilters,
        toggleFilters,
        activeFilterCount,
        setActiveFilterCount,
        activeTab,
        setActiveTab,
        sharedFilters,
        setSharedFilters,
        encodeFiltersForUrl,
        decodeFiltersFromUrl,
        highlightedFilter,
        setHighlightedFilter,
      }}
    >
      {children}
    </ExploreContext.Provider>
  )
}

export function useExploreContext() {
  const context = useContext(ExploreContext)
  if (!context) {
    throw new Error("useExploreContext must be used within an ExploreProvider")
  }
  return context
}

// Hook that returns null if not in explore context (for conditional usage in header)
export function useExploreContextOptional() {
  return useContext(ExploreContext)
}
