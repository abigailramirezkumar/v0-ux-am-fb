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

interface BreadcrumbStep {
  label: string
  href: string
  icon?: "compass" | "search"
}

/**
 * Builds a URL with breadcrumb path parameters for navigation continuity
 * @param baseUrl - The destination URL (e.g., "/athletes/john-doe")
 * @param from - The source type ("explore" or "search")
 * @param via - Array of intermediate steps to include in the path
 */
export function buildBreadcrumbUrl(
  baseUrl: string,
  from: string,
  via: Array<{ label: string; href: string }>
): string {
  const params = new URLSearchParams()
  params.set("from", from)
  
  if (via.length > 0) {
    // Encode as: "Label1|/path1,Label2|/path2"
    const viaString = via.map(step => `${step.label}|${step.href}`).join(",")
    params.set("via", viaString)
  }
  
  return `${baseUrl}?${params.toString()}`
}

/**
 * ProfileBreadcrumb - Breadcrumb navigation for full profile pages
 * 
 * Shows dynamic breadcrumbs based on how the user navigated to the profile:
 * - From explore page: "Explore > [Profile Name]"
 * - From search: "Search Results > [Profile Name]"
 * - With intermediate steps: "Explore > Team Name > Athlete Name"
 */
export function ProfileBreadcrumb({ currentPage }: ProfileBreadcrumbProps) {
  const searchParams = useSearchParams()
  const fromParam = searchParams.get("from")
  const viaParam = searchParams.get("via")

  // Parse the 'via' parameter to get intermediate breadcrumb steps
  const parseViaSteps = (): BreadcrumbStep[] => {
    if (!viaParam) return []
    
    return viaParam.split(",").map(step => {
      const [label, href] = step.split("|")
      return { label, href }
    }).filter(step => step.label && step.href)
  }

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
  const viaSteps = parseViaSteps()
  
  // Build the complete breadcrumb path
  const allSteps: BreadcrumbStep[] = [rootSource, ...viaSteps]

  // Determine the back link (goes to the previous step in the path)
  const getBackLink = (): string => {
    if (viaSteps.length > 0) {
      // Go back to the last intermediate step, preserving earlier path
      const lastStep = viaSteps[viaSteps.length - 1]
      const earlierSteps = viaSteps.slice(0, -1)
      
      if (earlierSteps.length > 0) {
        return buildBreadcrumbUrl(lastStep.href, fromParam || "explore", earlierSteps)
      }
      return `${lastStep.href}?from=${fromParam || "explore"}`
    }
    return rootSource.href
  }

  // Build href for intermediate breadcrumb links (preserving path up to that point)
  const getIntermediateLinkHref = (stepIndex: number): string => {
    const step = allSteps[stepIndex]
    
    // Root step (Explore/Search) - just go back to explore
    if (stepIndex === 0) {
      return step.href
    }
    
    // Intermediate steps - preserve path up to that point
    const priorSteps = allSteps.slice(1, stepIndex) // Skip root, get steps before this one
    if (priorSteps.length > 0) {
      return buildBreadcrumbUrl(step.href, fromParam || "explore", priorSteps)
    }
    return `${step.href}?from=${fromParam || "explore"}`
  }

  return (
    <div className="flex items-center gap-3">
      <Link 
        href={getBackLink()} 
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Icon name="chevronLeft" className="w-5 h-5" />
      </Link>
      <Breadcrumb>
        <BreadcrumbList>
          {allSteps.map((step, index) => (
            <BreadcrumbItem key={`${step.href}-${index}`}>
              {index > 0 && <BreadcrumbSeparator className="mr-2" />}
              <BreadcrumbLink asChild>
                <Link 
                  href={getIntermediateLinkHref(index)}
                  className="flex items-center gap-1.5"
                >
                  {step.icon && <Icon name={step.icon} className="w-3.5 h-3.5" />}
                  {step.label}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
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
 * Hook to get current breadcrumb context for building navigation URLs
 * Returns the current path info that should be passed to child pages
 */
export function useBreadcrumbContext(currentLabel: string, currentHref: string) {
  const searchParams = useSearchParams()
  const fromParam = searchParams.get("from") || "explore"
  const viaParam = searchParams.get("via")

  // Parse existing via steps
  const existingSteps: Array<{ label: string; href: string }> = viaParam
    ? viaParam.split(",").map(step => {
        const [label, href] = step.split("|")
        return { label, href }
      }).filter(step => step.label && step.href)
    : []

  // Add current page to the path
  const newViaSteps = [...existingSteps, { label: currentLabel, href: currentHref }]

  return {
    from: fromParam,
    via: newViaSteps,
    buildUrl: (targetUrl: string) => buildBreadcrumbUrl(targetUrl, fromParam, newViaSteps),
  }
}
