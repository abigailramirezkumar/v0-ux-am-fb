"use client"

import React, { useState, useEffect, useRef } from "react"

import type { FolderData } from "@/components/folder"
import type { LibraryItemData } from "@/components/library-item"
import { Icon, FolderIcon, CalendarIcon, UserIcon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { useLibraryContext } from "@/lib/library-context"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/input"

const getFolderIcon = (iconType?: "calendar" | "user" | "folder") => {
  switch (iconType) {
    case "calendar":
      return <CalendarIcon className="w-6 h-6" />
    case "user":
      return <UserIcon className="w-6 h-6" />
    default:
      return <FolderIcon className="w-6 h-6" />
  }
}

interface FolderTileProps {
  folder: FolderData
  onNavigate: (id: string) => void
  onMove?: (movedId: string, targetId: string, type: "folder" | "item") => void
  onRename?: (id: string, newName: string) => void
  onDelete?: (id: string) => void
}

const FolderTile = ({ folder, onNavigate, onMove, onRename, onDelete }: FolderTileProps) => {
  const {
    selectedFolders,
    setSelectedFolders,
    setSelectedItems,
    openMoveModal,
    openPermissionsModal,
    renamingId,
    setRenamingId,
  } = useLibraryContext()

  const [isDragOver, setIsDragOver] = useState(false)
  const [renameValue, setRenameValue] = useState(folder.name)
  const isRenaming = renamingId === folder.id
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
      setRenameValue(folder.name)
    }
  }, [isRenaming, folder.name])

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== folder.name) {
      onRename?.(folder.id, renameValue.trim())
    }
    setRenamingId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRenameSubmit()
    if (e.key === "Escape") setRenamingId(null)
    e.stopPropagation()
  }

  const isSelected = selectedFolders.has(folder.id)
  const isEmpty = !folder.children?.length && !folder.items?.length
  const itemCount = (folder.children?.length || 0) + (folder.items?.length || 0)

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ id: folder.id, type: "folder" }))
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
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
      if (data && data.id && data.type && onMove) {
        onMove(data.id, folder.id, data.type)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newSet = new Set(e.metaKey || e.ctrlKey ? selectedFolders : [])
    if (newSet.has(folder.id)) {
      newSet.delete(folder.id)
    } else {
      newSet.add(folder.id)
    }
    setSelectedFolders(newSet)
    if (!e.metaKey && !e.ctrlKey) {
      setSelectedItems(new Set())
    }
  }

  const MenuItems = () => (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation()
          onNavigate(folder.id)
        }}
      >
        Open
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation()
          setRenamingId(folder.id)
        }}
      >
        Rename
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
          openPermissionsModal(folder.id)
        }}
      >
        Share
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.(folder.id)
        }}
        className="text-destructive"
      >
        Delete
      </DropdownMenuItem>
    </>
  )

  const ContextItems = () => (
    <>
      <ContextMenuItem onClick={() => onNavigate(folder.id)}>Open</ContextMenuItem>
      <ContextMenuItem onClick={() => setRenamingId(folder.id)}>Rename</ContextMenuItem>
      <ContextMenuItem onClick={() => openMoveModal([{ id: folder.id, type: "folder" }])}>Move</ContextMenuItem>
      <ContextMenuItem onClick={() => openPermissionsModal(folder.id)}>Share</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => onDelete?.(folder.id)} className="text-destructive">
        Delete
      </ContextMenuItem>
    </>
  )

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          draggable={!isRenaming}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleSelect}
          onDoubleClick={(e) => {
            e.stopPropagation()
            setSelectedFolders(new Set())
            setSelectedItems(new Set())
            onNavigate(folder.id)
          }}
          className={cn(
            "group relative flex flex-col justify-between p-4 rounded-lg transition-all cursor-pointer select-none",
            "h-28",
            "bg-[#2a2f3a] hover:bg-[#353b48]",
            isSelected ? "ring-2 ring-primary" : "",
            isDragOver ? "ring-2 ring-primary bg-accent/20" : "",
            isEmpty && !isSelected && !isDragOver && "opacity-50 grayscale",
          )}
        >
          {/* Name - top left, bold */}
          {isRenaming ? (
            <Input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="h-6 text-sm bg-background/50"
            />
          ) : (
            <span className="text-sm font-bold text-white line-clamp-2 pr-8">{folder.name}</span>
          )}

          {/* Bottom row: count left, icon right */}
          <div className="flex items-end justify-between">
            <span className="text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </span>
            <div className="text-muted-foreground/70 [&_svg]:w-5 [&_svg]:h-5">{getFolderIcon(folder.icon)}</div>
          </div>

          {/* Hover Actions (3-dot) */}
          {!isRenaming && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-white/10 rounded-md" onClick={(e) => e.stopPropagation()}>
                    <Icon name="more-vertical" className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <MenuItems />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextItems />
      </ContextMenuContent>
    </ContextMenu>
  )
}

interface ItemTileProps {
  item: LibraryItemData
  onOpenItem: (id: string) => void
}

const ItemTile = ({ item, onOpenItem }: ItemTileProps) => {
  const { selectedItems, setSelectedItems, setSelectedFolders, openMoveModal, openPermissionsModal } =
    useLibraryContext()

  const isSelected = selectedItems.has(item.id)

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation()
    e.dataTransfer.setData("application/json", JSON.stringify({ id: item.id, type: "item" }))
    e.dataTransfer.effectAllowed = "move"
  }

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newSet = new Set(e.metaKey || e.ctrlKey ? selectedItems : [])
    if (newSet.has(item.id)) {
      newSet.delete(item.id)
    } else {
      newSet.add(item.id)
    }
    setSelectedItems(newSet)
    if (!e.metaKey && !e.ctrlKey) setSelectedFolders(new Set())
  }

  const MenuItems = () => (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation()
          onOpenItem(item.id)
        }}
      >
        Play
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation()
          openMoveModal([{ id: item.id, type: "item" }])
        }}
      >
        Move
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation()
          openPermissionsModal(item.id)
        }}
      >
        Share
      </DropdownMenuItem>
    </>
  )

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          draggable
          onDragStart={handleDragStart}
          onClick={handleSelect}
          onDoubleClick={(e) => {
            e.stopPropagation()
            onOpenItem(item.id)
          }}
          className={cn(
            "group flex flex-col rounded-lg overflow-hidden cursor-pointer select-none",
            "transition-all duration-200 ease-out",
            "hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20",
            isSelected ? "ring-2 ring-primary" : "",
          )}
        >
          {/* Thumbnail with overlay bar */}
          <div className="aspect-video w-full bg-muted relative rounded-lg overflow-hidden">
            <img src={item.thumbnailUrl || "/football-field.png"} alt="" className="w-full h-full object-cover" />

            {/* 3-dot menu button on hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 bg-black/50 hover:bg-black/70 rounded-md backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon name="more-vertical" className="w-4 h-4 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <MenuItems />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Bottom overlay bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/40 px-2.5 py-1.5 flex items-center justify-between">
              {/* Type badge */}
              <div className="flex items-center gap-1.5 bg-black/50 px-2 py-0.5 rounded">
                <Icon name="video" className="w-3 h-3 text-white/80" />
                <span className="text-[11px] text-white/90 font-medium">
                  {item.type === "video" ? "Game" : item.type}
                </span>
              </div>
              {/* Duration/Score */}
              <span className="text-[11px] text-white font-medium">{item.duration || "0:00"}</span>
            </div>

            {/* Play Overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <Icon name="play" className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          </div>

          {/* Footer - below thumbnail */}
          <div className="pt-2.5 pb-1 flex flex-col gap-1.5">
            {/* Title */}
            <span className="text-sm line-clamp-1 text-foreground text-justify font-bold" title={item.name}>
              {item.name}
            </span>
            {/* Meta row: team badge, date, icons */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {/* Team badge */}
              <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">ME</span>
              <span>{item.createdDate}</span>
              {/* Right side icons */}
              <div className="ml-auto flex items-center gap-1">
                {item.hasData && <Icon name="database" className="w-3.5 h-3.5 text-muted-foreground/60" />}
                {item.comments && item.comments > 0 && (
                  <div className="flex items-center gap-0.5">
                    <Icon name="message-square" className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <span className="text-[10px]">{item.comments}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onOpenItem(item.id)}>Play</ContextMenuItem>
        <ContextMenuItem onClick={() => openMoveModal([{ id: item.id, type: "item" }])}>Move</ContextMenuItem>
        <ContextMenuItem onClick={() => openPermissionsModal(item.id)}>Share</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

interface LibraryGridViewProps {
  folders: FolderData[]
  items: LibraryItemData[]
  onNavigate: (id: string) => void
  onOpenItem: (id: string) => void
  onMove?: (movedId: string, targetId: string, type: "folder" | "item") => void
  onRename?: (id: string, newName: string) => void
  onDelete?: (id: string) => void
}

export function LibraryGridView({
  folders,
  items,
  onNavigate,
  onOpenItem,
  onMove,
  onRename,
  onDelete,
}: LibraryGridViewProps) {
  return (
    <div className="p-4 pb-20">
      {folders.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {folders.map((folder) => (
              <FolderTile
                key={folder.id}
                folder={folder}
                onNavigate={onNavigate}
                onMove={onMove}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div>
          {folders.length > 0 && (
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Files</h3>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <ItemTile key={item.id} item={item} onOpenItem={onOpenItem} />
            ))}
          </div>
        </div>
      )}

      {folders.length === 0 && items.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Icon name="folder-open" className="w-12 h-12 mb-2 opacity-20" />
          <p>This folder is empty</p>
        </div>
      )}
    </div>
  )
}
