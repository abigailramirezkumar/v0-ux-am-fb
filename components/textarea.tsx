import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hasError?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hasError, ...props }, ref) => {
    const textareaId = React.useId()

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-bold text-foreground">
            {label}
            {props.required && <span className="text-[#e81c00] ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm bg-card placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
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
Textarea.displayName = "Textarea"

export { Textarea }
