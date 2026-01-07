"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/button"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import type { FolderData } from "@/components/folder"

interface FolderReorderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders: FolderData[]
  parentId: string // 'root' or folder ID
  onSave: (parentId: string, newOrder: string[]) => void
}

export function FolderReorderModal({ open, onOpenChange, folders, parentId, onSave }: FolderReorderModalProps) {
  const [orderedFolders, setOrderedFolders] = useState<FolderData[]>(folders)
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null)

  // Reset internal state when modal opens with new data
  useEffect(() => {
    if (open) {
      setOrderedFolders(folders)
    }
  }, [open, folders])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedItemIndex === null || draggedItemIndex === index) return

    const newOrder = [...orderedFolders]
    const draggedItem = newOrder[draggedItemIndex]
    newOrder.splice(draggedItemIndex, 1)
    newOrder.splice(index, 0, draggedItem)

    setOrderedFolders(newOrder)
    setDraggedItemIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedItemIndex(null)
  }

  const handleSave = () => {
    const newOrderIds = orderedFolders.map((f) => f.id)
    onSave(parentId, newOrderIds)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Folder Order</DialogTitle>
          <DialogDescription>
            Drag and drop to reorder folders. New folders will appear at the top of the list until reordered.
          </DialogDescription>
        </DialogHeader>

        <div className="border border-border rounded-md max-h-[300px] overflow-y-auto bg-muted/30 p-1 space-y-1">
          {orderedFolders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No folders to reorder.</div>
          ) : (
            orderedFolders.map((folder, index) => (
              <div
                key={folder.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center gap-3 p-3 bg-card border border-border rounded shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors",
                  draggedItemIndex === index && "opacity-50",
                )}
              >
                <Icon name="menu" className="text-muted-foreground w-4 h-4 shrink-0" />
                <Icon name="folder" className="text-muted-foreground w-4 h-4 shrink-0" />
                <span className="text-sm font-medium truncate">{folder.name}</span>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="subtle" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
