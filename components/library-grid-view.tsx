"use client"

import type React from "react"

import type { FolderData } from "@/components/folder"
import type { LibraryItemData } from "@/components/library-item"
import { Icon, FolderIcon, CalendarIcon, UserIcon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { useLibraryContext } from "@/lib/library-context"
import { ContextMenu, ContextMenuContent, ContextMenuTrigger, ContextMenuItem } from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

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
}

const FolderTile = ({ folder, onNavigate }: FolderTileProps) => {
  // Access context directly inside the component
  const { selectedFolders, setSelectedFolders, setSelectedItems, openMoveModal, openPermissionsModal } =
    useLibraryContext()

  const isSelected = selectedFolders.has(folder.id)

  const isEmpty = !folder.children?.length && !folder.items?.length

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newSet = new Set(e.metaKey || e.ctrlKey ? selectedFolders : [])
    if (newSet.has(folder.id)) {
      newSet.delete(folder.id)
    } else {
      newSet.add(folder.id)
    }
    setSelectedFolders(newSet)

    // Clear item selection unless multiselect
    if (!e.metaKey && !e.ctrlKey) {
      setSelectedItems(new Set())
    }
  }

  const itemCount = (folder.children?.length || 0) + (folder.items?.length || 0)

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
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
            isEmpty && !isSelected && "opacity-50 grayscale",
          )}
        >
          {/* Name - top left, bold */}
          <span className="text-sm font-bold text-white line-clamp-2 pr-8">{folder.name}</span>

          {/* Bottom row: count left, icon right */}
          <div className="flex items-end justify-between">
            <span className="text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </span>
            <div className="text-muted-foreground/70 [&_svg]:w-5 [&_svg]:h-5">{getFolderIcon(folder.icon)}</div>
          </div>

          {/* Hover Actions (3-dot) */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-white/10 rounded-md" onClick={(e) => e.stopPropagation()}>
                  <Icon name="more-vertical" className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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

interface ItemTileProps {
  item: LibraryItemData
  onOpenItem: (id: string) => void
}

const ItemTile = ({ item, onOpenItem }: ItemTileProps) => {
  const { selectedItems, setSelectedItems, setSelectedFolders, openMoveModal, openPermissionsModal } =
    useLibraryContext()

  const isSelected = selectedItems.has(item.id)

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

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
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
}

export function LibraryGridView({ folders, items, onNavigate, onOpenItem }: LibraryGridViewProps) {
  return (
    <div className="p-4 pb-20">
      {folders.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {folders.map((folder) => (
              <FolderTile key={folder.id} folder={folder} onNavigate={onNavigate} />
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
