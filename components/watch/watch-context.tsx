"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useLibraryContext } from "@/lib/library-context"
import { getDatasetForItem, type PlayData, type Dataset } from "@/lib/mock-datasets"

interface WatchContextType {
  // Tab State
  tabs: Dataset[]
  activeTabId: string | null // What data we are looking at
  playingTabId: string | null // What video is playing

  // Derived Data
  activeDataset: Dataset | null
  playingDataset: Dataset | null
  currentPlay: PlayData | null

  // Actions
  activateTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  playTab: (tabId: string) => void
  seekToPlay: (play: PlayData) => void
}

const WatchContext = createContext<WatchContextType | undefined>(undefined)

export function WatchProvider({ children }: { children: ReactNode }) {
  const { activeWatchItemId } = useLibraryContext()

  const [tabs, setTabs] = useState<Dataset[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [playingTabId, setPlayingTabId] = useState<string | null>(null)
  const [currentPlay, setCurrentPlay] = useState<PlayData | null>(null)

  useEffect(() => {
    if (!activeWatchItemId) return

    setTabs((prevTabs) => {
      const newDataset = getDatasetForItem(activeWatchItemId)

      // Check if already open by video URL
      const isAlreadyOpen = prevTabs.some((t) => t.videoUrl === newDataset.videoUrl)

      if (isAlreadyOpen) {
        // Just switch to it
        const target = prevTabs.find((t) => t.videoUrl === newDataset.videoUrl)
        if (target) setActiveTabId(target.id)
        return prevTabs
      }

      // Add to front with consistent ID
      const datasetWithId = { ...newDataset, id: activeWatchItemId }

      setActiveTabId(datasetWithId.id)

      // If this is the first tab, play it too
      if (prevTabs.length === 0) {
        setPlayingTabId(datasetWithId.id)
        if (datasetWithId.plays.length > 0) setCurrentPlay(datasetWithId.plays[0])
      }

      return [datasetWithId, ...prevTabs]
    })
  }, [activeWatchItemId])

  const activateTab = (tabId: string) => {
    setActiveTabId(tabId)
  }

  const playTab = (tabId: string) => {
    setPlayingTabId(tabId)
  }

  const closeTab = (tabId: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId)
      // If we closed the active tab, switch to the first one available
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[0].id)
      }
      // If we closed the playing tab, switch playback to active or first available
      if (playingTabId === tabId && newTabs.length > 0) {
        setPlayingTabId(activeTabId !== tabId ? activeTabId : newTabs[0].id)
      }
      return newTabs
    })
  }

  const seekToPlay = (play: PlayData) => {
    // When a user clicks a play, we MUST ensure the video player switches to this tab
    if (activeTabId && activeTabId !== playingTabId) {
      setPlayingTabId(activeTabId)
    }
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
        activateTab,
        closeTab,
        playTab,
        seekToPlay,
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
