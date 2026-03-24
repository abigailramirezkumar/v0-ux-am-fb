"use client"

import { useExploreContextOptional } from "@/lib/explore-context"
import { TeamProfilePage } from "@/app/teams/[teamId]/team-profile-page"
import { TeamProfileV3 } from "@/components/profile/team-profile-v3"
import type { Team } from "@/lib/sports-data"

interface TeamProfileWrapperProps {
  team: Team
}

export function TeamProfileWrapper({ team }: TeamProfileWrapperProps) {
  const exploreContext = useExploreContextOptional()
  
  // If we're in V3 explore mode, use the V3 profile with toolbar
  if (exploreContext?.exploreVersion === "v3") {
    return <TeamProfileV3 team={team} />
  }
  
  // Default to the standard profile page
  return <TeamProfilePage team={team} />
}
