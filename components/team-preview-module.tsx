"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { PreviewModuleShell, type BreadcrumbItem } from "@/components/preview-module-shell"
import type { Team, League } from "@/lib/sports-data"
import type { Game } from "@/lib/games-data"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TeamPreviewModuleProps {
  team: Team
  league: League
  onClose: () => void
  breadcrumbs?: BreadcrumbItem[]
  onNavigateToGame?: (game: Game) => void
}

// ---------------------------------------------------------------------------
// Mock data generators (deterministic based on team id)
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

interface TeamStats {
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  offenseRank: number
  defenseRank: number
  passingYPG: number
  rushingYPG: number
}

function generateTeamStats(team: Team): TeamStats {
  const h = hashString(team.id)
  const wins = 4 + (h % 10)
  const losses = 12 - wins
  return {
    wins,
    losses,
    pointsFor: 180 + (h % 150),
    pointsAgainst: 150 + ((h + 3) % 180),
    offenseRank: 1 + (h % 32),
    defenseRank: 1 + ((h + 7) % 32),
    passingYPG: 180 + (h % 120),
    rushingYPG: 80 + ((h + 5) % 80),
  }
}

interface RecentGameDisplay {
  game: Game
  result: "W" | "L"
  opponentName: string
  teamScore: number
  opponentScore: number
  weekLabel: string
}

const OPPONENT_TEAMS: Record<string, Team> = {
  "Ravens": { id: "ravens", name: "Baltimore Ravens", abbreviation: "BAL", logoColor: "#241773" },
  "Chiefs": { id: "chiefs", name: "Kansas City Chiefs", abbreviation: "KC", logoColor: "#E31837" },
  "Bills": { id: "bills", name: "Buffalo Bills", abbreviation: "BUF", logoColor: "#00338D" },
  "49ers": { id: "49ers", name: "San Francisco 49ers", abbreviation: "SF", logoColor: "#AA0000" },
  "Eagles": { id: "eagles", name: "Philadelphia Eagles", abbreviation: "PHI", logoColor: "#004C54" },
  "Cowboys": { id: "cowboys", name: "Dallas Cowboys", abbreviation: "DAL", logoColor: "#003594" },
  "Lions": { id: "lions", name: "Detroit Lions", abbreviation: "DET", logoColor: "#0076B6" },
  "Dolphins": { id: "dolphins", name: "Miami Dolphins", abbreviation: "MIA", logoColor: "#008E97" },
}

function generateRecentGames(team: Team): RecentGameDisplay[] {
  const h = hashString(team.id)
  const opponentNames = Object.keys(OPPONENT_TEAMS)
  const games: RecentGameDisplay[] = []
  
  for (let i = 0; i < 5; i++) {
    const oppIdx = (h + i * 3) % opponentNames.length
    const opponentName = opponentNames[oppIdx]
    const opponent = OPPONENT_TEAMS[opponentName]
    const isWin = (h + i) % 3 !== 0
    const teamScore = 14 + ((h + i) % 24)
    const opponentScore = isWin ? Math.max(teamScore - 3 - (i % 10), 0) : teamScore + 3 + (i % 14)
    const week = 12 - i
    
    // Create a Game object for navigation
    const gameObj: Game = {
      id: `${team.id}-${opponent.id}-week${week}`,
      homeTeam: team,
      awayTeam: opponent,
      homeScore: isWin ? teamScore : opponentScore,
      awayScore: isWin ? opponentScore : teamScore,
      date: `Nov ${10 + i}, 2024`,
      venue: `${team.name} Stadium`,
      league: "NFL",
      season: "2024",
      week,
      clipCount: 45 + (h % 30),
      isPlayoff: false,
    }
    
    games.push({
      game: gameObj,
      result: isWin ? "W" : "L",
      opponentName,
      teamScore: Math.max(teamScore, 0),
      opponentScore: Math.max(opponentScore, 0),
      weekLabel: `Week ${week}`,
    })
  }
  
  return games
}

interface KeyPlayer {
  name: string
  position: string
  number: number
  stat: string
}

function generateKeyPlayers(team: Team): KeyPlayer[] {
  const h = hashString(team.id)
  const qbNames = ["J. Smith", "M. Johnson", "T. Williams", "D. Brown", "C. Davis"]
  const rbNames = ["R. Harris", "K. Wilson", "A. Moore", "J. Taylor", "N. Chubb"]
  const wrNames = ["T. Hill", "J. Chase", "D. Adams", "S. Diggs", "A. Brown"]
  const deNames = ["M. Garrett", "T. Watt", "N. Bosa", "M. Crosby", "C. Young"]
  
  return [
    { name: qbNames[h % qbNames.length], position: "QB", number: 1 + (h % 19), stat: `${2800 + (h % 1500)} YDS` },
    { name: rbNames[(h + 1) % rbNames.length], position: "RB", number: 20 + (h % 15), stat: `${800 + (h % 600)} YDS` },
    { name: wrNames[(h + 2) % wrNames.length], position: "WR", number: 10 + (h % 10), stat: `${700 + (h % 500)} YDS` },
    { name: deNames[(h + 3) % deNames.length], position: "DE", number: 90 + (h % 9), stat: `${6 + (h % 10)} SACKS` },
  ]
}

// ---------------------------------------------------------------------------
// Stat Card Component
// ---------------------------------------------------------------------------

function StatCard({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) {
  return (
    <div className="flex flex-col p-3 bg-muted/30 rounded-lg">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-lg font-bold text-foreground">{value}</span>
      {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Team Preview Module
// ---------------------------------------------------------------------------

export function TeamPreviewModule({ team, league, onClose, breadcrumbs, onNavigateToGame }: TeamPreviewModuleProps) {
  const stats = useMemo(() => generateTeamStats(team), [team])
  const recentGames = useMemo(() => generateRecentGames(team), [team])
  const keyPlayers = useMemo(() => generateKeyPlayers(team), [team])

  const getLeagueLabel = (l: League) => {
    if (l === "NCAA (FBS)") return "College Football"
    if (l === "High School") return "High School Football"
    return "NFL"
  }

  const footer = (
    <>
      <Button variant="default" className="flex-1 gap-2">
        <Icon name="play" className="w-4 h-4" />
        View All Clips
      </Button>
      <Button variant="outline" className="flex-1 gap-2">
        <Icon name="folder" className="w-4 h-4" />
        Team Roster
      </Button>
    </>
  )

  return (
    <PreviewModuleShell
      icon="users"
      title={team.name}
      subtitle={getLeagueLabel(league)}
      onClose={onClose}
      footer={footer}
      breadcrumbs={breadcrumbs}
    >
      {/* Team Hero */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-lg font-bold shrink-0"
            style={{ backgroundColor: team.logoColor }}
          >
            {team.abbreviation}
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{stats.wins}</span>
              <span className="text-xl text-muted-foreground">-</span>
              <span className="text-3xl font-bold text-foreground">{stats.losses}</span>
            </div>
            <span className="text-sm text-muted-foreground">2024 Season Record</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
          {/* Stats Grid */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Team Stats</h3>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Points For" value={stats.pointsFor} subtext={`${(stats.pointsFor / (stats.wins + stats.losses)).toFixed(1)} PPG`} />
              <StatCard label="Points Against" value={stats.pointsAgainst} subtext={`${(stats.pointsAgainst / (stats.wins + stats.losses)).toFixed(1)} PPG`} />
              <StatCard label="Offense Rank" value={`#${stats.offenseRank}`} />
              <StatCard label="Defense Rank" value={`#${stats.defenseRank}`} />
              <StatCard label="Passing" value={`${stats.passingYPG}`} subtext="YDS/Game" />
              <StatCard label="Rushing" value={`${stats.rushingYPG}`} subtext="YDS/Game" />
            </div>
          </div>

          {/* Key Players */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Key Players</h3>
            <div className="space-y-2">
              {keyPlayers.map((player, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: team.logoColor }}
                    >
                      {player.number}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{player.name}</span>
                      <span className="text-xs text-muted-foreground">{player.position}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{player.stat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Games */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recent Games</h3>
            <div className="space-y-1">
              {recentGames.map((recentGame, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateToGame?.(recentGame.game)}
                  className={cn(
                    "flex items-center justify-between w-full py-2 px-3 rounded-lg transition-colors text-left",
                    onNavigateToGame ? "hover:bg-[#0273e3]/10 cursor-pointer" : "hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                        recentGame.result === "W" ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
                      )}
                    >
                      {recentGame.result}
                    </span>
                    <span className="text-sm text-foreground">vs {recentGame.opponentName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{recentGame.teamScore}-{recentGame.opponentScore}</span>
                    <span className="text-xs text-muted-foreground">{recentGame.weekLabel}</span>
                    {onNavigateToGame && (
                      <Icon name="chevronRight" className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
    </PreviewModuleShell>
  )
}
