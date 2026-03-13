"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import type { Team, League } from "@/lib/sports-data"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TeamPreviewModuleProps {
  team: Team
  league: League
  onClose: () => void
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

interface RecentGame {
  opponent: string
  result: "W" | "L"
  score: string
  date: string
}

function generateRecentGames(team: Team): RecentGame[] {
  const h = hashString(team.id)
  const opponents = ["Ravens", "Chiefs", "Bills", "49ers", "Eagles", "Cowboys", "Lions", "Dolphins"]
  const games: RecentGame[] = []
  
  for (let i = 0; i < 5; i++) {
    const oppIdx = (h + i * 3) % opponents.length
    const isWin = (h + i) % 3 !== 0
    const teamScore = 14 + ((h + i) % 24)
    const oppScore = isWin ? teamScore - 3 - (i % 10) : teamScore + 3 + (i % 14)
    games.push({
      opponent: opponents[oppIdx],
      result: isWin ? "W" : "L",
      score: `${Math.max(teamScore, 0)}-${Math.max(oppScore, 0)}`,
      date: `Week ${12 - i}`,
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

export function TeamPreviewModule({ team, league, onClose }: TeamPreviewModuleProps) {
  const stats = useMemo(() => generateTeamStats(team), [team])
  const recentGames = useMemo(() => generateRecentGames(team), [team])
  const keyPlayers = useMemo(() => generateKeyPlayers(team), [team])

  const getLeagueLabel = (l: League) => {
    if (l === "NCAA (FBS)") return "College Football"
    if (l === "High School") return "High School Football"
    return "NFL"
  }

  return (
    <div className="h-full flex flex-col bg-background rounded-lg border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-3">
          {/* Team logo */}
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: team.logoColor }}
          >
            {team.abbreviation.slice(0, 3)}
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-semibold text-foreground">{team.name}</h2>
            <span className="text-xs text-muted-foreground">{getLeagueLabel(league)}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <Icon name="close" className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          {/* Record Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Season Record</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{stats.wins}</span>
                <span className="text-lg text-muted-foreground">-</span>
                <span className="text-3xl font-bold text-foreground">{stats.losses}</span>
              </div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0273e3] rounded-full transition-all"
                  style={{ width: `${(stats.wins / (stats.wins + stats.losses)) * 100}%` }}
                />
              </div>
            </div>
          </div>

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
              {recentGames.map((game, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                        game.result === "W" ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
                      )}
                    >
                      {game.result}
                    </span>
                    <span className="text-sm text-foreground">vs {game.opponent}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{game.score}</span>
                    <span className="text-xs text-muted-foreground">{game.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="default" className="flex-1 gap-2">
              <Icon name="play" className="w-4 h-4" />
              View All Clips
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Icon name="folder" className="w-4 h-4" />
              Team Roster
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
