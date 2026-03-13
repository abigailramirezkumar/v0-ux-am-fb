"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"

// ---------------------------------------------------------------------------
// Preview Module Shell
// ---------------------------------------------------------------------------
// A shared layout shell for all preview modules (Clips, Teams, Games).
// Provides consistent header, scrollable content area, and fixed footer.
// ---------------------------------------------------------------------------

interface PreviewModuleShellProps {
  /** Icon name to display in header */
  icon: string
  /** Primary title text */
  title: string
  /** Secondary subtitle text */
  subtitle?: string
  /** Close handler */
  onClose: () => void
  /** Main scrollable content */
  children: ReactNode
  /** Fixed footer content (action buttons) */
  footer?: ReactNode
}

export function PreviewModuleShell({
  icon,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: PreviewModuleShellProps) {
  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden relative">
      {/* Fixed Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name={icon} className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-bold truncate">{title}</span>
          {subtitle && (
            <>
              <span className="text-muted-foreground text-sm shrink-0">|</span>
              <span className="text-sm text-muted-foreground truncate">{subtitle}</span>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
        >
          <Icon name="close" className="w-4 h-4" />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {children}
      </div>

      {/* Fixed Footer */}
      {footer && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4 px-4 shrink-0">
          <div className="flex items-center gap-2">
            {footer}
          </div>
        </div>
      )}
    </div>
  )
}
