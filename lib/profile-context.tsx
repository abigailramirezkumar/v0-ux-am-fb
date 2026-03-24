"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Game } from "@/types/game"
import type { MediaItemData } from "@/types/library"

interface ProfileModules {
  reports: boolean
  video: boolean
}

// Video content can be either a game or a playlist
interface VideoContent {
  type: "game" | "playlist"
  game?: Game
  playlist?: MediaItemData
}

interface ProfileContextValue {
  visibleModules: ProfileModules
  toggleModule: (module: keyof ProfileModules) => void
  setModuleVisibility: (module: keyof ProfileModules, visible: boolean) => void
  // Video module state
  videoContent: VideoContent | null
  setVideoContent: (content: VideoContent | null) => void
  clearVideoContent: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [visibleModules, setVisibleModules] = useState<ProfileModules>({
    reports: false,
    video: false,
  })
  const [videoContent, setVideoContentState] = useState<VideoContent | null>(null)

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

  const setVideoContent = (content: VideoContent | null) => {
    setVideoContentState(content)
  }

  const clearVideoContent = () => {
    setVideoContentState(null)
  }

  return (
    <ProfileContext.Provider
      value={{
        visibleModules,
        toggleModule,
        setModuleVisibility,
        videoContent,
        setVideoContent,
        clearVideoContent,
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
