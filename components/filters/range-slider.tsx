"use client"

import { Slider } from "@/components/ui/slider"

export interface RangeSliderProps {
  /** Minimum slider value. Defaults to 0. */
  min?: number
  /** Maximum slider value. Defaults to 100. */
  max?: number
  /** Current [low, high] value of the two thumbs. */
  value: [number, number]
  /** Callback fired when either thumb is moved. */
  onChange: (value: [number, number]) => void
}

/**
 * A dual-thumb range slider with min/max value labels underneath.
 * Wraps the shadcn `<Slider>` component with consistent styling.
 */
export function RangeSlider({ min = 0, max = 100, value, onChange }: RangeSliderProps) {
  return (
    <div className="space-y-2">
      <Slider
        min={min}
        max={max}
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
        className="[&_[data-slot=slider-track]]:bg-muted [&_[data-slot=slider-range]]:bg-foreground [&_[data-slot=slider-thumb]]:border-foreground [&_[data-slot=slider-thumb]]:w-3.5 [&_[data-slot=slider-thumb]]:h-3.5"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{value[0]}</span>
        <span>{value[1]}</span>
      </div>
    </div>
  )
}
