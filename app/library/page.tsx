"use client"

import { useState } from "react"
import { LibraryHeader } from "@/components/library-header"
import { LibrarySubheader } from "@/components/library-subheader"
import { Folder, type FolderData } from "@/components/folder"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/button"

const testFolders: FolderData[] = [
  {
    id: "folder-1",
    name: "Folder 1",
    dateModified: "Dec 5, 2024",
    children: [
      {
        id: "subfolder-1",
        name: "Subfolder 1",
        dateModified: "Jan 16, 2024",
        items: [
          {
            id: "item-1",
            name: "NYG vs. BUF 01.01.24",
            type: "video",
            dateModified: "Jan 15, 2024",
          },
          {
            id: "item-2",
            name: "DAL vs. PHI 12.15.23",
            type: "video",
            dateModified: "Dec 20, 2023",
          },
        ],
      },
      {
        id: "subfolder-2",
        name: "Subfolder 2",
        dateModified: "Feb 15, 2024",
        items: [
          {
            id: "item-3",
            name: "KC vs. SF 02.11.24",
            type: "video",
            dateModified: "Feb 14, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-2",
    name: "Folder 2",
    dateModified: "Nov 20, 2024",
    children: [
      {
        id: "subfolder-3",
        name: "Subfolder 3",
        dateModified: "Nov 19, 2023",
        items: [
          {
            id: "item-4",
            name: "BAL vs. CIN 11.16.23",
            type: "video",
            dateModified: "Nov 18, 2023",
          },
        ],
      },
    ],
  },
  {
    id: "folder-3",
    name: "Folder 3",
    dateModified: "Oct 31, 2024",
    children: [
      {
        id: "subfolder-4",
        name: "Subfolder 4",
        dateModified: "Oct 31, 2023",
        items: [
          {
            id: "item-5",
            name: "MIA vs. NE 10.29.23",
            type: "video",
            dateModified: "Oct 30, 2023",
          },
        ],
      },
    ],
  },
  {
    id: "folder-4",
    name: "Folder 4",
    dateModified: "Dec 2, 2024",
    children: [
      {
        id: "subfolder-4-1",
        name: "Subfolder 4-1",
        dateModified: "Dec 2, 2024",
        children: [
          {
            id: "subfolder-4-1-1",
            name: "Subfolder 4-1-1",
            dateModified: "Dec 2, 2024",
            children: [
              {
                id: "subfolder-4-1-1-1",
                name: "Subfolder 4-1-1-1",
                dateModified: "Dec 2, 2024",
                children: [
                  {
                    id: "subfolder-4-1-1-1-1",
                    name: "Subfolder 4-1-1-1-1",
                    dateModified: "Dec 2, 2024",
                    children: [
                      {
                        id: "subfolder-4-1-1-1-1-1",
                        name: "Subfolder 4-1-1-1-1-1",
                        dateModified: "Dec 1, 2024",
                        items: [
                          {
                            id: "item-6",
                            name: "GB vs. CHI Red Zone Analysis",
                            type: "video",
                            dateModified: "Dec 1, 2024",
                          },
                          {
                            id: "item-7",
                            name: "DET Third Down Conversions",
                            type: "video",
                            dateModified: "Nov 28, 2024",
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
    children: [
      {
        id: "subfolder-5-1",
        name: "Subfolder 5-1",
        dateModified: "Nov 21, 2024",
        children: [
          {
            id: "subfolder-5-1-1",
            name: "Subfolder 5-1-1",
            dateModified: "Nov 15, 2024",
            items: [
              {
                id: "item-8",
                name: "LAR Defensive Scheme Week 10",
                type: "video",
                dateModified: "Nov 15, 2024",
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
          },
          {
            id: "item-10",
            name: "SF Special Teams Breakdown",
            type: "video",
            dateModified: "Nov 18, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-6",
    name: "Folder 6",
    dateModified: "Oct 23, 2024",
    children: [
      {
        id: "subfolder-6-1",
        name: "Subfolder 6-1",
        dateModified: "Oct 23, 2024",
        children: [
          {
            id: "subfolder-6-1-1",
            name: "Subfolder 6-1-1",
            dateModified: "Oct 23, 2024",
            children: [
              {
                id: "subfolder-6-1-1-1",
                name: "Subfolder 6-1-1-1",
                dateModified: "Oct 23, 2024",
                children: [
                  {
                    id: "subfolder-6-1-1-1-1",
                    name: "Subfolder 6-1-1-1-1",
                    dateModified: "Oct 23, 2024",
                    children: [
                      {
                        id: "subfolder-6-1-1-1-1-1",
                        name: "Subfolder 6-1-1-1-1-1",
                        dateModified: "Oct 23, 2024",
                        children: [
                          {
                            id: "subfolder-6-1-1-1-1-1-1",
                            name: "Subfolder 6-1-1-1-1-1-1",
                            dateModified: "Oct 23, 2024",
                            children: [
                              {
                                id: "subfolder-6-1-1-1-1-1-1-1",
                                name: "Subfolder 6-1-1-1-1-1-1-1",
                                dateModified: "Oct 22, 2024",
                                items: [
                                  {
                                    id: "item-11",
                                    name: "TB vs. NO Goal Line Situations",
                                    type: "video",
                                    dateModified: "Oct 22, 2024",
                                  },
                                  {
                                    id: "item-12",
                                    name: "ATL Play Action Efficiency",
                                    type: "video",
                                    dateModified: "Oct 18, 2024",
                                  },
                                  {
                                    id: "item-13",
                                    name: "CAR Blitz Packages Study",
                                    type: "pdf",
                                    dateModified: "Oct 15, 2024",
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
        ],
      },
    ],
  },
  {
    id: "folder-7",
    name: "Folder 7",
    dateModified: "Sep 12, 2024",
    children: [
      {
        id: "subfolder-7-1",
        name: "Subfolder 7-1",
        dateModified: "Sep 12, 2024",
        children: [
          {
            id: "subfolder-7-1-1",
            name: "Subfolder 7-1-1",
            dateModified: "Sep 12, 2024",
            children: [
              {
                id: "subfolder-7-1-1-1",
                name: "Subfolder 7-1-1-1",
                dateModified: "Sep 10, 2024",
                items: [
                  {
                    id: "item-14",
                    name: "NYJ Offensive Line Assignments",
                    type: "video",
                    dateModified: "Sep 10, 2024",
                  },
                  {
                    id: "item-15",
                    name: "BUF Coverage Schemes",
                    type: "pdf",
                    dateModified: "Sep 8, 2024",
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "item-16",
            name: "MIA QB Decision Making",
            type: "video",
            dateModified: "Sep 12, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-8",
    name: "Folder 8",
    dateModified: "Aug 28, 2024",
    children: [
      {
        id: "subfolder-8-1",
        name: "Subfolder 8-1",
        dateModified: "Aug 28, 2024",
        children: [
          {
            id: "subfolder-8-1-1",
            name: "Subfolder 8-1-1",
            dateModified: "Aug 25, 2024",
            items: [
              {
                id: "item-17",
                name: "NE Run Game Tendencies",
                type: "video",
                dateModified: "Aug 25, 2024",
              },
            ],
          },
        ],
        items: [
          {
            id: "item-18",
            name: "PIT Zone Coverage Week 1",
            type: "video",
            dateModified: "Aug 28, 2024",
          },
          {
            id: "item-19",
            name: "CLE Pass Rush Analysis",
            type: "pdf",
            dateModified: "Aug 26, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-9",
    name: "Folder 9",
    dateModified: "Jul 15, 2024",
    children: [
      {
        id: "subfolder-9-1",
        name: "Subfolder 9-1",
        dateModified: "Jul 15, 2024",
        children: [
          {
            id: "subfolder-9-1-1",
            name: "Subfolder 9-1-1",
            dateModified: "Jul 12, 2024",
            items: [
              {
                id: "item-20",
                name: "HOU Pre-Season Camp Highlights",
                type: "video",
                dateModified: "Jul 12, 2024",
              },
              {
                id: "item-21",
                name: "IND Rookie Development Plan",
                type: "pdf",
                dateModified: "Jul 10, 2024",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "folder-10",
    name: "Folder 10",
    dateModified: "Jun 22, 2024",
    children: [
      {
        id: "subfolder-10-1",
        name: "Subfolder 10-1",
        dateModified: "Jun 22, 2024",
        children: [
          {
            id: "subfolder-10-1-1",
            name: "Subfolder 10-1-1",
            dateModified: "Jun 20, 2024",
            children: [
              {
                id: "subfolder-10-1-1-1",
                name: "Subfolder 10-1-1-1",
                dateModified: "Jun 18, 2024",
                items: [
                  {
                    id: "item-22",
                    name: "JAX Draft Pick Breakdown",
                    type: "video",
                    dateModified: "Jun 18, 2024",
                  },
                  {
                    id: "item-23",
                    name: "TEN Offseason Acquisitions",
                    type: "pdf",
                    dateModified: "Jun 15, 2024",
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "item-24",
            name: "DEN Training Camp Schedule",
            type: "pdf",
            dateModified: "Jun 22, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-11",
    name: "Folder 11",
    dateModified: "May 30, 2024",
    children: [
      {
        id: "subfolder-11-1",
        name: "Subfolder 11-1",
        dateModified: "May 30, 2024",
        items: [
          {
            id: "item-25",
            name: "LV Coaching Staff Updates",
            type: "pdf",
            dateModified: "May 30, 2024",
          },
          {
            id: "item-26",
            name: "LAC Personnel Changes",
            type: "video",
            dateModified: "May 28, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-12",
    name: "Folder 12",
    dateModified: "Apr 18, 2024",
    children: [
      {
        id: "subfolder-12-1",
        name: "Subfolder 12-1",
        dateModified: "Apr 18, 2024",
        children: [
          {
            id: "subfolder-12-1-1",
            name: "Subfolder 12-1-1",
            dateModified: "Apr 15, 2024",
            children: [
              {
                id: "subfolder-12-1-1-1",
                name: "Subfolder 12-1-1-1",
                dateModified: "Apr 12, 2024",
                items: [
                  {
                    id: "item-27",
                    name: "ARI Scheme Implementation",
                    type: "video",
                    dateModified: "Apr 12, 2024",
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "item-28",
            name: "MIN Draft Strategy Overview",
            type: "pdf",
            dateModified: "Apr 18, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-13",
    name: "Folder 13",
    dateModified: "Mar 5, 2024",
    children: [
      {
        id: "subfolder-13-1",
        name: "Subfolder 13-1",
        dateModified: "Mar 5, 2024",
        children: [
          {
            id: "subfolder-13-1-1",
            name: "Subfolder 13-1-1",
            dateModified: "Mar 3, 2024",
            items: [
              {
                id: "item-29",
                name: "WAS Free Agency Targets",
                type: "pdf",
                dateModified: "Mar 3, 2024",
              },
              {
                id: "item-30",
                name: "CHI Combine Evaluations",
                type: "video",
                dateModified: "Mar 1, 2024",
              },
            ],
          },
        ],
      },
    ],
  },
]

export default function LibraryPage() {
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

  const folders = libraryView === "team" ? teamFolders : myFolders
  const setFolders = libraryView === "team" ? setTeamFolders : setMyFolders

  const handleImportComplete = (importedFolders: FolderData[]) => {
    if (importedFolders.length > 0) {
      setFolders((prev) => {
        const mergeFolders = (existing: FolderData[], incoming: FolderData[]): FolderData[] => {
          const result = [...existing]

          for (const incomingFolder of incoming) {
            // Check if a folder with the same name already exists at this level
            const existingIndex = result.findIndex((f) => f.name === incomingFolder.name)

            if (existingIndex !== -1) {
              // Folder exists, merge its contents
              const existingFolder = result[existingIndex]
              result[existingIndex] = {
                ...existingFolder,
                // Merge children recursively
                children: incomingFolder.children
                  ? mergeFolders(existingFolder.children || [], incomingFolder.children)
                  : existingFolder.children,
                // Merge items, avoiding duplicates by ID
                items: [
                  ...(existingFolder.items || []),
                  ...(incomingFolder.items || []).filter(
                    (newItem) => !(existingFolder.items || []).some((existing) => existing.id === newItem.id),
                  ),
                ],
              }
            } else {
              // Folder doesn't exist, add it
              result.push(incomingFolder)
            }
          }

          return result
        }

        if (currentFolderId === null) {
          // Merge at root level
          return mergeFolders(prev, importedFolders)
        } else {
          // Merge within a specific folder
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
    }

    if (currentFolderId === null) {
      setFolders([...folders, newFolder])
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

  const currentFolder = currentFolderId === null ? null : findFolderById(folders, currentFolderId)
  const displayedFolders = currentFolderId === null ? folders : currentFolder?.children || []
  const displayedItems = currentFolderId === null ? [] : currentFolder?.items || []

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

  const handleItemActivate = (itemId: string) => {
    setActiveItem(itemId)
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
          return { ...folder, name: newName }
        }
        if (folder.children) {
          return { ...folder, children: renameInFolders(folder.children) }
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

  const handleUpdateImported = (newFolders: FolderData[], newItems: { id: string; name: string }[]) => {
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

    const { folderIds, itemIds } = collectIds(newFolders)
    setImportedFolders(new Set(folderIds))
    setImportedItems(new Set(itemIds))
  }

  const handleSortFolder = (folderId: string, sortBy: string, direction: "asc" | "desc" = "asc") => {
    if (sortBy === "") {
      // Clear the sort for this folder
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

  const sortFolderChildren = (folder: FolderData): FolderData => {
    const sortOption = folderSortOptions[folder.id]

    if (!sortOption) {
      // No sorting, return as-is with recursively sorted children
      return {
        ...folder,
        children: folder.children?.map(sortFolderChildren),
      }
    }

    const sortedFolder = { ...folder }

    // Sort items if they exist
    if (sortedFolder.items && sortedFolder.items.length > 0) {
      sortedFolder.items = [...sortedFolder.items].sort((a, b) => {
        let comparison = 0

        if (sortOption.by === "dateModified") {
          const dateA = new Date(a.dateModified || "")
          const dateB = new Date(b.dateModified || "")
          comparison = dateA.getTime() - dateB.getTime()
        } else if (sortOption.by === "type") {
          comparison = (a.type || "").localeCompare(b.type || "")
        } else if (sortOption.by === "name") {
          comparison = a.name.localeCompare(b.name)
        }

        return sortOption.direction === "desc" ? -comparison : comparison
      })
    }

    // Recursively sort children folders
    if (sortedFolder.children) {
      sortedFolder.children = sortedFolder.children.map(sortFolderChildren)
    }

    return sortedFolder
  }

  const sortedFolders =
    currentFolderId === null
      ? folders.map(sortFolderChildren)
      : ([findFolderById(folders, currentFolderId)].filter(Boolean).map(sortFolderChildren) as FolderData[])

  return (
    <div className="flex flex-col h-screen">
      <div className="px-4 pt-2">
        <LibraryHeader onImportComplete={handleImportComplete} />

        <LibrarySubheader breadcrumbs={breadcrumbs} onNavigate={handleNavigate} onCreateFolder={createFolder} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {currentFolderId === null ? (
          <>
            {sortedFolders.map((folder, index) => (
              <Folder
                key={folder.id}
                folder={folder}
                index={index}
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
              />
            ))}
          </>
        ) : (
          <>
            {sortedFolders.map((folder) => (
              <div key={folder.id}>
                {folder.children?.map((child, index) => (
                  <Folder
                    key={child.id}
                    folder={child}
                    index={index}
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
                  />
                ))}
              </div>
            ))}
          </>
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
    </div>
  )
}
