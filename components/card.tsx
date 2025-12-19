import type * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.ComponentProps<"div"> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6",
        className,
      )}
      {...props}
    />
  )
}

interface CardHeaderProps extends React.ComponentProps<"div"> {}

function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div className={cn("grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6", className)} {...props} />
  )
}

interface CardTitleProps extends React.ComponentProps<"h3"> {}

function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn("leading-none font-semibold text-card-foreground", className)} {...props} />
}

interface CardDescriptionProps extends React.ComponentProps<"p"> {}

function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn("text-muted-foreground text-sm", className)} {...props} />
}

interface CardContentProps extends React.ComponentProps<"div"> {}

function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("px-6", className)} {...props} />
}

interface CardFooterProps extends React.ComponentProps<"div"> {}

function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cn("flex items-center px-6 gap-2", className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
