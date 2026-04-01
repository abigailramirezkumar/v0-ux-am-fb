"use client"

import { useMemo, useRef, useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Icon } from "@/components/icon"
import { ProfileBreadcrumb, useBreadcrumbContext } from "@/components/profile-breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PreviewModuleV1 } from "@/components/explore/preview-module-v1"
import { TeamLogo } from "@/components/team-logo"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import type { ImperativePanelHandle } from "react-resizable-panels"
import { cn } from "@/lib/utils"
import { getAthletesForTeam } from "@/lib/mock-teams"
import { mockGames } from "@/lib/mock-games"
import { findTeamById } from "@/lib/games-context"
import { nameToSlug } from "@/lib/athletes-data"
import { Play, ChevronRight, ChevronLeft, Check } from "lucide-react"
import type { Team } from "@/lib/sports-data"
import type { Athlete } from "@/types/athlete"
import type { Game } from "@/types/game"
import type { MediaItemData, ClipData } from "@/types/library"
import { useLibraryContext, type WatchBreadcrumbItem } from "@/lib/library-context"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

/** Generate deterministic mock team identity data based on team ID */
function generateTeamIdentity(teamId: string, teamName: string) {
  const h = hashString(teamId)
  const firstNames = ["Mike", "John", "Bill", "Nick", "Andy", "Sean", "Kyle", "Dan", "Kevin", "Matt"]
  const lastNames = ["Johnson", "Smith", "Williams", "Brown", "Jones", "Davis", "Wilson", "Thomas", "Moore", "Taylor"]
  const coachName = `${firstNames[h % firstNames.length]} ${lastNames[(h + 3) % lastNames.length]}`
  
  const cities = ["Los Angeles, CA", "Dallas, TX", "Miami, FL", "Chicago, IL", "New York, NY", "Denver, CO", "Seattle, WA", "Phoenix, AZ", "Atlanta, GA", "Detroit, MI"]
  const city = cities[h % cities.length]
  
  const stadiumPrefixes = ["Memorial", "Victory", "Heritage", "National", "United", "State", "Metro", "Central"]
  const stadiumSuffixes = ["Stadium", "Field", "Arena", "Bowl", "Coliseum"]
  const stadium = `${stadiumPrefixes[h % stadiumPrefixes.length]} ${stadiumSuffixes[(h + 2) % stadiumSuffixes.length]}`
  
  return {
    fullName: teamName,
    headCoach: coachName,
    location: city,
    homeArena: stadium,
  }
}

/** Generate deterministic mock team stats based on team ID (football-specific) */
function generateTeamStats(teamId: string) {
  const h = hashString(teamId)
  return {
    passingYPG: (180 + (h % 120)).toFixed(1),
    passingRank: `Top ${10 + (h % 20)}%`,
    rushingYPG: (90 + (h % 60)).toFixed(1),
    rushingRank: h % 3 === 0 ? "Above D1 Average" : "Below D1 Average (low risk)",
    thirdDownPct: (35 + (h % 30)).toFixed(1),
    thirdDownRank: `Elite (top ${5 + (h % 15)}%)`,
    sacks: 25 + (h % 25),
    sacksSecondary: `/ ${35 + (h % 15)}`,
    sacksNote: `${20 + (h % 15)}.${h % 10}% sack rate`,
    turnovers: 10 + (h % 15),
    turnoversSecondary: `/ ${20 + (h % 10)}`,
    turnoversNote: `${10 + (h % 8)}.0% turnover rate`,
    ppg: (20 + (h % 15)).toFixed(1),
    ppgSecondary: `/ ${25 + (h % 10)}`,
    ppgNote: `${h % 2 === 0 ? "+" : ""}${(h % 8) - 4}.${h % 10} point differential`,
    record: {
      wins: 6 + (h % 8),
      losses: 3 + ((h + 3) % 7),
    },
  }
}



/** Generate deterministic mock playlists for team */
function generateTeamPlaylists(teamId: string) {
  const h = hashString(teamId)
  const playlistNames = [
    "Automatic Video Report",
    "Best Actions",
    "Touchdowns",
    "Interceptions",
    "Sacks",
    "Big Plays",
  ]
  return playlistNames.map((name, i) => ({
    id: `playlist-${teamId}-${i}`,
    name,
    clips: 100 + ((h + i * 17) % 150),
  }))
}

/** Generate detailed game stats for recent games */
function generateGameStats(gameId: string) {
  const h = hashString(gameId)
  return {
    passYds: 200 + (h % 200),
    rushYds: 80 + (h % 120),
    totalYds: 280 + (h % 250),
    firstDowns: 15 + (h % 15),
    thirdDown: `${4 + (h % 6)}/${10 + (h % 6)}`,
    thirdDownPct: ((4 + (h % 6)) / (10 + (h % 6)) * 100).toFixed(1),
    turnovers: h % 4,
    sacks: h % 5,
    penalties: 3 + (h % 8),
    penaltyYds: 25 + (h % 60),
    timeOfPoss: `${28 + (h % 8)}:${(h % 60).toString().padStart(2, "0")}`,
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEAM_PROFILE_TABS = ["Overview", "Games", "Players", "Events", "Report"] as const
type TeamProfileTab = (typeof TEAM_PROFILE_TABS)[number]

const SEASONS = ["All Seasons", "2025/26", "2024/25", "2023/24", "2022/23", "2021/22"] as const

// ---------------------------------------------------------------------------
// Team Profile Page Component
// ---------------------------------------------------------------------------

interface TeamProfilePageProps {
  team: Team
}

export function TeamProfilePage({ team }: TeamProfilePageProps) {
  const [activeTab, setActiveTab] = useState<TeamProfileTab>("Overview")
  const [selectedSeason, setSelectedSeason] = useState<string>("All Seasons")
  const [previewGame, setPreviewGame] = useState<Game | null>(null)
  const [previewPlaylist, setPreviewPlaylist] = useState<MediaItemData | null>(null)
  const previewPanelRef = useRef<ImperativePanelHandle>(null)
  
  // Build breadcrumb for watch app navigation
  const watchBreadcrumb: WatchBreadcrumbItem[] = useMemo(() => [
    { label: "Teams", href: "/explore?tab=teams", icon: "explore" },
    { label: team.name, href: `/teams/${team.id}` },
  ], [team.id, team.name])
  
  // Control preview panel expansion/collapse
  useEffect(() => {
    if (previewGame || previewPlaylist) {
      previewPanelRef.current?.resize(45)
    } else {
      previewPanelRef.current?.collapse()
    }
  }, [previewGame, previewPlaylist])

  // Helper to convert mock playlist to MediaItemData
  const handlePlaylistClick = (mockPlaylist: { id: string; name: string; clips: number }) => {
    // Clear game preview if open
    setPreviewGame(null)
    
    // Generate deterministic mock clips for the playlist
    const clips: ClipData[] = Array.from({ length: Math.min(mockPlaylist.clips, 20) }, (_, i) => ({
      id: `${mockPlaylist.id}-clip-${i}`,
      playNumber: i + 1,
      quarter: (i % 4) + 1,
      down: (i % 4) + 1,
      distance: 5 + (i % 10),
      playType: i % 2 === 0 ? "Pass" : "Run" as const,
      game: `${team.name} Game`,
      yards: 3 + (i % 15),
    }))
    
    const playlistData: MediaItemData = {
      id: mockPlaylist.id,
      name: mockPlaylist.name,
      type: "playlist",
      parentId: null,
      clips,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    }
    setPreviewPlaylist(playlistData)
  }

  // Close handler for preview panel
  const handleClosePreview = () => {
    setPreviewGame(null)
    setPreviewPlaylist(null)
  }

  // Handler for clicking on a key stat to open a playlist of clips for that stat
  const handleStatClick = (statLabel: string, statValue: number, playType?: "Pass" | "Run") => {
    // Clear game preview if open
    setPreviewGame(null)
    
    // Generate deterministic number of clips based on stat value
    const clipCount = Math.min(Math.max(Math.round(statValue), 10), 100)
    
    // Generate mock clips for the stat playlist
    const clips: ClipData[] = Array.from({ length: Math.min(clipCount, 20) }, (_, i) => ({
      id: `${team.id}-${statLabel}-clip-${i}`,
      playNumber: i + 1,
      quarter: (i % 4) + 1,
      down: (i % 4) + 1,
      distance: 5 + (i % 10),
      playType: playType || (i % 2 === 0 ? "Pass" as const : "Run" as const),
      game: `${team.name} Game`,
      yards: 3 + (i % 15),
    }))
    
    const playlistData: MediaItemData = {
      id: `stat-${team.id}-${statLabel}`,
      name: `${team.name} - ${statLabel}`,
      type: "playlist",
      parentId: null,
      clips,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    }
    setPreviewPlaylist(playlistData)
  }
  
  // Get breadcrumb context for building navigation URLs
  const { from: breadcrumbFrom, entity, filters } = useBreadcrumbContext()
  
  // Get team identity
  const identity = useMemo(() => generateTeamIdentity(team.id, team.name), [team.id, team.name])

  // Get team stats
  const stats = useMemo(() => generateTeamStats(team.id), [team.id])

  // Get all athletes for this team
  const teamAthletes = useMemo(() => getAthletesForTeam(team.id), [team.id])

  // Get playlists
  const playlists = useMemo(() => generateTeamPlaylists(team.id), [team.id])
  
  // Get library items to check if playlists are saved
  const { mediaItems } = useLibraryContext()
  const savedPlaylistNames = useMemo(() => {
    const names = new Set<string>()
    mediaItems.forEach((item) => {
      names.add(item.name.toLowerCase())
    })
    return names
  }, [mediaItems])

  // Get top players with position-specific stats
  const topPlayers = useMemo(() => {
    const positionPriority = ["QB", "RB", "WR", "TE", "DE", "LB"]
    const sorted = [...teamAthletes].sort((a, b) => {
      const aIdx = positionPriority.indexOf(a.position)
      const bIdx = positionPriority.indexOf(b.position)
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx)
    })
    return sorted.slice(0, 5).map((athlete) => {
      const h = hashString(athlete.id || athlete.name)
      let statLabel = ""
      let statValue = ""
      if (athlete.position === "QB") {
        statValue = ((250 + (h % 100)) / 100).toFixed(2)
        statLabel = "Pass YPG"
      } else if (athlete.position === "RB") {
        statValue = ((80 + (h % 50)) / 10).toFixed(2)
        statLabel = "Rush YPG"
      } else if (athlete.position === "WR" || athlete.position === "TE") {
        statValue = ((60 + (h % 50)) / 10).toFixed(2)
        statLabel = "Rec YPG"
      } else if (athlete.position === "DE" || athlete.position === "DT") {
        statValue = ((10 + (h % 10)) / 10).toFixed(2)
        statLabel = "Sacks / Game"
      } else {
        statValue = ((40 + (h % 40)) / 10).toFixed(2)
        statLabel = "Tackles / Game"
      }
      return { ...athlete, statValue, statLabel }
    })
  }, [teamAthletes])

  // Get recent games for this team (up to 5)
  const recentGames = useMemo(() => {
    return mockGames
      .filter((g) => g.homeTeamId === team.id || g.awayTeamId === team.id)
      .filter((g) => g.status === "final" && g.score)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((game) => {
        const isHome = game.homeTeamId === team.id
        const teamScore = isHome ? game.score!.home : game.score!.away
        const opponentScore = isHome ? game.score!.away : game.score!.home
        const opponentId = isHome ? game.awayTeamId : game.homeTeamId
        const opponent = findTeamById(opponentId)
        const won = teamScore > opponentScore
        const gameStats = generateGameStats(game.id)
        return {
          id: game.id,
          game, // Include full game object for preview
          date: new Date(game.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          competition: game.gameType === "playoff" ? "Playoff" : `Week ${game.week}`,
          opponent: opponent?.name || "Unknown",
          opponentAbbr: opponent?.abbreviation || "UNK",
          opponentColor: opponent?.logoColor || "#666",
          teamScore,
          opponentScore,
          won,
          score: `${won ? "W" : "L"} ${teamScore}-${opponentScore}`,
          stats: gameStats,
        }
      })
  }, [team.id])

  // Conference info
  const conferenceInfo = useMemo(() => {
    const h = hashString(team.id)
    const divisions = ["North", "South", "East", "West"]
    const conferences = ["AFC", "NFC"]
    return {
      conference: conferences[h % 2],
      division: divisions[h % 4],
      league: team.id.startsWith("hs-") ? "High School Football" : team.id.length > 3 ? "NCAA Division 1 Football" : "NFL",
    }
  }, [team.id])

  return (
    <div className="h-full flex flex-col bg-sidebar">
      {/* Main Content Area with Resizable Preview */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 gap-1">
        {/* Main Content Panel */}
        <ResizablePanel defaultSize={100} minSize={50} id="team-main" order={1}>
          <div className="h-full bg-background rounded-lg overflow-hidden flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-background shrink-0">
              <div className="px-6 py-4">
                {/* Breadcrumb Navigation */}
                <div className="mb-3">
                  <Suspense fallback={
                    <div className="flex items-center gap-3">
                      <Icon name="chevronLeft" className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  }>
                    <ProfileBreadcrumb currentPage={team.name} profileType="team" />
                  </Suspense>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <TeamLogo
                      teamId={team.id}
                      abbreviation={team.abbreviation}
                      logoColor={team.logoColor}
                      size="lg"
                    />
                    <div>
                      <h1 className="text-xl font-bold text-foreground">{team.name}</h1>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                        <span className="text-primary">{conferenceInfo.conference} {conferenceInfo.division}</span>
                        <span className="text-border">{"·"}</span>
                        <span>{conferenceInfo.league}</span>
                      </div>
                    </div>
                  </div>
                  <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                    <SelectTrigger size="sm" className="w-[130px]">
                      <SelectValue placeholder="Season" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEASONS.map((season) => (
                        <SelectItem key={season} value={season}>
                          {season}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </header>

            {/* Tab Navigation */}
            <div className="border-b border-border bg-background shrink-0">
              <div className="px-6">
                <div className="flex items-center gap-1 py-2">
                  {TEAM_PROFILE_TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-semibold transition-colors",
                        activeTab === tab
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="px-6 py-6">
                {activeTab === "Overview" && (
                  <div className="space-y-8">
            {/* Two-column layout: Identity and Key Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Identity Section */}
              <section>
                <h2 className="text-base font-bold text-foreground mb-4">Identity</h2>
                <div className="space-y-0">
                  <div className="flex justify-between py-3 border-b border-dotted border-border">
                    <span className="text-sm font-medium text-foreground">Team Name</span>
                    <span className="text-sm text-muted-foreground">{identity.fullName}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-dotted border-border">
                    <span className="text-sm font-medium text-foreground">Head Coach</span>
                    <span className="text-sm text-primary">{identity.headCoach}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-dotted border-border">
                    <span className="text-sm font-medium text-foreground">Conference</span>
                    <span className="text-sm text-primary">{conferenceInfo.conference}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-dotted border-border">
                    <span className="text-sm font-medium text-foreground">Location</span>
                    <span className="text-sm text-muted-foreground">{identity.location}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-sm font-medium text-foreground">Home Arena</span>
                    <span className="text-sm text-muted-foreground">{identity.homeArena}</span>
                  </div>
                </div>
              </section>

              {/* Key Stats Section */}
              <section>
                <h2 className="text-base font-bold text-foreground mb-4">Key Stats</h2>
                <div className="grid grid-cols-3 gap-3">
                  {/* Passing YPG */}
                  <button
                    onClick={() => handleStatClick("Passing YPG", parseFloat(stats.passingYPG), "Pass")}
                    className={cn(
                      "rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50 hover:border-primary/30 cursor-pointer",
                      previewPlaylist?.id === `stat-${team.id}-Passing YPG` && "bg-primary/10 border-primary/30"
                    )}
                  >
                    <p className="text-xs font-semibold text-primary mb-1">Passing YPG</p>
                    <p className="text-2xl font-bold text-foreground">{stats.passingYPG}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.passingRank}</p>
                  </button>
                  {/* Rushing YPG */}
                  <button
                    onClick={() => handleStatClick("Rushing YPG", parseFloat(stats.rushingYPG), "Run")}
                    className={cn(
                      "rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50 hover:border-primary/30 cursor-pointer",
                      previewPlaylist?.id === `stat-${team.id}-Rushing YPG` && "bg-primary/10 border-primary/30"
                    )}
                  >
                    <p className="text-xs font-semibold text-primary mb-1">Rushing YPG</p>
                    <p className="text-2xl font-bold text-foreground">{stats.rushingYPG}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.rushingRank}</p>
                  </button>
                  {/* 3rd Down % */}
                  <button
                    onClick={() => handleStatClick("3rd Down %", parseFloat(stats.thirdDownPct))}
                    className={cn(
                      "rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50 hover:border-primary/30 cursor-pointer",
                      previewPlaylist?.id === `stat-${team.id}-3rd Down %` && "bg-primary/10 border-primary/30"
                    )}
                  >
                    <p className="text-xs font-semibold text-primary mb-1">3rd Down %</p>
                    <p className="text-2xl font-bold text-foreground">{stats.thirdDownPct}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.thirdDownRank}</p>
                  </button>
                  {/* Sacks */}
                  <button
                    onClick={() => handleStatClick("Sacks", stats.sacks)}
                    className={cn(
                      "rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50 hover:border-primary/30 cursor-pointer",
                      previewPlaylist?.id === `stat-${team.id}-Sacks` && "bg-primary/10 border-primary/30"
                    )}
                  >
                    <p className="text-xs font-semibold text-primary mb-1">Sacks</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-bold text-foreground">{stats.sacks}</p>
                      <p className="text-sm text-muted-foreground">{stats.sacksSecondary}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stats.sacksNote}</p>
                  </button>
                  {/* Turnovers */}
                  <button
                    onClick={() => handleStatClick("Turnovers", stats.turnovers)}
                    className={cn(
                      "rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50 hover:border-primary/30 cursor-pointer",
                      previewPlaylist?.id === `stat-${team.id}-Turnovers` && "bg-primary/10 border-primary/30"
                    )}
                  >
                    <p className="text-xs font-semibold text-primary mb-1">Turnovers</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-bold text-foreground">{stats.turnovers}</p>
                      <p className="text-sm text-muted-foreground">{stats.turnoversSecondary}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stats.turnoversNote}</p>
                  </button>
                  {/* PPG */}
                  <button
                    onClick={() => handleStatClick("PPG", parseFloat(stats.ppg))}
                    className={cn(
                      "rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50 hover:border-primary/30 cursor-pointer",
                      previewPlaylist?.id === `stat-${team.id}-PPG` && "bg-primary/10 border-primary/30"
                    )}
                  >
                    <p className="text-xs font-semibold text-primary mb-1">PPG</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-bold text-foreground">{stats.ppg}</p>
                      <p className="text-sm text-muted-foreground">{stats.ppgSecondary}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stats.ppgNote}</p>
                  </button>
                </div>
              </section>
            </div>

            {/* Playlists */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-foreground">Playlists</h2>
                <Button variant="outline" size="sm">
                  Create Playlist
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist)}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:bg-muted/50 transition-colors",
                      previewPlaylist?.id === playlist.id && "bg-primary/10 border-primary/30"
                    )}
                  >
                    <Icon name="playlist" className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{playlist.name}</span>
                    <span className="text-sm text-muted-foreground">{playlist.clips} clips</span>
                    {savedPlaylistNames.has(playlist.name.toLowerCase()) && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-md border border-primary/20">
                        <Check className="w-3 h-3" />
                        Saved
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Recent Games Table */}
            {recentGames.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-foreground">Recent Games</h2>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="text-xs font-semibold h-10 px-3 w-10"></TableHead>
                        <TableHead className="text-xs font-semibold h-10 px-3">Date</TableHead>
                        <TableHead className="text-xs font-semibold h-10 px-3">Competition</TableHead>
                        <TableHead className="text-xs font-semibold h-10 px-3">Opponent</TableHead>
                        <TableHead className="text-xs font-semibold h-10 px-3">Score</TableHead>
                        <TableHead className="text-xs font-semibold h-10 px-3 text-right">Pass</TableHead>
                        <TableHead className="text-xs font-semibold h-10 px-3 text-right">Rush</TableHead>
                        <TableHead className="text-xs font-semibold h-10 px-3 text-right">TO</TableHead>
                        <TableHead className="text-xs font-semibold h-10 px-3 text-right">3rd%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentGames.map((gameData) => (
                        <TableRow
                          key={gameData.id}
                          className={cn(
                            "cursor-pointer hover:bg-muted/50",
                            previewGame?.id === gameData.id && "bg-primary/10"
                          )}
                          onClick={() => { setPreviewPlaylist(null); setPreviewGame(gameData.game); }}
                        >
                          <TableCell className="px-3 py-3">
                            <button className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                              <Play className="w-3 h-3 text-muted-foreground ml-0.5" />
                            </button>
                          </TableCell>
                          <TableCell className="text-xs px-3 py-3 text-muted-foreground">{gameData.date}</TableCell>
                          <TableCell className="text-xs px-3 py-3 text-muted-foreground">{gameData.competition}</TableCell>
                          <TableCell className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                                style={{ backgroundColor: gameData.opponentColor }}
                              >
                                {gameData.opponentAbbr.slice(0, 2)}
                              </div>
                              <span className="text-xs text-foreground">{gameData.opponentAbbr}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-3">
                            <span className={cn(
                              "text-xs font-semibold",
                              gameData.won ? "text-emerald-500" : "text-red-500"
                            )}>
                              {gameData.score}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs px-3 py-3 text-right tabular-nums text-primary">{gameData.stats.passYds}</TableCell>
                          <TableCell className="text-xs px-3 py-3 text-right tabular-nums text-primary">{gameData.stats.rushYds}</TableCell>
                          <TableCell className="text-xs px-3 py-3 text-right tabular-nums">{gameData.stats.turnovers}</TableCell>
                          <TableCell className="text-xs px-3 py-3 text-right tabular-nums text-primary">{gameData.stats.thirdDownPct}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            )}

            {/* Top Players */}
            {topPlayers.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-foreground">Top Players</h2>
                  <Button variant="outline" size="sm">
                    View Full Team
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {topPlayers.map((player, idx) => (
                    <Link
                      key={player.id || idx}
                      href={`/athletes/${nameToSlug(player.name)}?from=team-${team.id}&entity=teams&team=${team.id}${filters ? `&filters=${filters}` : ""}`}
                      className="rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors"
                    >
                      <p className="text-xs font-semibold text-primary mb-1">{player.statLabel}</p>
                      <p className="text-2xl font-bold text-foreground">{player.statValue}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                          {player.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-foreground truncate">{player.name.split(" ").pop()}</p>
                          <p className="text-[10px] text-muted-foreground">{player.position} · #{player.jersey_number}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
                  </div>
                )}

                {activeTab !== "Overview" && (
                  <div className="py-20 text-center">
                    <p className="text-muted-foreground">{activeTab} content coming soon.</p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </ResizablePanel>

        {/* Preview Panel */}
        <ResizableHandle className="w-0 bg-transparent border-0 after:hidden before:hidden [&>div]:hidden" />
        <ResizablePanel
          ref={previewPanelRef}
          defaultSize={0}
          minSize={30}
          maxSize={50}
          collapsible
          collapsedSize={0}
          id="team-preview"
          order={2}
        >
          {(previewGame || previewPlaylist) && (
            <PreviewModuleV1
              game={previewGame ?? undefined}
              playlist={previewPlaylist ?? undefined}
              onClose={handleClosePreview}
              watchBreadcrumb={watchBreadcrumb}
            />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
