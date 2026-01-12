"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { FolderData } from "@/components/folder"
import type { LibraryItemData } from "@/components/library-item"

export type SortDirection = "asc" | "desc" | null

export interface Column {
  id: string
  label: string
  visible: boolean
  width: number
  align?: "left" | "center" | "right"
  fixed?: boolean
}

// Helper to generate random library items for leaf nodes
const generateLeafItems = (year: number, folderId: string, count = 2): LibraryItemData[] => {
  const items: LibraryItemData[] = []

  // NFL-style dates (approximate regular season start)
  const baseMonth = 9 // September
  const baseDay = 8

  for (let i = 0; i < count; i++) {
    const month = baseMonth + Math.floor(Math.random() * 4)
    const day = baseDay + i * 7
    const dateStr = `${String(month).padStart(2, "0")} ${String(day).padStart(2, "0")} ${year.toString().slice(-2)}`

    // Randomize some metadata
    const durationMin = 20 + Math.floor(Math.random() * 100)
    const sizeGB = (1 + Math.random() * 4).toFixed(1)

    items.push({
      id: `item-${folderId}-${i}`,
      name: `${dateStr} Sample Game`,
      type: "video",
      dateModified: `Oct ${10 + i}, ${year}`,
      createdDate: `Sep ${day}, ${year}`,
      hasData: Math.random() > 0.3,
      itemCount: Math.floor(Math.random() * 150) + 50,
      duration: `${Math.floor(durationMin / 60)}:${String(durationMin % 60).padStart(2, "0")}:00`,
      size: `${sizeGB} GB`,
      angles: 2 + Math.floor(Math.random() * 3),
      comments: Math.floor(Math.random() * 20),
      thumbnailUrl: "/football-field.png",
    })
  }

  return items
}

function createSelfScoutYearFolders(): FolderData[] {
  const yearFolders: FolderData[] = []

  // Create folders for years 2020-2025
  for (let year = 2025; year >= 2020; year--) {
    const yearId = `self-scout-${year}`
    yearFolders.push({
      id: yearId,
      name: year.toString(),
      dateModified: `Dec 31, ${year}`,
      children: [
        {
          id: `${yearId}-offseason`,
          name: "Offseason Studies",
          items: generateLeafItems(year, `${yearId}-offseason`),
        },
        {
          id: `${yearId}-minicamp`,
          name: "Mini-Camp OTA",
          items: generateLeafItems(year, `${yearId}-minicamp`),
        },
        {
          id: `${yearId}-training-camp`,
          name: "Training Camp",
          items: generateLeafItems(year, `${yearId}-training-camp`),
        },
        {
          id: `${yearId}-self-scout`,
          name: "Self Scout",
          items: generateLeafItems(year, `${yearId}-self-scout`),
        },
      ],
    })
  }

  return yearFolders
}

function createTeamStructure(teamName: string, teamNickname: string): FolderData {
  const years: FolderData[] = []
  const teamId = teamName.toLowerCase().replace(/\s+/g, "-")

  // Create year folders from 2023-2025
  for (let year = 2023; year <= 2025; year++) {
    const yearId = `${teamId}-${year}`
    years.push({
      id: yearId,
      name: `${year} ${teamNickname}`,
      dateModified: `Dec 14, ${year}`,
      children: [
        { name: "Offense Share", items: generateLeafItems(year, `${yearId}-off`) },
        { name: "Defense Share", items: generateLeafItems(year, `${yearId}-def`) },
        { name: "Special Teams Share", items: generateLeafItems(year, `${yearId}-st`) },
      ].map((sub, i) => ({
        id: `${yearId}-sub-${i}`,
        name: sub.name,
        dateModified: `Dec 14, ${year}`,
        items: sub.items,
      })),
    })
  }

  return {
    id: teamId,
    name: teamName,
    dateModified: "Dec 14, 2024",
    children: years,
  }
}

function createCollegeScoutingStructure(yearRange: string): FolderData[] {
  const parentId = `scouting-${yearRange}`
  const year = Number.parseInt(yearRange.split("-")[1])

  return [
    { name: "Masters", items: true },
    { name: "Masters Working", items: true },
    { name: "College Games", children: [{ name: "Division I" }, { name: "Division II" }] },
    { name: "All Star Games", children: [{ name: "Senior Bowl" }, { name: "Shrine Bowl" }] },
    { name: "Combine", items: true },
    { name: "Pro Days", items: true },
  ].map((f, i) => {
    const id = `${parentId}-${i}`
    return {
      id,
      name: f.name,
      dateModified: `Feb 8, ${year}`,
      items: f.items ? generateLeafItems(year, id) : undefined,
      children: f.children
        ? f.children.map((c, j) => ({
            id: `${id}-child-${j}`,
            name: c.name,
            dateModified: `Feb 8, ${year}`,
            items: generateLeafItems(year, `${id}-child-${j}`),
          }))
        : undefined,
    }
  })
}

const generateRamsLibrary = (): FolderData[] => {
  return [
    {
      id: "self-scout",
      name: "Self Scout",
      dateModified: "Dec 15, 2024",
      createdDate: "Sep 1, 2010",
      children: createSelfScoutYearFolders(),
    },
    {
      id: "opponent-scout",
      name: "Opponent Scout",
      dateModified: "Dec 14, 2024",
      children: [
        createTeamStructure("Arizona Cardinals", "Cardinals"),
        createTeamStructure("San Francisco 49ers", "49ers"),
        createTeamStructure("Seattle Seahawks", "Seahawks"),
        createTeamStructure("Dallas Cowboys", "Cowboys"),
        createTeamStructure("Green Bay Packers", "Packers"),
      ],
    },
    {
      id: "scouting",
      name: "Scouting",
      dateModified: "Dec 13, 2024",
      children: [
        {
          id: "scouting-2024-2025",
          name: "2024-2025",
          dateModified: "May 15, 2025",
          children: createCollegeScoutingStructure("2024-2025"),
        },
        {
          id: "scouting-2025-2026",
          name: "2025-2026",
          dateModified: "May 15, 2026",
          children: createCollegeScoutingStructure("2025-2026"),
        },
      ],
    },
    {
      id: "practice",
      name: "Practice",
      dateModified: "Dec 11, 2024",
      items: generateLeafItems(2024, "practice"),
    },
    {
      id: "special-projects",
      name: "Special Projects",
      dateModified: "Dec 8, 2024",
      items: generateLeafItems(2024, "special-projects"),
    },
    {
      id: "analytics",
      name: "Performance Analytics",
      dateModified: "Dec 6, 2024",
      items: generateLeafItems(2024, "analytics"),
    },
  ]
}

interface LibraryContextType {
  // Config
  columns: Column[]
  sort: { columnId: string; direction: SortDirection }
  folderOrder: Record<string, string[]>
  activeWatchItemId: string | null
  renamingId: string | null

  // Data State (moved from LibraryView)
  folders: FolderData[]
  libraryView: "team" | "my"
  selectedFolders: Set<string>
  selectedItems: Set<string>
  expandedFolders: Set<string>
  currentFolderId: string | null
  breadcrumbs: Array<{ id: string; name: string }>

  // Setters
  setSort: (columnId: string) => void
  toggleColumnVisibility: (columnId: string) => void
  setColumns: (columns: Column[]) => void
  updateFolderOrder: (parentId: string, newOrder: string[]) => void
  resizeColumn: (columnId: string, width: number) => void
  moveColumn: (dragIndex: number, hoverIndex: number) => void
  setWatchItem: (itemId: string | null) => void
  setRenamingId: (id: string | null) => void

  // Data Setters
  setFolders: React.Dispatch<React.SetStateAction<FolderData[]>>
  setLibraryView: (view: "team" | "my") => void
  setSelectedFolders: (ids: Set<string>) => void
  setSelectedItems: (ids: Set<string>) => void
  setExpandedFolders: (ids: Set<string>) => void
  setCurrentFolderId: (id: string | null) => void
  setBreadcrumbs: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string }>>>
}

const defaultColumns: Column[] = [
  { id: "name", label: "Name", visible: true, width: 300, align: "left", fixed: true },
  { id: "dateModified", label: "Modified", visible: true, width: 120, align: "left" },
  { id: "type", label: "Type", visible: true, width: 80, align: "left" },
  { id: "hasData", label: "Data", visible: true, width: 60, align: "center" },
  { id: "itemCount", label: "Items", visible: true, width: 80, align: "left" },
  { id: "angles", label: "Angles", visible: true, width: 80, align: "left" },
  { id: "duration", label: "Duration", visible: true, width: 90, align: "left" },
  { id: "size", label: "Size", visible: true, width: 90, align: "left" },
  { id: "comments", label: "Comments", visible: true, width: 100, align: "left" },
  { id: "createdDate", label: "Created", visible: true, width: 120, align: "left" },
]

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  // Config State
  const [columns, setColumns] = useState<Column[]>(defaultColumns)
  const [sort, setSortState] = useState<{ columnId: string; direction: SortDirection }>({
    columnId: "",
    direction: null,
  })
  const [folderOrder, setFolderOrder] = useState<Record<string, string[]>>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeWatchItemId, setActiveWatchItemId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)

  const [folders, setFolders] = useState<FolderData[]>(generateRamsLibrary())
  const [libraryView, setLibraryView] = useState<"team" | "my">("team")
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set())
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    try {
      const savedColumnOrder = localStorage.getItem("library_column_order")
      const savedFolderOrder = localStorage.getItem("library_folder_order")

      if (savedColumnOrder) {
        const orderIds = JSON.parse(savedColumnOrder) as string[]
        const reordered: Column[] = []
        orderIds.forEach((id) => {
          const def = defaultColumns.find((c) => c.id === id)
          if (def) reordered.push({ ...def })
        })
        defaultColumns.forEach((def) => {
          if (!reordered.find((c) => c.id === def.id)) {
            reordered.push({ ...def })
          }
        })
        setColumns(reordered)
      } else {
        setColumns(defaultColumns.map((c) => ({ ...c })))
      }

      if (savedFolderOrder) {
        setFolderOrder(JSON.parse(savedFolderOrder))
      }
    } catch (e) {
      console.error("Failed to load library settings", e)
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      const orderIds = columns.map((c) => c.id)
      localStorage.setItem("library_column_order", JSON.stringify(orderIds))
      localStorage.setItem("library_folder_order", JSON.stringify(folderOrder))
    }
  }, [columns, folderOrder, isLoaded])

  const setSort = (columnId: string) => {
    setSortState((prev) => {
      if (prev.columnId === columnId) {
        if (prev.direction === "asc") return { columnId, direction: "desc" }
        if (prev.direction === "desc") return { columnId: "", direction: null }
      }
      return { columnId, direction: "asc" }
    })
  }

  const toggleColumnVisibility = (columnId: string) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === columnId) {
          return { ...col, visible: !col.visible }
        }
        return col
      }),
    )
  }

  const updateFolderOrder = (parentId: string, newOrder: string[]) => {
    setFolderOrder((prev) => ({
      ...prev,
      [parentId]: newOrder,
    }))
  }

  const resizeColumn = (columnId: string, newWidth: number) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, width: Math.max(50, newWidth) } : col)))
  }

  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    setColumns((prev) => {
      const newCols = [...prev]
      const targetCol = newCols[hoverIndex]
      const draggedCol = newCols[dragIndex]
      if (targetCol.fixed || draggedCol.fixed) return prev
      const [removed] = newCols.splice(dragIndex, 1)
      newCols.splice(hoverIndex, 0, removed)
      return newCols
    })
  }

  const setWatchItem = (itemId: string | null) => {
    setActiveWatchItemId(itemId)
  }

  return (
    <LibraryContext.Provider
      value={{
        // Config
        columns,
        sort,
        folderOrder,
        activeWatchItemId,
        renamingId,
        // Data State
        folders,
        libraryView,
        selectedFolders,
        selectedItems,
        expandedFolders,
        currentFolderId,
        breadcrumbs,
        // Config Setters
        setSort,
        toggleColumnVisibility,
        setColumns,
        updateFolderOrder,
        resizeColumn,
        moveColumn,
        setWatchItem,
        setRenamingId,
        // Data Setters
        setFolders,
        setLibraryView,
        setSelectedFolders,
        setSelectedItems,
        setExpandedFolders,
        setCurrentFolderId,
        setBreadcrumbs,
      }}
    >
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibraryContext() {
  const context = useContext(LibraryContext)
  if (context === undefined) {
    throw new Error("useLibraryContext must be used within a LibraryProvider")
  }
  return context
}
