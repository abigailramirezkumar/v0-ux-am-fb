"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActiveFilterChip } from "@/lib/explore-context"

interface FilterChipsProps {
  chips: ActiveFilterChip[]
  onChipClick: (chip: ActiveFilterChip) => void
  onChipRemove: (chip: ActiveFilterChip) => void
}

export function FilterChips({ chips, onChipClick, onChipRemove }: FilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <>
      {/* Vertical separator */}
      <div className="h-6 w-px bg-border/60" />
      
      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {chips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => onChipClick(chip)}
            className={cn(
              "group flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-all duration-200",
              "bg-primary/90 text-primary-foreground hover:bg-primary"
            )}
          >
            <span className="whitespace-nowrap">{chip.label}</span>
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation()
                onChipRemove(chip)
              }}
              className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-foreground/20 transition-colors"
            >
              <X className="w-3 h-3" />
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
