"use client"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { PreviewModuleShell, type BreadcrumbItem } from "@/components/preview-module-shell"
import type { Game } from "@/lib/games-data"
import type { Team, League } from "@/lib/sports-data"

interface GamePreviewModuleProps {
  game: Game
  onClose: () => void
  breadcrumbs?: BreadcrumbItem[]
  onNavigateToTeam?: (team: Team, league: League) => void
}

// Seeded random for consistent mock data
function createSeededRandom(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function GamePreviewModule({ game, onClose, breadcrumbs, onNavigateToTeam }: GamePreviewModuleProps) {
  const homeWon = game.homeScore > game.awayScore
  const awayWon = game.awayScore > game.homeScore
  
  // Generate consistent mock stats based on game id
  const seed = game.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const random = createSeededRandom(seed)
  
  const homeStats = {
    totalYards: Math.floor(random() * 200) + 250,
    passingYards: Math.floor(random() * 150) + 150,
    rushingYards: Math.floor(random() * 100) + 80,
    turnovers: Math.floor(random() * 3),
    penalties: Math.floor(random() * 8) + 3,
    thirdDownConv: `${Math.floor(random() * 6) + 3}/${Math.floor(random() * 6) + 10}`,
    timeOfPossession: `${Math.floor(random() * 10) + 25}:${String(Math.floor(random() * 60)).padStart(2, "0")}`,
  }
  
  const awayStats = {
    totalYards: Math.floor(random() * 200) + 250,
    passingYards: Math.floor(random() * 150) + 150,
    rushingYards: Math.floor(random() * 100) + 80,
    turnovers: Math.floor(random() * 3),
    penalties: Math.floor(random() * 8) + 3,
    thirdDownConv: `${Math.floor(random() * 6) + 3}/${Math.floor(random() * 6) + 10}`,
    timeOfPossession: `${Math.floor(random() * 10) + 25}:${String(Math.floor(random() * 60)).padStart(2, "0")}`,
  }
  
  // Generate mock scoring by quarter
  const quarters = [1, 2, 3, 4]
  const homeQuarters = quarters.map(() => Math.floor(random() * 14))
  const awayQuarters = quarters.map(() => Math.floor(random() * 14))
  
  // Normalize to actual scores
  const homeTotal = homeQuarters.reduce((a, b) => a + b, 0)
  const awayTotal = awayQuarters.reduce((a, b) => a + b, 0)
  const homeNormalized = homeQuarters.map((q) => Math.round((q / homeTotal) * game.homeScore))
  const awayNormalized = awayQuarters.map((q) => Math.round((q / awayTotal) * game.awayScore))

  const StatRow = ({ label, home, away }: { label: string; home: string | number; away: string | number }) => (
    <div className="flex items-center py-2 border-b border-border/30 last:border-0">
      <span className="w-16 text-right text-sm font-medium">{home}</span>
      <span className="flex-1 text-center text-xs text-muted-foreground">{label}</span>
      <span className="w-16 text-left text-sm font-medium">{away}</span>
    </div>
  )

  const footer = (
    <>
      <Button variant="default" className="flex-1 gap-2 bg-[#0273e3] hover:bg-[#0273e3]/90">
        <Icon name="play" className="w-4 h-4" />
        View Clips ({game.clipCount})
      </Button>
      <Button variant="outline" className="flex-1 gap-2">
        <Icon name="download" className="w-4 h-4" />
        Download
      </Button>
    </>
  )

  return (
    <PreviewModuleShell
      icon="video"
      title={`${game.awayTeam.abbreviation} @ ${game.homeTeam.abbreviation}`}
      subtitle={game.date}
      onClose={onClose}
      footer={footer}
      breadcrumbs={breadcrumbs}
    >
      <div className="p-4 space-y-6">
          {/* Matchup Header */}
          <div className="space-y-4">
            {/* Game info */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>{game.date}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span>{game.isPlayoff ? "Playoff" : `Week ${game.week}`}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span>{game.venue}</span>
            </div>
            
            {/* Scoreboard */}
            <div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
              {/* Away Team */}
              <button
                onClick={() => onNavigateToTeam?.(game.awayTeam, game.league as League)}
                className={cn(
                  "flex flex-col items-center gap-2 flex-1 rounded-lg p-2 transition-colors",
                  awayWon && "opacity-100",
                  !awayWon && homeWon && "opacity-60",
                  onNavigateToTeam && "hover:bg-[#0273e3]/10 cursor-pointer"
                )}
              >
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: game.awayTeam.logoColor }}
                >
                  {game.awayTeam.abbreviation}
                </div>
                <span className="text-xs text-center text-muted-foreground">{game.awayTeam.name}</span>
                <span className={cn(
                  "text-3xl font-bold tabular-nums",
                  awayWon && "text-foreground",
                  !awayWon && "text-muted-foreground"
                )}>
                  {game.awayScore}
                </span>
              </button>
              
              {/* VS */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground font-medium">FINAL</span>
              </div>
              
              {/* Home Team */}
              <button
                onClick={() => onNavigateToTeam?.(game.homeTeam, game.league as League)}
                className={cn(
                  "flex flex-col items-center gap-2 flex-1 rounded-lg p-2 transition-colors",
                  homeWon && "opacity-100",
                  !homeWon && awayWon && "opacity-60",
                  onNavigateToTeam && "hover:bg-[#0273e3]/10 cursor-pointer"
                )}
              >
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: game.homeTeam.logoColor }}
                >
                  {game.homeTeam.abbreviation}
                </div>
                <span className="text-xs text-center text-muted-foreground">{game.homeTeam.name}</span>
                <span className={cn(
                  "text-3xl font-bold tabular-nums",
                  homeWon && "text-foreground",
                  !homeWon && "text-muted-foreground"
                )}>
                  {game.homeScore}
                </span>
              </button>
            </div>
          </div>
          
          {/* Scoring by Quarter */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Scoring Summary
            </h3>
            <div className="bg-muted/30 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                <span className="flex-1">Team</span>
                {quarters.map((q) => (
                  <span key={q} className="w-8 text-center">Q{q}</span>
                ))}
                <span className="w-10 text-center">T</span>
              </div>
              
              {/* Away */}
              <div className="flex items-center px-3 py-2 border-b border-border/30">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold"
                    style={{ backgroundColor: game.awayTeam.logoColor }}
                  >
                    {game.awayTeam.abbreviation.slice(0, 2)}
                  </div>
                  <span className="text-xs font-medium">{game.awayTeam.abbreviation}</span>
                </div>
                {awayNormalized.map((score, i) => (
                  <span key={i} className="w-8 text-center text-xs tabular-nums">{score}</span>
                ))}
                <span className={cn(
                  "w-10 text-center text-xs tabular-nums font-semibold",
                  awayWon && "text-foreground"
                )}>
                  {game.awayScore}
                </span>
              </div>
              
              {/* Home */}
              <div className="flex items-center px-3 py-2">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold"
                    style={{ backgroundColor: game.homeTeam.logoColor }}
                  >
                    {game.homeTeam.abbreviation.slice(0, 2)}
                  </div>
                  <span className="text-xs font-medium">{game.homeTeam.abbreviation}</span>
                </div>
                {homeNormalized.map((score, i) => (
                  <span key={i} className="w-8 text-center text-xs tabular-nums">{score}</span>
                ))}
                <span className={cn(
                  "w-10 text-center text-xs tabular-nums font-semibold",
                  homeWon && "text-foreground"
                )}>
                  {game.homeScore}
                </span>
              </div>
            </div>
          </div>

          {/* Team Stats Comparison */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Team Statistics
            </h3>
            <div className="bg-muted/30 rounded-lg p-3">
              {/* Team headers */}
              <div className="flex items-center pb-2 border-b border-border/30 mb-2">
                <div className="w-16 flex justify-end">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: game.homeTeam.logoColor }}
                  >
                    {game.homeTeam.abbreviation.slice(0, 2)}
                  </div>
                </div>
                <div className="flex-1" />
                <div className="w-16 flex justify-start">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: game.awayTeam.logoColor }}
                  >
                    {game.awayTeam.abbreviation.slice(0, 2)}
                  </div>
                </div>
              </div>
              
              <StatRow label="Total Yards" home={homeStats.totalYards} away={awayStats.totalYards} />
              <StatRow label="Passing" home={homeStats.passingYards} away={awayStats.passingYards} />
              <StatRow label="Rushing" home={homeStats.rushingYards} away={awayStats.rushingYards} />
              <StatRow label="Turnovers" home={homeStats.turnovers} away={awayStats.turnovers} />
              <StatRow label="Penalties" home={homeStats.penalties} away={awayStats.penalties} />
              <StatRow label="3rd Down" home={homeStats.thirdDownConv} away={awayStats.thirdDownConv} />
              <StatRow label="Possession" home={homeStats.timeOfPossession} away={awayStats.timeOfPossession} />
            </div>
          </div>

      </div>
    </PreviewModuleShell>
  )
}
