"use client"

import { useState, useEffect, useRef } from "react"
import { useLibraryContext, type MoveItem } from "@/lib/library-context"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import { useRouter } from "next/navigation"
import type { FolderData } from "@/components/folder"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function LibraryActionBar() {
  const {
    selectedFolders,
    selectedItems,
    setSelectedFolders,
    setSelectedItems,
    setCurrentFolderId,
    setWatchItem,
    setWatchItems,
    copyFolder,
    setFolders,
    folders,
    openMoveModal,
  } = useLibraryContext()

  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsCompact(entry.contentRect.width < 640)
      }
    })
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [])

  const numFolders = selectedFolders.size
  const numItems = selectedItems.size
  const totalSelected = numFolders + numItems

  const calculateTotalHours = () => {
    let totalMinutes = 0

    const findItems = (nodes: FolderData[]) => {
      for (const node of nodes) {
        if (node.items) {
          for (const item of node.items) {
            if (selectedItems.has(item.id)) {
              const parts = item.duration?.split(":").map(Number) || []
              if (parts.length === 3) {
                totalMinutes += parts[0] * 60 + parts[1] + parts[2] / 60
              } else if (parts.length === 2) {
                totalMinutes += parts[0] + parts[1] / 60
              }
            }
          }
        }
        if (node.children) {
          findItems(node.children)
        }
      }
    }

    findItems(folders)

    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.floor(totalMinutes % 60)
    return `${hours}h ${minutes}m`
  }

  const totalDuration = numItems > 0 ? calculateTotalHours() : null

  if (totalSelected === 0) return null

  const handleClear = () => {
    setSelectedFolders(new Set())
    setSelectedItems(new Set())
  }

  const handleDelete = () => {
    const deleteRecursive = (nodes: FolderData[]): FolderData[] => {
      return nodes
        .filter((node) => {
          if (selectedFolders.has(node.id)) return false
          return true
        })
        .map((node) => {
          const newNode = { ...node }
          if (newNode.children) {
            newNode.children = deleteRecursive(newNode.children)
          }
          if (newNode.items) {
            newNode.items = newNode.items.filter((item) => !selectedItems.has(item.id))
          }
          return newNode
        })
    }

    setFolders((prev) => deleteRecursive(prev))
    handleClear()
  }

  const handlePlay = () => {
    if (numItems === 1) {
      setWatchItem(Array.from(selectedItems)[0])
    } else {
      setWatchItems(Array.from(selectedItems))
    }
    router.push("/watch")
  }

  const handleOpenFolder = () => {
    if (numFolders === 1) {
      setCurrentFolderId(Array.from(selectedFolders)[0])
      handleClear()
    }
  }

  const handleCopy = () => {
    selectedFolders.forEach((id) => copyFolder(id, "full"))
    handleClear()
  }

  const handleMove = () => {
    const items: MoveItem[] = []
    selectedFolders.forEach((id) => items.push({ id, type: "folder" }))
    selectedItems.forEach((id) => items.push({ id, type: "item" }))
    openMoveModal(items)
  }

  const isSingleItem = numFolders === 0 && numItems === 1
  const isMultipleItems = numFolders === 0 && numItems > 1
  const isSingleFolder = numFolders === 1 && numItems === 0
  const isMultipleFolders = numFolders > 1 && numItems === 0
  const isMixed = numFolders > 0 && numItems > 0

  const renderPrimary = () => {
    if (isSingleItem || isMultipleItems) {
      return (
        <Button
          size="sm"
          onClick={handlePlay}
          className="bg-primary text-primary-foreground hover:bg-primary/90 border-0 font-semibold whitespace-nowrap"
        >
          <Icon name="play" className="w-4 h-4 mr-2" />
          {isSingleItem ? "Play" : "Play all"}
        </Button>
      )
    }
    if (isSingleFolder) {
      return (
        <Button
          size="sm"
          onClick={handleOpenFolder}
          className="bg-primary text-primary-foreground hover:bg-primary/90 border-0 font-semibold"
        >
          Open
        </Button>
      )
    }
    return null
  }

  const renderSecondaryActions = (mode: "inline" | "dropdown") => {
    const actions: { label: string; action: () => void }[] = []

    // View Reports for items
    if (isSingleItem || isMultipleItems) {
      actions.push({ label: "View Reports", action: () => {} })
    }

    // Copy for folders or mixed
    if (isSingleFolder || isMultipleFolders || isMixed) {
      actions.push({ label: "Copy Folder and Contents", action: handleCopy })
    }

    actions.push({ label: "Move", action: handleMove })

    if (mode === "dropdown") {
      return (
        <>
          {actions.map((act, i) => (
            <DropdownMenuItem key={i} onClick={act.action}>
              {act.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
            Delete
          </DropdownMenuItem>
        </>
      )
    }

    return (
      <>
        {actions.map((act, i) => (
          <Button
            key={i}
            size="sm"
            variant="ghost"
            onClick={act.action}
            className="text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {act.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          Delete
        </Button>
      </>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-between w-full bg-content-emphasis-background-default text-foreground px-4 rounded-none overflow-hidden py-1.5"
    >
      {/* Left side: Close button and selection info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <button onClick={handleClear} className="hover:text-foreground/80 transition-colors flex-shrink-0">
          <Icon name="close" className="w-5 h-5" />
        </button>
        <div className="flex items-baseline gap-2 overflow-hidden">
          <span className="font-medium text-sm truncate">{totalSelected} Selected</span>
          {!isCompact && totalDuration && (
            <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">({totalDuration})</span>
          )}
        </div>
      </div>

      {/* Right side: Context-aware action buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {renderPrimary()}

        {isCompact ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="text-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
              >
                <div className="flex flex-col gap-0.5 items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-foreground" />
                  <div className="w-1 h-1 rounded-full bg-foreground" />
                  <div className="w-1 h-1 rounded-full bg-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">{renderSecondaryActions("dropdown")}</DropdownMenuContent>
          </DropdownMenu>
        ) : (
          renderSecondaryActions("inline")
        )}
      </div>
    </div>
  )
}
