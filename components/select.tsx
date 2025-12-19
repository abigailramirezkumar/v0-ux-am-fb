"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectProps {
  label?: string
  error?: string
  hasError?: boolean
  placeholder?: string
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  required?: boolean
}

const Select = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Root>, SelectProps>(
  ({ label, error, hasError, placeholder, children, required, ...props }, ref) => {
    const selectId = React.useId()

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-bold text-foreground">
            {label}
            {required && <span className="text-[#e81c00] ml-1">*</span>}
          </label>
        )}
        <SelectPrimitive.Root {...props}>
          <SelectPrimitive.Trigger
            id={selectId}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border px-3 py-1 text-sm bg-card transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
              hasError || error
                ? "border-[#e81c00] focus-visible:ring-[#e81c00]"
                : "border-input focus-visible:ring-ring",
              "data-[placeholder]:text-muted-foreground",
            )}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon asChild>
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className={cn(
                "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
              )}
              position="popper"
              sideOffset={4}
            >
              <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
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
Select.displayName = "Select"

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = "SelectItem"

export { Select, SelectItem }
