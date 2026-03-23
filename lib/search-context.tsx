"use client"

import { createContext, useContext, useRef, useCallback, type RefObject, type ReactNode } from "react"

interface SearchContextValue {
  inputRef: RefObject<HTMLInputElement | null>
  focusSearch: () => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null)
  
  const focusSearch = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <SearchContext.Provider value={{ inputRef, focusSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearchContext() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider")
  }
  return context
}

export function useSearchContextOptional() {
  return useContext(SearchContext)
}
