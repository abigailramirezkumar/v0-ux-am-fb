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

interface ProfileBreadcrumbProps {
  /** The current page title (e.g., athlete name or team name) */
  currentPage: string
}

/**
 * ProfileBreadcrumb - Breadcrumb navigation for full profile pages
 * 
 * Shows dynamic breadcrumbs based on how the user navigated to the profile:
 * - From explore page (?from=explore): "Explore > [Profile Name]"
 * - From search (?from=search): "Search Results > [Profile Name]"
 * - Default (no param): "Explore > [Profile Name]"
 */
export function ProfileBreadcrumb({ currentPage }: ProfileBreadcrumbProps) {
  const searchParams = useSearchParams()
  const fromParam = searchParams.get("from")

  // Determine the source and back link based on the 'from' parameter
  const getSourceInfo = () => {
    switch (fromParam) {
      case "search":
        return {
          label: "Search Results",
          href: "/explore", // Navigate back to explore (search is in header)
          icon: "search" as const,
        }
      case "explore":
      default:
        return {
          label: "Explore",
          href: "/explore",
          icon: "compass" as const,
        }
    }
  }

  const sourceInfo = getSourceInfo()

  return (
    <div className="flex items-center gap-3">
      <Link 
        href={sourceInfo.href} 
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Icon name="chevronLeft" className="w-5 h-5" />
      </Link>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                href={sourceInfo.href}
                className="flex items-center gap-1.5"
              >
                <Icon name={sourceInfo.icon} className="w-3.5 h-3.5" />
                {sourceInfo.label}
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
