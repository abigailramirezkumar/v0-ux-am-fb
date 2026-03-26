"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Icon } from "@/components/icon"
import { useSearchContextOptional } from "@/lib/search-context"
import type { ExploreTab } from "@/lib/explore-context"

interface ProfileBreadcrumbProps {
  /** The current page title (e.g., athlete name or team name) */
  currentPage: string
  /** The type of profile being viewed */
  profileType: "team" | "athlete"
  /** For athlete profiles: the team info when navigated via team */
  teamInfo?: {
    name: string
    id: string
  }
  /** Optional content name (game, playlist, clip) at the end of breadcrumbs */
  contentName?: string
}

/** Entity type labels for breadcrumbs */
const ENTITY_LABELS: Record<string, string> = {
  athletes: "Athletes",
  teams: "Teams",
  search: "Search Results",
}

/**
 * Builds a URL with breadcrumb path parameters for navigation continuity
 */
export function buildBreadcrumbUrl(
  baseUrl: string,
  params: { 
    from?: string
    entity?: string
    team?: string
    filters?: string
  }
): string {
  const searchParams = new URLSearchParams()
  if (params.from) searchParams.set("from", params.from)
  if (params.entity) searchParams.set("entity", params.entity)
  if (params.team) searchParams.set("team", params.team)
  if (params.filters) searchParams.set("filters", params.filters)
  
  const queryString = searchParams.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

/**
 * ProfileBreadcrumb - Entity-based hierarchical breadcrumb for profile pages
 * 
 * Breadcrumb rules:
 * 1. First breadcrumb = largest entity type (Athletes, Teams, Search Results)
 * 2. If navigating from team to athlete: Teams / [Team Name] / [Athlete]
 * 3. Direct entry to athlete: Athletes / [Athlete Name]
 * 4. Content items (games, playlists) come at the end
 * 
 * Clicking the first breadcrumb returns to Explore with that tab active.
 */
export function ProfileBreadcrumb({ 
  currentPage, 
  profileType, 
  teamInfo,
  contentName 
}: ProfileBreadcrumbProps) {
  const searchParams = useSearchParams()
  const searchContext = useSearchContextOptional()
  
  // Get navigation context from URL params
  const fromParam = searchParams.get("from") // "search", "explore", or "team-{id}"
  const entityParam = searchParams.get("entity") as ExploreTab | null // "athletes", "teams", etc.
  const teamParam = searchParams.get("team") // team ID when navigating via team
  const filtersParam = searchParams.get("filters") // preserved filters
  
  // Determine the root entity type
  const isFromSearch = fromParam === "search"
  const isFromTeam = fromParam?.startsWith("team-") || !!teamParam
  
  // Determine which explore tab to return to
  let rootEntity: string
  let rootTab: ExploreTab
  
  if (isFromSearch) {
    rootEntity = "search"
    rootTab = "clips" // Search typically relates to clips
  } else if (isFromTeam) {
    rootEntity = "teams"
    rootTab = "teams"
  } else if (profileType === "team") {
    rootEntity = "teams"
    rootTab = "teams"
  } else {
    // Default: use entity param or derive from profile type
    rootEntity = entityParam || (profileType === "athlete" ? "athletes" : "teams")
    rootTab = (entityParam as ExploreTab) || (profileType === "athlete" ? "athletes" : "teams")
  }
  
  // Build the explore URL with tab and preserved filters
  const buildExploreUrl = () => {
    const url = `/explore?tab=${rootTab}`
    return filtersParam ? `${url}&filters=${filtersParam}` : url
  }

  // Handler for clicking search to focus the search bar
  const handleSearchClick = (e: React.MouseEvent) => {
    if (isFromSearch && searchContext) {
      e.preventDefault()
      searchContext.focusSearch()
    }
  }

  // Build the team profile URL for intermediate breadcrumb
  const buildTeamUrl = () => {
    if (!teamInfo) return "/explore"
    return buildBreadcrumbUrl(`/teams/${teamInfo.id}`, {
      from: isFromSearch ? "search" : "explore",
      entity: "teams",
      filters: filtersParam || undefined,
    })
  }

  // Render the root breadcrumb (entity type)
  const renderRootBreadcrumb = () => {
    const label = ENTITY_LABELS[rootEntity] || "Explore"
    
    if (isFromSearch) {
      return (
        <button
          onClick={handleSearchClick}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          aria-label="Focus search bar"
        >
          <Icon name="search" className="w-4 h-4" />
          <span>{label}</span>
        </button>
      )
    }
    
    return (
      <Link
        href={buildExploreUrl()}
        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        aria-label={`Back to ${label}`}
      >
        <Icon name="explore" className="w-4 h-4" />
        <span>{label}</span>
      </Link>
    )
  }

  // Build hierarchical breadcrumb based on context
  // Team profile: [Entity] / [Team Name]
  if (profileType === "team") {
    return (
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        {renderRootBreadcrumb()}
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-semibold">{currentPage}</span>
        {contentName && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-semibold">{contentName}</span>
          </>
        )}
      </nav>
    )
  }

  // Athlete profile with team context: Teams / [Team] / [Athlete]
  if (isFromTeam && teamInfo) {
    return (
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        {renderRootBreadcrumb()}
        <span className="text-muted-foreground">/</span>
        <Link
          href={buildTeamUrl()}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {teamInfo.name}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-semibold">{currentPage}</span>
        {contentName && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-semibold">{contentName}</span>
          </>
        )}
      </nav>
    )
  }

  // Direct athlete profile: Athletes / [Athlete Name]
  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      {renderRootBreadcrumb()}
      <span className="text-muted-foreground">/</span>
      <span className="text-foreground font-semibold">{currentPage}</span>
      {contentName && (
        <>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-semibold">{contentName}</span>
        </>
      )}
    </nav>
  )
}

/**
 * Hook to get the current navigation context for building URLs
 */
export function useBreadcrumbContext() {
  const searchParams = useSearchParams()
  
  const from = searchParams.get("from") || "explore"
  const entity = searchParams.get("entity") as ExploreTab | null
  const team = searchParams.get("team")
  const filters = searchParams.get("filters")
  
  return { from, entity, team, filters }
}

/**
 * Hook to get the current 'from' value for building navigation URLs
 * @deprecated Use useBreadcrumbContext instead for full context
 */
export function useBreadcrumbFrom() {
  const searchParams = useSearchParams()
  return searchParams.get("from") || "explore"
}
