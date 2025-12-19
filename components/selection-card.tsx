"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "./checkbox"

interface SelectionCardProps {
  id: string
  selected?: boolean
  onChange?: (selected: boolean) => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function SelectionCard({
  id,
  selected = false,
  onChange,
  children,
  className,
  disabled = false,
  ...props
}: SelectionCardProps) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!selected)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      role="checkbox"
      aria-checked={selected}
      aria-labelledby={`${id}-label`}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Base styles - Updated to match screenshot with rounded corners and proper spacing
        "relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200",
        // Default state - Using border-border for default gray border
        "border-border bg-card hover:border-muted-foreground/50",
        selected && "border-primary bg-card ring-1 ring-primary/20",
        // Disabled state
        disabled && "cursor-not-allowed opacity-50",
        // Focus styles
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className,
      )}
      {...props}
    >
      <div className="absolute right-4 top-4">
        <Checkbox
          checked={selected}
          disabled={disabled}
          className="h-6 w-6"
          // Prevent the checkbox from triggering its own click event
          onClick={(e) => e.stopPropagation()}
          // Ensure the checkbox doesn't interfere with card selection
          onCheckedChange={() => {}} // Empty handler since card handles the state
        />
      </div>

      {/* Content - Added proper spacing for content area */}
      <div id={`${id}-label`} className="pr-10">
        {children}
      </div>
    </div>
  )
}

interface SelectionCardGroupProps {
  value?: string[]
  onChange?: (value: string[]) => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function SelectionCardGroup({
  value = [],
  onChange,
  children,
  className,
  disabled = false,
}: SelectionCardGroupProps) {
  const handleCardChange = (cardId: string, selected: boolean) => {
    if (!onChange) return

    if (selected) {
      onChange([...value, cardId])
    } else {
      onChange(value.filter((id) => id !== cardId))
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectionCard) {
          const cardId = child.props.id
          const isSelected = value.includes(cardId)

          return React.cloneElement(child, {
            selected: isSelected,
            onChange: (selected: boolean) => handleCardChange(cardId, selected),
            disabled: disabled || child.props.disabled,
          })
        }
        return child
      })}
    </div>
  )
}
