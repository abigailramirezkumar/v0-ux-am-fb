"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type SortDirection = "asc" | "desc" | null

export interface Column {
  id: string
  label: string
  visible: boolean
  width: number // Pixel width
  align?: "left" | "center" | "right"
  fixed?: boolean // Cannot be reordered
}

interface LibraryContextType {
  columns: Column[]
  sort: { columnId: string; direction: SortDirection }
  folderOrder: Record<string, string[]>
  activeWatchItemId: string | null
  setSort: (columnId: string) => void
  toggleColumnVisibility: (columnId: string) => void
  setColumns: (columns: Column[]) => void
  updateFolderOrder: (parentId: string, newOrder: string[]) => void
  resizeColumn: (columnId: string, width: number) => void
  moveColumn: (dragIndex: number, hoverIndex: number) => void
  setWatchItem: (itemId: string | null) => void
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
  const [columns, setColumns] = useState<Column[]>(defaultColumns)
  const [sort, setSortState] = useState<{ columnId: string; direction: SortDirection }>({
    columnId: "",
    direction: null,
  })
  const [folderOrder, setFolderOrder] = useState<Record<string, string[]>>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeWatchItemId, setActiveWatchItemId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const savedColumnOrder = localStorage.getItem("library_column_order")
      const savedFolderOrder = localStorage.getItem("library_folder_order")

      if (savedColumnOrder) {
        const orderIds = JSON.parse(savedColumnOrder) as string[]

        // Reconstruct: Sort defaultColumns based on saved IDs
        // This keeps the default widths but applies the saved order
        const reordered: Column[] = []

        // 1. Add columns found in saved order
        orderIds.forEach((id) => {
          const def = defaultColumns.find((c) => c.id === id)
          if (def) reordered.push({ ...def })
        })

        // 2. Append any new default columns not in saved order
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

      // Cannot move fixed columns or drop onto fixed columns
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
        columns,
        sort,
        folderOrder,
        activeWatchItemId,
        setSort,
        toggleColumnVisibility,
        setColumns,
        updateFolderOrder,
        resizeColumn,
        moveColumn,
        setWatchItem,
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
