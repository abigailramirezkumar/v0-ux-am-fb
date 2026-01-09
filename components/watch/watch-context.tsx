"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Play } from "@/lib/xchange-parser"

interface WatchContextType {
  plays: Play[]
  currentPlay: Play | null
  videoUrl: string | null
  frameRate: number
  setPlays: (plays: Play[]) => void
  seekToPlay: (play: Play) => void
  setVideoUrl: (url: string) => void
}

const WatchContext = createContext<WatchContextType | undefined>(undefined)

export function WatchProvider({ children }: { children: ReactNode }) {
  const [plays, setPlays] = useState<Play[]>([])
  const [currentPlay, setCurrentPlay] = useState<Play | null>(null)
  // DIRECT DROPBOX LINK (raw=1)
  const [videoUrl, setVideoUrl] = useState<string | null>(
    "https://www.dropbox.com/scl/fi/1gbepmodakercs3hfk8lm/24-2151-01-20-25-INND-K-VS-OHST.mp4?rlkey=xpw4vv50cntr7esu4msh42siy&st=sl735dr2&raw=1",
  )
  const frameRate = 30

  const seekToPlay = (play: Play) => {
    console.log("Seeking to play:", play.playNumber, "Frame:", play.markIn)
    setCurrentPlay(play)
  }

  return (
    <WatchContext.Provider
      value={{
        plays,
        currentPlay,
        videoUrl,
        frameRate,
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
