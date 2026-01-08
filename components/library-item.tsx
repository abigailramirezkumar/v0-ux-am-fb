"use client"

import type React from "react"
import { TooltipProvider } from "@/components/ui/tooltip" // Import TooltipProvider

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/checkbox"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDensity, getDensitySpacing } from "@/lib/density-context"

export interface LibraryItemData {
  id: string
  name: string
  thumbnailUrl?: string
  type: "video" | "pdf" | "image" | "audio" | "document"
  dateModified?: string
  // New metadata fields
  hasData?: boolean
  itemCount?: number
  duration?: string
  size?: string
  createdDate?: string
  angles?: number
  comments?: number
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

const DataIcon = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M11.0833 2.33325H2.91667C2.27233 2.33325 1.75 2.85559 1.75 3.49992V11.6666C1.75 12.3109 2.27233 12.8333 2.91667 12.8333H11.0833C11.7277 12.8333 12.25 12.3109 12.25 11.6666V3.49992C12.25 2.85559 11.7277 2.33325 11.0833 2.33325Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4.66602 1.16675V3.50008" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.33398 1.16675V3.50008" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.75 5.83325H12.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M5.25 8.16675L6.41667 9.33341L8.75 7.00008"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const AnglesIcon = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g clipPath="url(#clip0_angles)">
      <path
        d="M12.8333 9.91667C12.8333 10.227 12.7101 10.5245 12.4913 10.7433C12.2725 10.9621 11.975 11.0833 11.6647 11.0833H3.50033C3.18991 11.0833 2.89236 10.9621 2.67357 10.7433C2.45478 10.5245 2.33366 10.227 2.33366 9.91667V4.66667C2.33366 4.35624 2.45478 4.0587 2.67357 3.83991C2.89236 3.62111 3.18991 3.5 3.50033 3.5H5.25033L6.41699 5.25H11.6647C11.975 5.25 12.2725 5.37111 12.4913 5.58991C12.7101 5.8087 12.8333 6.10624 12.8333 6.41667V9.91667Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.83301 8.16675H9.33301" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.58301 6.41675V9.91675" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M4.66699 3.49992V2.33325C4.66699 2.02383 4.78911 1.72629 5.0079 1.50749C5.22669 1.2887 5.52424 1.16659 5.83366 1.16659H10.5003C10.8098 1.16659 11.1073 1.2887 11.3261 1.50749C11.5449 1.72629 11.667 2.02383 11.667 2.33325V5.24992"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_angles">
        <rect width="14" height="14" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const CommentsIcon = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12.25 6.70841C12.2524 7.40094 12.0929 8.08401 11.7842 8.70258C11.4134 9.44867 10.843 10.0769 10.1365 10.5175C9.42992 10.9582 8.61494 11.1943 7.78167 11.2001C7.08914 11.2024 6.40607 11.0429 5.7875 10.7342L1.75 12.2501L3.26583 8.21258C2.95713 7.59401 2.79764 6.91094 2.8 6.21841C2.80577 5.38514 3.04193 4.57016 3.48254 3.86362C3.92316 3.15708 4.55141 2.58666 5.2975 2.21591C5.91607 1.90721 6.59914 1.74772 7.29167 1.75008H7.58333C8.68237 1.81013 9.72603 2.26194 10.5238 3.0196C11.3215 3.77726 11.8215 4.79563 11.9333 5.89008C11.944 5.9955 11.9499 6.10136 11.9507 6.20728L12.25 6.70841Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

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

  const isVideo = item.type === "video"

  return (
    <TooltipProvider>
      {" "}
      {/* Wrap the entire component in TooltipProvider */}
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
        <div className="flex items-center flex-1 min-w-0 pl-4">
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
              <img
                src={item.thumbnailUrl || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-green-600 to-green-800 w-full" />
            )}
          </div>

          <div className="flex-1 flex items-center gap-2 min-w-0 ml-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn("text-sm font-medium truncate block", isSelected ? "text-white" : "text-foreground")}
                >
                  {item.name}
                </span>
              </TooltipTrigger>
              <TooltipContent>{item.name}</TooltipContent>
            </Tooltip>
            {isImported && <span className="text-xs text-green-600 font-medium">Imported</span>}
          </div>
        </div>

        <div className="w-24 flex-shrink-0 ml-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn("text-sm truncate block", isSelected ? "text-white/80" : "text-muted-foreground")}>
                {item.dateModified || ""}
              </span>
            </TooltipTrigger>
            {item.dateModified && <TooltipContent>{item.dateModified}</TooltipContent>}
          </Tooltip>
        </div>

        <div className="w-16 flex-shrink-0 ml-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn("text-sm truncate block", isSelected ? "text-white/80" : "text-muted-foreground")}>
                {formatItemType(item.type)}
              </span>
            </TooltipTrigger>
            <TooltipContent>{formatItemType(item.type)}</TooltipContent>
          </Tooltip>
        </div>

        {/* Data column */}
        <div className="w-12 flex-shrink-0 ml-3 flex justify-center">
          {isVideo ? (
            item.hasData ? (
              <DataIcon className={cn("w-4 h-4", isSelected ? "text-white" : "text-muted-foreground")} />
            ) : null
          ) : (
            <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}></span>
          )}
        </div>

        <div className="w-14 flex-shrink-0 ml-3 text-left">
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "text-sm text-left truncate block",
                  isSelected ? "text-white/80" : "text-muted-foreground",
                )}
              >
                {isVideo ? (item.itemCount ?? "") : ""}
              </span>
            </TooltipTrigger>
            {isVideo && item.itemCount !== undefined && <TooltipContent>{item.itemCount}</TooltipContent>}
          </Tooltip>
        </div>

        <div className="w-14 flex-shrink-0 ml-3 flex items-center gap-1 justify-start">
          {isVideo && item.angles !== undefined ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <AnglesIcon
                    className={cn("w-3.5 h-3.5 flex-shrink-0", isSelected ? "text-white" : "text-muted-foreground")}
                  />
                  <span
                    className={cn("text-sm truncate block", isSelected ? "text-white/80" : "text-muted-foreground")}
                  >
                    {item.angles}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>{item.angles} Angles</TooltipContent>
            </Tooltip>
          ) : (
            <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}></span>
          )}
        </div>

        <div className="w-16 flex-shrink-0 ml-3 text-left">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn("text-sm truncate block", isSelected ? "text-white/80" : "text-muted-foreground")}>
                {isVideo ? (item.duration ?? "") : ""}
              </span>
            </TooltipTrigger>
            {isVideo && item.duration && <TooltipContent>{item.duration}</TooltipContent>}
          </Tooltip>
        </div>

        <div className="w-16 flex-shrink-0 ml-3 text-left">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn("text-sm truncate block", isSelected ? "text-white/80" : "text-muted-foreground")}>
                {isVideo ? (item.size ?? "") : ""}
              </span>
            </TooltipTrigger>
            {isVideo && item.size && <TooltipContent>{item.size}</TooltipContent>}
          </Tooltip>
        </div>

        <div className="w-20 flex-shrink-0 ml-3 flex items-center gap-1 justify-start">
          {isVideo ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <CommentsIcon
                    className={cn("w-3.5 h-3.5 flex-shrink-0", isSelected ? "text-white" : "text-muted-foreground")}
                  />
                  <span
                    className={cn("text-sm truncate block", isSelected ? "text-white/80" : "text-muted-foreground")}
                  >
                    {item.comments ?? 0}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>{item.comments ?? 0} Comments</TooltipContent>
            </Tooltip>
          ) : (
            <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}></span>
          )}
        </div>

        <div className="w-24 flex-shrink-0 ml-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn("text-sm truncate block", isSelected ? "text-white/80" : "text-muted-foreground")}>
                {item.createdDate || ""}
              </span>
            </TooltipTrigger>
            {item.createdDate && <TooltipContent>{item.createdDate}</TooltipContent>}
          </Tooltip>
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
    </TooltipProvider>
  )
}
