"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type Density = "default" | "dense" | "spacious"

interface DensityContextType {
  density: Density
  setDensity: (density: Density) => void
}

const DensityContext = createContext<DensityContextType | undefined>(undefined)

export function DensityProvider({ children }: { children: ReactNode }) {
  const [density, setDensity] = useState<Density>("default")

  return <DensityContext.Provider value={{ density, setDensity }}>{children}</DensityContext.Provider>
}

export function useDensity() {
  const context = useContext(DensityContext)
  if (context === undefined) {
    throw new Error("useDensity must be used within a DensityProvider")
  }
  return context
}

export function getDensitySpacing(density: Density) {
  switch (density) {
    case "dense":
      return {
        py: "py-1.5", // Reduced from py-3
        gap: "gap-2", // Reduced from gap-3
        indent: 20, // Increased from 16 to 20
      }
    case "spacious":
      return {
        py: "py-4", // Increased from py-3
        gap: "gap-4", // Increased from gap-3
        indent: 40, // Increased from 32 to 40
      }
    case "default":
    default:
      return {
        py: "py-3",
        gap: "gap-3",
        indent: 28, // Increased from 24 to 28
      }
  }
}
