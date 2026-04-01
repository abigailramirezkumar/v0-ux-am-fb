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
      <div className="h-5 w-px bg-border/60" />
      
      {/* Filter chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {chips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => onChipClick(chip)}
            className={cn(
              "group flex items-center gap-1 px-2 py-0.5 text-xs rounded transition-all duration-200",
              "bg-[#96CCF3] text-foreground border border-blue-600 hover:bg-[#96CCF3]/80",
              "dark:bg-[#0D2959] dark:text-blue-100 dark:hover:bg-[#0D2959]/80"
            )}
          >
            <span className="whitespace-nowrap">{chip.label}</span>
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation()
                onChipRemove(chip)
              }}
              className="flex items-center justify-center w-3.5 h-3.5 rounded-sm hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
