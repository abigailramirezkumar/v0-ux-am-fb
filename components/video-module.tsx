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

  return (
    <div className="h-full w-full bg-black flex flex-col relative overflow-hidden group rounded-xl shadow-sm">
      {videoUrl ? (
        <>
          <video ref={videoRef} src={videoUrl} className="group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full border-none" controls playsInline />
          {/* Play Overlay Info */}
          <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm pointer-events-none">
            {currentPlay ? `Play #${currentPlay.playNumber} | Q${currentPlay.quarter}` : "Full Video"}
          </div>

          {/* Change Video Input (Hidden by default, shown on hover) */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setVideoUrl("")}>
              Change Video Source
            </Button>
          </div>
        </>
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
    </div>
  )
}
