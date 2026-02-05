"use client"
import { Icon } from "@/components/icon"
import { Button } from "@/components/button"
import { GlobalSearch } from "@/components/global-search"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

interface HeaderProps {
  className?: string
  title?: string
  showBack?: boolean
  onBackClick?: () => void
}

export function Header({
  className,
  title = "Content Title",
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


      </div>
    </header>
  )
}
