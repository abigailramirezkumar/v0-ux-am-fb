"use client"

import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Switch } from "@/components/ui/switch"
import { useLibraryContext } from "@/lib/library-context"
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown } from "lucide-react"

export function LibraryTableHeader() {
  const { columns, toggleColumnVisibility, sort, setSort } = useLibraryContext()

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="sticky top-0 z-10 flex items-center py-2 bg-background border-b border-border pt-1 min-w-fit">
          <div
            className="flex-1 min-w-[200px] pl-4 ml-4 cursor-pointer hover:text-foreground flex items-center gap-1 group"
            onClick={() => setSort("name")}
          >
            <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
              Name
            </span>
            {sort.columnId === "name" &&
              (sort.direction === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
          </div>

          <div className="flex items-center flex-shrink-0">
            {columns.map((column) =>
              column.visible ? (
                <div
                  key={column.id}
                  className={cn(
                    column.width,
                    "flex-shrink-0 ml-3 flex items-center gap-1 cursor-pointer hover:text-foreground group",
                    {
                      "justify-center": column.align === "center",
                      "justify-start": column.align === "left",
                      "justify-end": column.align === "right",
                    },
                  )}
                  onClick={() => setSort(column.id)}
                >
                  <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                    {column.label}
                  </span>
                  {sort.columnId === column.id &&
                    (sort.direction === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              ) : null,
            )}

            {/* Actions area spacer */}
            <div className="w-8 flex-shrink-0 ml-3 mr-4" />
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48 p-1.5 bg-popover rounded-xl shadow-lg border border-border">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => toggleColumnVisibility(column.id)}
          >
            <span className="text-sm text-foreground">{column.label}</span>
            <Switch
              checked={column.visible}
              onCheckedChange={() => toggleColumnVisibility(column.id)}
              onClick={(e) => e.stopPropagation()}
              className="scale-90"
            />
          </div>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}
