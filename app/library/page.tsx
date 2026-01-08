"use client"

import { useState, useMemo } from "react"
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
import { LibraryProvider, useLibraryContext } from "@/lib/library-context"
import { FolderReorderModal } from "@/components/folder-reorder-modal"

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
        children: [
          {
            id: "subfolder-6-1-1",
            name: "Subfolder 6-1-1",
            dateModified: "Oct 23, 2024",
            createdDate: "Sep 8, 2024",
            children: [
              {
                id: "subfolder-6-1-1-1",
                name: "Subfolder 6-1-1-1",
                dateModified: "Oct 23, 2024",
                createdDate: "Sep 10, 2024",
                children: [
                  {
                    id: "subfolder-6-1-1-1-1",
                    name: "Subfolder 6-1-1-1-1",
                    dateModified: "Oct 23, 2024",
                    createdDate: "Sep 12, 2024",
                    children: [
                      {
                        id: "subfolder-6-1-1-1-1-1",
                        name: "Subfolder 6-1-1-1-1-1",
                        dateModified: "Oct 23, 2024",
                        createdDate: "Sep 15, 2024",
                        children: [
                          {
                            id: "subfolder-6-1-1-1-1-1-1",
                            name: "Subfolder 6-1-1-1-1-1-1",
                            dateModified: "Oct 23, 2024",
                            createdDate: "Sep 18, 2024",
                            children: [
                              {
                                id: "subfolder-6-1-1-1-1-1-1-1",
                                name: "Subfolder 6-1-1-1-1-1-1-1",
                                dateModified: "Oct 22, 2024",
                                createdDate: "Sep 20, 2024",
                                items: [
                                  {
                                    id: "item-11",
                                    name: "TB vs. NO Goal Line Situations",
                                    type: "video",
                                    dateModified: "Oct 22, 2024",
                                    hasData: true,
                                    itemCount: 45,
                                    angles: 6,
                                    duration: "1:32:20",
                                    size: "1.8 GB",
                                    comments: 67,
                                    createdDate: "Oct 22, 2024",
                                  },
                                  {
                                    id: "item-12",
                                    name: "ATL Play Action Efficiency",
                                    type: "video",
                                    dateModified: "Oct 18, 2024",
                                    hasData: true,
                                    itemCount: 58,
                                    angles: 4,
                                    duration: "1:45:30",
                                    size: "2.0 GB",
                                    comments: 32,
                                    createdDate: "Oct 18, 2024",
                                  },
                                  {
                                    id: "item-13",
                                    name: "CAR Blitz Packages Study",
                                    type: "pdf",
                                    dateModified: "Oct 15, 2024",
                                    createdDate: "Oct 15, 2024",
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
    createdDate: "Aug 1, 2024",
    children: [
      {
        id: "subfolder-7-1",
        name: "Subfolder 7-1",
        dateModified: "Sep 12, 2024",
        createdDate: "Aug 5, 2024",
        children: [
          {
            id: "subfolder-7-1-1",
            name: "Subfolder 7-1-1",
            dateModified: "Sep 12, 2024",
            createdDate: "Aug 10, 2024",
            children: [
              {
                id: "subfolder-7-1-1-1",
                name: "Subfolder 7-1-1-1",
                dateModified: "Sep 10, 2024",
                createdDate: "Aug 15, 2024",
                items: [
                  {
                    id: "item-14",
                    name: "NYJ Offensive Line Assignments",
                    type: "video",
                    dateModified: "Sep 10, 2024",
                    hasData: true,
                    itemCount: 112,
                    angles: 5,
                    duration: "2:58:40",
                    size: "3.4 GB",
                    comments: 48,
                    createdDate: "Sep 10, 2024",
                  },
                  {
                    id: "item-15",
                    name: "BUF Coverage Schemes",
                    type: "pdf",
                    dateModified: "Sep 8, 2024",
                    createdDate: "Sep 8, 2024",
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
            hasData: false,
            itemCount: 95,
            angles: 4,
            duration: "2:35:15",
            size: "3.0 GB",
            comments: 73,
            createdDate: "Sep 12, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-8",
    name: "Folder 8",
    dateModified: "Aug 28, 2024",
    createdDate: "Jul 15, 2024",
    children: [
      {
        id: "subfolder-8-1",
        name: "Subfolder 8-1",
        dateModified: "Aug 28, 2024",
        createdDate: "Jul 20, 2024",
        children: [
          {
            id: "subfolder-8-1-1",
            name: "Subfolder 8-1-1",
            dateModified: "Aug 25, 2024",
            createdDate: "Jul 25, 2024",
            items: [
              {
                id: "item-17",
                name: "NE Run Game Tendencies",
                type: "video",
                dateModified: "Aug 25, 2024",
                hasData: true,
                itemCount: 88,
                angles: 3,
                duration: "2:22:30",
                size: "2.6 GB",
                comments: 21,
                createdDate: "Aug 25, 2024",
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
            hasData: true,
            itemCount: 76,
            angles: 4,
            duration: "2:05:45",
            size: "2.4 GB",
            comments: 35,
            createdDate: "Aug 28, 2024",
          },
          {
            id: "item-19",
            name: "CLE Pass Rush Analysis",
            type: "pdf",
            dateModified: "Aug 26, 2024",
            createdDate: "Aug 26, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-9",
    name: "Folder 9",
    dateModified: "Jul 15, 2024",
    createdDate: "Jun 1, 2024",
    children: [
      {
        id: "subfolder-9-1",
        name: "Subfolder 9-1",
        dateModified: "Jul 15, 2024",
        createdDate: "Jun 5, 2024",
        children: [
          {
            id: "subfolder-9-1-1",
            name: "Subfolder 9-1-1",
            dateModified: "Jul 12, 2024",
            createdDate: "Jun 10, 2024",
            items: [
              {
                id: "item-20",
                name: "HOU Pre-Season Camp Highlights",
                type: "video",
                dateModified: "Jul 12, 2024",
                hasData: false,
                itemCount: 234,
                angles: 6,
                duration: "4:15:00",
                size: "5.2 GB",
                comments: 156,
                createdDate: "Jul 12, 2024",
              },
              {
                id: "item-21",
                name: "IND Rookie Development Plan",
                type: "pdf",
                dateModified: "Jul 10, 2024",
                createdDate: "Jul 10, 2024",
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
    createdDate: "May 1, 2024",
    children: [
      {
        id: "subfolder-10-1",
        name: "Subfolder 10-1",
        dateModified: "Jun 22, 2024",
        createdDate: "May 5, 2024",
        children: [
          {
            id: "subfolder-10-1-1",
            name: "Subfolder 10-1-1",
            dateModified: "Jun 20, 2024",
            createdDate: "May 10, 2024",
            children: [
              {
                id: "subfolder-10-1-1-1",
                name: "Subfolder 10-1-1-1",
                dateModified: "Jun 18, 2024",
                createdDate: "May 15, 2024",
                items: [
                  {
                    id: "item-22",
                    name: "JAX Draft Pick Breakdown",
                    type: "video",
                    dateModified: "Jun 18, 2024",
                    hasData: true,
                    itemCount: 42,
                    angles: 3,
                    duration: "1:28:30",
                    size: "1.6 GB",
                    comments: 28,
                    createdDate: "Jun 18, 2024",
                  },
                  {
                    id: "item-23",
                    name: "TEN Offseason Acquisitions",
                    type: "pdf",
                    dateModified: "Jun 15, 2024",
                    createdDate: "Jun 15, 2024",
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
            createdDate: "Jun 22, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-11",
    name: "Folder 11",
    dateModified: "May 30, 2024",
    createdDate: "Apr 15, 2024",
    children: [
      {
        id: "subfolder-11-1",
        name: "Subfolder 11-1",
        dateModified: "May 30, 2024",
        createdDate: "Apr 20, 2024",
        items: [
          {
            id: "item-25",
            name: "LV Coaching Staff Updates",
            type: "pdf",
            dateModified: "May 30, 2024",
            createdDate: "May 30, 2024",
          },
          {
            id: "item-26",
            name: "LAC Personnel Changes",
            type: "video",
            dateModified: "May 28, 2024",
            hasData: true,
            itemCount: 65,
            angles: 2,
            duration: "1:45:20",
            size: "2.0 GB",
            comments: 14,
            createdDate: "May 28, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-12",
    name: "Folder 12",
    dateModified: "Apr 18, 2024",
    createdDate: "Mar 1, 2024",
    children: [
      {
        id: "subfolder-12-1",
        name: "Subfolder 12-1",
        dateModified: "Apr 18, 2024",
        createdDate: "Mar 5, 2024",
        children: [
          {
            id: "subfolder-12-1-1",
            name: "Subfolder 12-1-1",
            dateModified: "Apr 15, 2024",
            createdDate: "Mar 10, 2024",
            children: [
              {
                id: "subfolder-12-1-1-1",
                name: "Subfolder 12-1-1-1",
                dateModified: "Apr 12, 2024",
                createdDate: "Mar 15, 2024",
                items: [
                  {
                    id: "item-27",
                    name: "ARI Scheme Implementation",
                    type: "video",
                    dateModified: "Apr 12, 2024",
                    hasData: true,
                    itemCount: 108,
                    angles: 5,
                    duration: "2:52:15",
                    size: "3.3 GB",
                    comments: 62,
                    createdDate: "Apr 12, 2024",
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
            createdDate: "Apr 18, 2024",
          },
        ],
      },
    ],
  },
  {
    id: "folder-13",
    name: "Folder 13",
    dateModified: "Mar 5, 2024",
    createdDate: "Feb 1, 2024",
    children: [
      {
        id: "subfolder-13-1",
        name: "Subfolder 13-1",
        dateModified: "Mar 5, 2024",
        createdDate: "Feb 5, 2024",
        children: [
          {
            id: "subfolder-13-1-1",
            name: "Subfolder 13-1-1",
            dateModified: "Mar 3, 2024",
            createdDate: "Feb 10, 2024",
            items: [
              {
                id: "item-29",
                name: "WAS Free Agency Targets",
                type: "pdf",
                dateModified: "Mar 3, 2024",
                createdDate: "Mar 3, 2024",
              },
              {
                id: "item-30",
                name: "CHI Combine Evaluations",
                type: "video",
                dateModified: "Mar 1, 2024",
                hasData: true,
                itemCount: 186,
                angles: 8,
                duration: "3:45:00",
                size: "4.5 GB",
                comments: 245,
                createdDate: "Mar 1, 2024",
              },
            ],
          },
        ],
      },
    ],
  },
]

function LibraryPageContent() {
  const { isCatapultImportOpen, setIsCatapultImportOpen } = useCatapultImport()
  const { density } = useDensity()
  const { sort, folderOrder, updateFolderOrder } = useLibraryContext()

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

  const handleOpenReorder = (targetId: string | null = null) => {
    // If targetId is null, we use currentFolderId (context of the view)
    setReorderTargetId(targetId ?? currentFolderId ?? "root")
    setReorderModalOpen(true)
  }

  const foldersForReorder = useMemo(() => {
    if (!reorderModalOpen) return []

    const targetId = reorderTargetId === "root" ? null : reorderTargetId
    let items: FolderData[] = []

    // 1. Get the raw items for the current level
    if (targetId === null) {
      items = [...folders]
    } else {
      const parent = findFolderById(folders, targetId)
      items = parent?.children ? [...parent.children] : []
    }

    // 2. Apply the Custom Order Logic to ensure Modal matches expected state
    const orderKey = targetId || "root"
    const customOrder = folderOrder[orderKey] || []

    if (customOrder.length > 0) {
      items.sort((a, b) => {
        const indexA = customOrder.indexOf(a.id)
        const indexB = customOrder.indexOf(b.id)

        // New/Unordered items go to top (index -1)
        if (indexA === -1 && indexB !== -1) return -1
        if (indexA !== -1 && indexB === -1) return 1

        // If both are unordered, sort them alphabetically
        if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name)

        return indexA - indexB
      })
    } else {
      // Default to Alpha if no custom order exists yet
      items.sort((a, b) => a.name.localeCompare(b.name))
    }

    return items
  }, [reorderModalOpen, reorderTargetId, folders, folderOrder])

  const compareItems = (a: any, b: any, sortBy: string, direction: "asc" | "desc") => {
    let valA: any = a[sortBy]
    let valB: any = b[sortBy]

    // Handle Metadata Specifics
    if (sortBy === "itemCount") {
      // Special Case: Folders often calculate this dynamically
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
      // Default String comparison (Name, Type)
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

    // Priority: Folder Specific > Global Context
    const activeSortBy = sortOption?.by || sort.columnId
    const activeDirection = sortOption?.direction || sort.direction

    // Folders ONLY sort by applicable columns: Name, Modified, Created, Type, Items
    const folderSortApplicable = ["name", "dateModified", "createdDate", "type", "itemCount"].includes(activeSortBy)

    let sortedChildren = folder.children ? [...folder.children] : []

    // Calculate Folder Item Counts if sorting by Items
    if (activeSortBy === "itemCount") {
      sortedChildren = sortedChildren.map((child) => ({
        ...child,
        itemCount: (child.children?.length || 0) + (child.items?.length || 0),
      }))
    }

    // Apply Sort to Folders
    if (activeSortBy && activeDirection && folderSortApplicable) {
      sortedChildren.sort((a, b) => compareItems(a, b, activeSortBy, activeDirection!))
    } else if (customOrder.length > 0) {
      // Fallback to Custom Order if global sort isn't folder-compatible
      sortedChildren.sort((a, b) => {
        const indexA = customOrder.indexOf(a.id)
        const indexB = customOrder.indexOf(b.id)
        if (indexA === -1 && indexB !== -1) return -1
        if (indexA !== -1 && indexB === -1) return 1
        if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name)
        return indexA - indexB
      })
    } else {
      // Default Alpha if no custom order and no applicable sort
      sortedChildren.sort((a, b) => a.name.localeCompare(b.name))
    }

    // Apply Sort to Items (Always applies if direction exists)
    const sortedItems = folder.items ? [...folder.items] : []
    if (activeSortBy && activeDirection) {
      sortedItems.sort((a, b) => compareItems(a, b, activeSortBy, activeDirection))
    }

    // Recurse
    return {
      ...folder,
      children: sortedChildren.map(sortFolderChildren),
      items: sortedItems,
    }
  }

  const sortedFolders = useMemo(() => {
    // Process recursively (Sorts contents of every folder)
    const recursiveSorted = folders.map(sortFolderChildren)

    // Root Level Sort - same folder-applicable logic
    const folderSortApplicable = ["name", "dateModified", "createdDate", "type", "itemCount"].includes(sort.columnId)
    const customOrder = folderOrder["root"] || []

    if (currentFolderId === null) {
      if (sort.columnId && sort.direction && folderSortApplicable) {
        // Inject count if needed for root sort
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

      // Default
      return recursiveSorted.sort((a, b) => a.name.localeCompare(b.name))
    }

    // Drilled Down View
    const target = findFolderById(recursiveSorted, currentFolderId)
    return target ? [target] : []
  }, [folders, folderSortOptions, currentFolderId, sort, folderOrder])

  const getFlattenedVisibleItems = (nodes: FolderData[], level = 0) => {
    const items: Array<{ type: "folder" | "item"; data: FolderData | LibraryItemData; level: number }> = []

    nodes.forEach((node) => {
      // Add the folder itself
      items.push({ type: "folder", data: node, level })

      // If expanded, recursively add its children and items
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
    // Root view: Flatten everything starting from root folders
    visibleFlatList = getFlattenedVisibleItems(sortedFolders, 0)
  } else {
    // Drilled down view: Show contents of the current folder
    const currentFolder = sortedFolders.find((f) => f.id === currentFolderId) // Use sortedFolders for consistency
    if (currentFolder) {
      // Add children folders (flattened if they are expanded)
      if (currentFolder.children) {
        visibleFlatList.push(...getFlattenedVisibleItems(currentFolder.children, 0))
      }
      // Add items of the current folder
      if (currentFolder.items) {
        currentFolder.items.forEach((item) => {
          visibleFlatList.push({ type: "item", data: item, level: 0 })
        })
      }
    }
  }

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

export default function LibraryPage() {
  return (
    <LibraryProvider>
      <LibraryPageContent />
    </LibraryProvider>
  )
}
