"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useLibraryContext } from "@/lib/library-context"
import { getDatasetForItem, getRandomVideoUrl, type PlayData } from "@/lib/mock-datasets"
import type { Clip } from "@/lib/mock-clips"
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

  // Actions
  activateTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  playTab: (tabId: string) => void
  seekToPlay: (play: PlayData) => void
  setVideoUrl: (url: string) => void
  playUnsavedPlaylist: (clips: Clip[]) => void
  resetWatchState: () => void

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

export function WatchProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { activeWatchItemId, activeWatchItems, folders, setWatchItem, setWatchItems } = useLibraryContext()

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

      // 2. New Tab Logic - Check if it's a playlist
      const item = findItemById(folders, activeWatchItemId)
      let datasetWithId: Dataset

      if (item && item.type === "playlist") {
        // Initialize EMPTY dataset for playlists
        datasetWithId = {
          id: activeWatchItemId,
          name: item.name,
          plays: [], // Empty by default for new playlists
        }
        // Stop playback for empty playlist
        setVideoUrl(null)
        setCurrentPlay(null)
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
          datasetWithId = {
            id: itemId,
            name: item.name,
            plays: [],
          }
          if (!firstNewId) firstNewIsPlaylist = true
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
    // 1. Ensure the video player knows we are now playing from the Active Grid Tab
    if (activeTabId && activeTabId !== playingTabId) {
      setPlayingTabId(activeTabId)
    }

    // 2. Check if the play has its own videoUrl (from Explore clips), otherwise use random
    if (play.videoUrl) {
      setVideoUrl(play.videoUrl)
    } else {
      playRandomVideo()
    }

    // 3. Set the play data
    setCurrentPlay(play)
  }

  const resetWatchState = useCallback(() => {
    setTabs([])
    setActiveTabId(null)
    setPlayingTabId(null)
    setCurrentPlay(null)
    setVideoUrl(null)
    setVisibleModules({
      library: true,
      video: true,
      grid: true,
    })
  }, [])

  const playUnsavedPlaylist = (clips: Clip[]) => {
    // Clear any active Library item selection to prevent race conditions
    setWatchItem(null)
    setWatchItems([])
    
    // 1. Convert Clips to Plays
    const unsavedPlays: PlayData[] = clips.map((clip, index) => ({
      id: clip.id,
      playNumber: index + 1,
      description: `${clip.matchup} - Q${clip.quarter}`,
      startTime: 0,
      duration: 10,
      videoUrl: clip.videoUrl,
      thumbnailUrl: clip.thumbnailUrl,
      status: "live" as const,
      odk: "O",
      quarter: clip.quarter,
      down: clip.down,
      distance: clip.distance,
      yardLine: clip.yardLine,
      hash: clip.hash,
      yards: clip.gain,
      result: clip.passing?.result || (clip.rushing ? "Rush" : "-"),
      gainLoss: clip.gain >= 0 ? "Gn" : "Ls",
      defFront: "4-3",
      defStr: "R",
      coverage: "C3",
      blitz: "N",
      game: clip.matchup,
    }))

    // 2. Create Unsaved Dataset
    const unsavedDataset: Dataset = {
      id: "unsaved-playlist",
      name: "Unsaved Playlist",
      plays: unsavedPlays,
      isUnsaved: true,
    }

    // 3. Update State
    setTabs((prev) => {
      // Remove existing unsaved tab if present to avoid dupes
      const clean = prev.filter((t) => t.id !== "unsaved-playlist")
      return [unsavedDataset, ...clean]
    })
    setActiveTabId("unsaved-playlist")
    setPlayingTabId("unsaved-playlist")
    if (unsavedPlays.length > 0) {
      setCurrentPlay(unsavedPlays[0])
      setVideoUrl(unsavedPlays[0].videoUrl)
    }

    // 4. Navigate
    router.push("/watch")
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
        playUnsavedPlaylist,
        resetWatchState,
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
