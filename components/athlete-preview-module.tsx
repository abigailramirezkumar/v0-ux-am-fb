"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { PreviewModuleShell, type BreadcrumbItem } from "@/components/preview-module-shell"
import type { Athlete } from "@/types/athlete"
import type { Team, League } from "@/lib/sports-data"
import { getTeamByAbbreviation } from "@/lib/team-utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AthletePreviewModuleProps {
  athlete: Athlete
  onClose: () => void
  breadcrumbs?: BreadcrumbItem[]
  onNavigateToTeam?: (team: Team, league: League) => void
}

// ---------------------------------------------------------------------------
// Stats helpers
// ---------------------------------------------------------------------------

function getKeyStatsForAthlete(athlete: Athlete): { label: string; value: string }[] {
  const { stats, position } = athlete
  const isOffense = ["QB", "RB", "WR", "TE", "OL"].includes(position)
  
  if (position === "QB") {
    return [
      { label: "Pass YDS", value: stats.passing_yards.toLocaleString() },
      { label: "Pass TD", value: stats.passing_tds.toString() },
      { label: "Rush YDS", value: stats.rushing_yards.toLocaleString() },
      { label: "Rush TD", value: stats.rushing_tds.toString() },
    ]
  }
  
  if (position === "RB") {
    return [
      { label: "Rush YDS", value: stats.rushing_yards.toLocaleString() },
      { label: "Rush TD", value: stats.rushing_tds.toString() },
      { label: "Rec YDS", value: stats.receiving_yards.toLocaleString() },
      { label: "Rec TD", value: stats.receiving_tds.toString() },
    ]
  }
  
  if (position === "WR" || position === "TE") {
    return [
      { label: "Rec YDS", value: stats.receiving_yards.toLocaleString() },
      { label: "Rec TD", value: stats.receiving_tds.toString() },
      { label: "Rush YDS", value: stats.rushing_yards.toLocaleString() },
      { label: "Rush TD", value: stats.rushing_tds.toString() },
    ]
  }
  
  // Defense
  return [
    { label: "Tackles", value: stats.tackles.toString() },
    { label: "Sacks", value: stats.sacks.toString() },
    { label: "TFL", value: Math.floor(stats.tackles * 0.15).toString() },
    { label: "FF", value: Math.floor(stats.sacks * 0.3).toString() },
  ]
}

// ---------------------------------------------------------------------------
// Profile tabs
// ---------------------------------------------------------------------------

const PROFILE_TABS = ["Overview", "Stats", "Clips", "Games"] as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AthletePreviewModule({ 
  athlete, 
  onClose, 
  breadcrumbs, 
  onNavigateToTeam 
}: AthletePreviewModuleProps) {
  const [profileTab, setProfileTab] = useState<typeof PROFILE_TABS[number]>("Overview")
  const keyStats = useMemo(() => getKeyStatsForAthlete(athlete), [athlete])
  const teamData = getTeamByAbbreviation(athlete.team)
  const teamObj = teamData?.team || null
  const teamLeague = teamData?.league || "NFL"
  const teamName = teamObj?.name || athlete.team

  const handleTeamClick = () => {
    if (teamObj && onNavigateToTeam) {
      onNavigateToTeam(teamObj, teamLeague)
    }
  }

  const footer = (
    <>
      <Button variant="default" className="flex-1 gap-2 bg-[#0273e3] hover:bg-[#0273e3]/90">
        <Icon name="play" className="w-4 h-4" />
        View Clips
      </Button>
      <Button variant="outline" className="flex-1 gap-2">
        <Icon name="chart" className="w-4 h-4" />
        Full Stats
      </Button>
    </>
  )

  return (
    <PreviewModuleShell
      icon="users"
      title={athlete.name}
      subtitle={`${athlete.position} #${athlete.jersey_number}`}
      onClose={onClose}
      footer={footer}
      breadcrumbs={breadcrumbs}
    >
      {/* Avatar + Name + Team/Position */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-4">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
          style={{ backgroundColor: teamData?.logoColor || "#666" }}
        >
          {athlete.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-foreground leading-tight truncate">{athlete.name}</h2>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5 flex-wrap">
            {teamObj && onNavigateToTeam ? (
              <button
                onClick={handleTeamClick}
                className="text-[#0273e3] font-medium hover:underline transition-colors"
              >
                {teamName}
              </button>
            ) : (
              <span className="text-primary font-medium">{teamName}</span>
            )}
            <span className="text-border">{"·"}</span>
            <span>{athlete.position}</span>
            <span className="text-border">{"·"}</span>
            <span>#{athlete.jersey_number}</span>
          </div>
        </div>
      </div>

      {/* Tab selector */}
      <div className="px-5 border-b border-border/50">
        <div className="flex gap-1">
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setProfileTab(tab)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-t-md transition-colors relative",
                profileTab === tab
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {tab}
              {profileTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0273e3]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {profileTab === "Overview" && (
        <div className="p-5 space-y-6">
          {/* Key Stats */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Season Stats
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {keyStats.map((stat) => (
                <div key={stat.label} className="p-3 bg-muted/30 rounded-lg">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Identity */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Player Info
            </h3>
            <div className="bg-muted/30 rounded-lg p-3 space-y-0">
              <IdentityRow label="Height" value={athlete.height} />
              <IdentityRow label="Weight" value={`${athlete.weight} lbs`} />
              <IdentityRow label="College" value={athlete.college} />
              <IdentityRow 
                label="Team" 
                value={teamName} 
                isLast 
                isClickable={!!(teamObj && onNavigateToTeam)}
                onClick={handleTeamClick}
              />
            </div>
          </div>
        </div>
      )}

      {profileTab !== "Overview" && (
        <div className="p-5 flex items-center justify-center h-40 text-muted-foreground text-sm">
          {profileTab} content coming soon.
        </div>
      )}
    </PreviewModuleShell>
  )
}

// ---------------------------------------------------------------------------
// Identity Row
// ---------------------------------------------------------------------------

function IdentityRow({ label, value, isLast, isClickable, onClick }: { 
  label: string
  value: string
  isLast?: boolean
  isClickable?: boolean
  onClick?: () => void
}) {
  return (
    <div className={cn("flex items-center justify-between py-3", !isLast && "border-b border-dotted border-border")}>
      <span className="text-sm font-bold text-foreground">{label}</span>
      {isClickable && onClick ? (
        <button
          onClick={onClick}
          className="text-sm text-[#0273e3] hover:underline transition-colors"
        >
          {value}
        </button>
      ) : (
        <span className="text-sm text-muted-foreground">{value}</span>
      )}
    </div>
  )
}
