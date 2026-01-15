"use client"

import type React from "react"

import type { FolderData } from "@/components/folder"
import type { LibraryItemData } from "@/components/library-item"
import { Icon, FolderIcon, CalendarIcon, UserIcon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { useLibraryContext } from "@/lib/library-context"
import { ContextMenu, ContextMenuContent, ContextMenuTrigger, ContextMenuItem } from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface LibraryGridViewProps {
  folders: FolderData[]
  items: LibraryItemData[]
  onNavigate: (id: string) => void
  onOpenItem: (id: string) => void
}

export function LibraryGridView({ folders, items, onNavigate, onOpenItem }: LibraryGridViewProps) {
  const { selectedFolders, selectedItems, setSelectedFolders, setSelectedItems, openMoveModal, openPermissionsModal } =
    useLibraryContext()

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

  // --- Folder Tile ---
  const FolderTile = ({ folder }: { folder: FolderData }) => {
    const isSelected = selectedFolders.has(folder.id)

    const handleSelect = (e: React.MouseEvent) => {
      e.stopPropagation()
      // Simple toggle logic for grid
      const newSet = new Set(selectedFolders)
      if (e.metaKey || e.ctrlKey) {
        if (newSet.has(folder.id)) newSet.delete(folder.id)
        else newSet.add(folder.id)
      } else {
        newSet.clear()
        newSet.add(folder.id)
      }
      setSelectedFolders(newSet)
      // Clear items selection if not multiselect
      if (!e.metaKey && !e.ctrlKey) setSelectedItems(new Set())
    }

    const itemCount = (folder.children?.length || 0) + (folder.items?.length || 0)

    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            onClick={handleSelect}
            onDoubleClick={(e) => {
              e.stopPropagation()
              onNavigate(folder.id)
            }}
            className={cn(
              "group relative flex flex-col justify-between p-4 rounded-lg transition-all cursor-pointer aspect-[4/3]",
              "bg-[#2a2f3a] hover:bg-[#353b48]",
              isSelected ? "ring-2 ring-primary" : "",
            )}
          >
            {/* Name - top left, bold */}
            <span className="text-base font-bold text-white line-clamp-2 pr-8">{folder.name}</span>

            {/* Bottom row: count left, icon right */}
            <div className="flex items-end justify-between">
              <span className="text-sm text-muted-foreground">
                {itemCount} {itemCount === 1 ? "Item" : "Items"}
              </span>
              <div className="text-muted-foreground/70">{getFolderIcon(folder.icon)}</div>
            </div>

            {/* Hover Actions (3-dot) */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-white/10 rounded-md">
                    <Icon name="more-vertical" className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onNavigate(folder.id)}>Open</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openMoveModal([{ id: folder.id, type: "folder" }])}>
                    Move
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openPermissionsModal(folder.id)}>Share</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onNavigate(folder.id)}>Open</ContextMenuItem>
          <ContextMenuItem onClick={() => openMoveModal([{ id: folder.id, type: "folder" }])}>Move</ContextMenuItem>
          <ContextMenuItem onClick={() => openPermissionsModal(folder.id)}>Share</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  // --- Item Tile ---
  const ItemTile = ({ item }: { item: LibraryItemData }) => {
    const isSelected = selectedItems.has(item.id)

    const handleSelect = (e: React.MouseEvent) => {
      e.stopPropagation()
      const newSet = new Set(selectedItems)
      if (e.metaKey || e.ctrlKey) {
        if (newSet.has(item.id)) newSet.delete(item.id)
        else newSet.add(item.id)
      } else {
        newSet.clear()
        newSet.add(item.id)
      }
      setSelectedItems(newSet)
      if (!e.metaKey && !e.ctrlKey) setSelectedFolders(new Set())
    }

    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            onClick={handleSelect}
            onDoubleClick={(e) => {
              e.stopPropagation()
              onOpenItem(item.id)
            }}
            className={cn(
              "group flex flex-col rounded-xl border overflow-hidden transition-all cursor-pointer hover:border-accent relative",
              isSelected ? "ring-2 ring-primary border-primary" : "bg-card border-border/40",
            )}
          >
            {/* Thumbnail */}
            <div className="aspect-video w-full bg-muted relative">
              <img src={item.thumbnailUrl || "/football-field.png"} alt="" className="w-full h-full object-cover" />
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded-sm">
                {item.duration}
              </div>
              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                  <Icon name="play" className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 flex flex-col gap-1">
              <span className="text-sm font-medium line-clamp-1" title={item.name}>
                {item.name}
              </span>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.createdDate}</span>
                {item.size && <span>{item.size}</span>}
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

  return (
    <div className="p-4 pb-20">
      {folders.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {folders.map((folder) => (
              <FolderTile key={folder.id} folder={folder} />
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
              <ItemTile key={item.id} item={item} />
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
