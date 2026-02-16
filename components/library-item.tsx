"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/checkbox"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"

export interface LibraryItemData {
  id: string
  name: string
  thumbnailUrl?: string
  type: "video" | "pdf" | "image" | "audio" | "document"
}

interface LibraryItemProps {
  item: LibraryItemData
  level?: number
  onSelect?: (itemId: string, selected: boolean) => void
  selectedItems?: Set<string>
  importedItems?: Set<string>
  onUpdateImported?: (id: string, type: "folder" | "item") => void
}

export function LibraryItem({
  item,
  level = 0,
  onSelect,
  selectedItems = new Set(),
  importedItems = new Set(),
  onUpdateImported,
}: LibraryItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isSelected = selectedItems.has(item.id)
  const isImported = importedItems.has(item.id)

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(item.id, checked)
  }

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest('[role="checkbox"]')) {
      return
    }

    console.log("[v0] Library item clicked:", item.name)
  }

  const paddingLeft = level * 24 + 16

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3 px-4 cursor-pointer transition-colors border-b border-border border-dashed",
        isSelected && !isHovered && "bg-[#0273e3]",
        isSelected && isHovered && "bg-[#0273e3]",
        !isSelected && isHovered && "bg-muted",
        !isSelected && !isHovered && "bg-background",
      )}
      style={{ paddingLeft: `${paddingLeft}px` }}
      onClick={handleRowClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isImported && (
        <div className="flex items-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={isSelected} onCheckedChange={handleCheckboxChange} />
        </div>
      )}

      <div className="flex items-center justify-center flex-shrink-0 rounded overflow-hidden bg-muted h-5 w-9">
        {isHovered && item.type === "video" ? (
          <Icon name="video" size={24} className={cn(isSelected ? "text-white" : "text-foreground")} />
        ) : item.thumbnailUrl ? (
          <img src={item.thumbnailUrl || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="h-full bg-gradient-to-br from-green-600 to-green-800 w-full" />
        )}
      </div>

      <div className="flex-1 flex items-center gap-2">
        <span className={cn("font-medium text-sm", isSelected ? "text-white" : "text-foreground")}>{item.name}</span>
        {isImported && <span className="text-xs text-green-600 font-medium">Imported</span>}
      </div>

      {isImported ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation()
            onUpdateImported?.(item.id, "item")
          }}
        >
          Update
        </Button>
      ) : (
        isHovered && (
          <button
            className="flex-shrink-0 p-1 hover:bg-muted/50 rounded"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <div className="flex gap-1">
              <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-foreground")} />
              <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-foreground")} />
              <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-foreground")} />
            </div>
          </button>
        )
      )}
    </div>
  )
}
