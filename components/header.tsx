"use client"
import { Icon } from "@/components/icon"
import { Button } from "@/components/button"
import { GlobalSearch } from "@/components/global-search"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

interface HeaderProps {
  className?: string
  title?: string
  onShareClick?: () => void
  onDownloadClick?: () => void
  showBack?: boolean
  onBackClick?: () => void
}

export function Header({
  className,
  title = "Content Title",
  onShareClick,
  onDownloadClick,
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

        <div className="flex-1 px-4">
          <GlobalSearch />
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
