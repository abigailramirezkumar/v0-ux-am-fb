"use client"

import { useState } from "react"
import type React from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/checkbox"
import { FolderIcon, FolderFilledIcon, ChevronRightIcon, ChevronDownIcon, SortIcon } from "@/components/icon"
import { LibraryItem, type LibraryItemData } from "@/components/library-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/input"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
  onSortFolder?: (folderId: string, sortBy: string, direction: "asc" | "desc") => void
  folderSortOptions?: Record<string, { by: string; direction: "asc" | "desc" }>
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
  onSortFolder,
  folderSortOptions = {},
}: FolderProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameName, setRenameName] = useState(folder.name)

  const { density } = useDensity()
  const spacing = getDensitySpacing(density)
  const { columns } = useLibraryContext()

  const isSelected = selectedFolders.has(folder.id)
  const isExpanded = expandedFolders.has(folder.id)
  const hasChildren = (folder.children && folder.children.length > 0) || (folder.items && folder.items.length > 0)
  const isImported = importedFolders.has(folder.id)

  const totalItemCount = (folder.children?.length || 0) + (folder.items?.length || 0)

  const isAlternate = index % 2 === 1

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

  const indentMargin = level * spacing.indent

  const currentSort = folderSortOptions[folder.id]
  const hasSortApplied = !!currentSort

  const renderCell = (colId: string) => {
    switch (colId) {
      case "name":
        return (
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
                <span className={cn("text-sm font-bold truncate", isSelected ? "text-white" : "text-foreground")}>
                  {folder.name}
                </span>
                {hasSortApplied && (
                  <div className="flex items-center gap-1">
                    <SortIcon size={14} className={cn(isSelected ? "text-white/70" : "text-[#0273e3]")} />
                  </div>
                )}
                {isImported && <span className="text-xs text-green-600 font-medium">Imported</span>}
              </>
            )}
          </div>
        )
      case "dateModified":
        return (
          <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
            {folder.dateModified || ""}
          </span>
        )
      case "type":
        return <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>Folder</span>
      case "itemCount":
        return (
          <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
            {totalItemCount}
          </span>
        )
      case "createdDate":
        return (
          <span className={cn("text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
            {folder.createdDate || ""}
          </span>
        )
      default:
        // hasData, angles, duration, size, comments are N/A for folders
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
      )}
      onClick={handleRowClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {columns.map((col) => {
        if (!col.visible) return null

        if (col.id === "name") {
          // Render fixed structure for Name column
          return (
            <div key={col.id} className={cn("flex items-center min-w-0 pl-4", col.width)}>
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
              {renderCell(col.id)}
            </div>
          )
        }

        return (
          <div
            key={col.id}
            className={cn(
              "flex-shrink-0 ml-3 flex",
              col.width,
              col.align === "right" && "justify-end",
              col.align === "center" && "justify-center",
            )}
          >
            {renderCell(col.id)}
          </div>
        )
      })}

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
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
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={handleRenameStart}>Rename Folder</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                  Delete Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        )}
      </div>
    </div>
  )

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>{folderRow}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleRenameStart}>Rename Folder</ContextMenuItem>

          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <div className="flex items-center gap-2">
                Sort By
                {hasSortApplied && <div className="w-1.5 h-1.5 rounded-full bg-[#0273e3]" />}
              </div>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem
                onClick={() => onSortFolder?.(folder.id, "name", "asc")}
                className={currentSort?.by === "name" && currentSort?.direction === "asc" ? "bg-accent" : ""}
              >
                Name (A-Z)
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => onSortFolder?.(folder.id, "name", "desc")}
                className={currentSort?.by === "name" && currentSort?.direction === "desc" ? "bg-accent" : ""}
              >
                Name (Z-A)
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => onSortFolder?.(folder.id, "dateModified", "desc")}
                className={currentSort?.by === "dateModified" && currentSort?.direction === "desc" ? "bg-accent" : ""}
              >
                Date Modified (Newest)
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => onSortFolder?.(folder.id, "dateModified", "asc")}
                className={currentSort?.by === "dateModified" && currentSort?.direction === "asc" ? "bg-accent" : ""}
              >
                Date Modified (Oldest)
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => onSortFolder?.(folder.id, "type", "asc")}
                className={currentSort?.by === "type" && currentSort?.direction === "asc" ? "bg-accent" : ""}
              >
                Type (A-Z)
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => onSortFolder?.(folder.id, "type", "desc")}
                className={currentSort?.by === "type" && currentSort?.direction === "desc" ? "bg-accent" : ""}
              >
                Type (Z-A)
              </ContextMenuItem>
              {hasSortApplied && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => onSortFolder?.(folder.id, "", "asc")}>Clear Sort</ContextMenuItem>
                </>
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />
          <ContextMenuItem className="text-[#e81c00] focus:text-[#e81c00]" onClick={handleDelete}>
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
              onSortFolder={onSortFolder}
              folderSortOptions={folderSortOptions}
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
            />
          ))}
        </div>
      )}
    </div>
  )
}
