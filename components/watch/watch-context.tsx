"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useLibraryContext } from "@/lib/library-context"
import { getDatasetForItem, type PlayData } from "@/lib/mock-datasets"

interface WatchContextType {
  plays: PlayData[]
  currentPlay: PlayData | null
  videoUrl: string | null
  setPlays: (plays: PlayData[]) => void
  seekToPlay: (play: PlayData) => void
  setVideoUrl: (url: string) => void
}

const WatchContext = createContext<WatchContextType | undefined>(undefined)

export function WatchProvider({ children }: { children: ReactNode }) {
  const { activeWatchItemId } = useLibraryContext()

  const [plays, setPlays] = useState<PlayData[]>([])
  const [currentPlay, setCurrentPlay] = useState<PlayData | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    const dataset = getDatasetForItem(activeWatchItemId)
    setPlays(dataset.plays)
    setVideoUrl(dataset.videoUrl)

    if (dataset.plays.length > 0) {
      setCurrentPlay(dataset.plays[0])
    }
  }, [activeWatchItemId])

  const seekToPlay = (play: PlayData) => {
    console.log("Seeking to play:", play.playNumber)
    setCurrentPlay(play)
  }

  return (
    <WatchContext.Provider
      value={{
        plays,
        currentPlay,
        videoUrl,
        setPlays,
        seekToPlay,
        setVideoUrl,
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
