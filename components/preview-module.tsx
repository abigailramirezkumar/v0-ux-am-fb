"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { VIDEO_POOL } from "@/lib/mock-datasets"
import { athletes } from "@/lib/athletes-data"
import type { PlayData } from "@/lib/mock-datasets"
import type { Athlete } from "@/types/athlete"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/** Deterministic hash from a string to pick consistent data per play. */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

/** Generate a deterministic video URL for a play. */
function getVideoForPlay(play: PlayData): string {
  const idx = hashString(play.id) % VIDEO_POOL.length
  return VIDEO_POOL[idx]
}

// ---------------------------------------------------------------------------
// Play summary generation
// ---------------------------------------------------------------------------

const PASS_DIRECTIONS = ["short left", "short right", "short middle", "deep left", "deep right", "deep middle"]
const RUN_DIRECTIONS_DESC = ["left end", "left tackle", "left guard", "up the middle", "right guard", "right tackle", "right end"]

function generatePlaySummary(play: PlayData): string {
  const parts: string[] = []

  // Quarter
  parts.push(`Q${play.quarter}`)

  // Down & distance at yardline
  const ordinal = play.down === 1 ? "1st" : play.down === 2 ? "2nd" : play.down === 3 ? "3rd" : "4th"
  // Parse yard line: positive = own territory, negative = opponent territory
  const ylNum = parseInt(play.yardLine.replace(/[+-]/, ""), 10)
  const teamAbbr = play.game.split(" vs ")[0]?.split(" ")[0] || "OWN"
  const oppAbbr = play.game.split(" vs ")[1]?.split(" ")[0] || "OPP"
  const isOwnTerritory = play.yardLine.startsWith("+") || play.yardLine.startsWith("-") === false
  const fieldPos = isOwnTerritory ? `${teamAbbr} ${ylNum}` : `${oppAbbr} ${ylNum}`
  parts.push(`${ordinal} & ${play.distance} at ${fieldPos}`)

  // Play description
  const h = hashString(play.id)
  if (play.playType === "Pass") {
    const dir = PASS_DIRECTIONS[h % PASS_DIRECTIONS.length]
    const gainLossWord = play.gainLoss === "Gn" ? `for ${play.yards} yards` : `loss of ${play.yards}`
    if (play.passResult === "Complete") {
      parts.push(`pass ${dir} ${gainLossWord}`)
    } else if (play.passResult === "Incomplete") {
      parts.push(`pass ${dir} incomplete`)
    } else if (play.passResult === "Sack") {
      parts.push(`sacked ${gainLossWord}`)
    } else if (play.passResult === "Interception") {
      parts.push(`pass ${dir} INTERCEPTED`)
    } else if (play.passResult === "Throwaway") {
      parts.push(`pass thrown away`)
    } else {
      parts.push(`pass ${dir} ${gainLossWord}`)
    }
  } else if (play.playType === "Run") {
    const dir = RUN_DIRECTIONS_DESC[h % RUN_DIRECTIONS_DESC.length]
    const gainLossWord = play.gainLoss === "Gn" ? `for ${play.yards} yards` : `loss of ${play.yards}`
    parts.push(`run ${dir} ${gainLossWord}`)
  } else {
    parts.push(`special teams play for ${play.yards} yards`)
  }

  if (play.isTouchdown) parts.push("TOUCHDOWN")
  if (play.isFirstDown && !play.isTouchdown) parts.push("First Down")
  if (play.isPenalty && play.penaltyType) parts.push(`(Penalty: ${play.penaltyType})`)

  return parts.join(" | ")
}

// ---------------------------------------------------------------------------
// 22-player roster assignment (deterministic per play)
// ---------------------------------------------------------------------------

interface PlayRoster {
  offense: Athlete[]
  defense: Athlete[]
}

const OFFENSE_SLOTS: { position: string; count: number }[] = [
  { position: "QB", count: 1 },
  { position: "RB", count: 1 },
  { position: "WR", count: 3 },
  { position: "TE", count: 1 },
]
// Remaining 5 offensive spots are OL (not in athlete pool, so we generate placeholder names)

const DEFENSE_SLOTS: { position: string; count: number }[] = [
  { position: "DE", count: 2 },
  { position: "DT", count: 1 },
  { position: "LB", count: 2 },
  { position: "CB", count: 2 },
  { position: "S", count: 2 },
]
// Remaining 2 defensive spots are extra DL

const OL_NAMES: Athlete[] = [
  { name: "Penei Sewell", team: "DET", position: "QB" as any, jersey_number: 58, height: "6'5", weight: 331, college: "Oregon", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 0, sacks: 0 } },
  { name: "Tristan Wirfs", team: "TB", position: "QB" as any, jersey_number: 78, height: "6'5", weight: 320, college: "Iowa", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 0, sacks: 0 } },
  { name: "Rashawn Slater", team: "LAC", position: "QB" as any, jersey_number: 70, height: "6'3", weight: 315, college: "Northwestern", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 0, sacks: 0 } },
  { name: "Zack Martin", team: "DAL", position: "QB" as any, jersey_number: 70, height: "6'4", weight: 315, college: "Notre Dame", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 0, sacks: 0 } },
  { name: "Creed Humphrey", team: "KC", position: "QB" as any, jersey_number: 52, height: "6'5", weight: 320, college: "Oklahoma", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 0, sacks: 0 } },
]

const OL_POSITIONS = ["LT", "LG", "C", "RG", "RT"]

const EXTRA_DL: Athlete[] = [
  { name: "Jalen Carter", team: "PHI", position: "DT", jersey_number: 98, height: "6'3", weight: 314, college: "Georgia", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 72, sacks: 7 } },
  { name: "Calijah Kancey", team: "TB", position: "DT", jersey_number: 93, height: "6'1", weight: 281, college: "Pittsburgh", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 54, sacks: 6 } },
]

function assignPlayRoster(play: PlayData): PlayRoster {
  const h = hashString(play.id)

  // Group athletes by position
  const byPosition: Record<string, Athlete[]> = {}
  for (const a of athletes) {
    if (!byPosition[a.position]) byPosition[a.position] = []
    byPosition[a.position].push(a)
  }

  const offense: Athlete[] = []
  let offset = h
  for (const slot of OFFENSE_SLOTS) {
    const pool = byPosition[slot.position] || []
    for (let i = 0; i < slot.count && pool.length > 0; i++) {
      const idx = (offset + i) % pool.length
      offense.push(pool[idx])
      offset += 3
    }
  }

  const defense: Athlete[] = []
  offset = h + 7
  for (const slot of DEFENSE_SLOTS) {
    const pool = byPosition[slot.position] || []
    for (let i = 0; i < slot.count && pool.length > 0; i++) {
      const idx = (offset + i) % pool.length
      defense.push(pool[idx])
      offset += 3
    }
  }

  return { offense, defense }
}

// ---------------------------------------------------------------------------
// YouTube declarations
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// ---------------------------------------------------------------------------
// PreviewVideoPlayer
// ---------------------------------------------------------------------------

function PreviewVideoPlayer({ videoUrl }: { videoUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const playerIdRef = useRef(`preview-player-${Date.now()}`)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    const initPlayer = () => {
      const videoId = extractVideoId(videoUrl)
      if (!videoId) return

      if (playerRef.current && playerRef.current.loadVideoById) {
        playerRef.current.loadVideoById({ videoId, startSeconds: 0 })
        return
      }

      playerRef.current = new window.YT.Player(playerIdRef.current, {
        height: "100%",
        width: "100%",
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          mute: 1,
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true)
            setDuration(event.target.getDuration())
            if (event.target.isMuted()) setIsMuted(true)
            setVolume(event.target.getVolume())
          },
          onStateChange: (event: any) => {
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

  return (
    <div
      ref={containerRef}
      className="w-full aspect-video bg-black flex flex-col relative overflow-hidden group/video rounded-lg"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative flex-1 bg-black">
        <div id={playerIdRef.current} className="h-full w-full" />
        <div className="absolute inset-0 bg-transparent" onClick={togglePlay} />
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 py-2 transition-opacity duration-300 flex flex-col gap-1.5 z-20",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon-sm" onClick={togglePlay} className="text-white hover:bg-white/20 h-7 w-7">
              <Icon name={isPlaying ? "pause" : "play"} className="w-4 h-4 fill-current" />
            </Button>

            <div className="flex items-center gap-1.5 group/vol">
              <Button variant="ghost" size="icon-sm" onClick={toggleMute} className="text-white hover:bg-white/20 h-7 w-7">
                <Icon name={isMuted ? "volumeMute" : "volume"} className="w-4 h-4" />
              </Button>
              <div className="w-0 overflow-hidden group-hover/vol:w-16 transition-all duration-300">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-16"
                />
              </div>
            </div>

            <span className="text-[11px] text-white/90 font-medium tabular-nums ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PreviewModule
// ---------------------------------------------------------------------------

interface PreviewModuleProps {
  play: PlayData
  onClose: () => void
}

export function PreviewModule({ play, onClose }: PreviewModuleProps) {
  const videoUrl = useMemo(() => getVideoForPlay(play), [play])
  const summary = useMemo(() => generatePlaySummary(play), [play])
  const roster = useMemo(() => assignPlayRoster(play), [play])

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Icon name="video" className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Clip Preview</h3>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <Icon name="close" className="w-4 h-4" />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Video Player */}
        <div className="px-4 pt-4">
          <PreviewVideoPlayer videoUrl={videoUrl} />
        </div>

        {/* Play Summary */}
        <div className="px-4 pt-4 pb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Play Summary</h4>
          <p className="text-sm leading-relaxed text-foreground">{summary}</p>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-border/50" />

        {/* Players on the field */}
        <div className="px-4 pt-3 pb-6">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Players on Field</h4>

          {/* Offense */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-foreground mb-2">Offense ({roster.offense.length + 5})</p>
            <div className="flex flex-col gap-1">
              {roster.offense.map((player, i) => (
                <div key={`off-${i}`} className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="w-8 text-center text-xs font-bold text-muted-foreground">#{player.jersey_number}</span>
                  <span className="text-sm text-foreground flex-1">{player.name}</span>
                  <span className="text-xs text-muted-foreground font-medium">{player.position}</span>
                  <span className="text-xs text-muted-foreground">{player.team}</span>
                </div>
              ))}
              {/* OL placeholders */}
              {OL_NAMES.map((player, i) => (
                <div key={`ol-${i}`} className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="w-8 text-center text-xs font-bold text-muted-foreground">#{player.jersey_number}</span>
                  <span className="text-sm text-foreground flex-1">{player.name}</span>
                  <span className="text-xs text-muted-foreground font-medium">{OL_POSITIONS[i]}</span>
                  <span className="text-xs text-muted-foreground">{player.team}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Defense */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Defense ({roster.defense.length + 2})</p>
            <div className="flex flex-col gap-1">
              {roster.defense.map((player, i) => (
                <div key={`def-${i}`} className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="w-8 text-center text-xs font-bold text-muted-foreground">#{player.jersey_number}</span>
                  <span className="text-sm text-foreground flex-1">{player.name}</span>
                  <span className="text-xs text-muted-foreground font-medium">{player.position}</span>
                  <span className="text-xs text-muted-foreground">{player.team}</span>
                </div>
              ))}
              {/* Extra DL */}
              {EXTRA_DL.map((player, i) => (
                <div key={`edl-${i}`} className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="w-8 text-center text-xs font-bold text-muted-foreground">#{player.jersey_number}</span>
                  <span className="text-sm text-foreground flex-1">{player.name}</span>
                  <span className="text-xs text-muted-foreground font-medium">{player.position}</span>
                  <span className="text-xs text-muted-foreground">{player.team}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
