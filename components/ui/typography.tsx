import * as React from "react"
import { cn } from "@/lib/utils"

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?:
    | "display-large"
    | "display-medium"
    | "display-small"
    | "lead-large"
    | "lead-medium"
    | "lead-small"
    | "title-xxlarge"
    | "title-xlarge"
    | "title-large"
    | "title-medium"
    | "title-small"
    | "title-xsmall"
    | "text-large"
    | "text-default"
    | "text-small"
    | "text-micro"
  as?: React.ElementType
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = "text-default", as, ...props }, ref) => {
    const Component = as || getDefaultElement(variant)

    return <Component className={cn(getVariantClasses(variant), className)} ref={ref} {...props} />
  },
)

Typography.displayName = "Typography"

function getDefaultElement(variant: string): React.ElementType {
  if (variant.startsWith("display")) return "h1"
  if (variant.startsWith("title")) return "h2"
  if (variant.startsWith("lead")) return "p"
  return "p"
}

function getVariantClasses(variant: string): string {
  const variants = {
    // Display styles - Bold Italic
    "display-large": "text-6xl font-bold italic leading-[100%] tracking-tight",
    "display-medium": "text-5xl font-bold italic leading-[100%] tracking-tight",
    "display-small": "text-3xl font-bold italic leading-[100%] tracking-tight",

    // Lead styles - Medium weight
    "lead-large": "text-2xl font-medium leading-[140%]",
    "lead-medium": "text-xl font-medium leading-[140%]",
    "lead-small": "text-lg font-medium leading-[140%]",

    // Title styles - Bold weight
    "title-xxlarge": "text-4xl font-bold leading-[120%]",
    "title-xlarge": "text-3xl font-bold leading-[120%]",
    "title-large": "text-2xl font-bold leading-[120%] uppercase tracking-wide",
    "title-medium": "text-xl font-bold leading-[120%]",
    "title-small": "text-lg font-bold leading-[120%]",
    "title-xsmall": "text-base font-bold leading-[120%]",

    // Text styles - Medium weight
    "text-large": "text-lg font-medium leading-[140%]",
    "text-default": "text-base font-medium leading-[140%]",
    "text-small": "text-sm font-medium leading-[140%]",
    "text-micro": "text-xs font-medium leading-[140%]",
  }

  return variants[variant as keyof typeof variants] || variants["text-default"]
}

export { Typography }
