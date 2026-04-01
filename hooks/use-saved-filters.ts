"use client"

import { useState, useEffect, useCallback } from "react"
import type { FilterState, RangeFilterState } from "@/types/filters"

export interface SavedFilter {
  id: string
  name: string
  filters: FilterState
  rangeFilters: RangeFilterState
  createdAt: number
}

// Serialize FilterState (Sets to arrays) for localStorage
function serializeFilterState(filters: FilterState): Record<string, string[]> {
  const serialized: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value instanceof Set) {
      serialized[key] = Array.from(value)
    }
  }
  return serialized
}

// Deserialize FilterState (arrays to Sets) from localStorage
function deserializeFilterState(serialized: Record<string, string[]>): FilterState {
  const filters: FilterState = {}
  for (const [key, value] of Object.entries(serialized)) {
    if (Array.isArray(value)) {
      filters[key as keyof FilterState] = new Set(value)
    }
  }
  return filters
}

const STORAGE_KEY = "saved-filters"

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Deserialize the filter states
        const deserialized = parsed.map((sf: { id: string; name: string; filters: Record<string, string[]>; rangeFilters: RangeFilterState; createdAt: number }) => ({
          ...sf,
          filters: deserializeFilterState(sf.filters),
        }))
        setSavedFilters(deserialized)
      }
    } catch (e) {
      console.error("Failed to load saved filters:", e)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever savedFilters changes
  useEffect(() => {
    if (!isLoaded) return
    try {
      // Serialize the filter states for storage
      const serialized = savedFilters.map(sf => ({
        ...sf,
        filters: serializeFilterState(sf.filters),
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized))
    } catch (e) {
      console.error("Failed to save filters:", e)
    }
  }, [savedFilters, isLoaded])

  const saveFilter = useCallback((name: string, filters: FilterState, rangeFilters: RangeFilterState) => {
    const newFilter: SavedFilter = {
      id: crypto.randomUUID(),
      name,
      filters,
      rangeFilters,
      createdAt: Date.now(),
    }
    setSavedFilters(prev => [newFilter, ...prev])
    return newFilter.id
  }, [])

  const deleteFilter = useCallback((id: string) => {
    setSavedFilters(prev => prev.filter(sf => sf.id !== id))
  }, [])

  const renameFilter = useCallback((id: string, newName: string) => {
    setSavedFilters(prev => prev.map(sf => 
      sf.id === id ? { ...sf, name: newName } : sf
    ))
  }, [])

  return {
    savedFilters,
    saveFilter,
    deleteFilter,
    renameFilter,
    isLoaded,
  }
}
