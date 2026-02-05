"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { FilterState } from "@/hooks/use-explore-filters"
import { Button } from "@/components/ui/button"

interface FiltersModuleProps {
  filters: FilterState
  onToggle: (category: string, value: string) => void
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

// Filter row with circular checkbox
function FilterRow({
  label,
  count,
  isSelected,
  onClick,
  children,
}: {
  label: string
  count?: number
  isSelected?: boolean
  onClick?: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onClick !== undefined && (
            <button
              onClick={onClick}
              className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                isSelected
                  ? "border-foreground bg-foreground"
                  : "border-muted-foreground/40 bg-background hover:border-muted-foreground/60"
              )}
            >
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-background" />
              )}
            </button>
          )}
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

// Range slider with labels
function RangeSlider({
  min = 0,
  max = 100,
  value,
  onChange,
}: {
  min?: number
  max?: number
  value?: [number, number]
  onChange?: (value: [number, number]) => void
}) {
  return (
    <div className="space-y-2">
      <Slider
        min={min}
        max={max}
        value={value || [min, max]}
        onValueChange={(v) => onChange?.(v as [number, number])}
        className="[&_[data-slot=slider-track]]:bg-muted [&_[data-slot=slider-range]]:bg-foreground [&_[data-slot=slider-thumb]]:border-foreground [&_[data-slot=slider-thumb]]:w-3.5 [&_[data-slot=slider-thumb]]:h-3.5"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
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
  
  // Count active filters per section
  const getCount = (categories: string[]) => {
    return categories.reduce((acc, cat) => acc + (filters[cat]?.size || 0), 0)
  }

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

      {/* Results count */}
      <div className="px-4 py-2 border-b border-border bg-muted/50">
        <span className="text-xs text-muted-foreground">
          Showing <span className="text-foreground font-medium">{filteredCount}</span> of {totalCount} plays
        </span>
      </div>

      {/* Filter Sections */}
      <ScrollArea className="flex-1">
        <Accordion
          type="multiple"
          defaultValue={["game-context", "play-context"]}
          className="px-4"
        >
          {/* Game Context */}
          <AccordionItem value="game-context" className="border-b border-border">
            <AccordionTrigger className="py-3 hover:no-underline text-sm font-semibold text-foreground [&>svg]:text-muted-foreground">
              Game Context
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <FilterRow label="Down" count={123}>
                <ToggleGroup
                  items={[
                    { value: "1", label: "1st" },
                    { value: "2", label: "2nd" },
                    { value: "3", label: "3rd" },
                    { value: "4", label: "4th" },
                  ]}
                  category="down"
                  filters={filters}
                  onToggle={onToggle}
                />
              </FilterRow>

              <FilterRow label="Distance to first" count={128}>
                <ToggleGroup
                  items={[
                    { value: "Short: 1-3", label: "Short: 1-3" },
                    { value: "Medium: 4-7", label: "Medium: 4-7" },
                    { value: "Long: 8+", label: "Long: 8+" },
                  ]}
                  category="distanceType"
                  filters={filters}
                  onToggle={onToggle}
                />
                <RangeSlider min={0} max={100} />
              </FilterRow>

              <FilterRow label="Yard line" count={128}>
                <div className="pt-1">
                  <Slider
                    min={0}
                    max={100}
                    defaultValue={[50]}
                    className="[&_[data-slot=slider-track]]:bg-muted [&_[data-slot=slider-range]]:bg-foreground [&_[data-slot=slider-thumb]]:border-foreground [&_[data-slot=slider-thumb]]:w-3.5 [&_[data-slot=slider-thumb]]:h-3.5"
                  />
                  <div className="flex justify-center text-xs text-muted-foreground mt-2">
                    <span>50</span>
                  </div>
                </div>
              </FilterRow>

              <FilterRow label="Hash" count={123}>
                <ToggleGroup
                  items={[
                    { value: "L", label: "Left" },
                    { value: "M", label: "Middle" },
                    { value: "R", label: "Right" },
                  ]}
                  category="hash"
                  filters={filters}
                  onToggle={onToggle}
                />
              </FilterRow>
            </AccordionContent>
          </AccordionItem>

          {/* Play Context */}
          <AccordionItem value="play-context" className="border-b border-border">
            <AccordionTrigger className="py-3 hover:no-underline text-sm font-semibold text-foreground [&>svg]:text-muted-foreground">
              Play Context
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              <SubsectionHeader label="Play Development" />
              
              <FilterRow label="Play-action" count={123} />
              
              <FilterRow label="RPO" count={128}>
                <ToggleGroup
                  items={[
                    { value: "Pass", label: "Pass" },
                    { value: "Run", label: "Run" },
                  ]}
                  category="playType"
                  filters={filters}
                  onToggle={onToggle}
                />
              </FilterRow>

              <FilterRow label="Screen" count={123} />
              <FilterRow label="Designed rollout" count={123} />
              <FilterRow label="Broken Play" count={123} />

              <SubsectionHeader label="Play Result" />

              <FilterRow label="Touchdown" count={123}>
                <ToggleGroup
                  items={[
                    { value: "Pass", label: "Pass" },
                    { value: "Run", label: "Run" },
                    { value: "Defensive", label: "Defensive" },
                  ]}
                  category="touchdownType"
                  filters={filters}
                  onToggle={onToggle}
                />
              </FilterRow>

              <FilterRow label="First down earned" count={128}>
                <ToggleGroup
                  items={[
                    { value: "Pass", label: "Pass" },
                    { value: "Run", label: "Run" },
                  ]}
                  category="firstDownType"
                  filters={filters}
                  onToggle={onToggle}
                />
              </FilterRow>

              <FilterRow label="Turnover" count={123}>
                <ToggleGroup
                  items={[
                    { value: "Fumble", label: "Fumble" },
                    { value: "Interception", label: "Interception" },
                    { value: "On downs", label: "On downs" },
                  ]}
                  category="turnoverType"
                  filters={filters}
                  onToggle={onToggle}
                />
                <div className="pt-1">
                  <ToggleGroup
                    items={[{ value: "Safety", label: "Safety" }]}
                    category="turnoverType"
                    filters={filters}
                    onToggle={onToggle}
                  />
                </div>
              </FilterRow>

              <FilterRow label="Penalty" count={123}>
                <Select>
                  <SelectTrigger className="w-full h-9 text-sm border-border text-muted-foreground">
                    <SelectValue placeholder="Select penalty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="holding">Holding</SelectItem>
                    <SelectItem value="false-start">False Start</SelectItem>
                    <SelectItem value="offsides">Offsides</SelectItem>
                    <SelectItem value="pass-interference">Pass Interference</SelectItem>
                  </SelectContent>
                </Select>
              </FilterRow>
            </AccordionContent>
          </AccordionItem>

          {/* Passing */}
          <AccordionItem value="passing" className="border-b border-border">
            <AccordionTrigger className="py-3 hover:no-underline text-sm font-semibold text-foreground [&>svg]:text-muted-foreground">
              Passing
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              <SubsectionHeader label="Passing (Quarterback)" />

              <FilterRow label="Pass thrown" count={62}>
                <ToggleGroup
                  items={[
                    { value: "Complete", label: "Complete" },
                    { value: "Incomplete", label: "Incomplete" },
                  ]}
                  category="passResult"
                  filters={filters}
                  onToggle={onToggle}
                />
              </FilterRow>

              <FilterRow label="Pass thrown under pressure" count={59}>
                <ToggleGroup
                  items={[
                    { value: "Complete", label: "Complete" },
                    { value: "Incomplete", label: "Incomplete" },
                  ]}
                  category="passPressureResult"
                  filters={filters}
                  onToggle={onToggle}
                />
              </FilterRow>

              <FilterRow label="Scramble" count={17} />
              <FilterRow label="Sack taken" count={123} />
              <FilterRow label="Throwaway" count={123} />

              <SubsectionHeader label="Receiving" />

              <FilterRow label="Target / Pass targeted" count={13} />
              <FilterRow label="Reception" count={7} />
              <FilterRow label="Drop" count={17} />
              <FilterRow label="Contested catch" count={123} />

              <FilterRow label="Route type" count={123}>
                <Select>
                  <SelectTrigger className="w-full h-9 text-sm border-border text-muted-foreground">
                    <SelectValue placeholder="Select route type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slant">Slant</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="out">Out</SelectItem>
                    <SelectItem value="curl">Curl</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                  </SelectContent>
                </Select>
              </FilterRow>

              <FilterRow label="Depth of target" count={123}>
                <ToggleGroup
                  items={[
                    { value: "Behind LOS", label: "Behind LOS" },
                    { value: "0-10", label: "0-10" },
                    { value: "10-20", label: "10-20" },
                    { value: "20+", label: "20+" },
                  ]}
                  category="depthOfTarget"
                  filters={filters}
                  onToggle={onToggle}
                />
              </FilterRow>

              <SubsectionHeader label="Pass Defense" />

              <FilterRow label="Pass defended / Breakup" count={13} />
              <FilterRow label="Interception" count={7} />
              <FilterRow label="Sack made" count={17} />
              <FilterRow label="Pressure generated" count={123} />

              <FilterRow label="Coverage" count={123}>
                <Select>
                  <SelectTrigger className="w-full h-9 text-sm border-border text-muted-foreground">
                    <SelectValue placeholder="Select coverage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cov-1">Cover 1</SelectItem>
                    <SelectItem value="cov-2">Cover 2</SelectItem>
                    <SelectItem value="cov-3">Cover 3</SelectItem>
                    <SelectItem value="cov-4">Cover 4 / Quarters</SelectItem>
                  </SelectContent>
                </Select>
              </FilterRow>
            </AccordionContent>
          </AccordionItem>

          {/* Rushing */}
          <AccordionItem value="rushing" className="border-b border-border">
            <AccordionTrigger className="py-3 hover:no-underline text-sm font-semibold text-foreground [&>svg]:text-muted-foreground">
              Rushing
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              <SubsectionHeader label="Rushing (Ball Carrier)" />

              <FilterRow label="Rush attempt" count={62}>
                <ToggleGroup
                  items={[
                    { value: "Gn", label: "Gain" },
                    { value: "Ls", label: "Loss / No gain" },
                  ]}
                  category="gainLoss"
                  filters={filters}
                  onToggle={onToggle}
                />
              </FilterRow>

              <FilterRow label="Yards gained after contact" count={128}>
                <ToggleGroup
                  items={[
                    { value: "Short: 1-3", label: "Short: 1-3" },
                    { value: "Medium: 4-7", label: "Medium: 4-7" },
                    { value: "Long: 8+", label: "Long: 8+" },
                  ]}
                  category="yardsAfterContact"
                  filters={filters}
                  onToggle={onToggle}
                />
                <RangeSlider min={0} max={100} />
              </FilterRow>

              <FilterRow label="Rush direction" count={17}>
                <ToggleGroup
                  items={[
                    { value: "Left", label: "Left end" },
                    { value: "LeftTackle", label: "Left tackle" },
                    { value: "LeftGuard", label: "Left guard" },
                  ]}
                  category="runDirection"
                  filters={filters}
                  onToggle={onToggle}
                />
                <div className="pt-1">
                  <ToggleGroup
                    items={[
                      { value: "Middle", label: "Center" },
                      { value: "RightGuard", label: "Right guard" },
                      { value: "RightTackle", label: "Right tackle" },
                    ]}
                    category="runDirection"
                    filters={filters}
                    onToggle={onToggle}
                  />
                </div>
                <div className="pt-1">
                  <ToggleGroup
                    items={[{ value: "Right", label: "Right end" }]}
                    category="runDirection"
                    filters={filters}
                    onToggle={onToggle}
                  />
                </div>
              </FilterRow>

              <SubsectionHeader label="Rush Defense" />

              <FilterRow label="Tackle made" count={13} />
              <FilterRow label="Tackle missed" count={7} />
              <FilterRow label="Tackle for loss made" count={17} />
              <FilterRow label="Forced fumble" count={123} />
            </AccordionContent>
          </AccordionItem>

          {/* Blocking */}
          <AccordionItem value="blocking" className="border-b border-border">
            <AccordionTrigger className="py-3 hover:no-underline text-sm font-semibold text-foreground [&>svg]:text-muted-foreground">
              Blocking
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              <SubsectionHeader label="Offensive Line" />

              <FilterRow label="Pass block" count={62} />
              <FilterRow label="Run block" count={128} />
              <FilterRow label="Allowed pressure" count={17} />
              <FilterRow label="Allowed sack" count={123} />
            </AccordionContent>
          </AccordionItem>

          {/* Special Teams */}
          <AccordionItem value="special-teams" className="border-b-0">
            <AccordionTrigger className="py-3 hover:no-underline text-sm font-semibold text-foreground [&>svg]:text-muted-foreground">
              Special Teams
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              <FilterRow label="Field goal attempt" count={17}>
                <ToggleGroup
                  items={[
                    { value: "Made", label: "Made" },
                    { value: "Missed", label: "Missed" },
                    { value: "Blocked", label: "Blocked" },
                    { value: "Fake", label: "Fake" },
                  ]}
                  category="fieldGoalResult"
                  filters={filters}
                  onToggle={onToggle}
                />
              </FilterRow>

              <FilterRow label="PAT attempt" count={17}>
                <ToggleGroup
                  items={[
                    { value: "Made", label: "Made" },
                    { value: "Missed", label: "Missed" },
                    { value: "Blocked", label: "Blocked" },
                  ]}
                  category="patResult"
                  filters={filters}
                  onToggle={onToggle}
                />
              </FilterRow>

              <FilterRow label="Punt" count={62}>
                <ToggleGroup
                  items={[
                    { value: "Regular", label: "Regular" },
                    { value: "Fake", label: "Fake" },
                    { value: "Touchback", label: "Touchback" },
                  ]}
                  category="puntType"
                  filters={filters}
                  onToggle={onToggle}
                />
                <div className="pt-1">
                  <ToggleGroup
                    items={[
                      { value: "Out of bounds", label: "Out of bounds" },
                      { value: "Returned", label: "Returned" },
                      { value: "Downed", label: "Downed" },
                    ]}
                    category="puntType"
                    filters={filters}
                    onToggle={onToggle}
                  />
                </div>
              </FilterRow>

              <FilterRow label="Punt return" count={128}>
                <ToggleGroup
                  items={[
                    { value: "Short: 0-10", label: "Short: 0-10" },
                    { value: "Medium: 10-20", label: "Medium: 10-20" },
                    { value: "Long: 20+", label: "Long: 20+" },
                  ]}
                  category="puntReturnYards"
                  filters={filters}
                  onToggle={onToggle}
                />
                <RangeSlider min={0} max={100} />
              </FilterRow>

              <FilterRow label="Kickoff" count={123}>
                <ToggleGroup
                  items={[
                    { value: "Regular", label: "Regular" },
                    { value: "Onside", label: "Onside" },
                    { value: "Touchback", label: "Touchback" },
                  ]}
                  category="kickoffType"
                  filters={filters}
                  onToggle={onToggle}
                />
                <div className="pt-1">
                  <ToggleGroup
                    items={[
                      { value: "Out of bounds", label: "Out of bounds" },
                      { value: "Returned", label: "Returned" },
                      { value: "Downed", label: "Downed" },
                    ]}
                    category="kickoffType"
                    filters={filters}
                    onToggle={onToggle}
                  />
                </div>
              </FilterRow>

              <FilterRow label="Kickoff return" count={128}>
                <ToggleGroup
                  items={[
                    { value: "Short: 0-10", label: "Short: 0-10" },
                    { value: "Medium: 10-20", label: "Medium: 10-20" },
                    { value: "Long: 20+", label: "Long: 20+" },
                  ]}
                  category="kickoffReturnYards"
                  filters={filters}
                  onToggle={onToggle}
                />
                <RangeSlider min={0} max={100} />
              </FilterRow>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  )
}
