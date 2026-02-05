"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useLibraryContext } from "@/lib/library-context"
import { getDatasetForItem, getRandomVideoUrl, type PlayData } from "@/lib/mock-datasets"

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
  const { activeWatchItemId, activeWatchItems, folders, rootItems, getMediaItem } = useLibraryContext()

  // Stable refs so useEffects don't re-fire when these change
  const foldersRef = useRef(folders)
  foldersRef.current = folders
  const rootItemsRef = useRef(rootItems)
  rootItemsRef.current = rootItems
  const getMediaItemRef = useRef(getMediaItem)
  getMediaItemRef.current = getMediaItem

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

    // Check if already open — if so, just switch the active tab
    setTabs((prevTabs) => {
      const existing = prevTabs.find((t) => t.id === activeWatchItemId)
      if (existing) {
        // Defer the tab switch to avoid calling setState inside setState
        queueMicrotask(() => setActiveTabId(existing.id))
        return prevTabs
      }
      return prevTabs
    })

    // Build the new tab outside of setTabs to avoid nested setState calls
    const folderItem = findItemById(foldersRef.current, activeWatchItemId)
    const rootItem = !folderItem ? rootItemsRef.current.find((i) => i.id === activeWatchItemId) : null
    const item = folderItem || rootItem || null
    const mediaItem = !item ? getMediaItemRef.current(activeWatchItemId) : null

    const isPlaylist = (item && item.type === "playlist") || (mediaItem && mediaItem.type === "playlist")
    let datasetWithId: Dataset

    if (isPlaylist) {
      const existingClips: PlayData[] = mediaItem
        ? mediaItem.clips.map((clip, idx) => ({
            id: clip.id,
            playNumber: clip.playNumber ?? idx + 1,
            odk: clip.odk ?? "O",
            quarter: clip.quarter ?? 1,
            down: clip.down ?? 1,
            distance: clip.distance ?? 10,
            yardLine: clip.yardLine ?? "",
            hash: clip.hash ?? "M",
            yards: clip.yards ?? 0,
            result: clip.result ?? "",
            gainLoss: clip.gainLoss ?? "Gn",
            defFront: clip.defFront ?? "",
            defStr: clip.defStr ?? "",
            coverage: clip.coverage ?? "",
            blitz: clip.blitz ?? "",
            game: clip.game ?? "",
            playType: clip.playType ?? "Pass",
            passResult: clip.passResult,
            runDirection: clip.runDirection,
            personnelO: clip.personnelO ?? "11",
            personnelD: clip.personnelD ?? "Base",
            isTouchdown: clip.isTouchdown ?? false,
            isFirstDown: clip.isFirstDown ?? false,
            isPenalty: clip.isPenalty ?? false,
            penaltyType: clip.penaltyType,
          }))
        : []

      datasetWithId = {
        id: activeWatchItemId,
        name: mediaItem?.name || item?.name || "Untitled Playlist",
        plays: existingClips,
      }

      if (existingClips.length === 0) {
        setVideoUrl(null)
        setCurrentPlay(null)
      } else {
        playRandomVideo()
        setCurrentPlay(existingClips[0])
      }
    } else {
      const newDataset = getDatasetForItem(activeWatchItemId)
      datasetWithId = {
        ...newDataset,
        id: activeWatchItemId,
        name: item?.name || newDataset.name,
      }
      playRandomVideo()
      if (datasetWithId.plays.length > 0) {
        setCurrentPlay(datasetWithId.plays[0])
      }
    }

    // Now add the tab (only if not already present)
    setTabs((prevTabs) => {
      if (prevTabs.some((t) => t.id === activeWatchItemId)) return prevTabs
      return [datasetWithId, ...prevTabs]
    })

    // Set active / playing tab
    setActiveTabId(datasetWithId.id)
    setPlayingTabId(datasetWithId.id)
  }, [activeWatchItemId])

  useEffect(() => {
    if (!activeWatchItems || activeWatchItems.length === 0) return

    // Build all new datasets outside of setTabs
    const newDatasets: Dataset[] = []
    let firstNewId: string | null = null
    let firstNewIsPlaylist = false

    activeWatchItems.forEach((itemId) => {
      const folderItem = findItemById(foldersRef.current, itemId)
      const rootItem = !folderItem ? rootItemsRef.current.find((i) => i.id === itemId) : null
      const item = folderItem || rootItem || null
      const mediaItem = !item ? getMediaItemRef.current(itemId) : null
      const isPlaylist = (item && item.type === "playlist") || (mediaItem && mediaItem.type === "playlist")

      let datasetWithId: Dataset

      if (isPlaylist) {
        datasetWithId = {
          id: itemId,
          name: mediaItem?.name || item?.name || "Untitled Playlist",
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
      newDatasets.push(datasetWithId)
    })

    // Add new tabs (skip any that already exist)
    setTabs((prevTabs) => {
      const combined = [...prevTabs]
      for (const ds of newDatasets) {
        if (!combined.some((t) => t.id === ds.id)) {
          combined.unshift(ds)
        }
      }
      return combined
    })

    // Set active/playing and playback state OUTSIDE setTabs
    if (firstNewId) {
      setActiveTabId(firstNewId)
      setPlayingTabId(firstNewId)

      if (firstNewIsPlaylist) {
        setVideoUrl(null)
        setCurrentPlay(null)
      } else {
        playRandomVideo()
        const firstDataset = newDatasets.find((t) => t.id === firstNewId)
        if (firstDataset && firstDataset.plays.length > 0) {
          setCurrentPlay(firstDataset.plays[0])
        }
      }
    }
  }, [activeWatchItems])

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
