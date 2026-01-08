"use client"

import type React from "react"
import { useState } from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuCheckboxItem,
  ContextMenuTrigger,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import { useLibraryContext } from "@/lib/library-context"
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown } from "lucide-react"

export function LibraryTableHeader() {
  const { columns, toggleColumnVisibility, sort, setSort, resizeColumn, moveColumn } = useLibraryContext()
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null)

  const handleResizeMouseDown = (e: React.MouseEvent, columnId: string, currentWidth: number) => {
    e.preventDefault()
    e.stopPropagation()

    const startX = e.pageX

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.pageX - startX
      resizeColumn(columnId, currentWidth + delta)
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (columns[index].fixed) {
      e.preventDefault()
      return
    }
    setDraggedColumnIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (columns[index].fixed) {
      e.dataTransfer.dropEffect = "none"
      return
    }
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (columns[index].fixed) return

    if (draggedColumnIndex !== null && draggedColumnIndex !== index) {
      moveColumn(draggedColumnIndex, index)
    }
    setDraggedColumnIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedColumnIndex(null)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="sticky top-0 z-10 flex items-center py-2 bg-background border-b border-border pt-1 min-w-fit">
          <div className="flex items-center flex-shrink-0 pl-4">
            {columns.map((column, index) =>
              column.visible ? (
                <div
                  key={column.id}
                  className={cn(
                    "relative flex-shrink-0 flex items-center gap-1 cursor-pointer hover:text-foreground group select-none py-1 border-r border-transparent hover:border-border/50",
                    {
                      "justify-center": column.align === "center",
                      "justify-start": column.align === "left",
                      "justify-end": column.align === "right",
                      "opacity-50": draggedColumnIndex === index,
                      "ml-3": index > 0,
                      "cursor-default": column.fixed,
                      "cursor-grab active:cursor-grabbing": !column.fixed,
                    },
                  )}
                  style={{ width: column.width }}
                  onClick={() => setSort(column.id)}
                  draggable={!column.fixed}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                    {column.label}
                  </span>

                  {sort.columnId === column.id &&
                    (sort.direction === "asc" ? (
                      <ArrowUp className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <ArrowDown className="w-3 h-3 flex-shrink-0" />
                    ))}

                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 group-hover:bg-border transition-colors z-20"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => handleResizeMouseDown(e, column.id, column.width)}
                  />
                </div>
              ) : null,
            )}

            {/* Actions area spacer */}
            <div className="w-8 flex-shrink-0 ml-3 mr-4" />
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-56">
        <ContextMenuLabel>Column Visibility</ContextMenuLabel>
        <ContextMenuSeparator />
        {columns.map((column) => (
          <ContextMenuCheckboxItem
            key={column.id}
            checked={column.visible}
            onCheckedChange={() => toggleColumnVisibility(column.id)}
            onSelect={(e) => e.preventDefault()}
            disabled={column.fixed}
          >
            {column.label}
          </ContextMenuCheckboxItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}
