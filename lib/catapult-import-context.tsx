"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type CatapultVersion = "v1" | "v2" | "v3"

interface CatapultImportContextType {
  activeVersion: CatapultVersion
  setActiveVersion: (version: CatapultVersion) => void
  isCatapultImportOpen: boolean
  setIsCatapultImportOpen: (open: boolean) => void
}

const CatapultImportContext = createContext<CatapultImportContextType | undefined>(undefined)

export function CatapultImportProvider({ children }: { children: ReactNode }) {
  const [activeVersion, setActiveVersion] = useState<CatapultVersion>("v1")
  const [isCatapultImportOpen, setIsCatapultImportOpen] = useState(false)

  return (
    <CatapultImportContext.Provider
      value={{ activeVersion, setActiveVersion, isCatapultImportOpen, setIsCatapultImportOpen }}
    >
      {children}
    </CatapultImportContext.Provider>
  )
}

export function useCatapultImportContext() {
  const context = useContext(CatapultImportContext)
  if (!context) {
    throw new Error("useCatapultImportContext must be used within CatapultImportProvider")
  }
  return context
}

export const useCatapultImport = useCatapultImportContext
