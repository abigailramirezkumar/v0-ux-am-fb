"use client"

import { useCallback } from "react"
import { cn } from "@/lib/utils"
import type { FilterState, RangeFilterState, AnyFilterCategory, RangeCategory } from "@/types/filters"
import { getFilterSet, hasActiveRange } from "@/types/filters"

/** Stable fallback so `useCallback` deps don't churn. */
const ENABLED_DEFAULT: string[] = ["enabled"]

export interface FilterRowProps {
  /** Display label shown next to the circle checkbox. */
  label: string
  /** Optional play count badge displayed on the right. */
  count?: number
  /** The filter category key (derived from label when omitted). */
  category?: AnyFilterCategory
  /** All possible values for this category (defaults to `["enabled"]`). */
  allValues?: string[]
  /** Current set-based filter state. */
  filters?: FilterState
  /** Current range-based filter state. */
  rangeFilters?: RangeFilterState
  /** Key into `rangeFilters` for an associated range slider. */
  rangeCategory?: RangeCategory
  /** Default range used when resetting the slider. */
  rangeDefault?: [number, number]
  /** Callback to toggle all values in a category at once. */
  onToggleAll?: (category: AnyFilterCategory, allValues: string[]) => void
  /** Callback to toggle a single boolean value. */
  onToggle?: (category: AnyFilterCategory, value: string) => void
  /** Callback to reset a range filter to its default. */
  onRangeReset?: (category: RangeCategory, defaultRange: [number, number]) => void
  /** Child content rendered below the header row (chips, sliders, selects). */
  children?: React.ReactNode
}

/**
 * A filter row with a circular checkbox that controls whether the
 * filter is active. Clicking the circle either selects all values
 * (when inactive) or clears all values + any associated range slider
 * (when active). Children are rendered below the header for sub-controls.
 */
export function FilterRow({
  label,
  count,
  category,
  allValues,
  filters,
  rangeFilters,
  rangeCategory,
  rangeDefault,
  onToggleAll,
  onToggle,
  onRangeReset,
  children,
}: FilterRowProps) {
  // Derive a category key: use explicit category, or a normalized label for simple boolean filters
  const effectiveCategory = (category || `_filter_${label.toLowerCase().replace(/[\s\/]+/g, "_")}`) as AnyFilterCategory
  const effectiveValues = allValues || ENABLED_DEFAULT

  // Check if any set-based values in this category are selected
  const filterSet = filters ? getFilterSet(filters, effectiveCategory) : undefined
  const hasSetSelected = filterSet !== undefined && filterSet.size > 0
  // Check if the associated range slider is active
  const hasRangeSelected = !!(rangeCategory && rangeFilters && hasActiveRange(rangeFilters, rangeCategory))

  const isActive = hasSetSelected || hasRangeSelected

  const handleCircleClick = useCallback(() => {
    if (isActive) {
      // Clear everything: set-based filters and range filter
      if (hasSetSelected && onToggleAll) {
        onToggleAll(effectiveCategory, effectiveValues)
      } else if (hasSetSelected && onToggle) {
        onToggle(effectiveCategory, "enabled")
      }
      if (hasRangeSelected && onRangeReset && rangeDefault) {
        onRangeReset(rangeCategory!, rangeDefault)
      }
    } else {
      // Select all set-based values (but NOT range - sliders activate on their own)
      if (onToggleAll) {
        onToggleAll(effectiveCategory, effectiveValues)
      } else if (onToggle) {
        onToggle(effectiveCategory, "enabled")
      }
    }
  }, [
    isActive,
    hasSetSelected,
    hasRangeSelected,
    effectiveCategory,
    effectiveValues,
    onToggleAll,
    onToggle,
    onRangeReset,
    rangeCategory,
    rangeDefault,
  ])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCircleClick}
            className={cn(
              "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors",
              isActive
                ? "border-foreground bg-foreground"
                : "border-muted-foreground/40 bg-background hover:border-muted-foreground/60"
            )}
          >
            {isActive && (
              <div className="w-1.5 h-1.5 rounded-full bg-background" />
            )}
          </button>
          <span className="text-sm text-foreground">{label}</span>
        </div>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground">{count}</span>
        )}
      </div>
      {children}
    </div>
  )
}
