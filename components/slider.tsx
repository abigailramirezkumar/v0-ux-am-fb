"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

export interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  label?: string
  error?: string
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, label, error, ...props }, ref) => {
    const _values = React.useMemo(
      () =>
        Array.isArray(props.value)
          ? props.value
          : Array.isArray(props.defaultValue)
            ? props.defaultValue
            : [props.min || 0, props.max || 100],
      [props.value, props.defaultValue, props.min, props.max],
    )

    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium text-[#232a31] dark:text-white">{label}</label>}
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            "relative flex w-full touch-none select-none items-center",
            "data-[disabled]:opacity-50",
            "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
            className,
          )}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[#e5e7eb] dark:bg-[#374151]">
            <SliderPrimitive.Range className="absolute h-full bg-[#0273e3] dark:bg-[#0273e3]" />
          </SliderPrimitive.Track>
          {Array.from({ length: _values.length }, (_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              className={cn(
                "block h-5 w-5 rounded-full border-2 border-[#0273e3] bg-white shadow-sm transition-colors",
                "hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0273e3] focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                "dark:border-[#0273e3] dark:bg-white dark:hover:bg-[#f1f5f9]",
              )}
            />
          ))}
        </SliderPrimitive.Root>
        {error && (
          <p className="text-sm text-[#e81c00] dark:text-[#ef4444] flex items-center gap-1">
            <span className="text-[#e81c00] dark:text-[#ef4444]">⚠</span>
            {error}
          </p>
        )}
      </div>
    )
  },
)

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
