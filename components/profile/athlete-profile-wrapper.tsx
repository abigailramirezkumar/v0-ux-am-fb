"use client"

import { useExploreContextOptional } from "@/lib/explore-context"
import { AthleteProfilePage } from "@/app/athletes/[athleteId]/athlete-profile-page"
import { AthleteProfileV3 } from "@/components/profile/athlete-profile-v3"
import type { Athlete } from "@/types/athlete"

interface AthleteProfileWrapperProps {
  athlete: Athlete & { id: string }
}

export function AthleteProfileWrapper({ athlete }: AthleteProfileWrapperProps) {
  const exploreContext = useExploreContextOptional()
  
  // If we're in V3 explore mode, use the V3 profile with toolbar
  if (exploreContext?.exploreVersion === "v3") {
    return <AthleteProfileV3 athlete={athlete} />
  }
  
  // Default to the standard profile page
  return <AthleteProfilePage athlete={athlete} />
}
