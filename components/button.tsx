import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-[#0273e3] text-white hover:bg-[#0273e3]/90",
        secondary: "bg-[#85909e] text-white hover:bg-[#85909e]/90",
        subtle: "bg-[#e0e1e1] text-[#36485c] hover:bg-[#e0e1e1]/80",
        destructive: "bg-[#e81c00] text-white hover:bg-[#e81c00]/90",
        success: "bg-[#548309] text-white hover:bg-[#548309]/90",
      },
      size: {
        large: "h-12 px-6 py-3 text-base",
        medium: "h-10 px-4 py-2",
        small: "h-8 px-3 py-1.5 text-sm",
        xsmall: "h-6 px-2 py-1 text-xs",
      },
      iconVariant: {
        none: "",
        left: "",
        right: "",
        iconOnly: "px-0 aspect-square",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
      iconVariant: "none",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, iconVariant, icon, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const isIconOnly = iconVariant === "iconOnly"

    return (
      <Comp className={cn(buttonVariants({ variant, size, iconVariant, className }))} ref={ref} {...props}>
        {icon && iconVariant === "left" && !isIconOnly && <Icon name={icon} className="w-4 h-4" />}
        {icon && isIconOnly && <Icon name={icon} className="w-4 h-4" />}
        {!isIconOnly && children}
        {icon && iconVariant === "right" && !isIconOnly && <Icon name={icon} className="w-4 h-4" />}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
