import type React from "react"
import { cn } from "@/lib/utils"

interface ModuleLibraryIconProps extends React.SVGAttributes<SVGElement> {
  size?: number
  className?: string
}

export function ModuleLibraryIcon({ size = 20, className, ...props }: ModuleLibraryIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block", className)}
      {...props}
    >
      <path
        d="M25 4.5C25 4.22386 25.2239 4 25.5 4H26.5C26.7761 4 27 4.22386 27 4.5V27.5C27 27.7761 26.7761 28 26.5 28H25.5C25.2239 28 25 27.7761 25 27.5V4.5Z"
        fill="currentColor"
      />
      <path
        d="M19 4.5C19 4.22386 19.2239 4 19.5 4H20.5C20.7761 4 21 4.22386 21 4.5V27.5C21 27.7761 20.7761 28 20.5 28H19.5C19.2239 28 19 27.7761 19 27.5V4.5Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 4.67202C15 4.33708 14.6771 4.09686 14.3563 4.1931L5.35633 6.8931C5.14483 6.95655 5 7.15121 5 7.37201V24.628C5 24.8488 5.14483 25.0434 5.35633 25.1069L14.3563 27.8069C14.6771 27.9031 15 27.6629 15 27.328V4.67202ZM13 6.68806L7 8.48806V23.5119L13 25.3119V6.68806Z"
        fill="currentColor"
      />
    </svg>
  )
}
