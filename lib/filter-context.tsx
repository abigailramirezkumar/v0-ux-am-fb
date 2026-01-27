"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface FilterContextType {
  isFilterSidebarOpen: boolean
  toggleFilterSidebar: () => void
  setFilterSidebarOpen: (open: boolean) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true)

  const toggleFilterSidebar = () => setIsFilterSidebarOpen((prev) => !prev)
  const setFilterSidebarOpen = (open: boolean) => setIsFilterSidebarOpen(open)

  return (
    <FilterContext.Provider value={{ isFilterSidebarOpen, toggleFilterSidebar, setFilterSidebarOpen }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilter() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider")
  }
  return context
}
