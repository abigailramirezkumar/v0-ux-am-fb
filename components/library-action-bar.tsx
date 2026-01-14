"use client"

import type React from "react"

import { useLibraryContext } from "@/lib/library-context"
import { Icon } from "@/components/icon"
import { useRouter } from "next/navigation"
import type { FolderData } from "@/components/folder"
import { useState, useEffect, useRef } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  } = useLibraryContext()

  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isCompact, setIsCompact] = useState(false)

  const numFolders = selectedFolders.size
  const numItems = selectedItems.size
  const totalSelected = numFolders + numItems

  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        setIsCompact(containerRef.current.offsetWidth < 600)
      }
    }
    checkWidth()
    window.addEventListener("resize", checkWidth)
    return () => window.removeEventListener("resize", checkWidth)
  }, [])

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
    // Placeholder for move functionality
  }

  const estimatedHours = (numItems * 1.04).toFixed(1)

  const ActionButton = ({
    onClick,
    variant,
    children,
  }: {
    onClick?: () => void
    variant: "primary" | "secondary" | "danger"
    children: React.ReactNode
  }) => {
    const baseClasses = "px-4 py-1.5 rounded text-sm font-medium transition-colors"
    const variantClasses = {
      primary: "bg-[#3B82A0] hover:bg-[#3B82A0]/90 text-white",
      secondary: "bg-[#4A5568] hover:bg-[#4A5568]/90 text-white",
      danger: "bg-[#C53030] hover:bg-[#C53030]/90 text-white",
    }
    return (
      <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`}>
        {children}
      </button>
    )
  }

  const renderActions = () => {
    const actions = []

    // Play action (items only)
    if (numFolders === 0 && numItems > 0) {
      actions.push({
        key: "play",
        label: numItems === 1 ? "Play" : "Play",
        icon: "play",
        onClick: handlePlay,
        variant: "primary" as const,
        isPrimary: true,
      })
    }

    // Open action (single folder only)
    if (numFolders === 1 && numItems === 0) {
      actions.push({
        key: "open",
        label: "Open",
        onClick: handleOpenFolder,
        variant: "primary" as const,
        isPrimary: true,
      })
    }

    // Move action
    actions.push({
      key: "move",
      label: "Move",
      onClick: handleMove,
      variant: "secondary" as const,
    })

    // Copy action
    if (numFolders > 0) {
      actions.push({
        key: "copy",
        label: "Copy",
        onClick: handleCopy,
        variant: "secondary" as const,
      })
    }

    // Delete action
    actions.push({
      key: "delete",
      label: "Delete",
      onClick: handleDelete,
      variant: "danger" as const,
    })

    if (isCompact) {
      const primaryAction = actions.find((a) => a.isPrimary)
      const secondaryActions = actions.filter((a) => !a.isPrimary)

      return (
        <div className="flex items-center gap-2">
          {primaryAction && (
            <ActionButton onClick={primaryAction.onClick} variant={primaryAction.variant}>
              {primaryAction.icon && <Icon name={primaryAction.icon} className="w-4 h-4 mr-1.5 inline" />}
              {primaryAction.label}
            </ActionButton>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                <Icon name="more" className="w-5 h-5 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              {secondaryActions.map((action) => (
                <DropdownMenuItem
                  key={action.key}
                  onClick={action.onClick}
                  className={action.variant === "danger" ? "text-red-600 focus:text-red-600" : ""}
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <ActionButton key={action.key} onClick={action.onClick} variant={action.variant}>
            {action.icon && <Icon name={action.icon} className="w-4 h-4 mr-1.5 inline" />}
            {action.label}
          </ActionButton>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-between w-full py-2 px-4 bg-[#F7FAFC] border border-gray-200 rounded-md"
    >
      <div className="flex items-center gap-3">
        <span className="font-semibold text-sm text-gray-900">
          {totalSelected} Item{totalSelected !== 1 ? "s" : ""} Selected
        </span>
        {numItems > 0 && <span className="text-sm text-gray-500">({estimatedHours} hrs)</span>}
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Icon name="close" className="w-4 h-4" />
          <span>Clear</span>
        </button>
      </div>

      {renderActions()}
    </div>
  )
}
