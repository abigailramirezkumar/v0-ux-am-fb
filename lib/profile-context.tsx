"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ProfileModules {
  reports: boolean
}

interface ProfileContextValue {
  visibleModules: ProfileModules
  toggleModule: (module: keyof ProfileModules) => void
  setModuleVisibility: (module: keyof ProfileModules, visible: boolean) => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [visibleModules, setVisibleModules] = useState<ProfileModules>({
    reports: false,
  })

  const toggleModule = (module: keyof ProfileModules) => {
    setVisibleModules((prev) => ({
      ...prev,
      [module]: !prev[module],
    }))
  }

  const setModuleVisibility = (module: keyof ProfileModules, visible: boolean) => {
    setVisibleModules((prev) => ({
      ...prev,
      [module]: visible,
    }))
  }

  return (
    <ProfileContext.Provider
      value={{
        visibleModules,
        toggleModule,
        setModuleVisibility,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfileContext() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider")
  }
  return context
}

// Optional hook for conditional usage
export function useProfileContextOptional() {
  return useContext(ProfileContext)
}
