"use client"

import { ContextMenuTrigger } from "@/components/ui/context-menu"

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent as TooltipContentImport,
  TooltipProvider,
} from "@/components/ui/tooltip"

import { useState } from "react"
import type React from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/checkbox"
import { FolderIcon, FolderFilledIcon, ChevronRightIcon, ChevronDownIcon } from "@/components/icon"
import { LibraryItem, type LibraryItemData } from "@/components/library-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/input"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu"
import { useDensity, getDensitySpacing } from "@/lib/density-context"
import { useLibraryContext } from "@/lib/library-context"

export interface FolderData {
  id: string
  name: string
  dateModified?: string
  createdDate?: string
  children?: FolderData[]
  items?: LibraryItemData[]
}

interface FolderProps {
  folder: FolderData
  level?: number
  index?: number
  isFlattened?: boolean
  onSelect?: (folderId: string, selected: boolean) => void
  onSelectItem?: (itemId: string, selected: boolean) => void
  onDoubleClick?: (folderId: string) => void
  selectedFolders?: Set<string>
  selectedItems?: Set<string>
  expandedFolders?: Set<string>
  onToggleExpand?: (folderId: string) => void
  importedFolders?: Set<string>
  importedItems?: Set<string>
  onUpdateImported?: (id: string, type: "folder" | "item") => void
  onRename?: (folderId: string, newName: string) => void
  onDelete?: (folderId: string) => void
  onReorderChildren?: (folderId: string) => void
  onSortFolder?: (folderId: string, sortBy: string, direction?: "asc" | "desc") => void
  folderSortOptions?: Record<string, { by: string; direction: "asc" | "desc" }>
  onMove?: (movedId: string, targetId: string, type: "folder" | "item") => void
  onOpen?: (itemId: string) => void
}

export function Folder({
  folder,
  level = 0,
  index = 0,
  isFlattened = false,
  onSelect,
  onSelectItem,
  onDoubleClick,
  selectedFolders = new Set(),
  selectedItems = new Set(),
  expandedFolders = new Set(),
  onToggleExpand,
  importedFolders = new Set(),
  importedItems = new Set(),
  onUpdateImported,
  onRename,
  onDelete,
  onReorderChildren,
  onSortFolder,
  folderSortOptions,
  onMove,
  onOpen,
}: FolderProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameName, setRenameName] = useState(folder.name)
  const [isDragOver, setIsDragOver] = useState(false)

  const { density } = useDensity()
  const spacing = getDensitySpacing(density)
  const { columns } = useLibraryContext()

  const isSelected = selectedFolders.has(folder.id)
  const isExpanded = expandedFolders.has(folder.id)
  const hasChildren = (folder.children && folder.children.length > 0) || (folder.items && folder.items.length > 0)
  const isImported = importedFolders.has(folder.id)

  const totalItemCount = (folder.children?.length || 0) + (folder.items?.length || 0)

  const isAlternate = index % 2 === 1
  const indentMargin = level * spacing.indent

  const hasChildFolders = folder.children && folder.children.length > 0

  const totalRowWidth =
    columns.reduce((sum, col) => (col.visible ? sum + col.width : sum), 0) +
    (columns.filter((c) => c.visible).length - 1) * 12 + // ml-3 gaps (12px each)
    16 + // pl-4 left padding
    8 + // w-8 actions area
    12 + // ml-3 for actions
    16 // mr-4 right padding

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(folder.id, checked)
  }

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest('[role="checkbox"]') || target.closest("input")) {
      return
    }

    if (e.detail === 2) {
      onDoubleClick?.(folder.id)
    } else if (hasChildren) {
      onToggleExpand?.(folder.id)
    }
  }

  const handleRenameStart = () => {
    setIsRenaming(true)
    setRenameName(folder.name)
  }

  const handleRenameComplete = () => {
    if (renameName.trim() && renameName !== folder.name) {
      onRename?.(folder.id, renameName.trim())
    }
    setIsRenaming(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameComplete()
    } else if (e.key === "Escape") {
      setIsRenaming(false)
      setRenameName(folder.name)
    }
  }

  const handleDelete = () => {
    onDelete?.(folder.id)
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation()
    e.dataTransfer.setData("application/json", JSON.stringify({ id: folder.id, type: "folder" }))
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"))
      if (data && data.id && data.type) {
        onMove?.(data.id, folder.id, data.type)
      }
    } catch (err) {
      console.error("Failed to parse drag data", err)
    }
  }

  const renderCell = (columnId: string) => {
    switch (columnId) {
      case "name":
        return (
          <div className="flex items-center flex-1 min-w-0">
            {/* Indentation Spacer */}
            <div style={{ width: `${indentMargin}px` }} className="flex-shrink-0 transition-[width] duration-200" />

            <div className="flex-shrink-0 w-6">
              {!isImported && <Checkbox checked={isSelected} onCheckedChange={handleCheckboxChange} />}
            </div>

            <div className="flex items-center justify-center flex-shrink-0 w-9 h-5 ml-0">
              {isHovered && hasChildren ? (
                isExpanded ? (
                  <ChevronDownIcon size={20} className={cn(isSelected ? "text-white" : "text-foreground")} />
                ) : (
                  <ChevronRightIcon size={20} className={cn(isSelected ? "text-white" : "text-foreground")} />
                )
              ) : isExpanded ? (
                <FolderFilledIcon size={20} className={cn(isSelected ? "text-white" : "text-foreground")} />
              ) : (
                <FolderIcon size={20} className={cn(isSelected ? "text-white" : "text-foreground")} />
              )}
            </div>

            <div className="flex-1 flex items-center gap-2 min-w-0 ml-1">
              {isRenaming ? (
                <Input
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  onBlur={handleRenameComplete}
                  onKeyDown={handleRenameKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  className="h-7 text-sm font-medium"
                />
              ) : (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "text-sm font-bold truncate block",
                            isSelected ? "text-white" : "text-foreground",
                          )}
                        >
                          {folder.name}
                        </span>
                      </TooltipTrigger>
                      {folder.name && <TooltipContentImport>{folder.name}</TooltipContentImport>}
                    </Tooltip>
                  </TooltipProvider>
                  {isImported && <span className="text-xs text-green-600 font-medium">Imported</span>}
                </>
              )}
            </div>
          </div>
        )
      case "dateModified":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn("text-sm truncate block", isSelected ? "text-white/80" : "text-muted-foreground")}>
                  {folder.dateModified || ""}
                </span>
              </TooltipTrigger>
              {folder.dateModified && <TooltipContentImport>{folder.dateModified}</TooltipContentImport>}
            </Tooltip>
          </TooltipProvider>
        )
      case "type":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn("text-sm truncate block", isSelected ? "text-white/80" : "text-muted-foreground")}>
                  Folder
                </span>
              </TooltipTrigger>
              <TooltipContentImport>Folder</TooltipContentImport>
            </Tooltip>
          </TooltipProvider>
        )
      case "hasData":
        return <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}></span>
      case "itemCount":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn("text-sm truncate block", isSelected ? "text-white/80" : "text-muted-foreground")}>
                  {totalItemCount}
                </span>
              </TooltipTrigger>
              <TooltipContentImport>{totalItemCount} Items</TooltipContentImport>
            </Tooltip>
          </TooltipProvider>
        )
      case "createdDate":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn("text-sm truncate block", isSelected ? "text-white/80" : "text-muted-foreground")}>
                  {folder.createdDate || ""}
                </span>
              </TooltipTrigger>
              {folder.createdDate && <TooltipContentImport>{folder.createdDate}</TooltipContentImport>}
            </Tooltip>
          </TooltipProvider>
        )
      default:
        return <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}></span>
    }
  }

  const folderRow = (
    <div
      className={cn(
        `flex items-center ${spacing.py} cursor-pointer transition-colors`,
        isSelected && !isHovered && "bg-[#0273e3]",
        isSelected && isHovered && "bg-[#0273e3]",
        !isSelected && isHovered && "bg-muted",
        !isSelected && !isHovered && isAlternate && "bg-muted/20",
        !isSelected && !isHovered && !isAlternate && "bg-background",
        isDragOver && "bg-accent border border-primary/50",
      )}
      style={{ minWidth: totalRowWidth }}
      onClick={handleRowClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={!isRenaming}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center flex-shrink-0 pl-4">
        {columns.map((column, idx) =>
          column.visible ? (
            <div
              key={column.id}
              className={cn("flex-shrink-0", {
                "flex justify-center": column.align === "center",
                "text-left": column.align === "left",
                "text-right": column.align === "right",
                "ml-3": idx > 0,
              })}
              style={{ width: column.width, minWidth: column.width }}
            >
              {renderCell(column.id)}
            </div>
          ) : null,
        )}

        {/* Actions - fixed width */}
        <div className="w-8 flex-shrink-0 flex items-center justify-center ml-3 mr-4">
          {isImported ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                onUpdateImported?.(folder.id, "folder")
              }}
            >
              Update
            </Button>
          ) : (
            isHovered && (
              <div className="flex gap-1">
                <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-foreground")} />
                <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-foreground")} />
                <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-foreground")} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>{folderRow}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onSelect={(e) => {
              e.preventDefault()
              handleRenameStart()
            }}
          >
            Rename Folder
          </ContextMenuItem>

          {hasChildFolders && (
            <ContextMenuItem
              onSelect={(e) => {
                e.preventDefault()
                onReorderChildren?.(folder.id)
              }}
            >
              Set Folder Order
            </ContextMenuItem>
          )}

          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-[#e81c00] focus:text-[#e81c00]"
            onSelect={(e) => {
              e.preventDefault()
              handleDelete()
            }}
          >
            Delete Folder
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {!isFlattened && isExpanded && hasChildren && (
        <div>
          {folder.children?.map((child, i) => (
            <Folder
              key={child.id}
              folder={child}
              level={level + 1}
              index={i}
              onSelect={onSelect}
              onSelectItem={onSelectItem}
              onDoubleClick={onDoubleClick}
              selectedFolders={selectedFolders}
              selectedItems={selectedItems}
              expandedFolders={expandedFolders}
              onToggleExpand={onToggleExpand}
              importedFolders={importedFolders}
              importedItems={importedItems}
              onUpdateImported={onUpdateImported}
              onRename={onRename}
              onDelete={onDelete}
              onReorderChildren={onReorderChildren}
              onSortFolder={onSortFolder}
              folderSortOptions={folderSortOptions}
              onMove={onMove}
              onOpen={onOpen}
            />
          ))}

          {folder.items?.map((item, i) => (
            <LibraryItem
              key={item.id}
              item={{
                ...item,
                thumbnailUrl: item.thumbnailUrl || "/football-field.png",
              }}
              level={level + 1}
              index={i + (folder.children?.length || 0)}
              onSelect={onSelectItem}
              selectedItems={selectedItems}
              importedItems={importedItems}
              onUpdateImported={onUpdateImported}
              onMove={onMove}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  )
}
