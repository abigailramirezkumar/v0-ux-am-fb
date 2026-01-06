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
  type: "video" | "pdf" | "image" | "audio" | "document" | "Game"
  modifiedDate: string
  dataStatus?: boolean
  itemCount?: number
  angleCount?: number
  duration?: string
  size?: string
  commentCount?: number
  createdDate: string
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
    Game: "Game",
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
      <div className="flex items-center flex-1 min-w-[200px] pl-4">
        {/* Indentation Spacer */}
        <div style={{ width: `${indentMargin}px` }} className="flex-shrink-0 transition-[width] duration-200" />

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
          <span className={cn("text-sm font-medium truncate", isSelected ? "text-white" : "text-foreground")}>
            {item.name}
          </span>
          {isImported && <span className="text-xs text-green-600 font-medium">Imported</span>}
        </div>
      </div>

      {/* Modified */}
      <div className="w-[100px] flex-shrink-0 text-right">
        <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
          {item.modifiedDate}
        </span>
      </div>

      {/* Type */}
      <div className="w-[80px] flex-shrink-0 text-center">
        <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
          {formatItemType(item.type)}
        </span>
      </div>

      {/* Data */}
      <div className="w-[60px] flex-shrink-0 flex justify-center">
        {item.dataStatus ? (
          <Icon name="fileText" size={14} className={cn(isSelected ? "text-white/80" : "text-muted-foreground")} />
        ) : (
          <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>–</span>
        )}
      </div>

      {/* Items */}
      <div className="w-[60px] flex-shrink-0 text-center">
        <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
          {item.itemCount || "–"}
        </span>
      </div>

      {/* Angles */}
      <div className="w-[80px] flex-shrink-0 flex justify-center items-center gap-1">
        {item.angleCount ? (
          <>
            <Icon name="video" size={14} className={cn(isSelected ? "text-white/80" : "text-muted-foreground")} />
            <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
              {item.angleCount}
            </span>
          </>
        ) : (
          <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>–</span>
        )}
      </div>

      {/* Duration */}
      <div className="w-[80px] flex-shrink-0 text-center">
        <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
          {item.duration || "–"}
        </span>
      </div>

      {/* Size */}
      <div className="w-[80px] flex-shrink-0 text-right">
        <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
          {item.size || "–"}
        </span>
      </div>

      {/* Comments */}
      <div className="w-[100px] flex-shrink-0 flex justify-center items-center gap-1">
        {item.commentCount ? (
          <>
            <Icon
              name="messageSquare"
              size={14}
              className={cn(isSelected ? "text-white/80" : "text-muted-foreground")}
            />
            <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
              {item.commentCount}
            </span>
          </>
        ) : (
          <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>–</span>
        )}
      </div>

      {/* Created */}
      <div className="w-[100px] flex-shrink-0 text-right mr-2">
        <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
          {item.createdDate}
        </span>
      </div>

      {/* Actions - fixed width */}
      <div className="w-[40px] flex-shrink-0 flex items-center justify-center mr-4">
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
  )
}
