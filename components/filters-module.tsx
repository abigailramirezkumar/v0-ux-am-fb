"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCallback } from "react"
import { cn } from "@/lib/utils"
import { FilterState, RangeFilterState } from "@/hooks/use-explore-filters"
import { Button } from "@/components/ui/button"
import {
  FILTER_SECTIONS,
  DEFAULT_OPEN_SECTIONS,
  type FilterDef,
  type ToggleFilterDef,
  type ToggleWithRangeFilterDef,
  type RangeFilterDef,
  type SelectFilterDef,
} from "@/lib/filter-config"

interface FiltersModuleProps {
  filters: FilterState
  rangeFilters: RangeFilterState
  onToggle: (category: string, value: string) => void
  onToggleAll: (category: string, allValues: string[]) => void
  onRangeChange: (category: string, value: [number, number], defaultRange: [number, number]) => void
  onClear: () => void
  uniqueGames: string[]
  activeFilterCount: number
  totalCount: number
  filteredCount: number
}

// Toggle button component matching the design
function ToggleButton({
  label,
  isSelected,
  onClick,
}: {
  label: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs font-medium rounded border transition-colors",
        isSelected
          ? "bg-foreground text-background border-foreground"
          : "bg-background text-muted-foreground border-border hover:border-muted-foreground/50"
      )}
    >
      {label}
    </button>
  )
}

// Toggle button group
function ToggleGroup({
  items,
  category,
  filters,
  onToggle,
}: {
  items: { value: string; label: string }[]
  category: string
  filters: FilterState
  onToggle: (category: string, value: string) => void
}) {
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

// Toggle button group that also syncs an associated range slider when a chip is clicked
function ToggleGroupWithRange({
  items,
  category,
  filters,
  onToggle,
  rangeMap,
  onRangeChange,
  rangeCategory,
  rangeDefault,
}: {
  items: { value: string; label: string }[]
  category: string
  filters: FilterState
  onToggle: (category: string, value: string) => void
  rangeMap: Record<string, [number, number]>
  onRangeChange: (category: string, value: [number, number], defaultRange: [number, number]) => void
  rangeCategory: string
  rangeDefault: [number, number]
}) {
  const handleToggle = (value: string) => {
    const isCurrentlySelected = filters[category]?.has(value) || false
    // Toggle the chip filter
    onToggle(category, value)

    // Compute the set of selected chips after this toggle
    const currentSet = new Set(filters[category] || [])
    if (isCurrentlySelected) {
      currentSet.delete(value)
    } else {
      currentSet.add(value)
    }

    // Compute the union range across all selected chips
    if (currentSet.size === 0) {
      // No chips selected — reset slider to default
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
          isSelected={filters[category]?.has(item.value) || false}
          onClick={() => handleToggle(item.value)}
        />
      ))}
    </div>
  )
}

const ENABLED_DEFAULT: string[] = ["enabled"]

// Filter row with circular checkbox that toggles all sub-filters
function FilterRow({
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
}: {
  label: string
  count?: number
  category?: string
  allValues?: string[]
  filters?: FilterState
  rangeFilters?: RangeFilterState
  rangeCategory?: string
  rangeDefault?: [number, number]
  onToggleAll?: (category: string, allValues: string[]) => void
  onToggle?: (category: string, value: string) => void
  onRangeReset?: (category: string, defaultRange: [number, number]) => void
  children?: React.ReactNode
}) {
  // Derive a category key: use explicit category, or a normalized label for simple boolean filters
  const effectiveCategory = category || `_filter_${label.toLowerCase().replace(/[\s\/]+/g, "_")}`
  const effectiveValues = allValues || ENABLED_DEFAULT
  
  // Check if any set-based values in this category are selected
  const hasSetSelected = filters && filters[effectiveCategory]?.size > 0
  // Check if the associated range slider is active
  const hasRangeSelected = rangeCategory && rangeFilters && rangeCategory in rangeFilters
  
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

// Subsection header
function SubsectionHeader({ label }: { label: string }) {
  return (
    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pt-2 pb-1">
      {label}
    </div>
  )
}

// Range slider with labels (dual-thumb)
function RangeSlider({
  min = 0,
  max = 100,
  value,
  onChange,
}: {
  min?: number
  max?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}) {
  return (
    <div className="space-y-2">
      <Slider
        min={min}
        max={max}
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
        className="[&_[data-slot=slider-track]]:bg-muted [&_[data-slot=slider-range]]:bg-foreground [&_[data-slot=slider-thumb]]:border-foreground [&_[data-slot=slider-thumb]]:w-3.5 [&_[data-slot=slider-thumb]]:h-3.5"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{value[0]}</span>
        <span>{value[1]}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Renders a single FilterDef driven by its `type`.
// ---------------------------------------------------------------------------
function ConfigDrivenFilter({
  def,
  filters,
  rangeFilters,
  onToggle,
  onToggleAll,
  onRangeChange,
  resetRange,
}: {
  def: FilterDef
  filters: FilterState
  rangeFilters: RangeFilterState
  onToggle: (category: string, value: string) => void
  onToggleAll: (category: string, allValues: string[]) => void
  onRangeChange: (category: string, value: [number, number], defaultRange: [number, number]) => void
  resetRange: (category: string, defaultRange: [number, number]) => void
}) {
  switch (def.type) {
    case "boolean":
      return (
        <FilterRow
          label={def.label}
          count={def.count}
          filters={filters}
          onToggle={onToggle}
        />
      )

    case "toggle": {
      const d = def as ToggleFilterDef
      return (
        <FilterRow
          label={d.label}
          count={d.count}
          category={d.category}
          allValues={d.allValues}
          filters={filters}
          onToggleAll={onToggleAll}
        >
          {d.groups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "pt-1" : undefined}>
              <ToggleGroup
                items={group}
                category={d.category}
                filters={filters}
                onToggle={onToggle}
              />
            </div>
          ))}
        </FilterRow>
      )
    }

    case "toggleWithRange": {
      const d = def as ToggleWithRangeFilterDef
      return (
        <FilterRow
          label={d.label}
          count={d.count}
          category={d.category}
          allValues={d.allValues}
          filters={filters}
          rangeFilters={rangeFilters}
          rangeCategory={d.rangeCategory}
          rangeDefault={d.rangeDefault}
          onToggleAll={onToggleAll}
          onRangeReset={resetRange}
        >
          <ToggleGroupWithRange
            items={d.groups[0]}
            category={d.category}
            filters={filters}
            onToggle={onToggle}
            rangeMap={d.rangeMap}
            onRangeChange={onRangeChange}
            rangeCategory={d.rangeCategory}
            rangeDefault={d.rangeDefault}
          />
          <RangeSlider
            min={d.rangeMin}
            max={d.rangeMax}
            value={rangeFilters[d.rangeCategory] || d.rangeDefault}
            onChange={(v) => onRangeChange(d.rangeCategory, v, d.rangeDefault)}
          />
        </FilterRow>
      )
    }

    case "range": {
      const d = def as RangeFilterDef
      return (
        <FilterRow
          label={d.label}
          count={d.count}
          filters={filters}
          onToggle={onToggle}
          rangeFilters={rangeFilters}
          rangeCategory={d.rangeCategory}
          rangeDefault={d.rangeDefault}
          onRangeReset={resetRange}
        >
          <RangeSlider
            min={d.rangeMin}
            max={d.rangeMax}
            value={rangeFilters[d.rangeCategory] || d.rangeDefault}
            onChange={(v) => onRangeChange(d.rangeCategory, v, d.rangeDefault)}
          />
        </FilterRow>
      )
    }

    case "select": {
      const d = def as SelectFilterDef
      return (
        <FilterRow
          label={d.label}
          count={d.count}
          filters={filters}
          onToggle={onToggle}
        >
          <Select>
            <SelectTrigger className="w-full h-9 text-sm border-border text-muted-foreground">
              <SelectValue placeholder={d.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {d.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterRow>
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Main export — now data-driven via FILTER_SECTIONS
// ---------------------------------------------------------------------------
export function FiltersModule({
  filters,
  rangeFilters,
  onToggle,
  onToggleAll,
  onRangeChange,
  onClear,
  activeFilterCount,
}: FiltersModuleProps) {
  // Helper to reset a range filter to its default
  const resetRange = useCallback(
    (category: string, defaultRange: [number, number]) => {
      onRangeChange(category, defaultRange, defaultRange)
    },
    [onRangeChange]
  )

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-foreground text-background rounded">
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
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Sections — data-driven */}
      <ScrollArea className="flex-1 overflow-hidden">
        <Accordion
          type="multiple"
          defaultValue={DEFAULT_OPEN_SECTIONS}
          className="px-4"
        >
          {FILTER_SECTIONS.map((section, sIdx) => (
            <AccordionItem
              key={section.key}
              value={section.key}
              className={sIdx < FILTER_SECTIONS.length - 1 ? "border-b border-border" : "border-b-0"}
            >
              <AccordionTrigger className="py-3 hover:no-underline text-sm font-semibold text-foreground [&>svg]:text-muted-foreground">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-3">
                {section.subsections.map((sub, subIdx) => (
                  <div key={subIdx} className="space-y-3">
                    {sub.subsectionLabel && (
                      <SubsectionHeader label={sub.subsectionLabel} />
                    )}
                    {sub.filters.map((def) => (
                      <ConfigDrivenFilter
                        key={def.label}
                        def={def}
                        filters={filters}
                        rangeFilters={rangeFilters}
                        onToggle={onToggle}
                        onToggleAll={onToggleAll}
                        onRangeChange={onRangeChange}
                        resetRange={resetRange}
                      />
                    ))}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  )
}
