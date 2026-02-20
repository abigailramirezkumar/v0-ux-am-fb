"use client"

export function ReportsModule() {
  return (
    <div className="h-full w-full flex flex-col bg-background rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center h-10 px-3 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
          Reports
        </span>
      </div>

      {/* Body placeholder */}
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        <p>Reports will appear here</p>
      </div>
    </div>
  )
}
