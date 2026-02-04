"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useLibraryContext } from "@/lib/library-context"
import { getDatasetForItem, getRandomVideoUrl, findPlaysByIds, type PlayData } from "@/lib/mock-datasets"

import { useRouter } from "next/navigation"

// Extended Dataset type to support unsaved playlists
export interface Dataset {
  id: string
  name: string
  plays: PlayData[]
  isUnsaved?: boolean
}
import type { FolderData } from "@/components/folder"
import type { LibraryItemData } from "@/components/library-item"

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

  // Selection State
  selectedPlayIds: Set<string>
  togglePlaySelection: (playId: string) => void
  selectAllPlays: () => void
  clearPlaySelection: () => void

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

function findItemById(folders: FolderData[], itemId: string): LibraryItemData | null {
  for (const folder of folders) {
    // Check items in this folder
    if (folder.items) {
      const foundItem = folder.items.find((i) => i.id === itemId)
      if (foundItem) return foundItem
    }
    // Check children folders
    if (folder.children) {
      const foundInChild = findItemById(folder.children, itemId)
      if (foundInChild) return foundInChild
    }
  }
  return null
}

export function WatchProvider({ 
  children,
  initialTabs = [] 
}: { 
  children: ReactNode
  initialTabs?: Dataset[] 
}) {
  const router = useRouter()
  const { activeWatchItemId, activeWatchItems, folders } = useLibraryContext()

  // Initialize with provided tabs if any
  const [tabs, setTabs] = useState<Dataset[]>(initialTabs)
  
  // Set initial active/playing tab if initialTabs exist
  const [activeTabId, setActiveTabId] = useState<string | null>(
    initialTabs.length > 0 ? initialTabs[0].id : null
  )
  const [playingTabId, setPlayingTabId] = useState<string | null>(
    initialTabs.length > 0 ? initialTabs[0].id : null
  )
  const [currentPlay, setCurrentPlay] = useState<PlayData | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const frameRate = 30

  // Selection state
  const [selectedPlayIds, setSelectedPlayIds] = useState<Set<string>>(new Set())

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

      // 2. New Tab Logic - Check if it's a playlist
      const item = findItemById(folders, activeWatchItemId)
      let datasetWithId: Dataset

      if (item && item.type === "playlist") {
        // Hydrate playlist by converting stored IDs into playable video objects
        const clipIds = item.clipIds || []
        const hydratedPlays = findPlaysByIds(clipIds)
        
        datasetWithId = {
          id: activeWatchItemId,
          name: item.name,
          plays: hydratedPlays,
        }
        
        // Stop playback if playlist is empty, otherwise play first clip
        if (hydratedPlays.length === 0) {
          setVideoUrl(null)
          setCurrentPlay(null)
        } else {
          playRandomVideo()
          setCurrentPlay(hydratedPlays[0])
        }
      } else {
        // Use Mock data for games/other videos
        const newDataset = getDatasetForItem(activeWatchItemId)
        datasetWithId = {
          ...newDataset,
          id: activeWatchItemId,
          name: item?.name || newDataset.name, // Use real name or fallback to mock name
        }
        // Pick a random video to start
        playRandomVideo()
        // Set first play as current
        if (datasetWithId.plays.length > 0) {
          setCurrentPlay(datasetWithId.plays[0])
        }
      }

      // Make it active in Grid
      setActiveTabId(datasetWithId.id)

      // Also make it the Playing Tab (Auto-play behavior for new items)
      setPlayingTabId(datasetWithId.id)

      return [datasetWithId, ...prevTabs]
    })
  }, [activeWatchItemId, folders])

  useEffect(() => {
    if (!activeWatchItems || activeWatchItems.length === 0) return

    setTabs((prevTabs) => {
      const newTabs = [...prevTabs]
      let firstNewId: string | null = null
      let firstNewIsPlaylist = false

      activeWatchItems.forEach((itemId) => {
        // Check if already exists
        if (newTabs.some((t) => t.id === itemId)) return

        const item = findItemById(folders, itemId)
        let datasetWithId: Dataset

        if (item && item.type === "playlist") {
          // Hydrate playlist by converting stored IDs into playable video objects
          const clipIds = item.clipIds || []
          const hydratedPlays = findPlaysByIds(clipIds)
          
          datasetWithId = {
            id: itemId,
            name: item.name,
            plays: hydratedPlays,
          }
          if (!firstNewId) firstNewIsPlaylist = hydratedPlays.length === 0
        } else {
          const newDataset = getDatasetForItem(itemId)
          datasetWithId = {
            ...newDataset,
            id: itemId,
            name: item?.name || newDataset.name,
          }
        }

        if (!firstNewId) firstNewId = itemId
        newTabs.unshift(datasetWithId)
      })

      if (firstNewId) {
        setActiveTabId(firstNewId)
        setPlayingTabId(firstNewId)
        
        if (firstNewIsPlaylist) {
          setVideoUrl(null)
          setCurrentPlay(null)
        } else {
          playRandomVideo()
          // Set current play for the first new tab
          const firstDataset = newTabs.find((t) => t.id === firstNewId)
          if (firstDataset && firstDataset.plays.length > 0) {
            setCurrentPlay(firstDataset.plays[0])
          }
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

  // Selection handlers
  const togglePlaySelection = (playId: string) => {
    setSelectedPlayIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(playId)) {
        newSet.delete(playId)
      } else {
        newSet.add(playId)
      }
      return newSet
    })
  }

  const selectAllPlays = () => {
    if (activeDataset) {
      setSelectedPlayIds(new Set(activeDataset.plays.map((p) => p.id)))
    }
  }

  const clearPlaySelection = () => {
    setSelectedPlayIds(new Set())
  }

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
        selectedPlayIds,
        togglePlaySelection,
        selectAllPlays,
        clearPlaySelection,
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
