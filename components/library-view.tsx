"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LibraryHeader } from "@/components/library-header"
import { LibrarySubheader } from "@/components/library-subheader"
import { LibraryTableHeader } from "@/components/library-table-header"
import { LibraryActionBar } from "@/components/library-action-bar"
import { Folder, type FolderData } from "@/components/folder"
import { LibraryItem, type LibraryItemData } from "@/components/library-item"
import { useCatapultImport } from "@/lib/catapult-import-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/button"
import { useDensity } from "@/lib/density-context"
import { useLibraryContext } from "@/lib/library-context"
import { FolderReorderModal } from "@/components/folder-reorder-modal"
import { toast } from "@/components/ui/use-toast"
import { MoveToModal } from "@/components/move-to-modal"
import { PermissionsModal } from "@/components/permissions-modal"
import { LibraryGridView } from "@/components/library-grid-view"

const parseDuration = (str?: string) => {
  if (!str) return 0
  const parts = str.split(":").map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return 0
}

const parseSize = (str?: string) => {
  if (!str) return 0
  const units: Record<string, number> = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }
  const match = str.match(/([\d.]+)\s*([A-Z]+)/i)
  if (!match) return 0
  const val = Number.parseFloat(match[1])
  const unit = match[2].toUpperCase()
  return val * (units[unit] || 1)
}

export function LibraryView() {
  const router = useRouter()
  const { isCatapultImportOpen, setIsCatapultImportOpen } = useCatapultImport()
  const { density } = useDensity()

  const {
    sort,
    folderOrder,
    updateFolderOrder,
    setWatchItem,
    folders,
    rootItems,
    setFolders,
    setRootItems,
    libraryView,
    setLibraryView,
    selectedFolders,
    setSelectedFolders,
    selectedItems,
    setSelectedItems,
    expandedFolders,
    setExpandedFolders,
    currentFolderId,
    setCurrentFolderId,
    breadcrumbs,
    setBreadcrumbs,
    setRenamingId,
    viewMode,
    scheduleFolders,
    activeWatchItemId,
    layoutMode,
  } = useLibraryContext()

  useEffect(() => {
    if (activeWatchItemId) {
      // 1. Select the item
      setSelectedItems(new Set([activeWatchItemId]))

      // 2. Find and expand parent folders
      const parentIds = new Set<string>()

      const findParents = (nodes: FolderData[], targetId: string, path: string[] = []): boolean => {
        for (const node of nodes) {
          // Check if item is in this folder
          if (node.items?.some((item) => item.id === targetId)) {
            // Add this folder and all ancestors to parents
            path.forEach((id) => parentIds.add(id))
            parentIds.add(node.id)
            return true
          }

          // Recursive check for children folders
          if (node.children) {
            if (findParents(node.children, targetId, [...path, node.id])) {
              return true
            }
          }
        }
        return false
      }

      // Search in the active data source (either flat folders or schedule view)
      const sourceData = viewMode === "schedule" ? scheduleFolders : folders
      findParents(sourceData, activeWatchItemId)

      if (parentIds.size > 0) {
        setExpandedFolders((prev) => {
          const next = new Set(prev)
          parentIds.forEach((id) => next.add(id))
          return next
        })
      }
    }
  }, [activeWatchItemId, folders, scheduleFolders, viewMode, setSelectedItems, setExpandedFolders])

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null)
  const [importedFolders, setImportedFolders] = useState<Set<string>>(new Set())
  const [importedItems, setImportedItems] = useState<Set<string>>(new Set())
  const [folderSortOptions, setFolderSortOptions] = useState<Record<string, { by: string; direction: "asc" | "desc" }>>(
    {},
  )
  const [reorderModalOpen, setReorderModalOpen] = useState(false)
  const [reorderTargetId, setReorderTargetId] = useState<string | null>(null)

  const handleImportComplete = (importedFolders: FolderData[]) => {
    if (importedFolders.length > 0) {
      setFolders((prev) => {
        const mergeFolders = (existing: FolderData[], incoming: FolderData[]): FolderData[] => {
          const result = [...existing]

          for (const incomingFolder of incoming) {
            const existingIndex = result.findIndex((f) => f.name === incomingFolder.name)

            if (existingIndex !== -1) {
              const existingFolder = result[existingIndex]
              result[existingIndex] = {
                ...existingFolder,
                children: incomingFolder.children
                  ? mergeFolders(existingFolder.children || [], incomingFolder.children)
                  : existingFolder.children,
                items: [
                  ...(existingFolder.items || []),
                  ...(incomingFolder.items || []).filter(
                    (newItem) => !(existingFolder.items || []).some((existing) => existing.id === newItem.id),
                  ),
                ],
              }
            } else {
              result.push(incomingFolder)
            }
          }

          return result
        }

        if (currentFolderId === null) {
          return mergeFolders(prev, importedFolders)
        } else {
          const addToFolder = (folders: FolderData[]): FolderData[] => {
            return folders.map((folder) => {
              if (folder.id === currentFolderId) {
                return {
                  ...folder,
                  children: mergeFolders(folder.children || [], importedFolders),
                }
              }
              if (folder.children) {
                return {
                  ...folder,
                  children: addToFolder(folder.children),
                }
              }
              return folder
            })
          }
          return addToFolder(prev)
        }
      })

      const collectIds = (folders: FolderData[]): { folderIds: string[]; itemIds: string[] } => {
        const folderIds: string[] = []
        const itemIds: string[] = []

        const traverse = (folder: FolderData) => {
          folderIds.push(folder.id)
          if (folder.items) {
            folder.items.forEach((item) => itemIds.push(item.id))
          }
          if (folder.children) {
            folder.children.forEach(traverse)
          }
        }

        folders.forEach(traverse)
        return { folderIds, itemIds }
      }

      const { folderIds, itemIds } = collectIds(importedFolders)
      setImportedFolders(new Set(folderIds))
      setImportedItems(new Set(itemIds))
    }
  }

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

  const buildBreadcrumbs = (folderId: string): Array<{ id: string; name: string }> => {
    const path: Array<{ id: string; name: string }> = []

    const findPath = (
      folders: FolderData[],
      targetId: string,
      currentPath: Array<{ id: string; name: string }>,
    ): boolean => {
      for (const folder of folders) {
        const newPath = [...currentPath, { id: folder.id, name: folder.name }]
        if (folder.id === targetId) {
          path.push(...newPath)
          return true
        }
        if (folder.children && findPath(folder.children, targetId, newPath)) {
          return true
        }
      }
      return false
    }

    findPath(folders, folderId, [])
    return path
  }

  const handleNavigate = (folderId: string | null) => {
    if (folderId === null) {
      setCurrentFolderId(null)
      setBreadcrumbs([])
      setExpandedFolders(new Set())
    } else {
      setCurrentFolderId(folderId)
      setBreadcrumbs(buildBreadcrumbs(folderId))
    }
  }

  const handleFolderDoubleClick = (folderId: string) => {
    handleNavigate(folderId)
  }

  const createFolder = () => {
    const newFolderId = `folder-${Date.now()}`
    const newFolder: FolderData = {
      id: newFolderId,
      name: `New Folder`,
      children: [],
      items: [],
      createdDate: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    }

    if (currentFolderId === null) {
      setFolders((prev) => [...prev, newFolder])
    } else {
      const addToFolder = (folders: FolderData[]): FolderData[] => {
        return folders.map((folder) => {
          if (folder.id === currentFolderId) {
            return {
              ...folder,
              children: [...(folder.children || []), newFolder],
            }
          }
          if (folder.children) {
            return {
              ...folder,
              children: addToFolder(folder.children),
            }
          }
          return folder
        })
      }
      setFolders(addToFolder(folders))
    }

    setRenamingId(newFolderId)
  }

  const handleCreateSubfolder = useCallback(
    (parentId: string) => {
      const newFolderId = `folder-${Date.now()}`
      const newFolder: FolderData = {
        id: newFolderId,
        name: `New Folder`,
        children: [],
        items: [],
        createdDate: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      }

      const addSubfolder = (folders: FolderData[]): FolderData[] => {
        return folders.map((folder) => {
          if (folder.id === parentId) {
            return {
              ...folder,
              children: [...(folder.children || []), newFolder],
            }
          }
          if (folder.children) {
            return {
              ...folder,
              children: addSubfolder(folder.children),
            }
          }
          return folder
        })
      }

      setFolders(addSubfolder(folders))

      setExpandedFolders((prev) => new Set([...prev, parentId]))

      setRenamingId(newFolderId)
    },
    [folders, setFolders, setExpandedFolders, setRenamingId],
  )

  const currentFolder = useMemo(
    () => (currentFolderId === null ? null : findFolderById(folders, currentFolderId)),
    [folders, currentFolderId],
  )

  const collectAllDescendantIds = (folder: FolderData): { folderIds: string[]; itemIds: string[] } => {
    const folderIds: string[] = []
    const itemIds: string[] = []

    const traverse = (currentFolder: FolderData) => {
      if (currentFolder.children) {
        for (const child of currentFolder.children) {
          folderIds.push(child.id)
          traverse(child)
        }
      }

      if (currentFolder.items) {
        for (const item of currentFolder.items) {
          itemIds.push(item.id)
        }
      }
    }

    traverse(folder)
    return { folderIds, itemIds }
  }

  const handleSelectFolder = (folderId: string, selected: boolean) => {
    const folder = findFolderById(folders, folderId)
    if (!folder) return

    const { folderIds, itemIds } = collectAllDescendantIds(folder)

    const newSelectedFolders = new Set(selectedFolders)
    if (selected) {
      newSelectedFolders.add(folderId)
      folderIds.forEach((id) => newSelectedFolders.add(id))
    } else {
      newSelectedFolders.delete(folderId)
      folderIds.forEach((id) => newSelectedFolders.delete(id))
    }
    setSelectedFolders(newSelectedFolders)

    const newSelectedItems = new Set(selectedItems)
    if (selected) {
      itemIds.forEach((id) => newSelectedItems.add(id))
    } else {
      itemIds.forEach((id) => newSelectedItems.delete(id))
    }
    setSelectedItems(newSelectedItems)
  }

  const handleSelectItem = (itemId: string, selected: boolean) => {
    const newSet = new Set(selectedItems)
    if (selected) {
      newSet.add(itemId)
    } else {
      newSet.delete(itemId)
    }
    setSelectedItems(newSet)
  }

  const handleToggleExpand = (folderId: string) => {
    const newSet = new Set(expandedFolders)
    if (newSet.has(folderId)) {
      newSet.delete(folderId)
    } else {
      newSet.add(folderId)
    }
    setExpandedFolders(newSet)
  }

  const handleRenameFolder = (folderId: string, newName: string) => {
    const renameInFolders = (folders: FolderData[]): FolderData[] => {
      return folders.map((folder) => {
        if (folder.id === folderId) {
          return { ...folder, name: newName, dateModified: new Date().toISOString() }
        }
        if (folder.children) {
          return { ...folder, children: renameInFolders(folder.children), dateModified: new Date().toISOString() }
        }
        return folder
      })
    }
    setFolders(renameInFolders(folders))
  }

  const handleDeleteFolderStart = (folderId: string) => {
    setFolderToDelete(folderId)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!folderToDelete) return

    const deleteFromFolders = (folders: FolderData[]): FolderData[] => {
      return folders
        .filter((folder) => folder.id !== folderToDelete)
        .map((folder) => {
          if (folder.children) {
            return { ...folder, children: deleteFromFolders(folder.children) }
          }
          return folder
        })
    }

    setFolders(deleteFromFolders(folders))
    setDeleteModalOpen(false)
    setFolderToDelete(null)
  }

  const handleUpdateImported = (id: string, type: "folder" | "item") => {
    // Handle update imported logic
  }

  const handleSortFolder = (folderId: string, sortBy: string, direction: "asc" | "desc" = "asc") => {
    if (sortBy === "") {
      setFolderSortOptions((prev) => {
        const newOptions = { ...prev }
        delete newOptions[folderId]
        return newOptions
      })
    } else {
      setFolderSortOptions((prev) => ({
        ...prev,
        [folderId]: { by: sortBy, direction },
      }))
    }
  }

  const handleOpenReorder = (targetId: string | null = null) => {
    setReorderTargetId(targetId ?? currentFolderId ?? "root")
    setReorderModalOpen(true)
  }

  const handleOpenItem = useCallback(
    (itemId: string) => {
      setWatchItem(itemId)
      router.push("/watch")
    },
    [setWatchItem, router],
  )

  const foldersForReorder = useMemo(() => {
    if (!reorderModalOpen) return []

    const targetId = reorderTargetId === "root" ? null : reorderTargetId
    let items: FolderData[] = []

    if (targetId === null) {
      items = [...folders]
    } else {
      const parent = findFolderById(folders, targetId)
      items = parent?.children ? [...parent.children] : []
    }

    const orderKey = targetId || "root"
    const customOrder = folderOrder[orderKey] || []

    if (customOrder.length > 0) {
      items.sort((a, b) => {
        const indexA = customOrder.indexOf(a.id)
        const indexB = customOrder.indexOf(b.id)

        if (indexA === -1 && indexB !== -1) return -1
        if (indexA !== -1 && indexB === -1) return 1
        if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name)

        return indexA - indexB
      })
    } else {
      items.sort((a, b) => a.name.localeCompare(b.name))
    }

    return items
  }, [reorderModalOpen, reorderTargetId, folders, folderOrder])

  const compareItems = (a: any, b: any, sortBy: string, direction: "asc" | "desc") => {
    let valA: any = a[sortBy]
    let valB: any = b[sortBy]

    if (sortBy === "itemCount") {
      valA = a.itemCount ?? 0
      valB = b.itemCount ?? 0
    } else if (sortBy === "dateModified" || sortBy === "createdDate") {
      valA = valA ? new Date(valA).getTime() : 0
      valB = valB ? new Date(valB).getTime() : 0
    } else if (sortBy === "hasData") {
      valA = valA === true ? 1 : 0
      valB = valB === true ? 1 : 0
    } else if (sortBy === "duration") {
      valA = parseDuration(valA)
      valB = parseDuration(valB)
    } else if (sortBy === "size") {
      valA = parseSize(valA)
      valB = parseSize(valB)
    } else if (sortBy === "angles" || sortBy === "comments") {
      valA = Number(valA || 0)
      valB = Number(valB || 0)
    } else {
      valA = String(valA || "").toLowerCase()
      valB = String(valB || "").toLowerCase()
    }

    if (valA < valB) return direction === "asc" ? -1 : 1
    if (valA > valB) return direction === "asc" ? 1 : -1
    return 0
  }

  const sortFolderChildren = (folder: FolderData): FolderData => {
    const customOrder = folderOrder[folder.id] || []
    const sortOption = folderSortOptions[folder.id]

    const activeSortBy = sortOption?.by || sort.columnId
    const activeDirection = sortOption?.direction || sort.direction

    const folderSortApplicable = ["name", "dateModified", "createdDate", "type", "itemCount"].includes(activeSortBy)

    let sortedChildren = folder.children ? [...folder.children] : []

    if (activeSortBy === "itemCount") {
      sortedChildren = sortedChildren.map((child) => ({
        ...child,
        itemCount: (child.children?.length || 0) + (child.items?.length || 0),
      }))
    }

    if (activeSortBy && activeDirection && folderSortApplicable) {
      sortedChildren.sort((a, b) => compareItems(a, b, activeSortBy, activeDirection!))
    } else if (customOrder.length > 0) {
      sortedChildren.sort((a, b) => {
        const indexA = customOrder.indexOf(a.id)
        const indexB = customOrder.indexOf(b.id)
        if (indexA === -1 && indexB !== -1) return -1
        if (indexA !== -1 && indexB === -1) return 1
        if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name)
        return indexA - indexB
      })
    } else {
      sortedChildren.sort((a, b) => a.name.localeCompare(b.name))
    }

    const sortedItems = folder.items ? [...folder.items] : []
    if (activeSortBy && activeDirection) {
      sortedItems.sort((a, b) => compareItems(a, b, activeSortBy, activeDirection))
    }

    return {
      ...folder,
      children: sortedChildren.map(sortFolderChildren),
      items: sortedItems,
    }
  }

  const sortedFolders = useMemo(() => {
    const recursiveSorted = folders.map(sortFolderChildren)

    const folderSortApplicable = ["name", "dateModified", "createdDate", "type", "itemCount"].includes(sort.columnId)
    const customOrder = folderOrder["root"] || []

    if (currentFolderId === null) {
      if (sort.columnId && sort.direction && folderSortApplicable) {
        const withCounts = recursiveSorted.map((f) => ({
          ...f,
          itemCount: (f.children?.length || 0) + (f.items?.length || 0),
        }))
        return withCounts.sort((a, b) => compareItems(a, b, sort.columnId, sort.direction!))
      }

      if (customOrder.length > 0) {
        return recursiveSorted.sort((a, b) => {
          const indexA = customOrder.indexOf(a.id)
          const indexB = customOrder.indexOf(b.id)
          if (indexA === -1 && indexB !== -1) return -1
          if (indexA !== -1 && indexB === -1) return 1
          if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name)
          return indexA - indexB
        })
      }

      return recursiveSorted.sort((a, b) => a.name.localeCompare(b.name))
    }

    const target = findFolderById(recursiveSorted, currentFolderId)
    return target ? [target] : []
  }, [folders, folderSortOptions, currentFolderId, sort, folderOrder])

  const sortedScheduleFolders = useMemo(() => {
    // 1. Recursively sort children (Opponents, Categories, Items)
    const recursiveSorted = scheduleFolders.map(sortFolderChildren)

    const folderSortApplicable = ["name", "dateModified", "createdDate", "type", "itemCount"].includes(sort.columnId)

    // 2. Sort the root level (Seasons) if a global sort is active
    if (sort.columnId && sort.direction && folderSortApplicable) {
      const withCounts = recursiveSorted.map((f) => ({
        ...f,
        itemCount: (f.children?.length || 0) + (f.items?.length || 0),
      }))
      return withCounts.sort((a, b) => compareItems(a, b, sort.columnId, sort.direction!))
    }

    // Default order (as defined in data generation)
    return recursiveSorted
  }, [scheduleFolders, sort, folderSortOptions, folderOrder])

  // Sort Root Items (only relevant when at root level in folder view)
  const sortedRootItems = useMemo(() => {
    if (currentFolderId !== null || viewMode === "schedule") return []

    const items = [...rootItems]
    if (sort.columnId && sort.direction) {
      items.sort((a, b) => compareItems(a, b, sort.columnId, sort.direction!))
    } else {
      // Default sort (Name ASC)
      items.sort((a, b) => a.name.localeCompare(b.name))
    }
    return items
  }, [rootItems, currentFolderId, sort, viewMode])

  const getFlattenedVisibleItems = (nodes: FolderData[], level = 0) => {
    const items: Array<{ type: "folder" | "item"; data: FolderData | LibraryItemData; level: number }> = []

    nodes.forEach((node) => {
      items.push({ type: "folder", data: node, level })

      if (expandedFolders.has(node.id)) {
        if (node.children && node.children.length > 0) {
          items.push(...getFlattenedVisibleItems(node.children, level + 1))
        }
        if (node.items && node.items.length > 0) {
          node.items.forEach((item) => {
            items.push({ type: "item", data: item, level: level + 1 })
          })
        }
      }
    })

    return items
  }

  const activeData = useMemo(() => {
    if (viewMode === "schedule") {
      return sortedScheduleFolders
    }
    return sortedFolders
  }, [viewMode, sortedScheduleFolders, sortedFolders])

  const currentViewData = useMemo(() => {
    const rootData = viewMode === "schedule" ? scheduleFolders : folders

    if (currentFolderId === null) {
      // At root level, include rootItems
      return { children: activeData, items: sortedRootItems }
    }

    const findNode = (nodes: FolderData[]): FolderData | null => {
      for (const node of nodes) {
        if (node.id === currentFolderId) return node
        if (node.children) {
          const found = findNode(node.children)
          if (found) return found
        }
      }
      return null
    }

    const node = findNode(rootData)
    return node ? { children: node.children || [], items: node.items || [] } : { children: [], items: [] }
  }, [currentFolderId, viewMode, folders, scheduleFolders, activeData, sortedRootItems])

  let visibleFlatList: Array<{ type: "folder" | "item"; data: FolderData | LibraryItemData; level: number }> = []

  if (viewMode === "schedule") {
    // In schedule view, always show from root
    visibleFlatList = getFlattenedVisibleItems(activeData, 0)
  } else if (currentFolderId === null) {
    // ROOT LEVEL: Folders + Root Items
    visibleFlatList = getFlattenedVisibleItems(activeData, 0)

    // Append Root Items
    sortedRootItems.forEach((item) => {
      visibleFlatList.push({ type: "item", data: item, level: 0 })
    })
  } else {
    const currentFolderData = activeData.find((f) => f.id === currentFolderId)
    if (currentFolderData) {
      if (currentFolderData.children) {
        visibleFlatList.push(...getFlattenedVisibleItems(currentFolderData.children, 0))
      }
      if (currentFolderData.items) {
        currentFolderData.items.forEach((item) => {
          visibleFlatList.push({ type: "item", data: item, level: 0 })
        })
      }
    }
  }

  const isDescendantOf = useCallback((nodes: FolderData[], parentId: string, targetId: string): boolean => {
    const findInChildren = (folder: FolderData): boolean => {
      if (folder.id === targetId) return true
      if (folder.children) {
        return folder.children.some(findInChildren)
      }
      return false
    }

    const parent = findFolderById(nodes, parentId)
    if (!parent || !parent.children) return false
    return parent.children.some(findInChildren)
  }, [])

  const handleMove = useCallback(
    (movedId: string, targetId: string, type: "folder" | "item") => {
      if (movedId === targetId) return

      // 1. Handle moving an Item from rootItems -> Folder
      if (type === "item") {
        const rootItemIndex = rootItems.findIndex((i) => i.id === movedId)

        if (rootItemIndex !== -1) {
          const itemToMove = rootItems[rootItemIndex]

          // Remove from rootItems
          const newRootItems = [...rootItems]
          newRootItems.splice(rootItemIndex, 1)
          setRootItems(newRootItems)

          // Add to Target Folder
          setFolders((prevFolders) => {
            const newFolders = JSON.parse(JSON.stringify(prevFolders)) as FolderData[]

            const addToTarget = (nodes: FolderData[]): boolean => {
              for (const node of nodes) {
                if (node.id === targetId) {
                  node.items = node.items || []
                  node.items.push(itemToMove)
                  return true
                }
                if (node.children && addToTarget(node.children)) return true
              }
              return false
            }

            if (addToTarget(newFolders)) {
              toast({ title: "Moved Item", description: `Moved ${itemToMove.name}` })
              return newFolders
            }
            return prevFolders
          })
          return
        }
      }

      // 2. Existing Logic for Folder->Folder or SubItem->Folder moves
      setFolders((prevFolders) => {
        const newStructure = JSON.parse(JSON.stringify(prevFolders)) as FolderData[]

        if (type === "folder") {
          if (isDescendantOf(newStructure, movedId, targetId)) {
            toast({
              title: "Cannot move folder",
              description: "You cannot move a folder into its own child.",
              variant: "destructive",
            })
            return prevFolders
          }
        }

        let movedObject: FolderData | LibraryItemData | null = null

        const removeObject = (nodes: FolderData[]): boolean => {
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]

            if (type === "item" && node.items) {
              const itemIndex = node.items.findIndex((it) => it.id === movedId)
              if (itemIndex !== -1) {
                movedObject = node.items[itemIndex]
                node.items.splice(itemIndex, 1)
                return true
              }
            }

            if (type === "folder" && node.children) {
              const childIndex = node.children.findIndex((ch) => ch.id === movedId)
              if (childIndex !== -1) {
                movedObject = node.children[childIndex]
                node.children.splice(childIndex, 1)
                return true
              }
            }

            if (node.children && removeObject(node.children)) return true
          }
          return false
        }

        if (type === "folder") {
          const rootIndex = newStructure.findIndex((f) => f.id === movedId)
          if (rootIndex !== -1) {
            movedObject = newStructure[rootIndex]
            newStructure.splice(rootIndex, 1)
          } else {
            removeObject(newStructure)
          }
        } else {
          removeObject(newStructure)
        }

        if (!movedObject) {
          return prevFolders
        }

        const findAndInsert = (nodes: FolderData[]): boolean => {
          for (const node of nodes) {
            if (node.id === targetId) {
              if (type === "folder") {
                node.children = node.children || []
                node.children.push(movedObject as FolderData)
              } else {
                node.items = node.items || []
                node.items.push(movedObject as LibraryItemData)
              }
              return true
            }
            if (node.children && findAndInsert(node.children)) return true
          }
          return false
        }

        if (findAndInsert(newStructure)) {
          const targetFolder = findFolderById(newStructure, targetId)
          toast({
            title: "Moved Successfully",
            description: `Moved to ${targetFolder?.name || "folder"}`,
          })
          return newStructure
        } else {
          console.error("Could not find target folder")
          return prevFolders
        }
      })
    },
    [setFolders, rootItems, setRootItems, isDescendantOf],
  )

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border border-border shadow-sm overflow-hidden border-none min-w-0">
      <div className="px-4 pt-1 shrink-0 border-b border-border">
        <LibraryHeader onImportComplete={handleImportComplete} onReorderFolders={() => handleOpenReorder(null)} />
        {selectedFolders.size > 0 || selectedItems.size > 0 ? (
          <div className="px-0 pb-2">
            <LibraryActionBar />
          </div>
        ) : (
          <LibrarySubheader
            breadcrumbs={breadcrumbs}
            onNavigate={handleNavigate}
            onCreateFolder={createFolder}
            onReorderFolders={() => handleOpenReorder(null)}
          />
        )}
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {layoutMode === "grid" ? (
<LibraryGridView
  folders={currentViewData.children}
  items={currentViewData.items}
  onNavigate={handleNavigate}
  onOpenItem={handleOpenItem}
  onMove={handleMove}
  onRename={handleRenameFolder}
  onDelete={handleDeleteFolderStart}
  />
        ) : (
          <div className="min-w-[1000px] pb-4">
            <LibraryTableHeader />

            <div className="flex flex-col">
              {visibleFlatList.map((row, index) => {
                if (row.type === "folder") {
                  const folderData = row.data as FolderData
                  return (
                    <Folder
                      key={folderData.id}
                      folder={folderData}
                      level={row.level}
                      index={index}
                      isFlattened={true}
                      onSelect={handleSelectFolder}
                      onSelectItem={handleSelectItem}
                      onDoubleClick={handleFolderDoubleClick}
                      selectedFolders={selectedFolders}
                      selectedItems={selectedItems}
                      expandedFolders={expandedFolders}
                      onToggleExpand={handleToggleExpand}
                      importedFolders={importedFolders}
                      importedItems={importedItems}
                      onUpdateImported={handleUpdateImported}
                      onRename={handleRenameFolder}
                      onDelete={handleDeleteFolderStart}
                      onSortFolder={handleSortFolder}
                      folderSortOptions={folderSortOptions}
                      onReorderChildren={(id) => handleOpenReorder(id)}
                      onMove={handleMove}
                      onOpen={handleOpenItem}
                      onCreateSubfolder={handleCreateSubfolder}
                    />
                  )
                } else {
                  const itemData = row.data as LibraryItemData
                  return (
                    <LibraryItem
                      key={itemData.id}
                      item={{
                        ...itemData,
                        thumbnailUrl: itemData.thumbnailUrl || "/football-field.png",
                      }}
                      level={row.level}
                      index={index}
                      onSelect={handleSelectItem}
                      selectedItems={selectedItems}
                      importedItems={importedItems}
                      onUpdateImported={handleUpdateImported}
                      density={density}
                      onMove={handleMove}
                      onOpen={handleOpenItem}
                    />
                  )
                }
              })}

              {visibleFlatList.length === 0 && layoutMode === "list" && (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <p>This folder is empty</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this folder and all of its contents? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="subtle" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FolderReorderModal
        open={reorderModalOpen}
        onOpenChange={setReorderModalOpen}
        parentId={reorderTargetId || "root"}
        folders={foldersForReorder}
        onSave={updateFolderOrder}
      />

      <MoveToModal />
      <PermissionsModal />
    </div>
  )
}
