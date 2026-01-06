"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Icon } from "@/components/icon"
import { sportsData, type League, type Team, type Conference } from "@/lib/sports-data"
import { cn } from "@/lib/utils"

export function GlobalFilters() {
  const [league, setLeague] = useState<League>("NFL")
  const [season, setSeason] = useState("2024")
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([])

  // State for the Team Mega-Menu
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [teamPopoverOpen, setTeamPopoverOpen] = useState(false)
  const [teamSearch, setTeamSearch] = useState("")

  const currentData = sportsData[league]

  // Flatten logic to get all teams for "All" view or filter by category
  const getVisibleTeams = () => {
    let teams: Team[] = []

    // Recursive function to gather teams
    const gatherTeams = (conf: Conference) => {
      if (conf.teams) teams.push(...conf.teams)
      if (conf.subdivisions) conf.subdivisions.forEach(gatherTeams)
    }

    if (activeCategory === "All") {
      currentData.conferences.forEach(gatherTeams)
    } else {
      // Find the specific conference or subdivision
      const findCategory = (confs: Conference[]): boolean => {
        for (const conf of confs) {
          if (conf.name === activeCategory) {
            gatherTeams(conf)
            return true
          }
          if (conf.subdivisions && findCategory(conf.subdivisions)) return true
        }
        return false
      }
      findCategory(currentData.conferences)
    }

    // Filter by search
    if (teamSearch) {
      teams = teams.filter(
        (t) =>
          t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
          t.abbreviation.toLowerCase().includes(teamSearch.toLowerCase()),
      )
    }

    return teams
  }

  const visibleTeams = getVisibleTeams()

  // Helper to render the sidebar navigation in the team menu
  const renderSidebarNav = (confs: Conference[], level = 0) => {
    return confs.map((conf) => (
      <div key={conf.id}>
        <button
          onClick={() => setActiveCategory(conf.name)}
          className={cn(
            "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            activeCategory === conf.name && "bg-accent text-accent-foreground font-medium",
            level > 0 && "pl-8 text-muted-foreground",
          )}
        >
          {conf.name}
        </button>
        {conf.subdivisions && renderSidebarNav(conf.subdivisions, level + 1)}
      </div>
    ))
  }

  const handleLeagueChange = (newLeague: League) => {
    setLeague(newLeague)
    setSeason(sportsData[newLeague].seasons[0])
    setSelectedTeams([])
    setActiveCategory("All")
    setTeamSearch("")
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-background border-b border-border/50">
      {/* League Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" className="h-8 rounded-full bg-muted/50 border-transparent hover:border-border">
            <Icon name="flag" className="w-4 h-4 mr-2 opacity-50" />
            {league}
            <Icon name="chevronDown" className="w-4 h-4 ml-2 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                {Object.keys(sportsData).map((l) => (
                  <CommandItem key={l} onSelect={() => handleLeagueChange(l as League)}>
                    <Icon name="check" className={cn("mr-2 h-4 w-4", league === l ? "opacity-100" : "opacity-0")} />
                    {l}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Season Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" className="h-8 rounded-full bg-muted/50 border-transparent hover:border-border">
            <Icon name="calendar" className="w-4 h-4 mr-2 opacity-50" />
            {season} Season
            <Icon name="chevronDown" className="w-4 h-4 ml-2 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[150px] p-0" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                {currentData.seasons.map((s) => (
                  <CommandItem key={s} onSelect={() => setSeason(s)}>
                    <Icon name="check" className={cn("mr-2 h-4 w-4", season === s ? "opacity-100" : "opacity-0")} />
                    {s}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6" />

      {/* Team Mega-Menu Filter */}
      <Popover open={teamPopoverOpen} onOpenChange={setTeamPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            className="h-8 rounded-full bg-muted/50 border-transparent hover:border-border min-w-[140px] justify-between"
          >
            <span className="flex items-center">
              <Icon name="userGroup" className="w-4 h-4 mr-2 opacity-50" />
              {selectedTeams.length === 0 ? "All Teams" : `${selectedTeams.length} Selected`}
            </span>
            <Icon name="chevronDown" className="w-4 h-4 ml-2 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[700px] p-0" align="start">
          <div className="flex h-[450px]">
            {/* Left Sidebar: Navigation */}
            <div className="w-1/4 border-r border-border bg-muted/30">
              <ScrollArea className="h-full py-2">
                <button
                  onClick={() => setActiveCategory("All")}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    activeCategory === "All" && "bg-accent text-accent-foreground",
                  )}
                >
                  All Teams
                </button>
                <Separator className="my-2" />
                {renderSidebarNav(currentData.conferences)}
              </ScrollArea>
            </div>

            {/* Right Content: Team Grid */}
            <div className="flex-1 flex flex-col">
              <div className="p-3 border-b border-border flex items-center gap-3">
                <div className="flex-1 relative">
                  <Icon
                    name="search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search teams..."
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    className="pl-9 h-8 bg-muted/50"
                  />
                </div>
                {selectedTeams.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedTeams([])}
                  >
                    Clear ({selectedTeams.length})
                  </Button>
                )}
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="grid grid-cols-3 gap-2">
                  {visibleTeams.map((team) => {
                    const isSelected = selectedTeams.some((t) => t.id === team.id)
                    return (
                      <button
                        key={team.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTeams(selectedTeams.filter((t) => t.id !== team.id))
                          } else {
                            setSelectedTeams([...selectedTeams, team])
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md transition-colors text-sm text-left border",
                          isSelected
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "border-transparent hover:bg-muted",
                        )}
                      >
                        {/* Team Logo Placeholder */}
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: team.logoColor }}
                        >
                          {team.abbreviation.substring(0, 1)}
                        </div>
                        <span className="truncate flex-1">{team.name}</span>
                        {isSelected && <Icon name="check" className="w-3 h-3 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
                {visibleTeams.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">No teams found</div>
                )}
              </ScrollArea>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
