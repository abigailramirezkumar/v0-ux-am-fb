"use client"

import Link from "next/link"
import { Icon } from "@/components/icon"
import { useLibraryContext, type WatchBreadcrumbItem } from "@/lib/library-context"

/**
 * WatchBreadcrumb - Displays navigation breadcrumbs in the watch app
 * 
 * Shows the path taken to reach the watch app, e.g.:
 * - Athletes / Patrick Mahomes / Highlights
 * - Search Results / Game Film
 * - Library / Offense / Red Zone Plays
 */
export function WatchBreadcrumb() {
  const { watchBreadcrumb } = useLibraryContext()

  // Don't render if no breadcrumb is set
  if (!watchBreadcrumb || watchBreadcrumb.length === 0) {
    return null
  }

  const getIcon = (iconName?: WatchBreadcrumbItem["icon"]) => {
    if (!iconName) return null
    
    switch (iconName) {
      case "explore":
        return <Icon name="explore" className="w-4 h-4" />
      case "search":
        return <Icon name="search" className="w-4 h-4" />
      case "library":
        return <LibraryIcon className="w-3 h-3" />
      case "athlete":
        return <Icon name="jersey" className="w-4 h-4" />
      case "team":
        return <Icon name="teams" className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <nav className="flex items-center gap-2 text-sm px-3 py-2 bg-background/50 border-b border-border/50" aria-label="Navigation breadcrumb">
      {watchBreadcrumb.map((item, index) => {
        const isLast = index === watchBreadcrumb.length - 1
        const icon = getIcon(item.icon)

        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-muted-foreground">/</span>}
            
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                {icon}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className={`flex items-center gap-1.5 ${isLast ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {icon}
                <span>{item.label}</span>
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg
      width="11"
      height="12"
      viewBox="0 0 11 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 0.249998C10 0.111927 10.1119 -1.76803e-06 10.25 -1.79217e-06L10.75 -1.87959e-06C10.8881 -1.90373e-06 11 0.111927 11 0.249998L11 11.75C11 11.8881 10.8881 12 10.75 12L10.25 12C10.1119 12 10 11.8881 10 11.75L10 0.249998Z"
        fill="currentColor"
      />
      <path
        d="M7 0.249999C7 0.111927 7.11193 -1.24349e-06 7.25 -1.26763e-06L7.75 -1.35505e-06C7.88807 -1.37919e-06 8 0.111927 8 0.249999L8 11.75C8 11.8881 7.88807 12 7.75 12L7.25 12C7.11193 12 7 11.8881 7 11.75L7 0.249999Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 0.336007C5 0.168541 4.83857 0.0484293 4.67816 0.0965502L0.178163 1.44655C0.0724173 1.47827 2.75488e-07 1.57561 2.94791e-07 1.68601L1.80336e-06 10.314C1.82266e-06 10.4244 0.0724186 10.5217 0.178165 10.5534L4.67817 11.9034C4.83857 11.9516 5 11.8315 5 11.664L5 0.336007ZM4 1.34403L1 2.24403L1 9.75597L4 10.656L4 1.34403Z"
        fill="currentColor"
      />
    </svg>
  )
}
