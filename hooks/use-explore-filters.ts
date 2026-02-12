import { useState, useMemo, useCallback } from "react"
import { PlayData } from "@/lib/mock-datasets"

export type FilterState = Record<string, Set<string>>
export type RangeFilterState = Record<string, [number, number]>

export function useExploreFilters(initialPlays: PlayData[]) {
  const [filters, setFilters] = useState<FilterState>({})
  const [rangeFilters, setRangeFilters] = useState<RangeFilterState>({})

  const toggleFilter = useCallback((category: string, value: string) => {
    setFilters((prev) => {
      const currentSet = prev[category]

      // Adding a value to a category that doesn't exist yet
      if (!currentSet) {
        return { ...prev, [category]: new Set([value]) }
      }

      const hasValue = currentSet.has(value)

      // Removing the last value — delete the category entirely
      if (hasValue && currentSet.size === 1) {
        const { [category]: _, ...rest } = prev
        return rest
      }

      // Clone the Set only when we know a mutation is needed
      const newSet = new Set(currentSet)
      if (hasValue) {
        newSet.delete(value)
      } else {
        newSet.add(value)
      }

      return { ...prev, [category]: newSet }
    })
  }, [])

  // Toggle all values in a category - if any selected, clear all; if none selected, select all
  const toggleAllInCategory = useCallback((category: string, allValues: string[]) => {
    setFilters((prev) => {
      const currentSet = prev[category]

      if (currentSet && currentSet.size > 0) {
        // Clear all — remove category without spreading if nothing else changes
        const { [category]: _, ...rest } = prev
        return rest
      }

      // Select all
      return { ...prev, [category]: new Set(allValues) }
    })
  }, [])

  // Set a range filter (dual-thumb slider: [min, max])
  const setRangeFilter = useCallback((category: string, value: [number, number], defaultRange: [number, number]) => {
    setRangeFilters((prev) => {
      const isDefault = value[0] === defaultRange[0] && value[1] === defaultRange[1]
      const current = prev[category]

      if (isDefault) {
        // Already absent — no state change needed
        if (!current) return prev
        const { [category]: _, ...rest } = prev
        return rest
      }

      // Already set to the same value — no state change needed
      if (current && current[0] === value[0] && current[1] === value[1]) return prev

      return { ...prev, [category]: value }
    })
  }, [])

  // Set a single-point filter (single-thumb slider, e.g. yard line)
  const setSinglePointFilter = useCallback((category: string, value: number, defaultValue: number) => {
    setRangeFilters((prev) => {
      const current = prev[category]

      if (value === defaultValue) {
        if (!current) return prev
        const { [category]: _, ...rest } = prev
        return rest
      }

      if (current && current[0] === value && current[1] === value) return prev

      return { ...prev, [category]: [value, value] }
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
