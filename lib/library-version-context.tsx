"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type LibraryVersion = "v1" | "v2"

interface LibraryVersionContextType {
  libraryVersion: LibraryVersion
  setLibraryVersion: (version: LibraryVersion) => void
}

const LibraryVersionContext = createContext<LibraryVersionContextType | undefined>(undefined)

export function LibraryVersionProvider({ children }: { children: ReactNode }) {
  const [libraryVersion, setLibraryVersion] = useState<LibraryVersion>("v1")

  return (
    <LibraryVersionContext.Provider value={{ libraryVersion, setLibraryVersion }}>
      {children}
    </LibraryVersionContext.Provider>
  )
}

export function useLibraryVersion() {
  const context = useContext(LibraryVersionContext)
  if (!context) {
    throw new Error("useLibraryVersion must be used within LibraryVersionProvider")
  }
  return context
}
