import { useState, useMemo, useCallback } from "react"
import { PlayData } from "@/lib/mock-datasets"

export type FilterState = Record<string, Set<string>>
export type RangeFilterState = Record<string, [number, number]>

export function useExploreFilters(initialPlays: PlayData[]) {
  const [filters, setFilters] = useState<FilterState>({})
  const [rangeFilters, setRangeFilters] = useState<RangeFilterState>({})

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

  // Set a range filter (dual-thumb slider: [min, max])
  const setRangeFilter = useCallback((category: string, value: [number, number], defaultRange: [number, number]) => {
    setRangeFilters((prev) => {
      const next = { ...prev }
      // If the value matches the full default range, remove the filter
      if (value[0] === defaultRange[0] && value[1] === defaultRange[1]) {
        delete next[category]
      } else {
        next[category] = value
      }
      return next
    })
  }, [])

  // Set a single-point filter (single-thumb slider, e.g. yard line)
  const setSinglePointFilter = useCallback((category: string, value: number, defaultValue: number) => {
    setRangeFilters((prev) => {
      const next = { ...prev }
      if (value === defaultValue) {
        delete next[category]
      } else {
        next[category] = [value, value]
      }
      return next
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setRangeFilters({})
  }, [])

  const filteredPlays = useMemo(() => {
    const activeCategories = Object.entries(filters).filter(
      ([, values]) => values.size > 0
    )
    const activeRanges = Object.entries(rangeFilters)

    if (activeCategories.length === 0 && activeRanges.length === 0) return initialPlays

    return initialPlays.filter((play) => {
      // AND Logic: Must match ALL active set-based filter categories
      const matchesSetFilters = activeCategories.every(([category, selectedValues]) => {
        const value = getValueForCategory(play, category)

        // Special handling for distance ranges (toggle chips)
        if (category === "distanceType") {
          const dist = play.distance
          if (selectedValues.has("Short: 1-3") && dist >= 1 && dist <= 3) return true
          if (selectedValues.has("Medium: 4-7") && dist >= 4 && dist <= 7) return true
          if (selectedValues.has("Long: 8+") && dist >= 8) return true
          return false
        }

        return selectedValues.has(String(value))
      })

      if (!matchesSetFilters) return false

      // AND Logic: Must also match ALL active range filters
      const matchesRangeFilters = activeRanges.every(([category, [lo, hi]]) => {
        const numericValue = getNumericValueForRange(play, category)
        if (numericValue === null) return false
        // Single-point filters use lo === hi
        if (lo === hi) return numericValue === lo
        return numericValue >= lo && numericValue <= hi
      })

      return matchesRangeFilters
    })
  }, [initialPlays, filters, rangeFilters])

  // Get unique values for dynamic filter options
  const uniqueGames = useMemo(() => {
    const games = new Set<string>()
    initialPlays.forEach((play) => games.add(play.game))
    return Array.from(games)
  }, [initialPlays])

  const activeFilterCount = useMemo(() => {
    const setCount = Object.values(filters).reduce((acc, set) => acc + set.size, 0)
    const rangeCount = Object.keys(rangeFilters).length
    return setCount + rangeCount
  }, [filters, rangeFilters])

  return {
    filters,
    rangeFilters,
    toggleFilter,
    toggleAllInCategory,
    setRangeFilter,
    setSinglePointFilter,
    clearFilters,
    filteredPlays,
    uniqueGames,
    activeFilterCount,
  }
}

function getNumericValueForRange(play: PlayData, category: string): number | null {
  switch (category) {
    case "yardLine":
      return parseInt(play.yardLine.replace(/[+-]/, "")) || 0
    case "distanceRange":
      return play.distance
    case "yardsAfterContactRange":
      return play.yards // approximate with yards gained
    case "puntReturnRange":
      return play.yards
    case "kickoffReturnRange":
      return play.yards
    default:
      return null
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
