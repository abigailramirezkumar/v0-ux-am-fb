"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface DatePickerProps {
  label?: string
  error?: string
  hasError?: boolean
  placeholder?: string
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ className, label, error, hasError, placeholder = "Pick a date", value, onChange, disabled, ...props }, ref) => {
    const inputId = React.useId()

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-bold text-foreground">
            {label}
          </label>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={inputId}
              ref={ref}
              variant="outline"
              disabled={disabled}
              className={cn(
                "flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-card transition-colors justify-start text-left font-normal",
                hasError || error
                  ? "border-[#e81c00] focus-visible:ring-[#e81c00]"
                  : "border-input focus-visible:ring-ring",
                !value && "text-muted-foreground",
                className,
              )}
              {...props}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "PPP") : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={value} onSelect={onChange} disabled={disabled} initialFocus />
          </PopoverContent>
        </Popover>
        {error && (
          <p className="text-xs text-[#e81c00] flex items-center gap-1">
            <span className="text-[#e81c00]">⚠</span>
            {error}
          </p>
        )}
      </div>
    )
  },
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
