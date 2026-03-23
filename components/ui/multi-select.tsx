"use client"

import * as React from "react"
import { CheckIcon, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

interface MultiSelectOption {
  value: string
  label: string
  group?: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  allLabel?: string
  groupOrder?: string[]
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  disabled = false,
  allLabel = "All",
  groupOrder = [],
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const allSelected = value.length === options.length || value.length === 0
  const selectedCount = value.length

  const handleSelectAll = () => {
    if (allSelected || value.length === options.length) {
      // If all selected, select all (which is the same as none selected = all)
      onChange([])
    } else {
      // Select all
      onChange(options.map(o => o.value))
    }
  }

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      // Remove
      const newValue = value.filter(v => v !== optionValue)
      onChange(newValue)
    } else {
      // Add
      onChange([...value, optionValue])
    }
  }

  // Group options
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, MultiSelectOption[]> = {}
    const ungrouped: MultiSelectOption[] = []

    options.forEach(option => {
      if (option.group) {
        if (!groups[option.group]) {
          groups[option.group] = []
        }
        groups[option.group].push(option)
      } else {
        ungrouped.push(option)
      }
    })

    // Sort groups by groupOrder
    const sortedGroupNames = Object.keys(groups).sort((a, b) => {
      const aIdx = groupOrder.indexOf(a)
      const bIdx = groupOrder.indexOf(b)
      if (aIdx === -1 && bIdx === -1) return a.localeCompare(b)
      if (aIdx === -1) return 1
      if (bIdx === -1) return -1
      return aIdx - bIdx
    })

    return { groups, ungrouped, sortedGroupNames }
  }, [options, groupOrder])

  // Display text
  const displayText = React.useMemo(() => {
    if (allSelected || value.length === 0) {
      return allLabel
    }
    if (selectedCount === 1) {
      const selected = options.find(o => o.value === value[0])
      return selected?.label || value[0]
    }
    return `${selectedCount} selected`
  }, [allSelected, value, selectedCount, options, allLabel])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          className={cn(
            "flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background",
            "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <span className="truncate text-foreground">{displayText}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto">
          {/* All option */}
          <div
            className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-muted/50"
            onClick={handleSelectAll}
          >
            <Checkbox
              checked={allSelected || value.length === 0}
              onCheckedChange={() => handleSelectAll()}
              className="h-4 w-4 pointer-events-none"
            />
            <span className="text-sm font-medium">{allLabel}</span>
          </div>

          <div className="h-px bg-border" />

          {/* Ungrouped options */}
          {groupedOptions.ungrouped.map(option => (
            <div
              key={option.value}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-muted/50"
              onClick={() => handleToggle(option.value)}
            >
              <Checkbox
                checked={value.includes(option.value)}
                onCheckedChange={() => handleToggle(option.value)}
                className="h-4 w-4 pointer-events-none"
              />
              <span className="text-sm">{option.label}</span>
            </div>
          ))}

          {/* Grouped options */}
          {groupedOptions.sortedGroupNames.map(groupName => (
            <div key={groupName}>
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                {groupName}
              </div>
              {groupedOptions.groups[groupName].map(option => (
                <div
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-muted/50"
                  onClick={() => handleToggle(option.value)}
                >
                  <Checkbox
                    checked={value.includes(option.value)}
                    onCheckedChange={() => handleToggle(option.value)}
                    className="h-4 w-4 pointer-events-none"
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
