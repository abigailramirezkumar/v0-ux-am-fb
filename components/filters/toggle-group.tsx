"use client"

import type { FilterState } from "@/hooks/use-explore-filters"
import { ToggleButton } from "./toggle-button"

export interface ToggleGroupProps {
  /** The chip definitions to render. */
  items: { value: string; label: string }[]
  /** The filter category key these chips belong to. */
  category: string
  /** Current filter state (used to derive selected chips). */
  filters: FilterState
  /** Callback to toggle a single value within the category. */
  onToggle: (category: string, value: string) => void
}

/**
 * Renders a horizontal row of {@link ToggleButton} chips for a given
 * filter category. Each chip independently toggles its value in the
 * shared filter state.
 */
export function ToggleGroup({ items, category, filters, onToggle }: ToggleGroupProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <ToggleButton
          key={item.value}
          label={item.label}
          isSelected={filters[category]?.has(item.value) || false}
          onClick={() => onToggle(category, item.value)}
        />
      ))}
    </div>
  )
}
