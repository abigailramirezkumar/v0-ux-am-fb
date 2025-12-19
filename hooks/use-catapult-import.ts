"use client"

import { useState, useCallback, useEffect } from "react"
import { mockCatapultData } from "@/lib/mock-catapult-data"
import type { FolderData } from "@/components/folder"
import type { LibraryItemData } from "@/components/library-item"

export interface ImportSettings {
  destination: string | null
  preserveStructure: boolean
  overwriteExisting: boolean
}

export interface QueueItem {
  id: string
  name: string
  type: "folder" | "item"
  progress: number
  status: "pending" | "importing" | "complete" | "cancelled"
  estimatedTime: number // in seconds
  subItemCount?: number // Added to track number of items in a folder
  folderData?: FolderData // Store folder data for import
  itemData?: LibraryItemData // Store item data for import
  isUpdate?: boolean // Track if this is an update vs new import
}

interface UseCatapultImportProps {
  onImportComplete?: (folders: FolderData[], items: LibraryItemData[]) => void // Removed importFolderName parameter since we're no longer using catch-all folder
}

export function useCatapultImport({ onImportComplete }: UseCatapultImportProps = {}) {
  const [externalData] = useState<FolderData[]>(mockCatapultData)
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set())
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [importedFolders, setImportedFolders] = useState<Set<string>>(new Set())
  const [importedItems, setImportedItems] = useState<Set<string>>(new Set())
  const [importSettings, setImportSettings] = useState<Omit<ImportSettings, "importFolderName">>({
    destination: null,
    preserveStructure: true,
    overwriteExisting: false,
  })
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isImporting, setIsImporting] = useState(false)

  // Helper function to collect all descendant IDs from a folder
  const collectAllDescendantIds = useCallback((folder: FolderData): { folderIds: string[]; itemIds: string[] } => {
    const folderIds: string[] = [folder.id]
    const itemIds: string[] = []

    // Collect item IDs from this folder
    if (folder.items) {
      itemIds.push(...folder.items.map((item) => item.id))
    }

    // Recursively collect from children
    if (folder.children) {
      folder.children.forEach((child) => {
        const descendants = collectAllDescendantIds(child)
        folderIds.push(...descendants.folderIds)
        itemIds.push(...descendants.itemIds)
      })
    }

    return { folderIds, itemIds }
  }, [])

  const countFolderItems = useCallback((folder: FolderData): number => {
    let count = folder.items?.length || 0
    if (folder.children) {
      folder.children.forEach((child) => {
        count += countFolderItems(child)
      })
    }
    return count
  }, [])

  const toggleFolderSelection = useCallback(
    (folderId: string) => {
      const folder = findFolderById(externalData, folderId)
      if (!folder) return

      const isCurrentlySelected = selectedFolders.has(folderId)
      const { folderIds, itemIds } = collectAllDescendantIds(folder)

      if (isCurrentlySelected) {
        // Deselect this folder and all descendants
        setSelectedFolders((prev) => {
          const newSet = new Set(prev)
          folderIds.forEach((id) => newSet.delete(id))
          return newSet
        })
        setSelectedItems((prev) => {
          const newSet = new Set(prev)
          itemIds.forEach((id) => newSet.delete(id))
          return newSet
        })
      } else {
        // Select this folder and all descendants
        setSelectedFolders((prev) => {
          const newSet = new Set(prev)
          folderIds.forEach((id) => newSet.add(id))
          return newSet
        })
        setSelectedItems((prev) => {
          const newSet = new Set(prev)
          itemIds.forEach((id) => newSet.add(id))
          return newSet
        })
      }
    },
    [externalData, selectedFolders, collectAllDescendantIds],
  )

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }, [])

  const toggleFolderExpand = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }, [])

  const updateSettings = useCallback((settings: Partial<ImportSettings>) => {
    setImportSettings((prev) => ({ ...prev, ...settings }))
  }, [])

  const findFolderById = (folders: FolderData[], id: string): FolderData | null => {
    for (const folder of folders) {
      if (folder.id === id) return folder
      if (folder.children) {
        const found = findFolderById(folder.children, id)
        if (found) return found
      }
    }
    return null
  }

  const findItemById = (folders: FolderData[], id: string): LibraryItemData | null => {
    for (const folder of folders) {
      if (folder.items) {
        const item = folder.items.find((i) => i.id === id)
        if (item) return item
      }
      if (folder.children) {
        const found = findItemById(folder.children, id)
        if (found) return found
      }
    }
    return null
  }

  const addToQueue = useCallback(() => {
    const newQueueItems: QueueItem[] = []
    const processedFolderIds = new Set<string>()

    // Add selected folders to queue (only top-level selected folders)
    selectedFolders.forEach((folderId) => {
      // Skip if this folder is a child of another selected folder
      const folder = findFolderById(externalData, folderId)
      if (!folder) return

      // Check if any parent folder is also selected
      let hasSelectedParent = false
      const checkParent = (folders: FolderData[], targetId: string, parentId?: string): boolean => {
        for (const f of folders) {
          if (f.id === targetId && parentId && selectedFolders.has(parentId)) {
            return true
          }
          if (f.children) {
            if (checkParent(f.children, targetId, f.id)) return true
          }
        }
        return false
      }

      hasSelectedParent = checkParent(externalData, folderId)

      if (!hasSelectedParent) {
        const subItemCount = countFolderItems(folder)
        newQueueItems.push({
          id: folderId,
          name: folder.name,
          type: "folder",
          progress: 0,
          status: "pending",
          estimatedTime: Math.floor(Math.random() * 30) + 10,
          subItemCount,
          folderData: folder,
          isUpdate: false, // Mark as new import
        })
        processedFolderIds.add(folderId)

        // Mark all descendants as processed
        const { folderIds, itemIds } = collectAllDescendantIds(folder)
        folderIds.forEach((id) => processedFolderIds.add(id))
        itemIds.forEach((id) => processedFolderIds.add(id))
      }
    })

    // Add selected items to queue (only if not part of a selected folder)
    selectedItems.forEach((itemId) => {
      if (!processedFolderIds.has(itemId)) {
        const item = findItemById(externalData, itemId)
        if (item) {
          newQueueItems.push({
            id: itemId,
            name: item.name,
            type: "item",
            progress: 0,
            status: "pending",
            estimatedTime: Math.floor(Math.random() * 20) + 5,
            itemData: item,
            isUpdate: false, // Mark as new import
          })
        }
      }
    })

    setQueue((prev) => [...prev, ...newQueueItems])
    setSelectedFolders(new Set())
    setSelectedItems(new Set())
  }, [selectedFolders, selectedItems, externalData, countFolderItems, collectAllDescendantIds])

  const buildFolderStructureForItem = useCallback(
    (itemId: string): FolderData | null => {
      const findItemPath = (
        folders: FolderData[],
        targetItemId: string,
        path: FolderData[] = [],
      ): FolderData[] | null => {
        for (const folder of folders) {
          if (folder.items) {
            const item = folder.items.find((i) => i.id === targetItemId)
            if (item) return [...path, folder]
          }
          if (folder.children) {
            const childPath = findItemPath(folder.children, targetItemId, [...path, folder])
            if (childPath) return childPath
          }
        }
        return null
      }

      const path = findItemPath(externalData, itemId)
      if (!path || path.length === 0) return null

      const item = findItemById(externalData, itemId)
      if (!item) return null

      // Build nested folder structure from root to leaf, containing only the selected item
      const buildNestedFolder = (folders: FolderData[], depth: number): FolderData => {
        const currentFolder = folders[depth]
        const isLeaf = depth === folders.length - 1

        return {
          ...currentFolder,
          // Only include the item in the leaf folder
          items: isLeaf ? [item] : undefined,
          // Only include children if we need to go deeper
          children: isLeaf ? undefined : [buildNestedFolder(folders, depth + 1)],
        }
      }

      return buildNestedFolder(path, 0)
    },
    [externalData],
  )

  const buildFolderStructureForFolder = useCallback(
    (folderId: string): FolderData | null => {
      // Find the path from root to the target folder
      const findFolderPath = (
        folders: FolderData[],
        targetFolderId: string,
        path: FolderData[] = [],
      ): FolderData[] | null => {
        for (const folder of folders) {
          if (folder.id === targetFolderId) {
            return [...path, folder]
          }
          if (folder.children) {
            const childPath = findFolderPath(folder.children, targetFolderId, [...path, folder])
            if (childPath) return childPath
          }
        }
        return null
      }

      const path = findFolderPath(externalData, folderId)
      if (!path || path.length === 0) return null

      const targetFolder = path[path.length - 1]

      // If it's a root-level folder, return it as-is
      if (path.length === 1) {
        return targetFolder
      }

      // Build nested folder structure from root to target, containing only the selected folder
      const buildNestedFolder = (folders: FolderData[], depth: number): FolderData => {
        const currentFolder = folders[depth]
        const isTarget = depth === folders.length - 1

        return {
          ...currentFolder,
          // Only include children if we need to go deeper to reach the target folder
          children: isTarget ? currentFolder.children : [buildNestedFolder(folders, depth + 1)],
          // Don't include items from parent folders unless they're in the target folder
          items: isTarget ? currentFolder.items : undefined,
        }
      }

      return buildNestedFolder(path, 0)
    },
    [externalData],
  )

  const startImport = useCallback(() => {
    setIsImporting(true)

    const processQueue = () => {
      setQueue((currentQueue) => {
        const updatedQueue = [...currentQueue]
        let hasActiveImport = false
        const completedItems: QueueItem[] = []

        for (let i = 0; i < updatedQueue.length; i++) {
          const item = updatedQueue[i]

          if (item.status === "importing") {
            hasActiveImport = true
            if (item.progress < 100) {
              updatedQueue[i] = {
                ...item,
                progress: Math.min(item.progress + Math.random() * 10, 100),
                estimatedTime: Math.max(item.estimatedTime - 1, 0),
              }
            } else {
              updatedQueue[i] = { ...item, status: "complete", progress: 100, estimatedTime: 0 }
              completedItems.push(updatedQueue[i])
            }
            break
          }

          if (item.status === "pending" && !hasActiveImport) {
            updatedQueue[i] = { ...item, status: "importing" }
            hasActiveImport = true
            break
          }
        }

        if (completedItems.length > 0) {
          setTimeout(() => {
            completedItems.forEach((item) => {
              if (item.isUpdate) return

              if (item.type === "folder" && item.folderData) {
                const folderStructure = buildFolderStructureForFolder(item.id)
                if (folderStructure) {
                  setImportedFolders((prev) => {
                    const newSet = new Set(prev)
                    newSet.add(item.id)

                    // Collect all descendant folder and item IDs
                    if (item.folderData) {
                      const { folderIds, itemIds } = collectAllDescendantIds(item.folderData)
                      folderIds.forEach((id) => newSet.add(id))

                      // Also mark all descendant items as imported
                      setImportedItems((prevItems) => {
                        const newItemSet = new Set(prevItems)
                        itemIds.forEach((id) => newItemSet.add(id))
                        return newItemSet
                      })
                    }

                    return newSet
                  })
                }
              } else {
                setImportedItems((prev) => new Set(prev).add(item.id))
              }
            })

            if (onImportComplete) {
              const folders: FolderData[] = []

              completedItems.forEach((item) => {
                // Skip adding to library if this is an update
                if (item.isUpdate) return

                if (item.type === "folder" && item.folderData) {
                  const folderStructure = buildFolderStructureForFolder(item.id)
                  if (folderStructure) {
                    folders.push(folderStructure)
                  }
                } else if (item.type === "item" && item.itemData) {
                  const folderStructure = buildFolderStructureForItem(item.id)
                  if (folderStructure) {
                    folders.push(folderStructure)
                  }
                }
              })

              if (folders.length > 0) {
                onImportComplete(folders)
              }
            }
          }, 0)
        }

        const allDone = updatedQueue.every((item) => item.status === "complete" || item.status === "cancelled")
        if (allDone) {
          setIsImporting(false)
        }

        return updatedQueue
      })
    }

    const interval = setInterval(processQueue, 500)
    return () => clearInterval(interval)
  }, [onImportComplete, collectAllDescendantIds, buildFolderStructureForItem, buildFolderStructureForFolder])

  useEffect(() => {
    if (queue.length > 0 && !isImporting) {
      const hasNonCompleted = queue.some((item) => item.status !== "complete" && item.status !== "cancelled")
      if (hasNonCompleted) {
        startImport()
      }
    }
  }, [queue, isImporting, startImport])

  const cancelQueueItem = useCallback((itemId: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === itemId && item.status !== "complete" ? { ...item, status: "cancelled" } : item)),
    )
  }, [])

  const cancelAllQueue = useCallback(() => {
    setQueue((prev) => prev.map((item) => (item.status !== "complete" ? { ...item, status: "cancelled" } : item)))
    setIsImporting(false)
  }, [])

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      const newQueue = [...prev]
      const [removed] = newQueue.splice(fromIndex, 1)
      newQueue.splice(toIndex, 0, removed)
      return newQueue
    })
  }, [])

  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((item) => item.status !== "complete" && item.status !== "cancelled"))
  }, [])

  const updateImportedItem = useCallback(
    (id: string, type: "folder" | "item") => {
      if (type === "folder") {
        const folder = findFolderById(externalData, id)
        if (!folder) return

        const subItemCount = countFolderItems(folder)
        const newQueueItem: QueueItem = {
          id,
          name: folder.name,
          type: "folder",
          progress: 0,
          status: "pending",
          estimatedTime: Math.floor(Math.random() * 30) + 10,
          subItemCount,
          folderData: folder,
          isUpdate: true, // Mark as update to prevent duplicate creation
        }
        setQueue((prev) => [...prev, newQueueItem])
      } else {
        const item = findItemById(externalData, id)
        if (!item) return

        const newQueueItem: QueueItem = {
          id,
          name: item.name,
          type: "item",
          progress: 0,
          status: "pending",
          estimatedTime: Math.floor(Math.random() * 20) + 5,
          itemData: item,
          isUpdate: true, // Mark as update to prevent duplicate creation
        }
        setQueue((prev) => [...prev, newQueueItem])
      }
    },
    [externalData, countFolderItems],
  )

  return {
    externalData,
    selectedFolders,
    selectedItems,
    expandedFolders,
    importedFolders,
    importedItems,
    importSettings,
    isImporting,
    queue,
    toggleFolderSelection,
    toggleItemSelection,
    toggleFolderExpand,
    updateSettings,
    addToQueue,
    startImport,
    cancelQueueItem,
    cancelAllQueue,
    reorderQueue,
    clearCompleted,
    updateImportedItem,
  }
}
