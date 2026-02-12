import { useState, useMemo, useCallback } from "react"
import type { PlayData } from "@/lib/mock-datasets"
import { filterPlays } from "@/lib/filters/filter-engine"

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

  // Delegate to the pure filter engine -- no filtering logic lives in
  // the hook any more.  filterPlays returns the original array reference
  // when no filters are active, preventing unnecessary downstream renders.
  const filteredPlays = useMemo(
    () => filterPlays(initialPlays, filters, rangeFilters),
    [initialPlays, filters, rangeFilters],
  )

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


