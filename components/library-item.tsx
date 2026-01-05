"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/checkbox"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { useDensity, getDensitySpacing } from "@/lib/density-context"

export interface LibraryItemData {
  id: string
  name: string
  thumbnailUrl?: string
  type: "video" | "pdf" | "image" | "audio" | "document"
  dateModified?: string
}

interface LibraryItemProps {
  item: LibraryItemData
  level?: number
  index?: number
  onSelect?: (itemId: string, selected: boolean) => void
  selectedItems?: Set<string>
  importedItems?: Set<string>
  onUpdateImported?: (id: string, type: "folder" | "item") => void
}

const formatItemType = (type: string): string => {
  const typeMap: Record<string, string> = {
    video: "Video",
    pdf: "PDF",
    image: "Image",
    audio: "Audio",
    document: "Document",
  }
  return typeMap[type] || type
}

export function LibraryItem({
  item,
  level = 0,
  index = 0,
  onSelect,
  selectedItems = new Set(),
  importedItems = new Set(),
  onUpdateImported,
}: LibraryItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isSelected = selectedItems.has(item.id)
  const isImported = importedItems.has(item.id)

  const { density } = useDensity()
  const spacing = getDensitySpacing(density)

  const isAlternate = index % 2 === 1

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(item.id, checked)
  }

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest('[role="checkbox"]')) {
      return
    }
  }

  const indentMargin = level * spacing.indent

  return (
    <div
      className={cn(
        `flex items-center ${spacing.py} cursor-pointer transition-colors`,
        isSelected && !isHovered && "bg-[#0273e3]",
        isSelected && isHovered && "bg-[#0273e3]",
        !isSelected && isHovered && "bg-muted",
        !isSelected && !isHovered && isAlternate && "bg-muted/20",
        !isSelected && !isHovered && !isAlternate && "bg-background",
      )}
      onClick={handleRowClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center flex-1 pl-4" style={{ marginLeft: `${indentMargin}px` }}>
        {/* Checkbox - fixed width */}
        <div className="flex-shrink-0 w-6">
          {!isImported && <Checkbox checked={isSelected} onCheckedChange={handleCheckboxChange} />}
        </div>

        {/* Icon/Thumbnail - fixed width */}
        <div className="flex items-center justify-center flex-shrink-0 rounded overflow-hidden bg-muted h-5 w-9 ml-0">
          {isHovered && item.type === "video" ? (
            <Icon name="video" size={24} className={cn(isSelected ? "text-white" : "text-foreground")} />
          ) : item.thumbnailUrl ? (
            <img src={item.thumbnailUrl || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="h-full bg-gradient-to-br from-green-600 to-green-800 w-full" />
          )}
        </div>

        {/* Name - flexible */}
        <div className="flex-1 flex items-center gap-2 min-w-0 ml-1">
          <span className={cn("text-sm font-medium", isSelected ? "text-white" : "text-foreground")}>{item.name}</span>
          {isImported && <span className="text-xs text-green-600 font-medium">Imported</span>}
        </div>

        {/* Modified column - fixed width */}
        <div className="w-32 flex-shrink-0 ml-3">
          <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
            {item.dateModified || "—"}
          </span>
        </div>

        {/* Type column - fixed width */}
        <div className="w-24 flex-shrink-0 ml-3">
          <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
            {formatItemType(item.type)}
          </span>
        </div>

        {/* Actions - fixed width */}
        <div className="w-8 flex-shrink-0 flex items-center justify-center ml-3 mr-4">
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
      </div>
    </div>
  )
}
