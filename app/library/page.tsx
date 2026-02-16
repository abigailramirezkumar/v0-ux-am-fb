"use client"

import { useState } from "react"
import { LibraryHeader } from "@/components/library-header"
import { LibrarySubheader } from "@/components/library-subheader"
import { Folder, type FolderData } from "@/components/folder"
import { LibraryItem } from "@/components/library-item"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
    children: [
      {
        id: "subfolder-1",
        name: "Subfolder 1",
        items: [
          {
            id: "item-1",
            name: "NYG vs. BUF 01.01.24",
            type: "video",
          },
          {
            id: "item-2",
            name: "DAL vs. PHI 12.15.23",
            type: "video",
          },
        ],
      },
      {
        id: "subfolder-2",
        name: "Subfolder 2",
        items: [
          {
            id: "item-3",
            name: "KC vs. SF 02.11.24",
            type: "video",
          },
        ],
      },
    ],
  },
  {
    id: "folder-2",
    name: "Folder 2",
    children: [
      {
        id: "subfolder-3",
        name: "Subfolder 3",
        items: [
          {
            id: "item-4",
            name: "BAL vs. CIN 11.16.23",
            type: "video",
          },
        ],
      },
    ],
  },
  {
    id: "folder-3",
    name: "Folder 3",
    children: [
      {
        id: "subfolder-4",
        name: "Subfolder 4",
        items: [
          {
            id: "item-5",
            name: "MIA vs. NE 10.29.23",
            type: "video",
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

  const folders = libraryView === "team" ? teamFolders : myFolders
  const setFolders = libraryView === "team" ? setTeamFolders : setMyFolders

  const handleImportComplete = (importedFolders: FolderData[]) => {
    console.log("[v0] Import complete", { importedFolders })

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
  const displayFolders = currentFolderId === null ? folders : currentFolder?.children || []
  const displayItems = currentFolderId === null ? [] : currentFolder?.items || []

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

  const handleFolderSelect = (folderId: string, selected: boolean) => {
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

  const handleItemSelect = (itemId: string, selected: boolean) => {
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

  const handleDeleteFolder = (folderId: string) => {
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

  return (
    <div className="h-full">
      <div className="h-full p-6">
        <div className="h-full flex flex-col">
          <div className="hidden items-center justify-between mb-4">
            <ToggleGroup
              type="single"
              value={libraryView}
              onValueChange={(value) => {
                if (value) {
                  setLibraryView(value as "team" | "my")
                  setCurrentFolderId(null)
                  setBreadcrumbs([])
                  setExpandedFolders(new Set())
                  setSelectedFolders(new Set())
                  setSelectedItems(new Set())
                }
              }}
              className="gap-0"
            >
              <ToggleGroupItem value="team" className="px-4 py-2 rounded-sm">
                Team Library
              </ToggleGroupItem>
              <ToggleGroupItem
                value="my"
                className="px-4 py-2 data-[state=on]:bg-primary/90 data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/80 rounded-sm"
              >
                My Library
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <LibraryHeader
            showStorageIndicator={false}
            onImportComplete={handleImportComplete}
            showImportButton={libraryView === "team"}
          />
          <LibrarySubheader breadcrumbs={breadcrumbs} onNavigate={handleNavigate} onCreateFolder={createFolder} />
          <div className="flex-1 overflow-y-auto mt-0">
            {displayFolders.length === 0 && displayItems.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-lg">No Content in Your Library</p>
              </div>
            )}
            {displayFolders.map((folder) => (
              <Folder
                key={folder.id}
                folder={folder}
                onSelect={handleFolderSelect}
                onSelectItem={handleItemSelect}
                onDoubleClick={handleFolderDoubleClick}
                selectedFolders={selectedFolders}
                selectedItems={selectedItems}
                expandedFolders={expandedFolders}
                onToggleExpand={handleToggleExpand}
                onRename={handleRenameFolder}
                onDelete={handleDeleteFolder}
              />
            ))}
            {displayItems.map((item) => (
              <LibraryItem
                key={item.id}
                item={{
                  id: item.id,
                  name: item.name,
                  thumbnailUrl: "/football-field.png",
                  type: item.type as "video" | "pdf" | "image" | "audio" | "document",
                }}
                level={0}
                onSelect={handleItemSelect}
                selectedItems={selectedItems}
              />
            ))}
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
    </div>
  )
}
