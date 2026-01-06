"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/checkbox"

interface FilterSidebarProps {
  filters: {
    downs: number[]
    quarters: number[]
    playTypes: string[]
    personnel: string[]
  }
  onFilterChange: (filters: FilterSidebarProps["filters"]) => void
}

export function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const toggleFilter = (category: keyof typeof filters, value: number | string) => {
    const current = filters[category] as (number | string)[]
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    onFilterChange({ ...filters, [category]: updated })
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Filters</div>

      <Accordion type="multiple" defaultValue={["situation", "result", "personnel"]} className="space-y-2">
        {/* Situation Section */}
        <AccordionItem value="situation" className="border border-border rounded-lg px-3">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">Situation</AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-2">Down</div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((down) => (
                  <label key={down} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.downs.includes(down)}
                      onCheckedChange={() => toggleFilter("downs", down)}
                    />
                    <span className="text-xs">{down}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Quarter</div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((qtr) => (
                  <label key={qtr} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.quarters.includes(qtr)}
                      onCheckedChange={() => toggleFilter("quarters", qtr)}
                    />
                    <span className="text-xs">Q{qtr}</span>
                  </label>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Result Section */}
        <AccordionItem value="result" className="border border-border rounded-lg px-3">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">Result</AccordionTrigger>
          <AccordionContent className="pb-4 space-y-2">
            <div className="text-xs text-muted-foreground mb-2">Play Type</div>
            {["Pass", "Run", "Special Teams"].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.playTypes.includes(type)}
                  onCheckedChange={() => toggleFilter("playTypes", type)}
                />
                <span className="text-xs">{type}</span>
              </label>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Personnel Section */}
        <AccordionItem value="personnel" className="border border-border rounded-lg px-3">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">Personnel</AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-2">Offensive Personnel</div>
              <div className="space-y-2">
                {["11 Pers", "12 Pers", "21 Pers", "22 Pers"].map((pers) => (
                  <label key={pers} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.personnel.includes(pers)}
                      onCheckedChange={() => toggleFilter("personnel", pers)}
                    />
                    <span className="text-xs">{pers}</span>
                  </label>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Drive Section */}
        <AccordionItem value="drive" className="border border-border rounded-lg px-3">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">Drive</AccordionTrigger>
          <AccordionContent className="pb-4 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox />
              <span className="text-xs">Red Zone</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox />
              <span className="text-xs">Goal Line</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox />
              <span className="text-xs">2-Minute Drill</span>
            </label>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
