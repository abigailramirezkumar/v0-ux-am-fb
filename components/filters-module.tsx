"use client"

import { useCallback } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { FilterState, RangeFilterState, AnyFilterCategory, RangeCategory } from "@/types/filters"
import { getRangeValue } from "@/types/filters"
import {
  FILTER_SECTIONS,
  DEFAULT_OPEN_SECTIONS,
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
