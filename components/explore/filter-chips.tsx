"use client"

import { useState, useRef, useEffect } from "react"
import { X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import type { ActiveFilterChip } from "@/lib/explore-context"

interface FilterChipsProps {
  chips: ActiveFilterChip[]
  onChipClick: (chip: ActiveFilterChip) => void
  onChipRemove: (chip: ActiveFilterChip) => void
  onClearAll?: () => void
}

export function FilterChips({ chips, onChipClick, onChipRemove, onClearAll }: FilterChipsProps) {
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)

  // Detect overflow
  useEffect(() => {
    const checkOverflow = () => {
      if (chipsRef.current && containerRef.current) {
        const chipsWidth = chipsRef.current.scrollWidth
        const containerWidth = containerRef.current.clientWidth
        setIsOverflowing(chipsWidth > containerWidth)
      }
    }

    checkOverflow()
    window.addEventListener("resize", checkOverflow)
    return () => window.removeEventListener("resize", checkOverflow)
  }, [chips])

  if (chips.length === 0) return null

  // Format chip label for dropdown (use = instead of >)
  const formatDropdownLabel = (chip: ActiveFilterChip) => {
    // Extract category name and values from the label
    const parts = chip.label.split(" > ")
    if (parts.length === 2) {
      return { category: parts[0], value: parts[1] }
    }
    return { category: chip.category, value: chip.values.join(", ") }
  }

  return (
    <>
      {/* Vertical separator */}
      <div className="h-5 w-px bg-border/60 shrink-0" />
      
      {/* Container for measuring */}
      <div ref={containerRef} className="flex-1 min-w-0 overflow-hidden">
        {!isOverflowing ? (
          // Normal state - show all chips
          <div ref={chipsRef} className="flex items-center gap-1.5">
            {chips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => onChipClick(chip)}
                className={cn(
                  "group flex items-center gap-1 px-2 py-0.5 text-xs rounded transition-all duration-200 shrink-0",
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
        ) : (
          // Truncated state - show dropdown trigger
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded transition-all duration-200",
                  "border border-blue-600",
                  isOpen 
                    ? "bg-blue-600 text-white" 
                    : "bg-[#96CCF3] text-foreground hover:bg-[#96CCF3]/80 dark:bg-[#0D2959] dark:text-blue-100 dark:hover:bg-[#0D2959]/80"
                )}
              >
                <span>{chips.length} Active Filters</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              align="start" 
              className="w-80 p-0 bg-popover border border-border"
              sideOffset={8}
            >
              {/* Filter list */}
              <div className="max-h-[300px] overflow-y-auto">
                {chips.map((chip) => {
                  const { category, value } = formatDropdownLabel(chip)
                  return (
                    <div
                      key={chip.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        onChipClick(chip)
                        setIsOpen(false)
                      }}
                    >
                      <span className="text-sm">
                        <span className="font-semibold">{category}</span>
                        <span className="text-muted-foreground"> = </span>
                        <span>{value}</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onChipRemove(chip)
                        }}
                        className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
              
              {/* Footer with Clear button */}
              <div className="border-t border-border px-4 py-3 flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onClearAll?.()
                    setIsOpen(false)
                  }}
                >
                  Clear
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      
      {/* Hidden measurement div for overflow detection */}
      {isOverflowing && (
        <div 
          ref={chipsRef} 
          className="absolute invisible pointer-events-none flex items-center gap-1.5"
          aria-hidden="true"
        >
          {chips.map((chip) => (
            <span key={chip.id} className="px-2 py-0.5 text-xs whitespace-nowrap">
              {chip.label}
            </span>
          ))}
        </div>
      )}
    </>
  )
}
