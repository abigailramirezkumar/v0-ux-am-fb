"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/checkbox"
import { Slider } from "@/components/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface FilterState {
  downs: number[]
  distance: number[]
  yardLine: number[]
  hash: string[]
  playContext: string[] // e.g. "playAction", "rpo-Pass"
  playResult: string[] // e.g. "touchdown-Pass"
  passing: string[]
  rushing: string[]
  specialTeams: string[]
}

interface FilterSidebarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

export function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  
  const updateFilter = (category: keyof FilterState, value: any, type: "toggle" | "set" | "range" = "toggle") => {
    const current = filters[category] as any[]
    let next: any[] = []

    if (type === "range") {
      next = value // Value is [min, max]
    } else if (type === "set") {
        // For exclusive sets or direct assignment
        next = value
    } else {
      // Toggle logic
      next = current.includes(value) 
        ? current.filter(i => i !== value)
        : [...current, value]
    }
    
    onFilterChange({ ...filters, [category]: next })
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-4 border-b border-border sticky top-0 bg-background z-10 flex justify-between items-center">
        <span className="text-sm font-semibold">Filters</span>
        <Button variant="ghost" size="sm" onClick={() => onFilterChange({
            downs: [], distance: [0, 20], yardLine: [0, 100], hash: [],
            playContext: [], playResult: [], passing: [], rushing: [], specialTeams: []
        })}>
          Reset
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["gameContext", "playContext"]} className="px-4 pb-8">
        
        {/* GAME CONTEXT */}
        <AccordionItem value="gameContext" className="border-b border-border">
          <AccordionTrigger className="text-sm font-bold py-4">Game Context</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2">
            
            {/* Down */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Down</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(d => (
                  <Button 
                    key={d} 
                    variant={filters.downs.includes(d) ? "primary" : "outline"}
                    size="sm"
                    className="flex-1 h-8"
                    onClick={() => updateFilter("downs", d)}
                  >
                    {d}{d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Distance to First</span>
              <div className="flex gap-2 mb-2">
                <Button variant="outline" size="xsmall" className="flex-1" onClick={() => updateFilter("distance", [1, 3], "range")}>Short (1-3)</Button>
                <Button variant="outline" size="xsmall" className="flex-1" onClick={() => updateFilter("distance", [4, 7], "range")}>Med (4-7)</Button>
                <Button variant="outline" size="xsmall" className="flex-1" onClick={() => updateFilter("distance", [8, 20], "range")}>Long (8+)</Button>
              </div>
              <Slider 
                value={filters.distance} 
                min={0} max={20} step={1} 
                onValueChange={(val) => updateFilter("distance", val, "range")} 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{filters.distance[0]}</span>
                <span>{filters.distance[1]}+</span>
              </div>
            </div>

            {/* Yard Line */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Yard Line</span>
              <Slider 
                value={filters.yardLine} 
                min={0} max={100} step={1} 
                onValueChange={(val) => updateFilter("yardLine", val, "range")} 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Own End</span>
                <span>50</span>
                <span>Opp End</span>
              </div>
            </div>

            {/* Hash */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Hash</span>
              <div className="flex rounded-md shadow-sm" role="group">
                {["Left", "Middle", "Right"].map((h) => (
                  <Button
                    key={h}
                    variant={filters.hash.includes(h) ? "primary" : "outline"}
                    size="sm"
                    className="flex-1 rounded-none first:rounded-l-md last:rounded-r-md border-r-0 last:border-r"
                    onClick={() => updateFilter("hash", h)}
                  >
                    {h}
                  </Button>
                ))}
              </div>
            </div>

          </AccordionContent>
        </AccordionItem>

        {/* PLAY CONTEXT */}
        <AccordionItem value="playContext" className="border-b border-border">
          <AccordionTrigger className="text-sm font-bold py-4">Play Context</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2">
            
            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Play Development</span>
              <div className="space-y-2">
                <Checkbox label="Play-action" checked={filters.playContext.includes("playAction")} onCheckedChange={() => updateFilter("playContext", "playAction")} />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Checkbox label="RPO" checked={filters.playContext.some(i => i.startsWith("rpo"))} onCheckedChange={() => {
                      // Toggle all RPO options
                      const hasRpo = filters.playContext.some(i => i.startsWith("rpo"))
                      if (hasRpo) {
                        onFilterChange({ ...filters, playContext: filters.playContext.filter(i => !i.startsWith("rpo")) })
                      }
                    }} />
                  </div>
                  <div className="pl-6 flex gap-2">
                    <Badge variant={filters.playContext.includes("rpo-Pass") ? "default" : "outline"} className="cursor-pointer" onClick={() => updateFilter("playContext", "rpo-Pass")}>Pass</Badge>
                    <Badge variant={filters.playContext.includes("rpo-Run") ? "default" : "outline"} className="cursor-pointer" onClick={() => updateFilter("playContext", "rpo-Run")}>Run</Badge>
                  </div>
                </div>

                <Checkbox label="Screen" checked={filters.playContext.includes("screen")} onCheckedChange={() => updateFilter("playContext", "screen")} />
                <Checkbox label="Designed Rollout" checked={filters.playContext.includes("designedRollout")} onCheckedChange={() => updateFilter("playContext", "designedRollout")} />
                <Checkbox label="Broken Play" checked={filters.playContext.includes("brokenPlay")} onCheckedChange={() => updateFilter("playContext", "brokenPlay")} />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Play Result</span>
              <div className="space-y-2">
                 {/* Touchdown with Sub-options */}
                 <div className="space-y-2">
                    <Checkbox label="Touchdown" checked={filters.playResult.some(i => i.startsWith("td"))} onCheckedChange={() => {
                      const hasTd = filters.playResult.some(i => i.startsWith("td"))
                      if (hasTd) {
                        onFilterChange({ ...filters, playResult: filters.playResult.filter(i => !i.startsWith("td")) })
                      }
                    }} />
                    <div className="pl-6 flex flex-wrap gap-2">
                      {["Pass", "Run", "Defensive"].map(t => (
                        <Badge 
                          key={t}
                          variant={filters.playResult.includes(`td-${t}`) ? "default" : "outline"}
                          className="cursor-pointer text-[10px] h-5"
                          onClick={() => updateFilter("playResult", `td-${t}`)}
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                 </div>
                 
                 {/* First Down */}
                 <div className="space-y-2">
                    <Checkbox label="First Down" checked={filters.playResult.some(i => i.startsWith("fd"))} onCheckedChange={() => {
                      const hasFd = filters.playResult.some(i => i.startsWith("fd"))
                      if (hasFd) {
                        onFilterChange({ ...filters, playResult: filters.playResult.filter(i => !i.startsWith("fd")) })
                      }
                    }} />
                    <div className="pl-6 flex flex-wrap gap-2">
                      {["Pass", "Run"].map(t => (
                        <Badge 
                          key={t}
                          variant={filters.playResult.includes(`fd-${t}`) ? "default" : "outline"}
                          className="cursor-pointer text-[10px] h-5"
                          onClick={() => updateFilter("playResult", `fd-${t}`)}
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                 </div>

                 {/* Turnover */}
                 <div className="space-y-2">
                    <Checkbox label="Turnover" checked={filters.playResult.some(i => i.startsWith("to"))} onCheckedChange={() => {
                      const hasTo = filters.playResult.some(i => i.startsWith("to"))
                      if (hasTo) {
                        onFilterChange({ ...filters, playResult: filters.playResult.filter(i => !i.startsWith("to")) })
                      }
                    }} />
                    <div className="pl-6 flex flex-wrap gap-2">
                      {["Fumble", "Interception", "On downs"].map(t => (
                        <Badge 
                          key={t}
                          variant={filters.playResult.includes(`to-${t}`) ? "default" : "outline"}
                          className="cursor-pointer text-[10px] h-5"
                          onClick={() => updateFilter("playResult", `to-${t}`)}
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                 </div>
              </div>
            </div>

          </AccordionContent>
        </AccordionItem>

        {/* PASSING */}
        <AccordionItem value="passing" className="border-b border-border">
          <AccordionTrigger className="text-sm font-bold py-4">Passing</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
             <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Pass Result</span>
                <Checkbox label="Complete" checked={filters.passing.includes("result-Complete")} onCheckedChange={() => updateFilter("passing", "result-Complete")} />
                <Checkbox label="Incomplete" checked={filters.passing.includes("result-Incomplete")} onCheckedChange={() => updateFilter("passing", "result-Incomplete")} />
             </div>

             <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Quarterback</span>
                <Checkbox label="Scramble" checked={filters.passing.includes("scramble")} onCheckedChange={() => updateFilter("passing", "scramble")} />
                <Checkbox label="Sack Taken" checked={filters.passing.includes("sack")} onCheckedChange={() => updateFilter("passing", "sack")} />
                <Checkbox label="Throwaway" checked={filters.passing.includes("throwaway")} onCheckedChange={() => updateFilter("passing", "throwaway")} />
             </div>

             <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Receiver</span>
                <Checkbox label="Drop" checked={filters.passing.includes("drop")} onCheckedChange={() => updateFilter("passing", "drop")} />
                <Checkbox label="Contested Catch" checked={filters.passing.includes("contested")} onCheckedChange={() => updateFilter("passing", "contested")} />
             </div>
             
             <div className="space-y-2">
               <span className="text-xs font-semibold text-muted-foreground uppercase">Depth of Target</span>
               <div className="grid grid-cols-2 gap-2">
                 {["Behind LOS", "0-10", "10-20", "20+"].map(d => (
                   <Button 
                      key={d}
                      variant={filters.passing.includes(`depth-${d}`) ? "primary" : "outline"}
                      size="xsmall"
                      onClick={() => updateFilter("passing", `depth-${d}`)}
                   >
                     {d}
                   </Button>
                 ))}
               </div>
             </div>
          </AccordionContent>
        </AccordionItem>

        {/* RUSHING */}
        <AccordionItem value="rushing" className="border-b border-border">
          <AccordionTrigger className="text-sm font-bold py-4">Rushing</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
             <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Result</span>
                <Checkbox label="Gain" checked={filters.rushing.includes("attempt-Gain")} onCheckedChange={() => updateFilter("rushing", "attempt-Gain")} />
                <Checkbox label="Loss / No gain" checked={filters.rushing.includes("attempt-Loss")} onCheckedChange={() => updateFilter("rushing", "attempt-Loss")} />
             </div>

             <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Direction</span>
                <div className="grid grid-cols-3 gap-1">
                   {["Left end", "Left tackle", "Left guard", "Center", "Right guard", "Right tackle", "Right end"].map((d, idx) => (
                     <Button 
                        key={d}
                        variant={filters.rushing.includes(`dir-${d}`) ? "primary" : "outline"}
                        size="xsmall"
                        className={cn(
                          "text-[10px] h-7",
                          d === "Center" && "col-start-2",
                          d === "Right end" && "col-start-3"
                        )}
                        onClick={() => updateFilter("rushing", `dir-${d}`)}
                     >
                       {d === "Center" ? "Center" : `${d.split(' ')[0][0]} ${d.split(' ')[1]}`}
                     </Button>
                   ))}
                </div>
             </div>

             <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Defense</span>
                <Checkbox label="TFL (Tackle for Loss)" checked={filters.rushing.includes("tfl")} onCheckedChange={() => updateFilter("rushing", "tfl")} />
                <Checkbox label="Forced Fumble" checked={filters.rushing.includes("forcedFumble")} onCheckedChange={() => updateFilter("rushing", "forcedFumble")} />
             </div>
          </AccordionContent>
        </AccordionItem>

        {/* SPECIAL TEAMS */}
        <AccordionItem value="specialTeams" className="border-b border-border">
          <AccordionTrigger className="text-sm font-bold py-4">Special Teams</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
             <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Play Type</span>
                <Checkbox label="Field Goal" checked={filters.specialTeams.includes("type-Field Goal")} onCheckedChange={() => updateFilter("specialTeams", "type-Field Goal")} />
                <Checkbox label="PAT" checked={filters.specialTeams.includes("type-PAT")} onCheckedChange={() => updateFilter("specialTeams", "type-PAT")} />
                <Checkbox label="Punt" checked={filters.specialTeams.includes("type-Punt")} onCheckedChange={() => updateFilter("specialTeams", "type-Punt")} />
                <Checkbox label="Kickoff" checked={filters.specialTeams.includes("type-Kickoff")} onCheckedChange={() => updateFilter("specialTeams", "type-Kickoff")} />
             </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  )
}
