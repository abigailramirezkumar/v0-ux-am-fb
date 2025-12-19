import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hasError?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hasError, ...props }, ref) => {
    const inputId = React.useId()

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-bold text-foreground">
            {label}
            {props.required && <span className="text-[#e81c00] ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-card transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
            hasError || error
              ? "border-[#e81c00] focus-visible:ring-[#e81c00]"
              : "border-input focus-visible:ring-ring",
            className,
          )}
          ref={ref}
          {...props}
        />
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
Input.displayName = "Input"

export { Input }
