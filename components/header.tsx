"use client"
import { Icon } from "@/components/icon"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

interface HeaderProps {
  className?: string
  title?: string
  onFilterClick?: () => void
  onShareClick?: () => void
  onDownloadClick?: () => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  showBack?: boolean
  onBackClick?: () => void
}

export function Header({
  className,
  title = "Content Title",
  onFilterClick,
  onShareClick,
  onDownloadClick,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search or filter...",
  showBack,
  onBackClick,
}: HeaderProps) {
  return (
    <header className={cn("bg-sidebar border-b-0 border-border px-4 py-3 font-sans border-none", className)}>
      <div className="flex items-center gap-4">
        {showBack ? (
          <button onClick={onBackClick} className="p-1 hover:bg-muted rounded transition-colors -ml-1">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        ) : (
          <Icon name="moduleGrid" className="w-5 h-5 text-muted-foreground" />
        )}

        <span className="text-foreground font-medium">{title}</span>

        {/* Filter Button */}
        <button onClick={onFilterClick} className="p-1 hover:bg-muted rounded transition-colors" aria-label="Filter">
          <Icon name="filter" className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pr-10 bg-background border-input focus:border-primary focus:ring-primary"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Icon name="search" className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="medium" onClick={onShareClick} className="flex items-center gap-2">
            <Icon name="share" className="w-4 h-4" />
            Share
          </Button>

          <Button variant="ghost" size="medium" onClick={onDownloadClick} className="flex items-center gap-2">
            <Icon name="download" className="w-4 h-4" />
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline-block w-4 h-4"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"></path>
            </svg>
            Download
          </Button>
        </div>
      </div>
    </header>
  )
}
