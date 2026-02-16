"use client"

import { useState } from "react"
import type React from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/checkbox"
import { FolderIcon, FolderFilledIcon, ChevronRightIcon, ChevronDownIcon } from "@/components/icon"
import { LibraryItem, type LibraryItemData } from "@/components/library-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/input"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export interface FolderData {
  id: string
  name: string
  children?: FolderData[]
  items?: LibraryItemData[]
}

interface FolderProps {
  folder: FolderData
  level?: number
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
}

export function Folder({
  folder,
  level = 0,
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
}: FolderProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameName, setRenameName] = useState(folder.name)

  const isSelected = selectedFolders.has(folder.id)
  const isExpanded = expandedFolders.has(folder.id)
  const hasChildren = (folder.children && folder.children.length > 0) || (folder.items && folder.items.length > 0)
  const isImported = importedFolders.has(folder.id)

  const totalItemCount = (folder.children?.length || 0) + (folder.items?.length || 0)

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

  const paddingLeft = level * 24 + 16

  const folderRow = (
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

      <div className="flex items-center justify-center flex-shrink-0 w-5 h-5">
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

      <div className="flex-1 flex items-center gap-2">
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
            <span className={cn("font-medium text-sm", isSelected ? "text-white" : "text-foreground")}>
              {folder.name}
            </span>
            <span className={cn("text-sm", isSelected ? "text-white/70" : "text-muted-foreground")}>
              • {totalItemCount} {totalItemCount === 1 ? "Item" : "Items"}
            </span>
            {isImported && <span className="text-xs text-green-600 font-medium">Imported</span>}
          </>
        )}
      </div>

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
  )

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>{folderRow}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleRenameStart}>Rename Folder</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem className="text-[#e81c00] focus:text-[#e81c00]" onClick={handleDelete}>
            Delete Folder
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Children (Subfolders and Library Items) */}
      {isExpanded && hasChildren && (
        <div>
          {/* Render subfolders first */}
          {folder.children?.map((child) => (
            <Folder
              key={child.id}
              folder={child}
              level={level + 1}
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
            />
          ))}

          {/* Render library items */}
          {folder.items?.map((item) => (
            <LibraryItem
              key={item.id}
              item={{
                ...item,
                thumbnailUrl: item.thumbnailUrl || "/football-field.png",
              }}
              level={level + 1}
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
