"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type SortDirection = "asc" | "desc" | null

export interface Column {
  id: string
  label: string
  visible: boolean
  width: string
  fixed?: boolean
  align?: "left" | "center" | "right"
}

interface LibraryContextType {
  columns: Column[]
  sort: { columnId: string; direction: SortDirection }
  folderOrder: Record<string, string[]> // parentId -> ordered child IDs
  setSort: (columnId: string) => void
  toggleColumnVisibility: (columnId: string) => void
  moveColumn: (dragIndex: number, hoverIndex: number) => void
  setColumns: (columns: Column[]) => void
  updateFolderOrder: (parentId: string, newOrder: string[]) => void
}

const defaultColumns: Column[] = [
  { id: "name", label: "Name", visible: true, width: "flex-1 min-w-[200px]", fixed: true, align: "left" },
  { id: "dateModified", label: "Modified", visible: true, width: "w-24", align: "left" },
  { id: "type", label: "Type", visible: true, width: "w-16", align: "left" },
  { id: "hasData", label: "Data", visible: true, width: "w-12", align: "center" },
  { id: "itemCount", label: "Items", visible: true, width: "w-14", align: "center" },
  { id: "angles", label: "Angles", visible: true, width: "w-14", align: "center" },
  { id: "duration", label: "Duration", visible: true, width: "w-16", align: "center" },
  { id: "size", label: "Size", visible: true, width: "w-16", align: "right" },
  { id: "comments", label: "Comments", visible: true, width: "w-14", align: "center" },
  { id: "createdDate", label: "Created", visible: true, width: "w-24", align: "left" },
]

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [columns, setColumns] = useState<Column[]>(defaultColumns)
  const [sort, setSortState] = useState<{ columnId: string; direction: SortDirection }>({
    columnId: "name",
    direction: "asc",
  })
  const [folderOrder, setFolderOrder] = useState<Record<string, string[]>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from local storage
  useEffect(() => {
    try {
      const savedColumns = localStorage.getItem("library_columns")
      const savedOrder = localStorage.getItem("library_folder_order")

      if (savedColumns) {
        const parsed = JSON.parse(savedColumns)
        // Merge with defaults
        const merged = defaultColumns.map((def) => {
          const saved = parsed.find((p: Column) => p.id === def.id)
          return saved ? { ...def, visible: saved.visible } : def
        })

        // Restore order
        const ordered: Column[] = []
        parsed.forEach((saved: Column) => {
          const found = merged.find((m) => m.id === saved.id)
          if (found) ordered.push(found)
        })
        merged.forEach((m) => {
          if (!ordered.find((o) => o.id === m.id)) ordered.push(m)
        })
        setColumns(ordered)
      }

      if (savedOrder) {
        setFolderOrder(JSON.parse(savedOrder))
      }
    } catch (e) {
      console.error("Failed to load library settings", e)
    }
    setIsLoaded(true)
  }, [])

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("library_columns", JSON.stringify(columns))
      localStorage.setItem("library_folder_order", JSON.stringify(folderOrder))
    }
  }, [columns, folderOrder, isLoaded])

  const setSort = (columnId: string) => {
    setSortState((prev) => {
      if (prev.columnId === columnId) {
        if (prev.direction === "asc") return { columnId, direction: "desc" }
        if (prev.direction === "desc") return { columnId, direction: "asc" }
      }
      return { columnId, direction: "asc" }
    })
  }

  const toggleColumnVisibility = (columnId: string) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === columnId && !col.fixed) {
          return { ...col, visible: !col.visible }
        }
        return col
      }),
    )
  }

  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    setColumns((prev) => {
      const newCols = [...prev]
      const [draggedItem] = newCols.splice(dragIndex, 1)
      newCols.splice(hoverIndex, 0, draggedItem)
      if (newCols[0].fixed === false) return prev
      return newCols
    })
  }

  const updateFolderOrder = (parentId: string, newOrder: string[]) => {
    setFolderOrder((prev) => ({
      ...prev,
      [parentId]: newOrder,
    }))
  }

  return (
    <LibraryContext.Provider
      value={{
        columns,
        sort,
        folderOrder,
        setSort,
        toggleColumnVisibility,
        moveColumn,
        setColumns,
        updateFolderOrder,
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
