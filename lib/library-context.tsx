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
  setSort: (columnId: string) => void
  toggleColumnVisibility: (columnId: string) => void
  moveColumn: (dragIndex: number, hoverIndex: number) => void
  setColumns: (columns: Column[]) => void
}

const defaultColumns: Column[] = [
  { id: "name", label: "Name", visible: true, width: "flex-1 min-w-[200px]", fixed: true, align: "left" },
  { id: "dateModified", label: "Modified", visible: true, width: "w-24", align: "left" },
  { id: "type", label: "Type", visible: true, width: "w-16", align: "left" },
  { id: "hasData", label: "Data", visible: true, width: "w-12", align: "center" },
  { id: "itemCount", label: "Items", visible: true, width: "w-14", align: "left" },
  { id: "angles", label: "Angles", visible: true, width: "w-14", align: "left" },
  { id: "duration", label: "Duration", visible: true, width: "w-16", align: "left" },
  { id: "size", label: "Size", visible: true, width: "w-16", align: "left" },
  { id: "comments", label: "Comments", visible: true, width: "w-14", align: "left" },
  { id: "createdDate", label: "Created", visible: true, width: "w-24", align: "left" },
]

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [columns, setColumns] = useState<Column[]>(defaultColumns)
  const [sort, setSortState] = useState<{ columnId: string; direction: SortDirection }>({
    columnId: "name",
    direction: "asc",
  })
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from local storage
  useEffect(() => {
    const savedColumns = localStorage.getItem("library_columns")
    if (savedColumns) {
      try {
        const parsed = JSON.parse(savedColumns)
        // Merge with defaults to ensure new columns appear if added in code later
        const merged = defaultColumns.map((def) => {
          const saved = parsed.find((p: Column) => p.id === def.id)
          return saved ? { ...def, visible: saved.visible } : def
        })

        // Also respect saved order
        const ordered: Column[] = []
        parsed.forEach((saved: Column) => {
          const found = merged.find((m) => m.id === saved.id)
          if (found) ordered.push(found)
        })
        // Add any new defaults that weren't in saved
        merged.forEach((m) => {
          if (!ordered.find((o) => o.id === m.id)) ordered.push(m)
        })

        setColumns(ordered)
      } catch (e) {
        console.error("Failed to parse columns", e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("library_columns", JSON.stringify(columns))
    }
  }, [columns, isLoaded])

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

      // Ensure fixed columns stay at start
      if (newCols[0].fixed === false) {
        return prev
      }
      return newCols
    })
  }

  return (
    <LibraryContext.Provider value={{ columns, sort, setSort, toggleColumnVisibility, moveColumn, setColumns }}>
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
