"use client"

import type React from "react"

import { useLibraryContext } from "@/lib/library-context"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icon"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

export function LibraryTableHeader() {
  const { columns, sort, setSort, toggleColumnVisibility, moveColumn } = useLibraryContext()
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedColumnId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (!draggedColumnId || draggedColumnId === id) return

    const dragIndex = columns.findIndex((c) => c.id === draggedColumnId)
    const hoverIndex = columns.findIndex((c) => c.id === id)

    // Don't allow moving before fixed columns
    if (columns[hoverIndex].fixed) return

    moveColumn(dragIndex, hoverIndex)
  }

  const handleDragEnd = () => {
    setDraggedColumnId(null)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="sticky top-0 z-10 flex items-center py-2 bg-background border-b border-border pt-1 min-w-fit">
          {columns.map((col) => {
            if (!col.visible) return null

            return (
              <div
                key={col.id}
                draggable={!col.fixed}
                onDragStart={(e) => handleDragStart(e, col.id)}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragEnd={handleDragEnd}
                onClick={() => setSort(col.id)}
                className={cn(
                  "flex items-center gap-1 text-sm font-bold text-muted-foreground select-none transition-colors hover:text-foreground cursor-pointer group",
                  col.width,
                  col.fixed ? "pl-4 ml-4" : "ml-3",
                  col.align === "right" && "justify-end",
                  col.align === "center" && "justify-center",
                  draggedColumnId === col.id && "opacity-50",
                )}
              >
                {col.label}

                {/* Sort Icon */}
                <div className="w-4 flex justify-center">
                  {sort.columnId === col.id ? (
                    <Icon
                      name={sort.direction === "asc" ? "chevronUp" : "chevronDown"}
                      size={14}
                      className="text-primary"
                    />
                  ) : (
                    <Icon
                      name="sort"
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                    />
                  )}
                </div>
              </div>
            )
          })}
          {/* Actions spacer */}
          <div className="w-8 flex-shrink-0 ml-3 mr-4" />
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-64">
        <ContextMenuLabel>Column Visibility</ContextMenuLabel>
        <ContextMenuSeparator />
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex items-center justify-between px-2 py-1.5 text-sm outline-none data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
          >
            <span className={cn(col.fixed && "text-muted-foreground font-medium")}>{col.label}</span>
            <Switch checked={col.visible} disabled={col.fixed} onCheckedChange={() => toggleColumnVisibility(col.id)} />
          </div>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}
