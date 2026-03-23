"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Icon } from "@/components/icon"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/breadcrumb"

interface BreadcrumbStep {
  label: string
  href: string
  icon?: "compass" | "search"
}

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
 * ProfileBreadcrumb - Hierarchical breadcrumb navigation for profile pages
 * 
 * Enforces hierarchy: Explore/Search > Team > Athlete
 * - Team profiles: Always show "Explore > Team"
 * - Athlete profiles: Always show "Explore > Team > Athlete" (team is required)
 */
export function ProfileBreadcrumb({ currentPage, profileType, teamInfo }: ProfileBreadcrumbProps) {
  const searchParams = useSearchParams()
  const fromParam = searchParams.get("from")

  // Get the root source info based on the 'from' parameter
  const getRootSource = (): BreadcrumbStep => {
    switch (fromParam) {
      case "search":
        return {
          label: "Search Results",
          href: "/explore",
          icon: "search",
        }
      case "explore":
      default:
        return {
          label: "Explore",
          href: "/explore",
          icon: "compass",
        }
    }
  }

  const rootSource = getRootSource()
  const fromValue = fromParam || "explore"

  // Build hierarchical breadcrumb based on profile type
  // Hierarchy is always: Root > Team > Athlete
  if (profileType === "team") {
    // Team profile: Explore > Team (current)
    return (
      <div className="flex items-center gap-3">
        <Link 
          href={rootSource.href} 
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="chevronLeft" className="w-5 h-5" />
        </Link>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={rootSource.href} className="flex items-center gap-1.5">
                  {rootSource.icon && <Icon name={rootSource.icon} className="w-3.5 h-3.5" />}
                  {rootSource.label}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    )
  }

  // Athlete profile: Explore > Team > Athlete (current)
  // Team is always shown in the hierarchy
  const teamHref = teamInfo ? buildBreadcrumbUrl(`/teams/${teamInfo.id}`, fromValue) : "/explore"
  const backHref = teamInfo ? teamHref : rootSource.href

  return (
    <div className="flex items-center gap-3">
      <Link 
        href={backHref} 
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Icon name="chevronLeft" className="w-5 h-5" />
      </Link>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={rootSource.href} className="flex items-center gap-1.5">
                {rootSource.icon && <Icon name={rootSource.icon} className="w-3.5 h-3.5" />}
                {rootSource.label}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {teamInfo && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={teamHref}>
                    {teamInfo.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

/**
 * Hook to get the current 'from' value for building navigation URLs
 */
export function useBreadcrumbFrom() {
  const searchParams = useSearchParams()
  return searchParams.get("from") || "explore"
}
