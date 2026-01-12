"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useWatchContext } from "@/components/watch/watch-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icon } from "@/components/icon"

export function VideoModule() {
  const { currentPlay, videoUrl, setVideoUrl, frameRate } = useWatchContext()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [inputValue, setInputValue] = useState("")

  // Sync Video to Play
  useEffect(() => {
    if (currentPlay && videoRef.current) {
      // Convert frames to seconds
      const timeInSeconds = currentPlay.markIn / frameRate
      videoRef.current.currentTime = timeInSeconds
      videoRef.current.play().catch((e) => console.log("Auto-play blocked", e))
    }
  }, [currentPlay, frameRate])

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue) setVideoUrl(inputValue)
  }

  const getEmbedUrl = () => {
    if (!videoUrl) return ""

    // If it's already an embed URL, append params
    const url = videoUrl
    const separator = url.includes("?") ? "&" : "?"

    // Autoplay + Start time
    const startTime = currentPlay?.startTime || 0

    // Params explanation:
    // autoplay=1: Start playing immediately
    // start={time}: Seek to specific second
    // controls=0: Hide bottom player controls (playbar, volume, etc)
    // mute=1: Start muted (required for many browsers to allow autoplay)
    // modestbranding=1: Remove YouTube logo from control bar
    // rel=0: Show related videos from same channel only (or none)
    // showinfo=0: Deprecated but sometimes hides title
    // iv_load_policy=3: Hide annotations
    // fs=0: Disable fullscreen button
    // disablekb=1: Disable keyboard shortcuts to prevent interfering with app

    const params = [
      "autoplay=1",
      `start=${startTime}`,
      "controls=0",
      "mute=1",
      "modestbranding=1",
      "rel=0",
      "showinfo=0",
      "iv_load_policy=3",
      "fs=0",
      "disablekb=1",
    ].join("&")

    return `${url}${separator}${params}`
  }

  return (
    <div className="h-full w-full bg-black flex flex-col relative overflow-hidden group rounded-xl shadow-sm">
      {videoUrl ? (
        <div className="relative w-full h-full">
          <iframe
            key={currentPlay?.id} // Force re-render on play change to ensure seek works reliably
            src={getEmbedUrl()}
            className="h-full w-full border-none pointer-events-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center gap-6 p-8 bg-zinc-950 text-white">
          <div className="text-center space-y-2">
            <Icon name="video" className="w-12 h-12 mx-auto text-zinc-600" />
            <h3 className="text-xl font-semibold">Load Video</h3>
          </div>
          <form onSubmit={handleUrlSubmit} className="flex gap-2 w-full max-w-sm">
            <Input
              placeholder="Paste video URL..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-zinc-600"
            />
            <Button type="submit" variant="secondary">
              Load
            </Button>
          </form>
        </div>
      )}

      {currentPlay && (
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm pointer-events-none backdrop-blur-sm z-10">
          Play #{currentPlay.playNumber} | Q{currentPlay.quarter} | {currentPlay.game}
        </div>
      )}
    </div>
  )
}
