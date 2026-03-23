"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Icon } from "@/components/icon"
import { useSearchContextOptional } from "@/lib/search-context"

interface ProfileBreadcrumbProps {
  /** The current page title (e.g., athlete name or team name) */
  currentPage: string
  /** The type of profile being viewed */
  profileType: "team" | "athlete"
  /** For athlete profiles: the team info to always show in hierarchy */
  teamInfo?: {
    name: string
    id: string
  }
}

/**
 * Builds a URL with breadcrumb path parameters for navigation continuity
 */
export function buildBreadcrumbUrl(
  baseUrl: string,
  from: string
): string {
  return `${baseUrl}?from=${from}`
}

/**
 * ProfileBreadcrumb - Purely navigational breadcrumb for profile pages
 * 
 * Styled to match the library subheader breadcrumbs:
 * - Explore icon on the left
 * - Items separated by " / "
 * - Muted text for intermediate items, semibold for current
 * 
 * Shows navigation path based on how user arrived:
 * - From search: Search > Athlete/Team
 * - From explore: Explore > Athlete/Team
 * - From team profile: Explore/Search > Team > Athlete
 * 
 * Team is only shown in breadcrumbs when drilling down FROM a team profile.
 */
export function ProfileBreadcrumb({ currentPage, profileType, teamInfo }: ProfileBreadcrumbProps) {
  const searchParams = useSearchParams()
  const fromParam = searchParams.get("from")
  const searchContext = useSearchContextOptional()

  // Get the root source info based on the 'from' parameter
  const isFromSearch = fromParam === "search"
  // Check if navigating from a team profile (format: "team-{teamId}")
  const isFromTeam = fromParam?.startsWith("team-")
  const rootHref = "/explore"
  const fromValue = fromParam || "explore"

  // Handler for clicking the search icon to focus the search bar
  const handleSearchClick = (e: React.MouseEvent) => {
    if (isFromSearch && searchContext) {
      e.preventDefault()
      searchContext.focusSearch()
    }
  }

  // Render the root icon - either search or explore
  const RootIcon = isFromSearch ? (
    <button
      onClick={handleSearchClick}
      className="hover:text-foreground transition-colors flex items-center"
      aria-label="Focus search bar"
    >
      <Icon name="search" className="w-4 h-4" />
    </button>
  ) : (
    <Link
      href={rootHref}
      className="hover:text-foreground transition-colors flex items-center"
      aria-label="Back to explore"
    >
      <Icon name="explore" className="w-4 h-4" />
    </Link>
  )

  // Build hierarchical breadcrumb based on profile type
  // Hierarchy is always: Root > Team > Athlete
  if (profileType === "team") {
    // Team profile: Search/Explore > Team (current)
    return (
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        {RootIcon}
        <span>/</span>
        <span className="text-foreground font-semibold">{currentPage}</span>
        <span>/</span>
      </nav>
    )
  }

  // Athlete profile: Show team in breadcrumbs ONLY when coming from a team profile
  // This makes breadcrumbs purely navigational - showing where you came from
  const showTeamInBreadcrumb = isFromTeam && teamInfo
  const teamHref = teamInfo ? buildBreadcrumbUrl(`/teams/${teamInfo.id}`, isFromSearch ? "search" : "explore") : rootHref

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
      {RootIcon}
      {showTeamInBreadcrumb && (
        <>
          <span>/</span>
          <Link
            href={teamHref}
            className="hover:text-foreground transition-colors"
          >
            {teamInfo.name}
          </Link>
        </>
      )}
      <span>/</span>
      <span className="text-foreground font-semibold">{currentPage}</span>
      <span>/</span>
    </nav>
  )
}

/**
 * Hook to get the current 'from' value for building navigation URLs
 */
export function useBreadcrumbFrom() {
  const searchParams = useSearchParams()
  return searchParams.get("from") || "explore"
}
