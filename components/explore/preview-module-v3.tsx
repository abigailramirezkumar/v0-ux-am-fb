"use client"

/**
 * PreviewModuleV3 - Simplified Preview Module (No Internal Navigation)
 * 
 * This version removes all internal navigation capabilities:
 * - No clickable elements to navigate to other entities
 * - No hover states on previously clickable items
 * - Only the footer action buttons and video players are interactive
 * - Users must use the list views on the explore page to change what's previewed
 */

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Icon } from "@/components/icon"
import { TeamLogo } from "@/components/team-logo"
import { cn } from "@/lib/utils"
import { VIDEO_POOL } from "@/lib/mock-datasets"
import { athletes, getAthleteByName } from "@/lib/athletes-data"
import { useRouter } from "next/navigation"
import type { PlayData } from "@/lib/mock-datasets"
import type { Athlete } from "@/types/athlete"
import type { ClipData, MediaItemData } from "@/types/library"
import type { Game } from "@/types/game"
import { findTeamById, mockClips } from "@/lib/games-context"
import { mockGames } from "@/lib/mock-games"
import { getAthletesForTeam } from "@/lib/mock-teams"
import type { Team } from "@/lib/sports-data"

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

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

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
  const h = hashString(play.id)

  const clockMin = (h % 12) + 1
  const clockSec = h % 60
  parts.push(`Q${play.quarter} ${clockMin}:${clockSec.toString().padStart(2, "0")}`)

  const ordinal = play.down === 1 ? "1st" : play.down === 2 ? "2nd" : play.down === 3 ? "3rd" : "4th"
  const gameParts = play.game.split(" vs ")
  const teamAbbr = gameParts[0]?.split(" ")[0] || "OWN"
  parts.push(`${ordinal} & ${play.distance} at ${teamAbbr} ${play.yardLineNumeric}`)

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
// 22-player roster assignment
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
  const qbs = byPosition["QB"] || []
  if (qbs.length > 0) {
    const qb = qbs[h % qbs.length]
    offense.push({ name: qb.name, position: "QB", jersey_number: qb.jersey_number })
  }
  const rbs = byPosition["RB"] || []
  if (rbs.length > 0) {
    const rb = rbs[(h + 1) % rbs.length]
    offense.push({ name: rb.name, position: "RB", jersey_number: rb.jersey_number })
  }
  const wrs = byPosition["WR"] || []
  for (let i = 0; i < 3 && wrs.length > 0; i++) {
    const wr = wrs[(h + 2 + i) % wrs.length]
    offense.push({ name: wr.name, position: "WR", jersey_number: wr.jersey_number })
  }
  const tes = byPosition["TE"] || []
  if (tes.length > 0) {
    const te = tes[(h + 5) % tes.length]
    offense.push({ name: te.name, position: "TE", jersey_number: te.jersey_number })
  }
  offense.push(...OL_PLAYERS)

  const defense: PlayerOnField[] = []
  const des = byPosition["DE"] || []
  for (let i = 0; i < 2 && des.length > 0; i++) {
    const de = des[(h + i) % des.length]
    defense.push({ name: de.name, position: "DE", jersey_number: de.jersey_number })
  }
  const dts = byPosition["DT"] || []
  if (dts.length > 0) {
    const dt = dts[h % dts.length]
    defense.push({ name: dt.name, position: "DT", jersey_number: dt.jersey_number })
  }
  const lbs = byPosition["LB"] || []
  for (let i = 0; i < 2 && lbs.length > 0; i++) {
    const lb = lbs[(h + i) % lbs.length]
    defense.push({ name: lb.name, position: "LB", jersey_number: lb.jersey_number })
  }
  const cbs = byPosition["CB"] || []
  for (let i = 0; i < 2 && cbs.length > 0; i++) {
    const cb = cbs[(h + i) % cbs.length]
    defense.push({ name: cb.name, position: "CB", jersey_number: cb.jersey_number })
  }
  const ss = byPosition["S"] || []
  for (let i = 0; i < 2 && ss.length > 0; i++) {
    const s = ss[(h + i) % ss.length]
    defense.push({ name: s.name, position: "S", jersey_number: s.jersey_number })
  }
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
// Video Player (Interactive - kept as-is)
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
  const playerIdRef = useRef(`preview-player-v3-${Date.now()}`)

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
// Static Player Chip (Non-clickable)
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
// Static Identity Row (Non-clickable)
// ---------------------------------------------------------------------------

function IdentityRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-2", !isLast && "border-b border-border/50")}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Clip Preview V3 (Simplified)
// ---------------------------------------------------------------------------

const PLAY_TABS = ["Details", "Draw", "Telestration"] as const

function ClipPreviewV3({ play, onClose }: { play: PlayData; onClose: () => void }) {
  const router = useRouter()
  const [playTab, setPlayTab] = useState<typeof PLAY_TABS[number]>("Details")
  const roster = useMemo(() => assignPlayRoster(play), [play])
  const videoUrl = useMemo(() => getVideoForPlay(play), [play])
  const sourceType = getSourceType(play)
  const score = getGameScore(play)
  const summary = useMemo(() => generatePlaySummary(play), [play])

  const handleOpenClip = useCallback(() => {
    router.push(`/media/${play.id}?from=explore`)
  }, [router, play.id])

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <span className="text-sm font-semibold text-foreground">Clip {play.playNumber}</span>
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
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Video player */}
        <div className="p-4">
          <PreviewVideoPlayer
            videoUrl={videoUrl}
            sourceType={sourceType}
            score={score}
            onOpenClip={handleOpenClip}
          />
        </div>

        {/* Play summary */}
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-4 flex items-center gap-1.5">
          {PLAY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setPlayTab(tab)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
                playTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {playTab === "Details" && (
          <div className="px-4 pb-4 space-y-4">
            {/* Play metadata */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground mb-1">Play Type</p>
                <p className="text-sm font-semibold text-foreground">{play.playType}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground mb-1">Yards</p>
                <p className="text-sm font-semibold text-foreground">
                  {play.gainLoss === "Gn" ? "+" : "-"}{play.yards}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground mb-1">Down & Distance</p>
                <p className="text-sm font-semibold text-foreground">
                  {play.down === 1 ? "1st" : play.down === 2 ? "2nd" : play.down === 3 ? "3rd" : "4th"} & {play.distance}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground mb-1">Formation</p>
                <p className="text-sm font-semibold text-foreground">{play.formationOff}</p>
              </div>
            </div>

            {/* Offense Section - Static list */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2">Offense ({roster.offense.length})</h4>
              <div className="flex flex-wrap gap-1.5">
                {roster.offense.map((p, i) => (
                  <PlayerChip key={i} player={p} />
                ))}
              </div>
            </div>

            {/* Defense Section - Static list */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2">Defense ({roster.defense.length})</h4>
              <div className="flex flex-wrap gap-1.5">
                {roster.defense.map((p, i) => (
                  <PlayerChip key={i} player={p} />
                ))}
              </div>
            </div>
          </div>
        )}

        {playTab !== "Details" && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            {playTab} tools coming soon.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3.5 flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          className="flex-1 font-semibold"
          onClick={() => {
            console.log("Add to playlist:", play.id)
          }}
        >
          Add to Playlist
        </Button>
        <Button
          className="flex-1 font-semibold"
          onClick={handleOpenClip}
        >
          Open Clip
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Athlete Preview V3 (Simplified - no navigation)
// ---------------------------------------------------------------------------

const PROFILE_TABS = ["Overview", "Games", "Events", "Career", "Report"] as const

const TEAM_FULL_NAMES: Record<string, string> = {
  BAL: "Baltimore Ravens", BUF: "Buffalo Bills", KC: "Kansas City Chiefs",
  DET: "Detroit Lions", CIN: "Cincinnati Bengals", HOU: "Houston Texans",
  SF: "San Francisco 49ers", PHI: "Philadelphia Eagles", MIN: "Minnesota Vikings",
  MIA: "Miami Dolphins", DAL: "Dallas Cowboys", LAR: "Los Angeles Rams",
  NYJ: "New York Jets", ATL: "Atlanta Falcons", LV: "Las Vegas Raiders",
  CLE: "Cleveland Browns", NYG: "New York Giants", PIT: "Pittsburgh Steelers",
  DEN: "Denver Broncos", IND: "Indianapolis Colts", NE: "New England Patriots",
  TB: "Tampa Bay Buccaneers",
}

function getKeyStatsForAthlete(athlete: Athlete): { label: string; value: string; secondary?: string; note?: string }[] {
  const s = athlete.stats
  const pos = athlete.position

  if (pos === "QB") {
    return [
      { label: "Pass Yards", value: s.passing_yards.toLocaleString(), secondary: `/ ${s.passing_tds} TDs`, note: "Career total" },
      { label: "Passer Rating", value: ((s.passing_tds / Math.max(s.passing_yards / 250, 1)) * 30 + 65).toFixed(1), note: "Estimated" },
      { label: "Rush Yards", value: s.rushing_yards.toLocaleString(), secondary: `/ ${s.rushing_tds} TDs`, note: "Dual threat" },
      { label: "Total TDs", value: (s.passing_tds + s.rushing_tds).toString(), note: "Pass + Rush" },
      { label: "YPG", value: (s.passing_yards / 17).toFixed(1), note: "Yards per game avg" },
      { label: "Comp %", value: (58 + (hashString(athlete.name) % 12)).toFixed(1) + "%", note: "Estimated" },
    ]
  }

  if (pos === "RB") {
    return [
      { label: "Rush Yards", value: s.rushing_yards.toLocaleString(), secondary: `/ ${s.rushing_tds} TDs`, note: "Career total" },
      { label: "YPC", value: (s.rushing_yards / Math.max((s.rushing_yards / 4.5), 1)).toFixed(1), note: "Yards per carry" },
      { label: "Rec Yards", value: s.receiving_yards.toLocaleString(), secondary: `/ ${s.receiving_tds} TDs`, note: "Receiving" },
      { label: "Total TDs", value: (s.rushing_tds + s.receiving_tds).toString(), note: "Rush + Rec" },
      { label: "Scrimmage", value: (s.rushing_yards + s.receiving_yards).toLocaleString(), note: "Total yards" },
      { label: "Rush YPG", value: (s.rushing_yards / 17).toFixed(1), note: "Yards per game avg" },
    ]
  }

  if (pos === "WR" || pos === "TE") {
    return [
      { label: "Rec Yards", value: s.receiving_yards.toLocaleString(), secondary: `/ ${s.receiving_tds} TDs`, note: "Career total" },
      { label: "Rec/Game", value: ((s.receiving_yards / 12) / 17).toFixed(1), note: "Receptions avg" },
      { label: "YPR", value: (s.receiving_yards / Math.max(s.receiving_yards / 12, 1)).toFixed(1), note: "Yards per reception" },
      { label: "Total TDs", value: (s.receiving_tds + s.rushing_tds).toString(), note: "All touchdowns" },
      { label: "Rec YPG", value: (s.receiving_yards / 17).toFixed(1), note: "Yards per game avg" },
      { label: "Targets", value: Math.round(s.receiving_yards / 8.5).toLocaleString(), note: "Estimated" },
    ]
  }

  // Default for defense
  return [
    { label: "Tackles", value: s.tackles.toString(), note: "Career total" },
    { label: "Sacks", value: s.sacks.toFixed(1), note: "Career total" },
    { label: "TFL", value: Math.round(s.sacks * 1.5 + 12).toString(), note: "Tackles for loss" },
    { label: "Tkl/Game", value: (s.tackles / 34).toFixed(1), note: "Per game avg" },
    { label: "PD", value: Math.round(s.tackles * 0.08 + 3).toString(), note: "Pass deflections" },
    { label: "INT", value: Math.round(s.tackles * 0.02 + 1).toString(), note: "Interceptions" },
  ]
}

function AthletePreviewV3({ athlete, onClose }: { athlete: Athlete & { id?: string }; onClose: () => void }) {
  const router = useRouter()
  const [profileTab, setProfileTab] = useState<typeof PROFILE_TABS[number]>("Overview")
  const keyStats = useMemo(() => getKeyStatsForAthlete(athlete), [athlete])
  const teamName = TEAM_FULL_NAMES[athlete.team] || athlete.team
  const athleteTeam = useMemo(() => findTeamById(athlete.team), [athlete.team])
  const athleteSlug = athlete.name.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <span className="text-sm font-semibold text-foreground truncate">{athlete.name}</span>
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
        {/* Avatar + Name + Team/Position */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground shrink-0">
            {athlete.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground leading-tight truncate">{athlete.name}</h2>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5 flex-wrap">
              {athleteTeam && (
                <div
                  className="w-4 h-4 rounded flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                  style={{ backgroundColor: athleteTeam.logoColor }}
                >
                  {athleteTeam.abbreviation.slice(0, 2)}
                </div>
              )}
              <span>{teamName}</span>
              <span className="text-border">{"·"}</span>
              <span>{athlete.position}</span>
              <span className="text-border">{"·"}</span>
              <span>#{athlete.jersey_number}</span>
            </div>
          </div>
        </div>

        {/* Profile tabs */}
        <div className="px-5 pb-4 flex items-center gap-1.5 overflow-x-auto">
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setProfileTab(tab)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap",
                profileTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {profileTab === "Overview" ? (
          <div className="px-5 pb-6">
            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Identity section */}
              <div>
                <h3 className="text-base font-bold text-foreground mb-4">Identity</h3>
                <div className="flex flex-col">
                  <IdentityRow label="Height / Weight" value={`${athlete.height} / ${athlete.weight} lbs`} />
                  <IdentityRow label="Position" value={athlete.position} />
                  <IdentityRow label="Jersey" value={`#${athlete.jersey_number}`} />
                  <IdentityRow label="College" value={athlete.college} />
                  <IdentityRow label="Team" value={teamName} isLast />
                </div>
              </div>

              {/* Key Stats */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-foreground">Key Stats</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>2025/26</span>
                    <Icon name="chevronDown" className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {keyStats.slice(0, 6).map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-border p-3">
                      <p className="text-xs font-medium text-foreground mb-1">{stat.label}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-primary">{stat.value}</span>
                        {stat.secondary && (
                          <span className="text-[10px] text-muted-foreground">{stat.secondary}</span>
                        )}
                      </div>
                      {stat.note && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stat.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Teams Section - Static */}
            <div className="mt-6">
              <h3 className="text-base font-bold text-foreground mb-3">Teams</h3>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                {athleteTeam ? (
                  <>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: athleteTeam.logoColor }}
                    >
                      {athleteTeam.abbreviation}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{athleteTeam.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {athlete.position} {"·"} #{athlete.jersey_number}
                      </p>
                      <p className="text-[10px] text-muted-foreground">2023 - Present</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold shrink-0">
                      {athlete.team.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{teamName}</p>
                      <p className="text-xs text-muted-foreground">
                        {athlete.position} {"·"} #{athlete.jersey_number}
                      </p>
                      <p className="text-[10px] text-muted-foreground">2023 - Present</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            {profileTab} content coming soon.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3.5 flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          className="flex-1 font-semibold"
          onClick={() => {
            console.log("View highlights:", athlete.name)
          }}
        >
          View Highlights
        </Button>
        <Button
          className="flex-1 font-semibold"
          onClick={() => router.push(`/athletes/${athleteSlug}?from=explore`)}
        >
          View Full Profile
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Team Preview V3 (Simplified - no navigation)
// ---------------------------------------------------------------------------

const TEAM_TABS = ["Overview", "Schedule", "Roster", "Stats"] as const

function TeamPreviewV3({ team, onClose }: { team: Team; onClose: () => void }) {
  const router = useRouter()
  const [teamTab, setTeamTab] = useState<typeof TEAM_TABS[number]>("Overview")
  const rosterAthletes = useMemo(() => getAthletesForTeam(team.id), [team.id])
  const teamGames = useMemo(() => mockGames.filter(g => g.homeTeamId === team.id || g.awayTeamId === team.id).slice(0, 5), [team.id])

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <span className="text-sm font-semibold text-foreground truncate">{team.name}</span>
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
        {/* Team banner */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-4">
          <TeamLogo
            teamId={team.id}
            abbreviation={team.abbreviation}
            logoColor={team.logoColor}
            size="xl"
            round
          />
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground leading-tight truncate">{team.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{team.abbreviation}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-4 flex items-center gap-1.5 overflow-x-auto">
          {TEAM_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setTeamTab(tab)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap",
                teamTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {teamTab === "Overview" && (
          <div className="px-5 pb-6 space-y-6">
            {/* Recent Games - Static list */}
            <div>
              <h3 className="text-base font-bold text-foreground mb-3">Recent Games</h3>
              <div className="space-y-2">
                {teamGames.map((game) => {
                  const isHome = game.homeTeamId === team.id
                  const opponent = isHome ? findTeamById(game.awayTeamId) : findTeamById(game.homeTeamId)
                  const scoreStr = game.score ? `${game.score.home}-${game.score.away}` : "TBD"
                  return (
                    <div key={game.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{game.date}</p>
                        <p className="text-sm font-medium text-foreground truncate">
                          {isHome ? "vs" : "@"} {opponent?.name || "Unknown"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{scoreStr}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Roster Preview - Static list */}
            <div>
              <h3 className="text-base font-bold text-foreground mb-3">Roster ({rosterAthletes.length})</h3>
              <div className="space-y-2">
                {rosterAthletes.slice(0, 5).map((athlete) => (
                  <div key={athlete.name} className="flex items-center gap-3 p-2 rounded-lg border border-border">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                      {athlete.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{athlete.name}</p>
                      <p className="text-xs text-muted-foreground">{athlete.position} #{athlete.jersey_number}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {teamTab === "Roster" && (
          <div className="px-5 pb-6">
            <div className="space-y-2">
              {rosterAthletes.map((athlete) => (
                <div key={athlete.name} className="flex items-center gap-3 p-2 rounded-lg border border-border">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {athlete.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{athlete.name}</p>
                    <p className="text-xs text-muted-foreground">{athlete.position} #{athlete.jersey_number}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {teamTab !== "Overview" && teamTab !== "Roster" && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            {teamTab} content coming soon.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3.5 flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          className="flex-1 font-semibold"
          onClick={() => {
            console.log("View schedule:", team.name)
          }}
        >
          View Schedule
        </Button>
        <Button
          className="flex-1 font-semibold"
          onClick={() => router.push(`/teams/${team.id}?from=explore`)}
        >
          View Full Team
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Game Preview V3 (Simplified - no navigation)
// ---------------------------------------------------------------------------

const GAME_TABS = ["Overview", "Clips", "Stats", "Report"] as const

function GamePreviewV3({ game, onClose }: { game: Game; onClose: () => void }) {
  const router = useRouter()
  const [gameTab, setGameTab] = useState<typeof GAME_TABS[number]>("Overview")
  const homeTeam = useMemo(() => findTeamById(game.homeTeamId), [game.homeTeamId])
  const awayTeam = useMemo(() => findTeamById(game.awayTeamId), [game.awayTeamId])
  const gameClips = useMemo(() => mockClips.filter(c => c.gameId === game.id).slice(0, 5), [game.id])

  // Get video for game
  const videoUrl = useMemo(() => {
    const idx = hashString(game.id) % VIDEO_POOL.length
    return VIDEO_POOL[idx]
  }, [game.id])

  // Format score as string for display
  const scoreDisplay = useMemo(() => {
    if (!game.score) return null
    return `${game.score.home}-${game.score.away}`
  }, [game.score])

  const handleOpenGame = useCallback(() => {
    router.push(`/games/${game.id}?from=explore`)
  }, [router, game.id])

  return (
    <div className="h-full flex flex-col bg-background rounded-lg overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <span className="text-sm font-semibold text-foreground truncate">{game.matchupDisplay}</span>
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
        <div className="p-4">
          <PreviewVideoPlayer
            videoUrl={videoUrl}
            sourceType="GAME"
            score={scoreDisplay}
            onOpenClip={handleOpenGame}
          />
        </div>

        {/* Teams matchup - Static */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <TeamLogo
                teamId={homeTeam?.id || ""}
                abbreviation={homeTeam?.abbreviation || "HME"}
                logoColor={homeTeam?.logoColor || "#666"}
                size="md"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">{homeTeam?.name || "Home Team"}</p>
                <p className="text-xs text-muted-foreground">Home</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{scoreDisplay || "vs"}</p>
              <p className="text-xs text-muted-foreground">{game.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground text-right">{awayTeam?.name || "Away Team"}</p>
                <p className="text-xs text-muted-foreground text-right">Away</p>
              </div>
              <TeamLogo
                teamId={awayTeam?.id || ""}
                abbreviation={awayTeam?.abbreviation || "AWY"}
                logoColor={awayTeam?.logoColor || "#666"}
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-4 flex items-center gap-1.5 overflow-x-auto">
          {GAME_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setGameTab(tab)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap",
                gameTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {gameTab === "Overview" && (
          <div className="px-4 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground mb-1">Date</p>
                <p className="text-sm font-semibold text-foreground">{game.date}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground mb-1">Venue</p>
                <p className="text-sm font-semibold text-foreground">{game.venue || "TBD"}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground mb-1">Total Clips</p>
                <p className="text-sm font-semibold text-foreground">{gameClips.length}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground mb-1">Status</p>
                <p className="text-sm font-semibold text-foreground">{game.status || "Final"}</p>
              </div>
            </div>
          </div>
        )}

        {gameTab === "Clips" && (
          <div className="px-4 pb-6">
            <div className="space-y-2">
              {gameClips.map((clip, idx) => (
                <div key={clip.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      Q{clip.quarter} - {clip.down === 1 ? "1st" : clip.down === 2 ? "2nd" : clip.down === 3 ? "3rd" : "4th"} & {clip.distance}
                    </p>
                    <p className="text-xs text-muted-foreground">{clip.time} - {clip.formation.type}</p>
                  </div>
                </div>
              ))}
              {gameClips.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No clips available</p>
              )}
            </div>
          </div>
        )}

        {gameTab !== "Overview" && gameTab !== "Clips" && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            {gameTab} content coming soon.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3.5 flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          className="flex-1 font-semibold"
          onClick={() => {
            console.log("View game report:", game.id)
          }}
        >
          View Report
        </Button>
        <Button
          className="flex-1 font-semibold"
          onClick={handleOpenGame}
        >
          Open Game
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PreviewModuleV3 - Main Component (No Internal Navigation)
// ---------------------------------------------------------------------------

interface PreviewModuleV3Props {
  play?: PlayData
  game?: Game
  team?: Team
  athlete?: Athlete & { id?: string }
  onClose: () => void
}

export function PreviewModuleV3({ 
  play, 
  game, 
  team, 
  athlete, 
  onClose,
}: PreviewModuleV3Props) {
  // Render the appropriate preview based on props
  if (game) {
    return <GamePreviewV3 game={game} onClose={onClose} />
  }
  
  if (team) {
    return <TeamPreviewV3 team={team} onClose={onClose} />
  }
  
  if (athlete) {
    return <AthletePreviewV3 athlete={athlete} onClose={onClose} />
  }
  
  if (play) {
    return <ClipPreviewV3 play={play} onClose={onClose} />
  }

  return null
}
