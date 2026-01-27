"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectItem } from "@/components/select"
import { cn } from "@/lib/utils"

export interface FilterState {
  downs: number[]
  distance: number[]
  yardLine: number[]
  hash: string[]
  playContext: string[]
  playResult: string[]
  passing: string[]
  rushing: string[]
  blocking: string[]
  specialTeams: string[]
}

interface FilterSidebarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

// Filter row component with radio button, label, and count
function FilterRow({ 
  label, 
  count, 
  checked, 
  onChange,
  children 
}: { 
  label: string
  count: number
  checked: boolean
  onChange: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button 
          onClick={onChange}
          className="flex items-center gap-2 text-left"
        >
          <div className={cn(
            "h-4 w-4 rounded-full border flex items-center justify-center",
            checked ? "border-[#3d4a5c]" : "border-[#85909e]"
          )}>
            {checked && <div className="h-2 w-2 rounded-full bg-[#3d4a5c]" />}
          </div>
          <span className="text-sm text-foreground">{label}</span>
        </button>
        <span className="text-sm text-muted-foreground">{count}</span>
      </div>
      {children}
    </div>
  )
}

// Toggle badge component
function ToggleBadge({ 
  label, 
  selected, 
  onClick,
  className
}: { 
  label: string
  selected: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs font-medium transition-colors",
        selected 
          ? "bg-[#64748b] text-white" 
          : "bg-[#3f4a5a] text-[#9ca3af] hover:bg-[#4a5568]",
        className
      )}
    >
      {label}
    </button>
  )
}

// Preset button for sliders
function PresetButton({ 
  label, 
  selected, 
  onClick,
  className
}: { 
  label: string
  selected: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs font-medium transition-colors",
        selected 
          ? "bg-[#64748b] text-white" 
          : "bg-[#3f4a5a] text-[#9ca3af] hover:bg-[#4a5568]",
        className
      )}
    >
      {label}
    </button>
  )
}

// Section header component
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-semibold text-muted-foreground uppercase tracking-wide text-xs leading-8">
      {children}
    </span>
  )
}

export function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  
  const updateFilter = (category: keyof FilterState, value: any, type: "toggle" | "set" | "range" = "toggle") => {
    const current = filters[category] as any[]
    let next: any[] = []

    if (type === "range") {
      next = value
    } else if (type === "set") {
      next = value
    } else {
      next = current.includes(value) 
        ? current.filter(i => i !== value)
        : [...current, value]
    }
    
    onFilterChange({ ...filters, [category]: next })
  }

  const isInRange = (range: number[], min: number, max: number) => {
    return range[0] === min && range[1] === max
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-4 border-b border-border sticky top-0 bg-background z-10 flex justify-between items-center">
        <span className="text-sm font-semibold">Filters</span>
        <Button variant="ghost" size="sm" onClick={() => onFilterChange({
          downs: [], distance: [0, 100], yardLine: [50], hash: [],
          playContext: [], playResult: [], passing: [], rushing: [], blocking: [], specialTeams: []
        })}>
          Reset
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["gameContext", "playContext"]} className="px-4 pb-8">
        
        {/* GAME CONTEXT */}
        <AccordionItem value="gameContext" className="border-b border-border">
          <AccordionTrigger className="text-sm font-semibold py-3">Game Context</AccordionTrigger>
          <AccordionContent className="space-y-5 pb-4">
            
            {/* Down */}
            <FilterRow label="Down" count={123} checked={filters.downs.length > 0} onChange={() => {}}>
              <div className="flex pl-6">
                {[1, 2, 3, 4].map((d, i) => (
                  <ToggleBadge 
                    key={d}
                    label={`${d}${d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'}`}
                    selected={filters.downs.includes(d)}
                    onClick={() => updateFilter("downs", d)}
                    className={cn(
                      i === 0 && "rounded-l",
                      i === 3 && "rounded-r"
                    )}
                  />
                ))}
              </div>
            </FilterRow>

            {/* Distance to first */}
            <FilterRow label="Distance to first" count={128} checked={!isInRange(filters.distance, 0, 100)} onChange={() => {}}>
              <div className="pl-6 space-y-2">
                <div className="flex">
                  <PresetButton label="Short: 1-3" selected={isInRange(filters.distance, 1, 3)} onClick={() => updateFilter("distance", [1, 3], "range")} className="rounded-l" />
                  <PresetButton label="Medium: 4-7" selected={isInRange(filters.distance, 4, 7)} onClick={() => updateFilter("distance", [4, 7], "range")} />
                  <PresetButton label="Long: 8+" selected={isInRange(filters.distance, 8, 100)} onClick={() => updateFilter("distance", [8, 100], "range")} className="rounded-r" />
                </div>
                <Slider 
                  value={filters.distance} 
                  min={0} max={100} step={1} 
                  onValueChange={(val) => updateFilter("distance", val, "range")} 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{filters.distance[0]}</span>
                  <span>{filters.distance[1]}</span>
                </div>
              </div>
            </FilterRow>

            {/* Yard line */}
            <FilterRow label="Yard line" count={128} checked={filters.yardLine[0] !== 50} onChange={() => {}}>
              <div className="pl-6 space-y-2">
                <Slider 
                  value={filters.yardLine} 
                  min={0} max={100} step={1} 
                  onValueChange={(val) => updateFilter("yardLine", val, "range")} 
                />
                <div className="flex justify-center text-xs text-muted-foreground">
                  <span>{filters.yardLine[0]}</span>
                </div>
              </div>
            </FilterRow>

            {/* Hash */}
            <FilterRow label="Hash" count={123} checked={filters.hash.length > 0} onChange={() => {}}>
              <div className="flex pl-6">
                {["Left", "Middle", "Right"].map((h, i) => (
                  <ToggleBadge 
                    key={h}
                    label={h}
                    selected={filters.hash.includes(h)}
                    onClick={() => updateFilter("hash", h)}
                    className={cn(
                      i === 0 && "rounded-l",
                      i === 2 && "rounded-r"
                    )}
                  />
                ))}
              </div>
            </FilterRow>

          </AccordionContent>
        </AccordionItem>

        {/* PLAY CONTEXT */}
        <AccordionItem value="playContext" className="border-b border-border">
          <AccordionTrigger className="text-sm font-semibold py-3">Play Context</AccordionTrigger>
          <AccordionContent className="space-y-5 pb-4">
            
            <SectionHeader>Play Development</SectionHeader>
            
            <FilterRow label="Play-action" count={123} checked={filters.playContext.includes("playAction")} onChange={() => updateFilter("playContext", "playAction")} />
            
            <FilterRow label="RPO" count={128} checked={filters.playContext.some(i => i.startsWith("rpo"))} onChange={() => {}}>
              <div className="flex pl-6">
                <ToggleBadge label="Pass" selected={filters.playContext.includes("rpo-Pass")} onClick={() => updateFilter("playContext", "rpo-Pass")} className="rounded-l" />
                <ToggleBadge label="Run" selected={filters.playContext.includes("rpo-Run")} onClick={() => updateFilter("playContext", "rpo-Run")} className="rounded-r" />
              </div>
            </FilterRow>

            <FilterRow label="Screen" count={123} checked={filters.playContext.includes("screen")} onChange={() => updateFilter("playContext", "screen")} />
            <FilterRow label="Designed rollout" count={123} checked={filters.playContext.includes("designedRollout")} onChange={() => updateFilter("playContext", "designedRollout")} />
            <FilterRow label="Broken Play" count={123} checked={filters.playContext.includes("brokenPlay")} onChange={() => updateFilter("playContext", "brokenPlay")} />

            <SectionHeader>Play Result</SectionHeader>

            <FilterRow label="Touchdown" count={123} checked={filters.playResult.some(i => i.startsWith("td"))} onChange={() => {}}>
              <div className="flex pl-6">
                <ToggleBadge label="Pass" selected={filters.playResult.includes("td-Pass")} onClick={() => updateFilter("playResult", "td-Pass")} className="rounded-l" />
                <ToggleBadge label="Run" selected={filters.playResult.includes("td-Run")} onClick={() => updateFilter("playResult", "td-Run")} />
                <ToggleBadge label="Defensive" selected={filters.playResult.includes("td-Defensive")} onClick={() => updateFilter("playResult", "td-Defensive")} className="rounded-r" />
              </div>
            </FilterRow>

            <FilterRow label="First down earned" count={128} checked={filters.playResult.some(i => i.startsWith("fd"))} onChange={() => {}}>
              <div className="flex pl-6">
                <ToggleBadge label="Pass" selected={filters.playResult.includes("fd-Pass")} onClick={() => updateFilter("playResult", "fd-Pass")} className="rounded-l" />
                <ToggleBadge label="Run" selected={filters.playResult.includes("fd-Run")} onClick={() => updateFilter("playResult", "fd-Run")} className="rounded-r" />
              </div>
            </FilterRow>

            <FilterRow label="Turnover" count={123} checked={filters.playResult.some(i => i.startsWith("to"))} onChange={() => {}}>
              <div className="pl-6 space-y-1">
                <div className="flex">
                  <ToggleBadge label="Fumble" selected={filters.playResult.includes("to-Fumble")} onClick={() => updateFilter("playResult", "to-Fumble")} className="rounded-l" />
                  <ToggleBadge label="Interception" selected={filters.playResult.includes("to-Interception")} onClick={() => updateFilter("playResult", "to-Interception")} />
                  <ToggleBadge label="On downs" selected={filters.playResult.includes("to-OnDowns")} onClick={() => updateFilter("playResult", "to-OnDowns")} className="rounded-r" />
                </div>
                <div className="flex">
                  <ToggleBadge label="Safety" selected={filters.playResult.includes("to-Safety")} onClick={() => updateFilter("playResult", "to-Safety")} className="rounded" />
                </div>
              </div>
            </FilterRow>

            <FilterRow label="Penalty" count={123} checked={filters.playResult.some(i => i.startsWith("penalty"))} onChange={() => {}}>
              <div className="pl-6">
                <Select placeholder="Select penalty" onValueChange={(val) => updateFilter("playResult", `penalty-${val}`)}>
                  <SelectItem value="holding">Holding</SelectItem>
                  <SelectItem value="offside">Offside</SelectItem>
                  <SelectItem value="falseStart">False Start</SelectItem>
                  <SelectItem value="passInterference">Pass Interference</SelectItem>
                </Select>
              </div>
            </FilterRow>

          </AccordionContent>
        </AccordionItem>

        {/* PASSING */}
        <AccordionItem value="passing" className="border-b border-border">
          <AccordionTrigger className="text-sm font-semibold py-3">Passing</AccordionTrigger>
          <AccordionContent className="space-y-5 pb-4">
            
            <SectionHeader>Passing (Quarterback)</SectionHeader>
            
            <FilterRow label="Pass thrown" count={62} checked={filters.passing.some(i => i.startsWith("thrown"))} onChange={() => {}}>
              <div className="flex pl-6">
                <ToggleBadge label="Complete" selected={filters.passing.includes("thrown-Complete")} onClick={() => updateFilter("passing", "thrown-Complete")} className="rounded-l" />
                <ToggleBadge label="Incomplete" selected={filters.passing.includes("thrown-Incomplete")} onClick={() => updateFilter("passing", "thrown-Incomplete")} className="rounded-r" />
              </div>
            </FilterRow>

            <FilterRow label="Pass thrown under pressure" count={59} checked={filters.passing.some(i => i.startsWith("pressure"))} onChange={() => {}}>
              <div className="flex pl-6">
                <ToggleBadge label="Complete" selected={filters.passing.includes("pressure-Complete")} onClick={() => updateFilter("passing", "pressure-Complete")} className="rounded-l" />
                <ToggleBadge label="Incomplete" selected={filters.passing.includes("pressure-Incomplete")} onClick={() => updateFilter("passing", "pressure-Incomplete")} className="rounded-r" />
              </div>
            </FilterRow>

            <FilterRow label="Scramble" count={17} checked={filters.passing.includes("scramble")} onChange={() => updateFilter("passing", "scramble")} />
            <FilterRow label="Sack taken" count={123} checked={filters.passing.includes("sackTaken")} onChange={() => updateFilter("passing", "sackTaken")} />
            <FilterRow label="Throwaway" count={123} checked={filters.passing.includes("throwaway")} onChange={() => updateFilter("passing", "throwaway")} />

            <SectionHeader>Receiving</SectionHeader>

            <FilterRow label="Target / Pass targeted" count={13} checked={filters.passing.includes("target")} onChange={() => updateFilter("passing", "target")} />
            <FilterRow label="Reception" count={7} checked={filters.passing.includes("reception")} onChange={() => updateFilter("passing", "reception")} />
            <FilterRow label="Drop" count={17} checked={filters.passing.includes("drop")} onChange={() => updateFilter("passing", "drop")} />
            <FilterRow label="Contested catch" count={123} checked={filters.passing.includes("contested")} onChange={() => updateFilter("passing", "contested")} />
            
            <FilterRow label="Route type" count={123} checked={filters.passing.some(i => i.startsWith("route"))} onChange={() => {}}>
              <div className="pl-6">
                <Select placeholder="Select route type" onValueChange={(val) => updateFilter("passing", `route-${val}`)}>
                  <SelectItem value="slant">Slant</SelectItem>
                  <SelectItem value="out">Out</SelectItem>
                  <SelectItem value="in">In</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="corner">Corner</SelectItem>
                </Select>
              </div>
            </FilterRow>

            <FilterRow label="Depth of target" count={123} checked={filters.passing.some(i => i.startsWith("depth"))} onChange={() => {}}>
              <div className="flex pl-6">
                <ToggleBadge label="Behind LOS" selected={filters.passing.includes("depth-BehindLOS")} onClick={() => updateFilter("passing", "depth-BehindLOS")} className="rounded-l" />
                <ToggleBadge label="0-10" selected={filters.passing.includes("depth-0-10")} onClick={() => updateFilter("passing", "depth-0-10")} />
                <ToggleBadge label="10-20" selected={filters.passing.includes("depth-10-20")} onClick={() => updateFilter("passing", "depth-10-20")} />
                <ToggleBadge label="20+" selected={filters.passing.includes("depth-20+")} onClick={() => updateFilter("passing", "depth-20+")} className="rounded-r" />
              </div>
            </FilterRow>

            <SectionHeader>Pass Defense</SectionHeader>

            <FilterRow label="Pass defended / Breakup" count={13} checked={filters.passing.includes("defended")} onChange={() => updateFilter("passing", "defended")} />
            <FilterRow label="Interception" count={7} checked={filters.passing.includes("interception")} onChange={() => updateFilter("passing", "interception")} />
            <FilterRow label="Sack made" count={17} checked={filters.passing.includes("sackMade")} onChange={() => updateFilter("passing", "sackMade")} />
            <FilterRow label="Pressure generated" count={123} checked={filters.passing.includes("pressureGenerated")} onChange={() => updateFilter("passing", "pressureGenerated")} />
            
            <FilterRow label="Coverage" count={123} checked={filters.passing.some(i => i.startsWith("coverage"))} onChange={() => {}}>
              <div className="pl-6">
                <Select placeholder="Select coverage" onValueChange={(val) => updateFilter("passing", `coverage-${val}`)}>
                  <SelectItem value="man">Man</SelectItem>
                  <SelectItem value="zone">Zone</SelectItem>
                  <SelectItem value="cover2">Cover 2</SelectItem>
                  <SelectItem value="cover3">Cover 3</SelectItem>
                </Select>
              </div>
            </FilterRow>

          </AccordionContent>
        </AccordionItem>

        {/* RUSHING */}
        <AccordionItem value="rushing" className="border-b border-border">
          <AccordionTrigger className="text-sm font-semibold py-3">Rushing</AccordionTrigger>
          <AccordionContent className="space-y-5 pb-4">
            
            <SectionHeader>Rushing (Ball Carrier)</SectionHeader>
            
            <FilterRow label="Rush attempt" count={62} checked={filters.rushing.some(i => i.startsWith("attempt"))} onChange={() => {}}>
              <div className="flex pl-6">
                <ToggleBadge label="Gain" selected={filters.rushing.includes("attempt-Gain")} onClick={() => updateFilter("rushing", "attempt-Gain")} className="rounded-l" />
                <ToggleBadge label="Loss / No gain" selected={filters.rushing.includes("attempt-Loss")} onClick={() => updateFilter("rushing", "attempt-Loss")} className="rounded-r" />
              </div>
            </FilterRow>

            <FilterRow label="Yards gained after contact" count={128} checked={filters.rushing.some(i => i.startsWith("yac"))} onChange={() => {}}>
              <div className="pl-6 space-y-2">
                <div className="flex">
                  <PresetButton label="Short: 1-3" selected={filters.rushing.includes("yac-1-3")} onClick={() => updateFilter("rushing", "yac-1-3")} className="rounded-l" />
                  <PresetButton label="Medium: 4-7" selected={filters.rushing.includes("yac-4-7")} onClick={() => updateFilter("rushing", "yac-4-7")} />
                  <PresetButton label="Long: 8+" selected={filters.rushing.includes("yac-8+")} onClick={() => updateFilter("rushing", "yac-8+")} className="rounded-r" />
                </div>
                <Slider 
                  value={[0, 100]} 
                  min={0} max={100} step={1} 
                  onValueChange={() => {}} 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
            </FilterRow>

            <FilterRow label="Rush direction" count={17} checked={filters.rushing.some(i => i.startsWith("dir"))} onChange={() => {}}>
              <div className="pl-6 space-y-1">
                <div className="flex">
                  <ToggleBadge label="Left end" selected={filters.rushing.includes("dir-LeftEnd")} onClick={() => updateFilter("rushing", "dir-LeftEnd")} className="rounded-l" />
                  <ToggleBadge label="Left tackle" selected={filters.rushing.includes("dir-LeftTackle")} onClick={() => updateFilter("rushing", "dir-LeftTackle")} />
                  <ToggleBadge label="Left guard" selected={filters.rushing.includes("dir-LeftGuard")} onClick={() => updateFilter("rushing", "dir-LeftGuard")} className="rounded-r" />
                </div>
                <div className="flex">
                  <ToggleBadge label="Center" selected={filters.rushing.includes("dir-Center")} onClick={() => updateFilter("rushing", "dir-Center")} className="rounded-l" />
                  <ToggleBadge label="Right guard" selected={filters.rushing.includes("dir-RightGuard")} onClick={() => updateFilter("rushing", "dir-RightGuard")} />
                  <ToggleBadge label="Right tackle" selected={filters.rushing.includes("dir-RightTackle")} onClick={() => updateFilter("rushing", "dir-RightTackle")} className="rounded-r" />
                </div>
                <div className="flex">
                  <ToggleBadge label="Right end" selected={filters.rushing.includes("dir-RightEnd")} onClick={() => updateFilter("rushing", "dir-RightEnd")} className="rounded" />
                </div>
              </div>
            </FilterRow>

            <SectionHeader>Rush Defense</SectionHeader>

            <FilterRow label="Tackle made" count={13} checked={filters.rushing.includes("tackleMade")} onChange={() => updateFilter("rushing", "tackleMade")} />
            <FilterRow label="Tackle missed" count={7} checked={filters.rushing.includes("tackleMissed")} onChange={() => updateFilter("rushing", "tackleMissed")} />
            <FilterRow label="Tackle for loss made" count={17} checked={filters.rushing.includes("tfl")} onChange={() => updateFilter("rushing", "tfl")} />
            <FilterRow label="Forced fumble" count={123} checked={filters.rushing.includes("forcedFumble")} onChange={() => updateFilter("rushing", "forcedFumble")} />

          </AccordionContent>
        </AccordionItem>

        {/* BLOCKING */}
        <AccordionItem value="blocking" className="border-b border-border">
          <AccordionTrigger className="text-sm font-semibold py-3">Blocking</AccordionTrigger>
          <AccordionContent className="space-y-5 pb-4">
            
            <SectionHeader>Offensive Line</SectionHeader>
            
            <FilterRow label="Pass block" count={62} checked={filters.blocking.includes("passBlock")} onChange={() => updateFilter("blocking", "passBlock")} />
            <FilterRow label="Run block" count={128} checked={filters.blocking.includes("runBlock")} onChange={() => updateFilter("blocking", "runBlock")} />
            <FilterRow label="Allowed pressure" count={17} checked={filters.blocking.includes("allowedPressure")} onChange={() => updateFilter("blocking", "allowedPressure")} />
            <FilterRow label="Allowed sack" count={123} checked={filters.blocking.includes("allowedSack")} onChange={() => updateFilter("blocking", "allowedSack")} />

          </AccordionContent>
        </AccordionItem>

        {/* SPECIAL TEAMS */}
        <AccordionItem value="specialTeams" className="border-b border-border">
          <AccordionTrigger className="text-sm font-semibold py-3">Special Teams</AccordionTrigger>
          <AccordionContent className="space-y-5 pb-4">
            
            <FilterRow label="Field goal attempt" count={17} checked={filters.specialTeams.some(i => i.startsWith("fg"))} onChange={() => {}}>
              <div className="flex pl-6">
                <ToggleBadge label="Made" selected={filters.specialTeams.includes("fg-Made")} onClick={() => updateFilter("specialTeams", "fg-Made")} className="rounded-l" />
                <ToggleBadge label="Missed" selected={filters.specialTeams.includes("fg-Missed")} onClick={() => updateFilter("specialTeams", "fg-Missed")} />
                <ToggleBadge label="Blocked" selected={filters.specialTeams.includes("fg-Blocked")} onClick={() => updateFilter("specialTeams", "fg-Blocked")} />
                <ToggleBadge label="Fake" selected={filters.specialTeams.includes("fg-Fake")} onClick={() => updateFilter("specialTeams", "fg-Fake")} className="rounded-r" />
              </div>
            </FilterRow>

            <FilterRow label="PAT attempt" count={17} checked={filters.specialTeams.some(i => i.startsWith("pat"))} onChange={() => {}}>
              <div className="flex pl-6">
                <ToggleBadge label="Made" selected={filters.specialTeams.includes("pat-Made")} onClick={() => updateFilter("specialTeams", "pat-Made")} className="rounded-l" />
                <ToggleBadge label="Missed" selected={filters.specialTeams.includes("pat-Missed")} onClick={() => updateFilter("specialTeams", "pat-Missed")} />
                <ToggleBadge label="Blocked" selected={filters.specialTeams.includes("pat-Blocked")} onClick={() => updateFilter("specialTeams", "pat-Blocked")} className="rounded-r" />
              </div>
            </FilterRow>

            <FilterRow label="Punt" count={62} checked={filters.specialTeams.some(i => i.startsWith("punt-") && !i.startsWith("puntReturn"))} onChange={() => {}}>
              <div className="pl-6 space-y-1">
                <div className="flex">
                  <ToggleBadge label="Regular" selected={filters.specialTeams.includes("punt-Regular")} onClick={() => updateFilter("specialTeams", "punt-Regular")} className="rounded-l" />
                  <ToggleBadge label="Fake" selected={filters.specialTeams.includes("punt-Fake")} onClick={() => updateFilter("specialTeams", "punt-Fake")} />
                  <ToggleBadge label="Touchback" selected={filters.specialTeams.includes("punt-Touchback")} onClick={() => updateFilter("specialTeams", "punt-Touchback")} className="rounded-r" />
                </div>
                <div className="flex">
                  <ToggleBadge label="Out of bounds" selected={filters.specialTeams.includes("punt-OOB")} onClick={() => updateFilter("specialTeams", "punt-OOB")} className="rounded-l" />
                  <ToggleBadge label="Returned" selected={filters.specialTeams.includes("punt-Returned")} onClick={() => updateFilter("specialTeams", "punt-Returned")} />
                  <ToggleBadge label="Downed" selected={filters.specialTeams.includes("punt-Downed")} onClick={() => updateFilter("specialTeams", "punt-Downed")} className="rounded-r" />
                </div>
              </div>
            </FilterRow>

            <FilterRow label="Punt return" count={128} checked={filters.specialTeams.some(i => i.startsWith("puntReturn"))} onChange={() => {}}>
              <div className="pl-6 space-y-2">
                <div className="flex">
                  <PresetButton label="Short: 0-10" selected={filters.specialTeams.includes("puntReturn-0-10")} onClick={() => updateFilter("specialTeams", "puntReturn-0-10")} className="rounded-l" />
                  <PresetButton label="Medium: 10-20" selected={filters.specialTeams.includes("puntReturn-10-20")} onClick={() => updateFilter("specialTeams", "puntReturn-10-20")} />
                  <PresetButton label="Long: 20+" selected={filters.specialTeams.includes("puntReturn-20+")} onClick={() => updateFilter("specialTeams", "puntReturn-20+")} className="rounded-r" />
                </div>
                <Slider 
                  value={[0, 100]} 
                  min={0} max={100} step={1} 
                  onValueChange={() => {}} 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
            </FilterRow>

            <FilterRow label="Kickoff" count={123} checked={filters.specialTeams.some(i => i.startsWith("kickoff-") && !i.startsWith("kickoffReturn"))} onChange={() => {}}>
              <div className="pl-6 space-y-1">
                <div className="flex">
                  <ToggleBadge label="Regular" selected={filters.specialTeams.includes("kickoff-Regular")} onClick={() => updateFilter("specialTeams", "kickoff-Regular")} className="rounded-l" />
                  <ToggleBadge label="Onside" selected={filters.specialTeams.includes("kickoff-Onside")} onClick={() => updateFilter("specialTeams", "kickoff-Onside")} />
                  <ToggleBadge label="Touchback" selected={filters.specialTeams.includes("kickoff-Touchback")} onClick={() => updateFilter("specialTeams", "kickoff-Touchback")} className="rounded-r" />
                </div>
                <div className="flex">
                  <ToggleBadge label="Out of bounds" selected={filters.specialTeams.includes("kickoff-OOB")} onClick={() => updateFilter("specialTeams", "kickoff-OOB")} className="rounded-l" />
                  <ToggleBadge label="Returned" selected={filters.specialTeams.includes("kickoff-Returned")} onClick={() => updateFilter("specialTeams", "kickoff-Returned")} />
                  <ToggleBadge label="Downed" selected={filters.specialTeams.includes("kickoff-Downed")} onClick={() => updateFilter("specialTeams", "kickoff-Downed")} className="rounded-r" />
                </div>
              </div>
            </FilterRow>

            <FilterRow label="Kickoff return" count={128} checked={filters.specialTeams.some(i => i.startsWith("kickoffReturn"))} onChange={() => {}}>
              <div className="pl-6 space-y-2">
                <div className="flex">
                  <PresetButton label="Short: 0-10" selected={filters.specialTeams.includes("kickoffReturn-0-10")} onClick={() => updateFilter("specialTeams", "kickoffReturn-0-10")} className="rounded-l" />
                  <PresetButton label="Medium: 10-20" selected={filters.specialTeams.includes("kickoffReturn-10-20")} onClick={() => updateFilter("specialTeams", "kickoffReturn-10-20")} />
                  <PresetButton label="Long: 20+" selected={filters.specialTeams.includes("kickoffReturn-20+")} onClick={() => updateFilter("specialTeams", "kickoffReturn-20+")} className="rounded-r" />
                </div>
                <Slider 
                  value={[0, 100]} 
                  min={0} max={100} step={1} 
                  onValueChange={() => {}} 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
            </FilterRow>

          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  )
}
