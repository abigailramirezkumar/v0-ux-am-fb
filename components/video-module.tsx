"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { useWatchContext } from "@/components/watch/watch-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"

function extractVideoId(url: string | null) {
  if (!url) return null
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length === 11 ? match[7] : null
}

function formatTime(seconds: number) {
  if (!seconds) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function VideoModule() {
  const { currentPlay, playingDataset } = useWatchContext()
  const videoUrl = playingDataset?.videoUrl || null

  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Player State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(true) // Start muted for autoplay
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)

  useEffect(() => {
    // Load API Script if not present
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    // Initialize Player when API is ready
    const initPlayer = () => {
      const videoId = extractVideoId(videoUrl)
      if (!videoId) return

      // If player exists, just load new video
      if (playerRef.current && playerRef.current.loadVideoById) {
        playerRef.current.loadVideoById(videoId)
        return
      }

      // Create new player
      playerRef.current = new window.YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0, // Hide default controls
          disablekb: 1, // Disable keyboard controls
          fs: 0, // Hide fullscreen button
          iv_load_policy: 3, // Hide annotations
          modestbranding: 1,
          rel: 0,
          mute: 1, // Start muted
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true)
            setDuration(event.target.getDuration())
            // Sync initial state
            if (event.target.isMuted()) setIsMuted(true)
            setVolume(event.target.getVolume())
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING = 1
            setIsPlaying(event.data === 1)
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
    }

    // Cleanup
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [videoUrl])

  useEffect(() => {
    if (isPlaying && isPlayerReady) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime()
          setCurrentTime(time)
          // Also update duration occasionally in case of loading
          if (duration === 0) setDuration(playerRef.current.getDuration())
        }
      }, 500)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, isPlayerReady, duration])

  useEffect(() => {
    if (currentPlay && playerRef.current && isPlayerReady) {
      playerRef.current.seekTo(currentPlay.startTime, true)
      playerRef.current.playVideo()
    }
  }, [currentPlay, isPlayerReady])

  // --- Controls Handlers ---

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }, [isPlaying])

  const handleSeek = (value: number[]) => {
    if (!playerRef.current) return
    const newTime = value[0]
    setCurrentTime(newTime)
    playerRef.current.seekTo(newTime, true)
  }

  const toggleMute = () => {
    if (!playerRef.current) return
    if (isMuted) {
      playerRef.current.unMute()
      setIsMuted(false)
    } else {
      playerRef.current.mute()
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (!playerRef.current) return
    const newVol = value[0]
    setVolume(newVol)
    playerRef.current.setVolume(newVol)
    if (newVol === 0 && !isMuted) {
      playerRef.current.mute()
      setIsMuted(true)
    } else if (newVol > 0 && isMuted) {
      playerRef.current.unMute()
      setIsMuted(false)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-black flex flex-col relative overflow-hidden group rounded-xl shadow-sm"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {videoUrl ? (
        <>
          <div className="relative flex-1 bg-black">
            {/* We use a unique ID for the player target */}
            <div id="youtube-player" className="h-full w-full" />

            {/* Invisible Overlay to capture clicks for Play/Pause */}
            <div className="absolute inset-0 bg-transparent" onClick={togglePlay} onDoubleClick={toggleFullscreen} />
          </div>

          {/* Info Overlay */}
          <div
            className={cn(
              "absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm pointer-events-none transition-opacity duration-300 backdrop-blur-sm z-10",
              showControls ? "opacity-100" : "opacity-0",
            )}
          >
            {currentPlay ? `Play #${currentPlay.playNumber} | Q${currentPlay.quarter}` : "Full Video"}
          </div>

          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-3 transition-opacity duration-300 flex flex-col gap-2 z-20",
              showControls ? "opacity-100" : "opacity-0",
            )}
          >
            {/* Seek Bar */}
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm" onClick={togglePlay} className="text-white hover:bg-white/20">
                  <Icon name={isPlaying ? "pause" : "play"} className="w-5 h-5 fill-current" />
                </Button>

                <div className="flex items-center gap-2 group/vol">
                  <Button variant="ghost" size="icon-sm" onClick={toggleMute} className="text-white hover:bg-white/20">
                    <Icon name={isMuted ? "volumeMute" : "volume"} className="w-5 h-5" />
                  </Button>
                  <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="w-20"
                    />
                  </div>
                </div>

                <span className="text-xs text-white/90 font-medium tabular-nums ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Icon name={isFullscreen ? "minimize" : "maximize"} className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center gap-6 p-8 bg-zinc-950 text-white">
          <Icon name="video" className="w-12 h-12 mx-auto text-zinc-600" />
          <h3 className="text-xl font-semibold">No Video Source</h3>
        </div>
      )}
    </div>
  )
}
