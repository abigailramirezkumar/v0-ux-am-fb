"use client"

import type { FilterState, AnyFilterCategory, RangeCategory } from "@/types/filters"
import { hasFilter, getFilterSet } from "@/types/filters"
import { ToggleButton } from "./toggle-button"

export interface ToggleGroupWithRangeProps {
  /** The chip definitions to render. */
  items: { value: string; label: string }[]
  /** The filter category key these chips belong to. */
  category: AnyFilterCategory
  /** Current filter state. */
  filters: FilterState
  /** Callback to toggle a single chip value. */
  onToggle: (category: AnyFilterCategory, value: string) => void
  /** Map from chip value to a numeric [min, max] range. */
  rangeMap: Record<string, [number, number]>
  /** Callback to update the associated range slider. */
  onRangeChange: (category: RangeCategory, value: [number, number], defaultRange: [number, number]) => void
  /** Key used for the range state in `rangeFilters`. */
  rangeCategory: RangeCategory
  /** The full default range the slider resets to. */
  rangeDefault: [number, number]
}

/**
 * A toggle chip group that **also** drives an associated range slider.
 *
 * When a chip is toggled, the component computes the union range across
 * all currently-selected chips and pushes that range to the slider via
 * `onRangeChange`. If no chips are selected the slider resets to its default.
 */
export function ToggleGroupWithRange({
  items,
  category,
  filters,
  onToggle,
  rangeMap,
  onRangeChange,
  rangeCategory,
  rangeDefault,
}: ToggleGroupWithRangeProps) {
  const handleToggle = (value: string) => {
    const isCurrentlySelected = hasFilter(filters, category, value)
    // Toggle the chip filter
    onToggle(category, value)

    // Compute the set of selected chips after this toggle
    const currentSet = new Set(getFilterSet(filters, category) ?? [])
    if (isCurrentlySelected) {
      currentSet.delete(value)
    } else {
      currentSet.add(value)
    }

    // Compute the union range across all selected chips
    if (currentSet.size === 0) {
      // No chips selected -- reset slider to default
      onRangeChange(rangeCategory, rangeDefault, rangeDefault)
    } else {
      let unionMin = Infinity
      let unionMax = -Infinity
      for (const chip of currentSet) {
        const range = rangeMap[chip]
        if (range) {
          unionMin = Math.min(unionMin, range[0])
          unionMax = Math.max(unionMax, range[1])
        }
      }
      if (unionMin !== Infinity && unionMax !== -Infinity) {
        onRangeChange(rangeCategory, [unionMin, unionMax], rangeDefault)
      }
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <ToggleButton
          key={item.value}
          label={item.label}
          isSelected={hasFilter(filters, category, item.value)}
          onClick={() => handleToggle(item.value)}
        />
      ))}
    </div>
  )
}
