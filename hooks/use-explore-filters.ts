import { useState, useMemo, useCallback } from "react"
import { PlayData } from "@/lib/mock-datasets"

export type FilterState = Record<string, Set<string>>

export function useExploreFilters(initialPlays: PlayData[]) {
  const [filters, setFilters] = useState<FilterState>({})

  const toggleFilter = useCallback((category: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev }
      if (!next[category]) next[category] = new Set()

      const newSet = new Set(next[category])
      if (newSet.has(value)) {
        newSet.delete(value)
      } else {
        newSet.add(value)
      }

      if (newSet.size === 0) {
        delete next[category]
      } else {
        next[category] = newSet
      }
      return next
    })
  }, [])

  // Toggle all values in a category - if any selected, clear all; if none selected, select all
  const toggleAllInCategory = useCallback((category: string, allValues: string[]) => {
    setFilters((prev) => {
      const next = { ...prev }
      const currentSet = next[category]
      const hasAnySelected = currentSet && currentSet.size > 0

      if (hasAnySelected) {
        // Clear all
        delete next[category]
      } else {
        // Select all
        next[category] = new Set(allValues)
      }
      return next
    })
  }, [])

  const clearFilters = useCallback(() => setFilters({}), [])

  const filteredPlays = useMemo(() => {
    const activeCategories = Object.entries(filters).filter(
      ([, values]) => values.size > 0
    )

    if (activeCategories.length === 0) return initialPlays

    return initialPlays.filter((play) => {
      // AND Logic: Must match ALL active filter categories
      return activeCategories.every(([category, selectedValues]) => {
        // OR Logic: Must match ANY value within the category
        const value = getValueForCategory(play, category)

        // Special handling for distance ranges
        if (category === "distanceType") {
          const dist = play.distance
          if (selectedValues.has("Short: 1-3") && dist >= 1 && dist <= 3) return true
          if (selectedValues.has("Medium: 4-7") && dist >= 4 && dist <= 7) return true
          if (selectedValues.has("Long: 8+") && dist >= 8) return true
          return false
        }

        // Special handling for yard line ranges
        if (category === "yardLineRange") {
          const yardNum = parseInt(play.yardLine.replace(/[+-]/, ""))
          if (selectedValues.has("0") && yardNum >= 0 && yardNum <= 25) return true
          if (selectedValues.has("50") && yardNum >= 26 && yardNum <= 50) return true
          if (selectedValues.has("100") && yardNum >= 51) return true
          return false
        }

        return selectedValues.has(String(value))
      })
    })
  }, [initialPlays, filters])

  // Get unique values for dynamic filter options
  const uniqueGames = useMemo(() => {
    const games = new Set<string>()
    initialPlays.forEach((play) => games.add(play.game))
    return Array.from(games)
  }, [initialPlays])

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).reduce((acc, set) => acc + set.size, 0)
  }, [filters])

  return {
    filters,
    toggleFilter,
    toggleAllInCategory,
    clearFilters,
    filteredPlays,
    uniqueGames,
    activeFilterCount,
  }
}

function getValueForCategory(play: PlayData, category: string): string {
  switch (category) {
    case "quarter":
      return String(play.quarter)
    case "down":
      return String(play.down)
    case "odk":
      return play.odk
    case "hash":
      return play.hash
    case "playType":
      return play.playType
    case "personnelO":
      return play.personnelO
    case "personnelD":
      return play.personnelD
    case "blitz":
      return play.blitz
    case "coverage":
      return play.coverage
    case "defFront":
      return play.defFront
    case "game":
      return play.game
    case "passResult":
      return play.passResult || ""
    case "runDirection":
      return play.runDirection || ""
    case "isTouchdown":
      return play.isTouchdown ? "Yes" : "No"
    case "isFirstDown":
      return play.isFirstDown ? "Yes" : "No"
    case "isPenalty":
      return play.isPenalty ? "Yes" : "No"
    case "gainLoss":
      return play.gainLoss
    default:
      return ""
  }
}
