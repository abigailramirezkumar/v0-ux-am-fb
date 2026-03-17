"use client"

import { useCallback, useMemo } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { FilterState, RangeFilterState, AnyFilterCategory, RangeCategory } from "@/types/filters"
import { getRangeValue } from "@/types/filters"
import {
  FILTER_SECTIONS,
  DEFAULT_OPEN_SECTIONS,
  RANGE_DEFAULTS,
  type FilterDef,
  type ToggleFilterDef,
  type ToggleWithRangeFilterDef,
  type RangeFilterDef,
  type SelectFilterDef,
} from "@/lib/filter-config"
import { ToggleGroup } from "@/components/filters/toggle-group"
import { ToggleGroupWithRange } from "@/components/filters/toggle-group-with-range"
import { RangeSlider } from "@/components/filters/range-slider"
import { FilterRow } from "@/components/filters/filter-row"
import { SubsectionHeader } from "@/components/filters/subsection-header"
import { Icon } from "@/components/icon"

// ---------------------------------------------------------------------------
// Types for active filter chips
// ---------------------------------------------------------------------------
interface ActiveFilterChip {
  id: string
  label: string
  type: "toggle" | "range"
  category?: AnyFilterCategory
  value?: string
  rangeCategory?: RangeCategory
}

// ---------------------------------------------------------------------------
// Build a lookup from category+value to display label
// ---------------------------------------------------------------------------
function buildLabelLookup(): Map<string, string> {
  const lookup = new Map<string, string>()
  
  for (const section of FILTER_SECTIONS) {
    for (const subsection of section.subsections) {
      for (const def of subsection.filters) {
        if (def.type === "toggle" || def.type === "toggleWithRange") {
          const d = def as ToggleFilterDef | ToggleWithRangeFilterDef
          for (const group of d.groups) {
            for (const item of group) {
              lookup.set(`${d.category}:${item.value}`, item.label)
            }
          }
        }
      }
    }
  }
  
  return lookup
}

const LABEL_LOOKUP = buildLabelLookup()

// Build category to section label lookup
function buildCategoryLabelLookup(): Map<string, string> {
  const lookup = new Map<string, string>()
  
  for (const section of FILTER_SECTIONS) {
    for (const subsection of section.subsections) {
      for (const def of subsection.filters) {
        if (def.type === "toggle" || def.type === "toggleWithRange") {
          const d = def as ToggleFilterDef | ToggleWithRangeFilterDef
          lookup.set(d.category, def.label)
        } else if (def.type === "range") {
          const d = def as RangeFilterDef
          lookup.set(d.rangeCategory, def.label)
        } else if (def.type === "boolean") {
          // Boolean filters use normalized key pattern
          const key = `_filter_${def.label.toLowerCase().replace(/ /g, "_")}`
          lookup.set(key, def.label)
        }
      }
    }
  }
  
  return lookup
}

const CATEGORY_LABEL_LOOKUP = buildCategoryLabelLookup()

interface FiltersModuleProps {
  filters: FilterState
  rangeFilters: RangeFilterState
  onToggle: (category: AnyFilterCategory, value: string) => void
  onToggleAll: (category: AnyFilterCategory, allValues: string[]) => void
  onRangeChange: (category: RangeCategory, value: [number, number], defaultRange: [number, number]) => void
  onClear: () => void
  uniqueGames: string[]
  activeFilterCount: number
  totalCount: number
  filteredCount: number
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
  onToggle: (category: AnyFilterCategory, value: string) => void
  onToggleAll: (category: AnyFilterCategory, allValues: string[]) => void
  onRangeChange: (category: RangeCategory, value: [number, number], defaultRange: [number, number]) => void
  resetRange: (category: RangeCategory, defaultRange: [number, number]) => void
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
            value={getRangeValue(rangeFilters, d.rangeCategory, d.rangeDefault)}
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
            value={getRangeValue(rangeFilters, d.rangeCategory, d.rangeDefault)}
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
    (category: RangeCategory, defaultRange: [number, number]) => {
      onRangeChange(category, defaultRange, defaultRange)
    },
    [onRangeChange]
  )
  
  // Compute active filter chips for display
  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = []
    
    // Add set-based filter chips
    for (const [category, values] of Object.entries(filters)) {
      if (values && values.size > 0) {
        const categoryLabel = CATEGORY_LABEL_LOOKUP.get(category) || category
        
        for (const value of values) {
          const displayLabel = LABEL_LOOKUP.get(`${category}:${value}`) || value
          chips.push({
            id: `${category}:${value}`,
            label: `${categoryLabel}: ${displayLabel}`,
            type: "toggle",
            category: category as AnyFilterCategory,
            value,
          })
        }
      }
    }
    
    // Add range filter chips
    for (const [rangeCategory, value] of Object.entries(rangeFilters)) {
      if (value) {
        const categoryLabel = CATEGORY_LABEL_LOOKUP.get(rangeCategory) || rangeCategory
        const [min, max] = value
        chips.push({
          id: `range:${rangeCategory}`,
          label: `${categoryLabel}: ${min}-${max}`,
          type: "range",
          rangeCategory: rangeCategory as RangeCategory,
        })
      }
    }
    
    return chips
  }, [filters, rangeFilters])
  
  // Handler to remove a single filter chip
  const removeChip = useCallback((chip: ActiveFilterChip) => {
    if (chip.type === "toggle" && chip.category && chip.value) {
      onToggle(chip.category, chip.value)
    } else if (chip.type === "range" && chip.rangeCategory) {
      const defaults = RANGE_DEFAULTS[chip.rangeCategory]
      if (defaults) {
        onRangeChange(chip.rangeCategory, defaults.default, defaults.default)
      }
    }
  }, [onToggle, onRangeChange])

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded">
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

      {/* Active Filters Section */}
      {activeFilterChips.length > 0 && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Active Filters
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => removeChip(chip)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[#0273e3]/10 text-[#0273e3] rounded-md hover:bg-[#0273e3]/20 transition-colors group"
              >
                <span className="max-w-[150px] truncate">{chip.label}</span>
                <Icon 
                  name="close" 
                  size={12} 
                  className="opacity-60 group-hover:opacity-100 transition-opacity" 
                />
              </button>
            ))}
          </div>
        </div>
      )}

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
