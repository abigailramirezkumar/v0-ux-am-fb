"use client"

import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Switch } from "@/components/ui/switch"
import { useLibraryContext } from "@/lib/library-context"
import { cn } from "@/lib/utils"

export function LibraryTableHeader() {
  const { columns, toggleColumnVisibility } = useLibraryContext()

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="sticky top-0 z-10 flex items-center py-2 bg-background border-b border-border pt-1 min-w-fit">
          {/* Name column - Always visible/Fixed */}
          <div className="flex-1 min-w-[200px] pl-4 ml-4">
            <span className="text-sm font-bold text-muted-foreground">Name</span>
          </div>

          {/* Dynamic metadata columns */}
          <div className="flex items-center flex-shrink-0">
            {columns.map((column) =>
              column.visible ? (
                <div
                  key={column.id}
                  className={cn(column.width, "flex-shrink-0 ml-3", {
                    "text-center": column.align === "center",
                    "text-left": column.align === "left",
                    "text-right": column.align === "right",
                  })}
                >
                  <span className="text-sm font-bold text-muted-foreground">{column.label}</span>
                </div>
              ) : null,
            )}

            {/* Actions area spacer */}
            <div className="w-8 flex-shrink-0 ml-3 mr-4" />
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-56 p-2 bg-popover">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-muted cursor-pointer"
            onClick={() => toggleColumnVisibility(column.id)}
          >
            <span className="text-sm font-medium text-foreground">{column.label}</span>
            <Switch
              checked={column.visible}
              onCheckedChange={() => toggleColumnVisibility(column.id)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}
