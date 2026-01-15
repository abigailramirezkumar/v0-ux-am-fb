"use client"

import { ContextMenuTrigger } from "@/components/ui/context-menu"

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent as TooltipContentImport,
  TooltipProvider,
} from "@/components/ui/tooltip"

import { useState, useEffect } from "react"
import type React from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/checkbox"
import {
  FolderIcon,
  FolderFilledIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CalendarIcon,
  UserIcon,
} from "@/components/icon"
import { LibraryItem, type LibraryItemData } from "@/components/library-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/input"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
  color?: string
  icon?: "calendar" | "user" | "folder"
  isSystemGroup?: boolean
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
  onCreateSubfolder?: (parentId: string) => void
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
  onCreateSubfolder,
}: FolderProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameName, setRenameName] = useState(folder.name)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { density } = useDensity()
  const spacing = getDensitySpacing(density)
  const {
    columns,
    renamingId,
    setRenamingId,
    copyFolder,
    pasteFolder,
    clipboard,
    setFolderColor,
    openMoveModal,
    openPermissionsModal,
  } = useLibraryContext()

  useEffect(() => {
    if (renamingId === folder.id) {
      setIsRenaming(true)
      setRenameName(folder.name)
      setRenamingId(null)
    }
  }, [renamingId, folder.id, folder.name, setRenamingId])

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

  const getFolderIcon = () => {
    const iconClass = cn(isSelected ? "text-white" : !folder.color && "text-foreground")
    const iconStyle = !isSelected && folder.color ? { color: folder.color } : undefined

    if (folder.icon === "calendar") {
      return <CalendarIcon size={20} className={iconClass} style={iconStyle} />
    }
    if (folder.icon === "user") {
      return <UserIcon size={20} className={iconClass} style={iconStyle} />
    }

    if (isHovered && hasChildren) {
      return isExpanded ? (
        <ChevronDownIcon size={20} className={iconClass} style={iconStyle} />
      ) : (
        <ChevronRightIcon size={20} className={iconClass} style={iconStyle} />
      )
    }
    return isExpanded ? (
      <FolderFilledIcon size={20} className={iconClass} style={iconStyle} />
    ) : (
      <FolderIcon size={20} className={iconClass} style={iconStyle} />
    )
  }

  const showCheckbox = !isImported && (!folder.isSystemGroup || folder.icon === "folder")

  const showActions = isHovered || isSelected || isMenuOpen
  const showMenuButton = !isImported && !folder.isSystemGroup

  const renderCell = (columnId: string) => {
    switch (columnId) {
      case "name":
        return (
          <div className="flex items-center flex-1 min-w-0">
            {/* Indentation Spacer */}
            <div style={{ width: `${indentMargin}px` }} className="flex-shrink-0 transition-[width] duration-200" />

            {showCheckbox && (
              <div className="flex-shrink-0 w-6">
                <Checkbox checked={isSelected} onCheckedChange={handleCheckboxChange} />
              </div>
            )}

            <div
              className="flex items-center justify-center flex-shrink-0 w-9 h-5 ml-0"
              style={!isSelected && folder.color ? { color: folder.color } : undefined}
            >
              {getFolderIcon()}
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
                            isSelected ? "text-white" : !folder.color && "text-foreground",
                          )}
                          style={!isSelected && folder.color ? { color: folder.color } : undefined}
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

  const renderDropdownMenuItems = () => (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation()
          onCreateSubfolder?.(folder.id)
        }}
      >
        New Folder
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation()
          handleRenameStart()
        }}
      >
        Rename Folder
      </DropdownMenuItem>

      {folder.children && folder.children.length > 0 && (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onReorderChildren?.(folder.id)
          }}
        >
          Set Folder Order
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation()
          openPermissionsModal(folder.id)
        }}
      >
        Share...
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation()
          openMoveModal([{ id: folder.id, type: "folder" }])
        }}
      >
        Move
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation()
          copyFolder(folder.id, "full")
        }}
      >
        Copy Folder and Contents
      </DropdownMenuItem>

      <DropdownMenuItem
        disabled={!clipboard || clipboard.mode !== "full"}
        onClick={(e) => {
          e.stopPropagation()
          pasteFolder(folder.id)
        }}
      >
        Paste Folder and Contents
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation()
          copyFolder(folder.id, "structure")
        }}
      >
        Copy Folder Structure
      </DropdownMenuItem>

      <DropdownMenuItem
        disabled={!clipboard || clipboard.mode !== "structure"}
        onClick={(e) => {
          e.stopPropagation()
          pasteFolder(folder.id)
        }}
      >
        Paste Folder Structure
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Tags
      </DropdownMenuLabel>
      <div className="px-2 py-1 flex flex-wrap gap-1">
        {["#C91A1A", "#FF9000", "#E3C000", "#55A734", "#00C6D4", "#2D83C9", "#9B29E5", "#FF4CA2"].map((color) => {
          const isActive = folder.color === color
          return (
            <button
              key={color}
              onClick={(e) => {
                e.stopPropagation()
                setFolderColor(folder.id, isActive ? null : color)
              }}
              className={cn(
                "w-5 h-5 rounded-full border border-transparent hover:scale-110 transition-transform",
                isActive && "ring-2 ring-offset-2 ring-offset-background ring-black dark:ring-white border-white/20",
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          )
        })}
      </div>

      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-[#e81c00] focus:text-[#e81c00]"
        onClick={(e) => {
          e.stopPropagation()
          handleDelete()
        }}
      >
        Delete Folder
      </DropdownMenuItem>
    </>
  )

  const folderRow = (
    <div
      className={cn(
        `flex items-center ${spacing.py} cursor-pointer transition-colors relative`,
        isSelected && !isHovered && "bg-[#0273e3]",
        isSelected && isHovered && "bg-[#0273e3]",
        !isSelected && isHovered && "bg-muted",
        !isSelected && !isHovered && isAlternate && "bg-muted/20",
        !isSelected && !isHovered && !isAlternate && "bg-background",
        isDragOver && "bg-accent border border-primary/50",
      )}
      style={{ minWidth: "100%" }}
      onClick={handleRowClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={!isRenaming}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center flex-1 min-w-0 pl-4">
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
      </div>

      <div
        className={cn(
          "sticky right-0 flex items-center justify-center w-12 flex-shrink-0 z-10",
          isSelected || isMenuOpen
            ? "bg-[#0273e3]"
            : isHovered
              ? "bg-muted"
              : isAlternate
                ? "bg-muted/20"
                : "bg-background",
          isDragOver && "bg-accent",
        )}
      >
        {isImported ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs bg-transparent border-primary/30"
            onClick={(e) => {
              e.stopPropagation()
              onUpdateImported?.(folder.id, "folder")
            }}
          >
            Update
          </Button>
        ) : (
          showMenuButton && (
            <div
              className={cn(
                "transition-opacity duration-200",
                showActions ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
              )}
            >
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "h-6 w-6 flex items-center justify-center rounded-md transition-colors",
                      isSelected || isMenuOpen
                        ? "hover:bg-white/20 text-white"
                        : "bg-black/5 hover:bg-black/10 text-muted-foreground hover:text-foreground",
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex gap-0.5">
                      <div
                        className={cn("w-0.5 h-0.5 rounded-full", isSelected || isMenuOpen ? "bg-white" : "bg-current")}
                      />
                      <div
                        className={cn("w-0.5 h-0.5 rounded-full", isSelected || isMenuOpen ? "bg-white" : "bg-current")}
                      />
                      <div
                        className={cn("w-0.5 h-0.5 rounded-full", isSelected || isMenuOpen ? "bg-white" : "bg-current")}
                      />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {renderDropdownMenuItems()}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        )}
      </div>
    </div>
  )

  const contextMenuContent = !folder.isSystemGroup ? (
    <ContextMenuContent>
      <ContextMenuLabel>Tags</ContextMenuLabel>
      <ContextMenuItem
        onSelect={(e) => {
          e.preventDefault()
          onCreateSubfolder?.(folder.id)
        }}
      >
        New Folder
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        onSelect={(e) => {
          e.preventDefault()
          handleRenameStart()
        }}
      >
        Rename Folder
      </ContextMenuItem>

      {folder.children && folder.children.length > 0 && (
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
        onSelect={(e) => {
          e.preventDefault()
          openPermissionsModal(folder.id)
        }}
      >
        Share...
      </ContextMenuItem>

      <ContextMenuItem
        onSelect={(e) => {
          e.preventDefault()
          openMoveModal([{ id: folder.id, type: "folder" }])
        }}
      >
        Move
      </ContextMenuItem>

      <ContextMenuItem
        onSelect={(e) => {
          e.preventDefault()
          copyFolder(folder.id, "full")
        }}
      >
        Copy Folder and Contents
      </ContextMenuItem>

      <ContextMenuItem
        disabled={!clipboard || clipboard.mode !== "full"}
        onSelect={(e) => {
          e.preventDefault()
          pasteFolder(folder.id)
        }}
      >
        Paste Folder and Contents
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem
        onSelect={(e) => {
          e.preventDefault()
          copyFolder(folder.id, "structure")
        }}
      >
        Copy Folder Structure
      </ContextMenuItem>

      <ContextMenuItem
        disabled={!clipboard || clipboard.mode !== "structure"}
        onSelect={(e) => {
          e.preventDefault()
          pasteFolder(folder.id)
        }}
      >
        Paste Folder Structure
      </ContextMenuItem>

      <ContextMenuSeparator />
      <ContextMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Tags
      </ContextMenuLabel>
      <div className="px-2 py-1 flex flex-wrap gap-2">
        {["#C91A1A", "#FF9000", "#E3C000", "#55A734", "#00C6D4", "#2D83C9", "#9B29E5", "#FF4CA2"].map((color) => {
          const isActive = folder.color === color
          return (
            <button
              key={color}
              onClick={(e) => {
                e.stopPropagation()
                setFolderColor(folder.id, isActive ? null : color)
              }}
              className={cn(
                "w-5 h-5 rounded-full border border-transparent hover:scale-110 transition-transform",
                isActive && "ring-2 ring-offset-2 ring-offset-background ring-black dark:ring-white border-white/20",
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          )
        })}
      </div>

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
  ) : null

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>{folderRow}</ContextMenuTrigger>
        {contextMenuContent}
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
              onCreateSubfolder={onCreateSubfolder}
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
