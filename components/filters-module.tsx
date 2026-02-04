"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { FilterState } from "@/hooks/use-explore-filters"
import { ChevronDown, X } from "lucide-react"

interface FiltersModuleProps {
  filters: FilterState
  onToggle: (category: string, value: string) => void
  onClear: () => void
  uniqueGames: string[]
  activeFilterCount: number
  totalCount: number
  filteredCount: number
}

interface FilterOption {
  label: string
  category: string
  items: string[]
  type?: "checkbox" | "toggle" | "slider" | "select"
}

interface FilterSection {
  id: string
  title: string
  count?: number
  options: FilterOption[]
}

// Toggle button group component for compact filter options
function ToggleGroup({
  items,
  category,
  filters,
  onToggle,
}: {
  items: string[]
  category: string
  filters: FilterState
  onToggle: (category: string, value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => {
        const isSelected = filters[category]?.has(item)
        return (
          <button
            key={item}
            onClick={() => onToggle(category, item)}
            className={cn(
              "px-2.5 py-1 text-xs rounded-md border transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            )}
          >
            {item}
          </button>
        )
      })}
    </div>
  )
}

// Checkbox group component
function CheckboxGroup({
  items,
  category,
  filters,
  onToggle,
}: {
  items: string[]
  category: string
  filters: FilterState
  onToggle: (category: string, value: string) => void
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isSelected = filters[category]?.has(item)
        return (
          <label
            key={item}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggle(category, item)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className={cn(
              "text-sm transition-colors",
              isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {item}
            </span>
          </label>
        )
      })}
    </div>
  )
}

export function FiltersModule({
  filters,
  onToggle,
  onClear,
  uniqueGames,
  activeFilterCount,
  totalCount,
  filteredCount,
}: FiltersModuleProps) {
  const sections: FilterSection[] = [
    {
      id: "game-context",
      title: "Game Context",
      options: [
        { label: "Down", category: "down", items: ["1", "2", "3", "4"], type: "toggle" },
        { label: "Distance to first", category: "distanceType", items: ["Short: 1-3", "Medium: 4-7", "Long: 8+"], type: "toggle" },
        { label: "Hash", category: "hash", items: ["L", "M", "R"], type: "toggle" },
      ],
    },
    {
      id: "play-context",
      title: "Play Context",
      options: [
        { label: "Play Type", category: "playType", items: ["Pass", "Run"], type: "toggle" },
        { label: "Personnel (O)", category: "personnelO", items: ["11", "12", "21", "22", "10", "Empty"], type: "toggle" },
        { label: "Personnel (D)", category: "personnelD", items: ["Base", "Nickel", "Dime", "Goal Line"], type: "toggle" },
        { label: "Touchdown", category: "isTouchdown", items: ["Yes", "No"], type: "toggle" },
        { label: "First down earned", category: "isFirstDown", items: ["Yes", "No"], type: "toggle" },
        { label: "Penalty", category: "isPenalty", items: ["Yes", "No"], type: "toggle" },
      ],
    },
    {
      id: "passing",
      title: "Passing",
      options: [
        { label: "Pass Result", category: "passResult", items: ["Complete", "Incomplete", "Sack", "Interception", "Throwaway"], type: "checkbox" },
      ],
    },
    {
      id: "rushing",
      title: "Rushing",
      options: [
        { label: "Run Direction", category: "runDirection", items: ["Left", "Middle", "Right"], type: "toggle" },
        { label: "Gain/Loss", category: "gainLoss", items: ["Gn", "Ls"], type: "toggle" },
      ],
    },
    {
      id: "defense",
      title: "Defense",
      options: [
        { label: "Coverage", category: "coverage", items: ["Cov 1", "Cov 2", "Cov 3", "Quarters"], type: "checkbox" },
        { label: "Blitz", category: "blitz", items: ["Yes", "No"], type: "toggle" },
        { label: "Front", category: "defFront", items: ["Over", "Under", "Bear", "Okie"], type: "checkbox" },
      ],
    },
    {
      id: "game",
      title: "Game",
      options: [
        { label: "Opponent / Game", category: "game", items: uniqueGames, type: "checkbox" },
      ],
    },
  ]

  // Count active filters per section
  const getSectionCount = (section: FilterSection) => {
    return section.options.reduce((acc, opt) => {
      return acc + (filters[opt.category]?.size || 0)
    }, 0)
  }

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">
          Showing <span className="text-foreground font-medium">{filteredCount}</span> of {totalCount} plays
        </span>
      </div>

      {/* Filter Sections */}
      <ScrollArea className="flex-1">
        <Accordion
          type="multiple"
          defaultValue={["game-context", "play-context"]}
          className="px-2 py-2"
        >
          {sections.map((section) => {
            const sectionCount = getSectionCount(section)
            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border-b border-border/50 last:border-b-0"
              >
                <AccordionTrigger className="py-3 px-2 hover:no-underline hover:bg-muted/50 rounded-md [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center justify-between w-full pr-2">
                    <span className="text-sm font-medium text-foreground">
                      {section.title}
                    </span>
                    {sectionCount > 0 && (
                      <span className="text-xs text-primary font-medium">
                        {sectionCount}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-3">
                  <div className="space-y-4">
                    {section.options.map((opt) => (
                      <div key={opt.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">
                            {opt.label}
                          </span>
                          {filters[opt.category]?.size > 0 && (
                            <span className="text-xs text-primary">
                              {filters[opt.category].size}
                            </span>
                          )}
                        </div>
                        {opt.type === "toggle" ? (
                          <ToggleGroup
                            items={opt.items}
                            category={opt.category}
                            filters={filters}
                            onToggle={onToggle}
                          />
                        ) : (
                          <CheckboxGroup
                            items={opt.items}
                            category={opt.category}
                            filters={filters}
                            onToggle={onToggle}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </ScrollArea>
    </div>
  )
}
