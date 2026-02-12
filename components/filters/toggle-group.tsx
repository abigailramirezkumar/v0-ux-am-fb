"use client"

import type { FilterState, AnyFilterCategory } from "@/types/filters"
import { hasFilter } from "@/types/filters"
import { ToggleButton } from "./toggle-button"

export interface ToggleGroupProps {
  /** The chip definitions to render. */
  items: { value: string; label: string }[]
  /** The filter category key these chips belong to. */
  category: AnyFilterCategory
  /** Current filter state (used to derive selected chips). */
  filters: FilterState
  /** Callback to toggle a single value within the category. */
  onToggle: (category: AnyFilterCategory, value: string) => void
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
          isSelected={hasFilter(filters, category, item.value)}
          onClick={() => onToggle(category, item.value)}
        />
      ))}
    </div>
  )
}
