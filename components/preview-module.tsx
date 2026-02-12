"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { VIDEO_POOL } from "@/lib/mock-datasets"
import { athletes } from "@/lib/athletes-data"
import { useLibraryContext } from "@/lib/library-context"
import { useRouter } from "next/navigation"
import type { PlayData } from "@/lib/mock-datasets"
import type { Athlete } from "@/types/athlete"
import type { ClipData } from "@/types/library"

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

/** Generate a human-readable summary like "Q1 11:25 . 2nd & 6 at BUF 3 . J. Cook run left, gain of 7 yards . Tackled by J. Poyer" */
function generatePlaySummary(play: PlayData): string {
  const parts: string[] = []
  const h = hashString(play.id)

  // Quarter + game clock
  const clockMin = (h % 12) + 1
  const clockSec = h % 60
  parts.push(`Q${play.quarter} ${clockMin}:${clockSec.toString().padStart(2, "0")}`)

  // Down & distance at yardline
  const ordinal = play.down === 1 ? "1st" : play.down === 2 ? "2nd" : play.down === 3 ? "3rd" : "4th"
  const ylNum = parseInt(play.yardLine.replace(/[+-]/, ""), 10)
  const gameParts = play.game.split(" vs ")
  const teamAbbr = gameParts[0]?.split(" ")[0] || "OWN"
  parts.push(`${ordinal} & ${play.distance} at ${teamAbbr} ${ylNum}`)

  // Play description with player name
  const offensePlayers = athletes.filter((a) => ["QB", "RB", "WR", "TE"].includes(a.position))
  const defPlayers = athletes.filter((a) => ["LB", "CB", "S", "DE", "DT"].includes(a.position))
  const primaryPlayer = offensePlayers[h % offensePlayers.length]
  const tackler = defPlayers[(h + 3) % defPlayers.length]
  const pInitial = primaryPlayer.name.split(" ")[0][0]
  const pLast = primaryPlayer.name.split(" ").slice(1).join(" ")
  const tInitial = tackler.name.split(" ")[0][0]
  const tLast = tackler.name.split(" ").slice(1).join(" ")

  if (play.playType === "Pass") {
    const dir = PASS_DIRECTIONS[h % PASS_DIRECTIONS.length]
    if (play.passResult === "Complete") {
      const receiver = offensePlayers[(h + 7) % offensePlayers.length]
      const rInitial = receiver.name.split(" ")[0][0]
      const rLast = receiver.name.split(" ").slice(1).join(" ")
      parts.push(
        `#${primaryPlayer.jersey_number} ${pInitial}. ${pLast} pass ${dir} to #${receiver.jersey_number} ${rInitial}. ${rLast} for ${play.yards} yards`
      )
    } else if (play.passResult === "Incomplete") {
      parts.push(`#${primaryPlayer.jersey_number} ${pInitial}. ${pLast} pass ${dir} incomplete`)
    } else if (play.passResult === "Sack") {
      parts.push(`#${primaryPlayer.jersey_number} ${pInitial}. ${pLast} sacked for loss of ${play.yards}`)
    } else if (play.passResult === "Interception") {
      parts.push(`#${primaryPlayer.jersey_number} ${pInitial}. ${pLast} pass ${dir} INTERCEPTED`)
    } else {
      parts.push(`#${primaryPlayer.jersey_number} ${pInitial}. ${pLast} pass ${dir}`)
    }
  } else if (play.playType === "Run") {
    const dir = RUN_DIRECTIONS_DESC[h % RUN_DIRECTIONS_DESC.length]
    const gainWord = play.gainLoss === "Gn" ? `gain of ${play.yards} yards` : `loss of ${play.yards}`
    parts.push(`#${primaryPlayer.jersey_number} ${pInitial}. ${pLast} run ${dir}, ${gainWord}`)
  } else {
    parts.push(`special teams play for ${play.yards} yards`)
  }

  // Tackled by
  if (play.playType !== "Special Teams" && play.passResult !== "Incomplete" && play.passResult !== "Interception") {
    parts.push(`Tackled by ${tInitial}. ${tLast}`)
  }

  if (play.isTouchdown) parts.push("TOUCHDOWN")

  return parts.join("  \u2022  ")
}

// ---------------------------------------------------------------------------
// Source type + score helpers
// ---------------------------------------------------------------------------

type SourceType = "GAME" | "PRACTICE" | "SCOUT"

function getSourceType(play: PlayData): SourceType {
  const g = play.game.toLowerCase()
  if (g.includes("practice") || g.includes("drill")) return "PRACTICE"
  if (g.includes("scout")) return "SCOUT"
  return "GAME"
}

function getGameScore(play: PlayData): string | null {
  const source = getSourceType(play)
  if (source !== "GAME") return null
  const h = hashString(play.id)
  const gameParts = play.game.split(" vs ")
  const team1 = gameParts[0]?.split(" ")[0] || "HOME"
  const team2 = gameParts[1]?.split(" ")[0] || "AWAY"
  const score1 = 10 + (h % 28)
  const score2 = 3 + ((h + 5) % 31)
  return `${team1} ${score1} - ${score2}`
}

// ---------------------------------------------------------------------------
// 22-player roster assignment (deterministic per play)
// ---------------------------------------------------------------------------

interface PlayerOnField {
  name: string
  position: string
  jersey_number: number
}

interface PlayRoster {
  offense: PlayerOnField[]
  defense: PlayerOnField[]
}

const OL_PLAYERS: PlayerOnField[] = [
  { name: "Penei Sewell", position: "LT", jersey_number: 58 },
  { name: "Quenton Nelson", position: "LG", jersey_number: 56 },
  { name: "Creed Humphrey", position: "C", jersey_number: 52 },
  { name: "Zack Martin", position: "RG", jersey_number: 70 },
  { name: "Tristan Wirfs", position: "RT", jersey_number: 78 },
]

const EXTRA_DL: PlayerOnField[] = [
  { name: "Jalen Carter", position: "DT", jersey_number: 98 },
  { name: "Calijah Kancey", position: "DT", jersey_number: 93 },
]

function assignPlayRoster(play: PlayData): PlayRoster {
  const h = hashString(play.id)

  const byPosition: Record<string, Athlete[]> = {}
  for (const a of athletes) {
    if (!byPosition[a.position]) byPosition[a.position] = []
    byPosition[a.position].push(a)
  }

  const offense: PlayerOnField[] = []

  // QB x1
  const qbs = byPosition["QB"] || []
  if (qbs.length > 0) {
    const qb = qbs[h % qbs.length]
    offense.push({ name: qb.name, position: "QB", jersey_number: qb.jersey_number })
  }

  // RB x1
  const rbs = byPosition["RB"] || []
  if (rbs.length > 0) {
    const rb = rbs[(h + 1) % rbs.length]
    offense.push({ name: rb.name, position: "RB", jersey_number: rb.jersey_number })
  }

  // WR x3
  const wrs = byPosition["WR"] || []
  for (let i = 0; i < 3 && wrs.length > 0; i++) {
    const wr = wrs[(h + 2 + i) % wrs.length]
    offense.push({ name: wr.name, position: "WR", jersey_number: wr.jersey_number })
  }

  // TE x1
  const tes = byPosition["TE"] || []
  if (tes.length > 0) {
    const te = tes[(h + 5) % tes.length]
    offense.push({ name: te.name, position: "TE", jersey_number: te.jersey_number })
  }

  // OL x5
  offense.push(...OL_PLAYERS)

  const defense: PlayerOnField[] = []

  // DE x2
  const des = byPosition["DE"] || []
  for (let i = 0; i < 2 && des.length > 0; i++) {
    const de = des[(h + i) % des.length]
    defense.push({ name: de.name, position: "DE", jersey_number: de.jersey_number })
  }

  // DT x1
  const dts = byPosition["DT"] || []
  if (dts.length > 0) {
    const dt = dts[h % dts.length]
    defense.push({ name: dt.name, position: "DT", jersey_number: dt.jersey_number })
  }

  // LB x2
  const lbs = byPosition["LB"] || []
  for (let i = 0; i < 2 && lbs.length > 0; i++) {
    const lb = lbs[(h + i) % lbs.length]
    defense.push({ name: lb.name, position: "LB", jersey_number: lb.jersey_number })
  }

  // CB x2
  const cbs = byPosition["CB"] || []
  for (let i = 0; i < 2 && cbs.length > 0; i++) {
    const cb = cbs[(h + i) % cbs.length]
    defense.push({ name: cb.name, position: "CB", jersey_number: cb.jersey_number })
  }

  // S x2
  const ss = byPosition["S"] || []
  for (let i = 0; i < 2 && ss.length > 0; i++) {
    const s = ss[(h + i) % ss.length]
    defense.push({ name: s.name, position: "S", jersey_number: s.jersey_number })
  }

  // Extra DL to reach 11
  defense.push(...EXTRA_DL)

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
// Camera Angle Menu
// ---------------------------------------------------------------------------

const CAMERA_ANGLES = ["Sideline", "Endzone", "Wide Endzone", "TV", "Scoreboard"] as const

function AngleMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-foreground hover:bg-background/95 transition-colors"
        >
          <Icon name="record" className="w-3.5 h-3.5" />
          <span>{CAMERA_ANGLES.length}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-44 p-1"
        side="top"
        align="start"
      >
        <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">Camera Angles</div>
        {CAMERA_ANGLES.map((angle) => (
          <button
            key={angle}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted text-left"
          >
            <Icon name="record" className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{angle}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// PreviewVideoPlayer
// ---------------------------------------------------------------------------

function PreviewVideoPlayer({
  videoUrl,
  sourceType,
  score,
  onOpenClip,
}: {
  videoUrl: string
  sourceType: SourceType
  score: string | null
  onOpenClip: () => void
}) {
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
      className="w-full aspect-video bg-black flex flex-col relative overflow-hidden rounded-lg"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative flex-1 bg-black">
        <div id={playerIdRef.current} className="h-full w-full" />
        <div className="absolute inset-0 bg-transparent" onClick={togglePlay} />
      </div>

      {/* Persistent overlays (always visible) */}
      {/* Top left: Source type badge */}
      <div className="absolute top-2 left-2 z-30">
        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-foreground/80 text-background">
          {sourceType}
        </span>
      </div>

      {/* Top right: Score */}
      {score && (
        <div className="absolute top-2 right-2 z-30">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold tabular-nums bg-foreground/80 text-background">
            {score}
          </span>
        </div>
      )}

      {/* Bottom left: Angle switcher */}
      <div className="absolute bottom-2 left-2 z-30">
        <AngleMenu />
      </div>

      {/* Bottom right: Open Clip button */}
      <div className="absolute bottom-2 right-2 z-30">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpenClip()
          }}
          className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Icon name="share" className="w-3 h-3" />
          Open Clip
        </button>
      </div>

      {/* Hover controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 py-2 transition-opacity duration-300 flex flex-col gap-1.5 z-20",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none",
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
// Player Chip
// ---------------------------------------------------------------------------

function PlayerChip({ player }: { player: PlayerOnField }) {
  const nameParts = player.name.split(" ")
  const firstInitial = nameParts[0][0]
  const lastName = nameParts.slice(1).join(" ")

  return (
    <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-2 py-1 text-xs whitespace-nowrap">
      <span className="font-bold text-foreground">
        {firstInitial}. {lastName}
      </span>
      <span className="text-muted-foreground">
        {player.position} #{player.jersey_number}
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Convert PlayData to ClipData
// ---------------------------------------------------------------------------

function playToClip(play: PlayData): ClipData {
  return {
    id: play.id,
    playNumber: play.playNumber,
    odk: play.odk,
    quarter: play.quarter,
    down: play.down,
    distance: play.distance,
    yardLine: play.yardLine,
    hash: play.hash,
    yards: play.yards,
    result: play.result,
    gainLoss: play.gainLoss,
    defFront: play.defFront,
    defStr: play.defStr,
    coverage: play.coverage,
    blitz: play.blitz,
    game: play.game,
    playType: play.playType,
    passResult: play.passResult,
    runDirection: play.runDirection,
    personnelO: play.personnelO,
    personnelD: play.personnelD,
    isTouchdown: play.isTouchdown,
    isFirstDown: play.isFirstDown,
    isPenalty: play.isPenalty,
    penaltyType: play.penaltyType,
  }
}

// ---------------------------------------------------------------------------
// Format game label for header
// ---------------------------------------------------------------------------

function formatGameLabel(game: string): string {
  // e.g. "BUF vs LA 01.01.26" -> "01.01.26 BUF @ LA"
  const parts = game.split(" vs ")
  if (parts.length === 2) {
    const team1 = parts[0].trim()
    const team2Parts = parts[1].trim().split(" ")
    if (team2Parts.length >= 2) {
      const team2 = team2Parts[0]
      const date = team2Parts.slice(1).join(" ")
      return `${date} ${team1} @ ${team2}`
    }
    return game
  }
  return game
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
  const sourceType = useMemo(() => getSourceType(play), [play])
  const score = useMemo(() => getGameScore(play), [play])

  const { setPendingPreviewClips, setWatchItem } = useLibraryContext()
  const router = useRouter()

  // "Open Clip" -- open as unsaved playlist in watch page
  const handleOpenClip = useCallback(() => {
    const clip = playToClip(play)
    setPendingPreviewClips([clip])
    router.push("/watch")
  }, [play, setPendingPreviewClips, router])

  // "View Full Game" -- open the Library Item the clip references
  const handleViewFullGame = useCallback(() => {
    // Identify a library item by matching the game string
    // For now we use a hash of the game name as a deterministic item id
    setWatchItem(null)
    router.push("/watch")
  }, [setWatchItem, router])

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden relative">
      {/* Fixed Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="play" className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-bold truncate">Clip {play.playNumber}</span>
          <span className="text-muted-foreground text-sm shrink-0">|</span>
          <span className="text-sm text-muted-foreground truncate">{formatGameLabel(play.game)}</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
        >
          <Icon name="close" className="w-4 h-4" />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Video Player */}
        <div className="px-4 pt-4">
          <PreviewVideoPlayer
            videoUrl={videoUrl}
            sourceType={sourceType}
            score={score}
            onOpenClip={handleOpenClip}
          />
        </div>

        {/* Play Summary */}
        <div className="px-4 pt-5 pb-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Play Summary</h4>
          <p className="text-sm leading-relaxed text-foreground">{summary}</p>
        </div>

        {/* Offense on the field */}
        <div className="px-4 pt-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Offense on the Field</h4>
          <div className="flex flex-wrap gap-1.5">
            {roster.offense.map((player, i) => (
              <PlayerChip key={`off-${i}`} player={player} />
            ))}
          </div>
        </div>

        {/* Defense on the field */}
        <div className="px-4 pt-5 pb-6">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Defense on the Field</h4>
          <div className="flex flex-wrap gap-1.5">
            {roster.defense.map((player, i) => (
              <PlayerChip key={`def-${i}`} player={player} />
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border/50 px-4 py-3 flex items-center gap-2 shrink-0">
        <AddToPlaylistButton play={play} />
        <Button
          variant="outline"
          className="flex-1 font-semibold"
          onClick={handleViewFullGame}
        >
          View Full Game
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add to Playlist button (for preview footer)
// ---------------------------------------------------------------------------

function AddToPlaylistButton({ play }: { play: PlayData }) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { folders, rootItems, recentPlaylists, addToPlaylist, mediaItems, addClipsToPlaylist, openCreatePlaylistModal, setWatchItem } = useLibraryContext()
  const { toast } = useToast()
  const router = useRouter()

  const allPlaylists = useMemo(() => {
    const playlists: Array<{ id: string; name: string; folderId: string | null }> = []
    rootItems.forEach((item) => {
      if (item.type === "playlist") {
        playlists.push({ id: item.id, name: item.name, folderId: null })
      }
    })
    const findPlaylists = (nodes: any[], _parentId: string | null) => {
      nodes.forEach((node) => {
        if (node.items) {
          node.items.forEach((item: any) => {
            if (item.type === "playlist") {
              playlists.push({ id: item.id, name: item.name, folderId: node.id })
            }
          })
        }
        if (node.children) {
          findPlaylists(node.children, node.id)
        }
      })
    }
    findPlaylists(folders, null)
    mediaItems.forEach((mi) => {
      if (mi.type === "playlist" && !playlists.some((p) => p.id === mi.id)) {
        playlists.push({ id: mi.id, name: mi.name, folderId: mi.parentId })
      }
    })
    return playlists
  }, [folders, rootItems, mediaItems])

  const filteredPlaylists = useMemo(() => {
    if (!searchQuery.trim()) return allPlaylists
    const query = searchQuery.toLowerCase()
    return allPlaylists.filter((p) => p.name.toLowerCase().includes(query))
  }, [allPlaylists, searchQuery])

  const handleAddToPlaylist = (playlistId: string) => {
    const clip = playToClip(play)
    addClipsToPlaylist(playlistId, [clip])
    addToPlaylist(playlistId, [clip.id])

    toast({
      description: "1 clip added to playlist.",
      action: (
        <ToastAction
          altText="View Playlist"
          onClick={() => {
            setWatchItem(playlistId)
            router.push("/watch")
          }}
          className="h-7 px-2 text-xs"
        >
          View Playlist
        </ToastAction>
      ),
    })

    setOpen(false)
    setSearchQuery("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="flex-1 font-semibold">
          Add to Playlist
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start" side="top">
        <div className="p-3 border-b border-border">
          <input
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 px-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="max-h-64 overflow-y-auto">
          {recentPlaylists.length > 0 && !searchQuery && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">Recent</div>
              {recentPlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted text-left"
                >
                  <Icon name="playlist" className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{playlist.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="p-2">
            {!searchQuery && recentPlaylists.length > 0 && (
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">All Playlists</div>
            )}
            {filteredPlaylists.length > 0 ? (
              filteredPlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted text-left"
                >
                  <Icon name="playlist" className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{playlist.name}</span>
                </button>
              ))
            ) : (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                {searchQuery ? "No playlists found" : "No playlists available"}
              </div>
            )}
          </div>
        </div>

        <div className="p-2 border-t border-border">
          <button
            onClick={() => {
              const clip = playToClip(play)
              setOpen(false)
              setSearchQuery("")
              openCreatePlaylistModal(undefined, [clip])
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted text-left text-primary"
          >
            <Icon name="add" className="w-4 h-4" />
            <span>Create New Playlist</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Import toast
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
