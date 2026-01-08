"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { LibraryHeader } from "@/components/library-header"
import { LibrarySubheader } from "@/components/library-subheader"
import { LibraryTableHeader } from "@/components/library-table-header"
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

const testFolders: FolderData[] = [
  {
    id: "folder-1",
    name: "Folder 1",
    dateModified: "Dec 5, 2024",
    createdDate: "Nov 1, 2024",
    children: [
      {
        id: "subfolder-1",
        name: "Subfolder 1",
        dateModified: "Jan 16, 2024",
        createdDate: "Jan 10, 2024",
        items: [
          {
            id: "item-1",
            name: "NYG vs. BUF 01.01.24",
            type: "video",
            dateModified: "Jan 15, 2024",
            hasData: true,
            itemCount: 145,
            angles: 4,
            duration: "3:24:15",
            size: "4.2 GB",
            comments: 23,
            createdDate: "Jan 2, 2024",
          },
          {
            id: "item-2",
            name: "DAL vs. PHI 12.15.23",
            type: "video",
            dateModified: "Dec 20, 2023",
            hasData: true,
            itemCount: 128,
            angles: 3,
            duration: "3:18:42",
            size: "3.9 GB",
            comments: 45,
            createdDate: "Dec 16, 2023",
          },
        ],
      },
      {
        id: "subfolder-2",
        name: "Subfolder 2",
        dateModified: "Feb 15, 2024",
        createdDate: "Feb 1, 2024",
        items: [
          {
            id: "item-3",
            name: "KC vs. SF 02.11.24",
            type: "video",
            dateModified: "Feb 14, 2024",
            hasData: true,
            itemCount: 156,
            angles: 6,
            duration: "4:02:30",
            size: "5.1 GB",
            comments: 89,
            createdDate: "Feb 12, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-2",
    name: "Folder 2",
    dateModified: "Nov 20, 2024",
    createdDate: "Oct 15, 2024",
    children: [
      {
        id: "subfolder-3",
        name: "Subfolder 3",
        dateModified: "Nov 19, 2023",
        createdDate: "Nov 1, 2023",
        items: [
          {
            id: "item-4",
            name: "BAL vs. CIN 11.16.23",
            type: "video",
            dateModified: "Nov 18, 2023",
            hasData: false,
            itemCount: 132,
            angles: 4,
            duration: "3:15:20",
            size: "3.8 GB",
            comments: 12,
            createdDate: "Nov 17, 2023",
          },
        ],
      },
    ],
  },
  {
    id: "folder-3",
    name: "Folder 3",
    dateModified: "Oct 31, 2024",
    createdDate: "Sep 20, 2024",
    children: [
      {
        id: "subfolder-4",
        name: "Subfolder 4",
        dateModified: "Oct 31, 2023",
        createdDate: "Oct 15, 2023",
        items: [
          {
            id: "item-5",
            name: "MIA vs. NE 10.29.23",
            type: "video",
            dateModified: "Oct 30, 2023",
            hasData: true,
            itemCount: 118,
            angles: 3,
            duration: "3:08:45",
            size: "3.5 GB",
            comments: 34,
            createdDate: "Oct 30, 2023",
          },
        ],
      },
    ],
  },
  {
    id: "folder-4",
    name: "Folder 4",
    dateModified: "Dec 2, 2024",
    createdDate: "Nov 15, 2024",
    children: [
      {
        id: "subfolder-4-1",
        name: "Subfolder 4-1",
        dateModified: "Dec 2, 2024",
        createdDate: "Nov 20, 2024",
        children: [
          {
            id: "subfolder-4-1-1",
            name: "Subfolder 4-1-1",
            dateModified: "Dec 2, 2024",
            createdDate: "Nov 22, 2024",
            children: [
              {
                id: "subfolder-4-1-1-1",
                name: "Subfolder 4-1-1-1",
                dateModified: "Dec 2, 2024",
                createdDate: "Nov 25, 2024",
                children: [
                  {
                    id: "subfolder-4-1-1-1-1",
                    name: "Subfolder 4-1-1-1-1",
                    dateModified: "Dec 2, 2024",
                    createdDate: "Nov 28, 2024",
                    children: [
                      {
                        id: "subfolder-4-1-1-1-1-1",
                        name: "Subfolder 4-1-1-1-1-1",
                        dateModified: "Dec 1, 2024",
                        createdDate: "Nov 30, 2024",
                        items: [
                          {
                            id: "item-6",
                            name: "GB vs. CHI Red Zone Analysis",
                            type: "video",
                            dateModified: "Dec 1, 2024",
                            hasData: true,
                            itemCount: 87,
                            angles: 5,
                            duration: "2:45:30",
                            size: "3.2 GB",
                            comments: 56,
                            createdDate: "Dec 1, 2024",
                          },
                          {
                            id: "item-7",
                            name: "DET Third Down Conversions",
                            type: "video",
                            dateModified: "Nov 28, 2024",
                            hasData: true,
                            itemCount: 64,
                            angles: 4,
                            duration: "1:52:18",
                            size: "2.1 GB",
                            comments: 28,
                            createdDate: "Nov 28, 2024",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "folder-5",
    name: "Folder 5",
    dateModified: "Nov 21, 2024",
    createdDate: "Oct 1, 2024",
    children: [
      {
        id: "subfolder-5-1",
        name: "Subfolder 5-1",
        dateModified: "Nov 21, 2024",
        createdDate: "Oct 5, 2024",
        children: [
          {
            id: "subfolder-5-1-1",
            name: "Subfolder 5-1-1",
            dateModified: "Nov 15, 2024",
            createdDate: "Oct 10, 2024",
            items: [
              {
                id: "item-8",
                name: "LAR Defensive Scheme Week 10",
                type: "video",
                dateModified: "Nov 15, 2024",
                hasData: true,
                itemCount: 92,
                angles: 4,
                duration: "2:28:45",
                size: "2.8 GB",
                comments: 41,
                createdDate: "Nov 15, 2024",
              },
            ],
          },
        ],
        items: [
          {
            id: "item-9",
            name: "SEA Offensive Playbook Q3",
            type: "pdf",
            dateModified: "Nov 20, 2024",
            createdDate: "Nov 18, 2024",
          },
          {
            id: "item-10",
            name: "SF Special Teams Breakdown",
            type: "video",
            dateModified: "Nov 18, 2024",
            hasData: false,
            itemCount: 78,
            angles: 3,
            duration: "2:15:10",
            size: "2.5 GB",
            comments: 19,
            createdDate: "Nov 18, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-6",
    name: "Folder 6",
    dateModified: "Oct 23, 2024",
    createdDate: "Sep 1, 2024",
    children: [
      {
        id: "subfolder-6-1",
        name: "Subfolder 6-1",
        dateModified: "Oct 23, 2024",
        createdDate: "Sep 5, 2024",
        items: [],
      },
    ],
  },
  {
    id: "folder-7",
    name: "Folder 7",
    dateModified: "Sep 12, 2024",
    createdDate: "Aug 1, 2024",
    children: [],
  },
  {
    id: "folder-8",
    name: "Folder 8",
    dateModified: "Aug 28, 2024",
    createdDate: "Jul 15, 2024",
    children: [],
  },
  {
    id: "folder-9",
    name: "Folder 9",
    dateModified: "Jul 15, 2024",
    createdDate: "Jun 1, 2024",
    children: [],
  },
  {
    id: "folder-10",
    name: "Folder 10",
    dateModified: "Jun 22, 2024",
    createdDate: "May 1, 2024",
    children: [],
  },
  {
    id: "folder-11",
    name: "Folder 11",
    dateModified: "May 30, 2024",
    createdDate: "Apr 15, 2024",
    children: [],
  },
  {
    id: "folder-12",
    name: "Folder 12",
    dateModified: "Apr 18, 2024",
    createdDate: "Mar 1, 2024",
    children: [],
  },
  {
    id: "folder-13",
    name: "Folder 13",
    dateModified: "Mar 5, 2024",
    createdDate: "Feb 1, 2024",
    children: [],
  },
]

export function LibraryView() {
  const router = useRouter()
  const { isCatapultImportOpen, setIsCatapultImportOpen } = useCatapultImport()
  const { density } = useDensity()
  const { sort, folderOrder, updateFolderOrder, setWatchItem } = useLibraryContext()

  const [libraryView, setLibraryView] = useState<"team" | "my">("team")
  const [teamFolders, setTeamFolders] = useState<FolderData[]>(testFolders)
  const [myFolders, setMyFolders] = useState<FolderData[]>([])

  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set())
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null)
  const [importedFolders, setImportedFolders] = useState<Set<string>>(new Set())
  const [importedItems, setImportedItems] = useState<Set<string>>(new Set())

  const [folderSortOptions, setFolderSortOptions] = useState<Record<string, { by: string; direction: "asc" | "desc" }>>(
    {},
  )

  const [reorderModalOpen, setReorderModalOpen] = useState(false)
  const [reorderTargetId, setReorderTargetId] = useState<string | null>(null)

  const folders = libraryView === "team" ? teamFolders : myFolders
  const setFolders = libraryView === "team" ? setTeamFolders : setMyFolders

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
    const newFolder: FolderData = {
      id: `folder-${Date.now()}`,
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
  }

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

    setSelectedFolders((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(folderId)
        folderIds.forEach((id) => newSet.add(id))
      } else {
        newSet.delete(folderId)
        folderIds.forEach((id) => newSet.delete(id))
      }
      return newSet
    })

    setSelectedItems((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        itemIds.forEach((id) => newSet.add(id))
      } else {
        itemIds.forEach((id) => newSet.delete(id))
      }
      return newSet
    })
  }

  const handleSelectItem = (itemId: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(itemId)
      } else {
        newSet.delete(itemId)
      }
      return newSet
    })
  }

  const handleToggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
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

  // Open handler for Watch page navigation
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

  let visibleFlatList: Array<{ type: "folder" | "item"; data: FolderData | LibraryItemData; level: number }> = []

  if (currentFolderId === null) {
    visibleFlatList = getFlattenedVisibleItems(sortedFolders, 0)
  } else {
    const currentFolderData = sortedFolders.find((f) => f.id === currentFolderId)
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
          console.error("Could not find object to move")
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
    [setFolders, isDescendantOf],
  )

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border border-border shadow-sm overflow-hidden border-none min-w-0">
      <div className="px-4 pt-1 shrink-0 border-b border-border">
        <LibraryHeader onImportComplete={handleImportComplete} />
        <LibrarySubheader
          breadcrumbs={breadcrumbs}
          onNavigate={handleNavigate}
          onCreateFolder={createFolder}
          onReorderFolders={() => handleOpenReorder(null)}
        />
      </div>

      <div className="flex-1 overflow-auto min-h-0">
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

            {visibleFlatList.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p>This folder is empty</p>
              </div>
            )}
          </div>
        </div>
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
    </div>
  )
}
