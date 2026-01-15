"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useLibraryContext } from "@/lib/library-context"
import { getDatasetForItem, getRandomVideoUrl, type PlayData, type Dataset } from "@/lib/mock-datasets"
import type { FolderData } from "@/components/folder"

interface WatchContextType {
  // Tab State
  tabs: Dataset[]
  activeTabId: string | null
  playingTabId: string | null

  // Derived Data
  activeDataset: Dataset | null
  playingDataset: Dataset | null
  currentPlay: PlayData | null

  videoUrl: string | null
  frameRate: number

  // Actions
  activateTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  playTab: (tabId: string) => void
  seekToPlay: (play: PlayData) => void
  setVideoUrl: (url: string) => void

  // Module Visibility
  visibleModules: {
    library: boolean
    video: boolean
    grid: boolean
  }
  toggleModule: (module: "library" | "video" | "grid") => void
}

const WatchContext = createContext<WatchContextType | undefined>(undefined)

function findItemNameById(folders: FolderData[], itemId: string): string | null {
  for (const folder of folders) {
    // Check items in this folder
    if (folder.items) {
      const foundItem = folder.items.find((i) => i.id === itemId)
      if (foundItem) return foundItem.name
    }
    // Check children folders
    if (folder.children) {
      const foundInChild = findItemNameById(folder.children, itemId)
      if (foundInChild) return foundInChild
    }
  }
  return null
}

export function WatchProvider({ children }: { children: ReactNode }) {
  const { activeWatchItemId, activeWatchItems, folders } = useLibraryContext()

  const [tabs, setTabs] = useState<Dataset[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [playingTabId, setPlayingTabId] = useState<string | null>(null)
  const [currentPlay, setCurrentPlay] = useState<PlayData | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const frameRate = 30

  const [visibleModules, setVisibleModules] = useState({
    library: true,
    video: true,
    grid: true,
  })

  const toggleModule = (module: "library" | "video" | "grid") => {
    setVisibleModules((prev) => ({
      ...prev,
      [module]: !prev[module],
    }))
  }

  const playRandomVideo = () => {
    setVideoUrl((prev) => getRandomVideoUrl(prev))
  }

  useEffect(() => {
    if (!activeWatchItemId) return

    setTabs((prevTabs) => {
      // 1. Check if already open
      const existing = prevTabs.find((t) => t.id === activeWatchItemId)

      if (existing) {
        // Just switch the GRID to it. Do not change video.
        setActiveTabId(existing.id)
        return prevTabs
      }

      // 2. New Tab Logic
      const newDataset = getDatasetForItem(activeWatchItemId)

      const realName = findItemNameById(folders, activeWatchItemId)

      const datasetWithId = {
        ...newDataset,
        id: activeWatchItemId,
        name: realName || newDataset.name, // Use real name or fallback to mock name
      }

      // Make it active in Grid
      setActiveTabId(datasetWithId.id)

      // Also make it the Playing Tab (Auto-play behavior for new items)
      setPlayingTabId(datasetWithId.id)

      // Pick a random video to start
      playRandomVideo()

      // Set first play as current
      if (datasetWithId.plays.length > 0) {
        setCurrentPlay(datasetWithId.plays[0])
      }

      return [datasetWithId, ...prevTabs]
    })
  }, [activeWatchItemId, folders])

  useEffect(() => {
    if (!activeWatchItems || activeWatchItems.length === 0) return

    setTabs((prevTabs) => {
      const newTabs = [...prevTabs]
      let firstNewId: string | null = null

      activeWatchItems.forEach((itemId) => {
        // Check if already exists
        if (newTabs.some((t) => t.id === itemId)) return

        const newDataset = getDatasetForItem(itemId)
        const realName = findItemNameById(folders, itemId)

        const datasetWithId = {
          ...newDataset,
          id: itemId,
          name: realName || newDataset.name,
        }

        if (!firstNewId) firstNewId = itemId
        newTabs.unshift(datasetWithId)
      })

      if (firstNewId) {
        setActiveTabId(firstNewId)
        setPlayingTabId(firstNewId)
        playRandomVideo()
        // Set current play for the first new tab
        const firstDataset = newTabs.find((t) => t.id === firstNewId)
        if (firstDataset && firstDataset.plays.length > 0) {
          setCurrentPlay(firstDataset.plays[0])
        }
      }

      return newTabs
    })
  }, [activeWatchItems, folders])

  const activateTab = (tabId: string) => {
    setActiveTabId(tabId)
  }

  const playTab = (tabId: string) => {
    setPlayingTabId(tabId)
    playRandomVideo()
  }

  const closeTab = (tabId: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId)
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[0].id)
      }
      return newTabs
    })
  }

  const seekToPlay = (play: PlayData) => {
    console.log("Play selected:", play.playNumber)

    // 1. Ensure the video player knows we are now playing from the Active Grid Tab
    if (activeTabId && activeTabId !== playingTabId) {
      setPlayingTabId(activeTabId)
    }

    // 2. Pick a NEW random video for this clip
    playRandomVideo()

    // 3. Set the play data
    setCurrentPlay(play)
  }

  const activeDataset = tabs.find((t) => t.id === activeTabId) || null
  const playingDataset = tabs.find((t) => t.id === playingTabId) || null

  return (
    <WatchContext.Provider
      value={{
        tabs,
        activeTabId,
        playingTabId,
        activeDataset,
        playingDataset,
        currentPlay,
        videoUrl,
        frameRate,
        activateTab,
        closeTab,
        playTab,
        seekToPlay,
        setVideoUrl,
        visibleModules,
        toggleModule,
      }}
    >
      {children}
    </WatchContext.Provider>
  )
}

export function useWatchContext() {
  const context = useContext(WatchContext)
  if (!context) throw new Error("useWatchContext must be used within WatchProvider")
  return context
}
