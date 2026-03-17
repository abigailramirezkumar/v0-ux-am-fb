"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"

// ---------------------------------------------------------------------------
// Preview Module Shell
// ---------------------------------------------------------------------------
// A shared layout shell for all preview modules (Clips, Teams, Games).
// Provides consistent header, scrollable content area, and fixed footer.
// Supports breadcrumb navigation for drill-down flows.
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  label: string
  onClick: () => void
}

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
  /** Breadcrumb trail for drill-down navigation */
  breadcrumbs?: BreadcrumbItem[]
}

export function PreviewModuleShell({
  icon,
  title,
  subtitle,
  onClose,
  children,
  footer,
  breadcrumbs,
}: PreviewModuleShellProps) {
  const hasBreadcrumbs = breadcrumbs && breadcrumbs.length > 0

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden relative">
      {/* Fixed Header */}
      <div className="flex flex-col border-b border-border/50 shrink-0">
        {/* Breadcrumbs row */}
        {hasBreadcrumbs && (
          <div className="flex items-center gap-1 px-4 pt-2 pb-1">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-1">
                <button
                  onClick={crumb.onClick}
                  className="text-xs text-[#0273e3] hover:text-[#0273e3]/80 hover:underline transition-colors"
                >
                  {crumb.label}
                </button>
                <Icon name="chevronRight" className="w-3 h-3 text-muted-foreground" />
              </div>
            ))}
            <span className="text-xs text-muted-foreground truncate">{title}</span>
          </div>
        )}
        
        {/* Main header row */}
        <div className="flex items-center justify-between px-4 py-2">
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
