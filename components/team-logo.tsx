"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

// ESPN CDN URL mapping for NFL teams
// Format: https://a.espncdn.com/i/teamlogos/nfl/500/{team}.png
// ESPN uses lowercase team abbreviations, some differ from our IDs
const ESPN_TEAM_MAP: Record<string, string> = {
  // AFC North
  bal: "bal",
  cin: "cin",
  cle: "cle",
  pit: "pit",
  // AFC East
  buf: "buf",
  mia: "mia",
  ne: "ne",
  nyj: "nyj",
  // AFC South
  hou: "hou",
  ind: "ind",
  jax: "jax",
  ten: "ten",
  // AFC West
  den: "den",
  kc: "kc",
  lv: "lv",
  lac: "lac",
  // NFC North
  chi: "chi",
  det: "det",
  gb: "gb",
  min: "min",
  // NFC East
  dal: "dal",
  nyg: "nyg",
  phi: "phi",
  was: "wsh", // ESPN uses "wsh" for Washington
  // NFC South
  atl: "atl",
  car: "car",
  no: "no",
  tb: "tb",
  // NFC West
  ari: "ari",
  lar: "lar",
  sf: "sf",
  sea: "sea",
}

function getESPNLogoUrl(teamId: string): string | null {
  const espnId = ESPN_TEAM_MAP[teamId.toLowerCase()]
  if (!espnId) return null
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${espnId}.png`
}

interface TeamLogoProps {
  teamId: string
  abbreviation: string
  logoColor: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  /** If true, uses rounded-full instead of rounded-lg */
  round?: boolean
}

const SIZE_MAP = {
  xs: { container: "w-4 h-4", text: "text-[8px]", image: 16 },
  sm: { container: "w-6 h-6", text: "text-[10px]", image: 24 },
  md: { container: "w-10 h-10", text: "text-xs", image: 40 },
  lg: { container: "w-12 h-12", text: "text-sm", image: 48 },
  xl: { container: "w-16 h-16", text: "text-xl", image: 64 },
}

export function TeamLogo({
  teamId,
  abbreviation,
  logoColor,
  size = "md",
  className,
  round = false,
}: TeamLogoProps) {
  const [imageError, setImageError] = useState(false)
  const espnUrl = getESPNLogoUrl(teamId)
  const sizeConfig = SIZE_MAP[size]
  const useImage = espnUrl && !imageError

  return (
    <div
      className={cn(
        sizeConfig.container,
        round ? "rounded-full" : "rounded-lg",
        "flex items-center justify-center shrink-0 overflow-hidden",
        !useImage && "text-white font-bold",
        className
      )}
      style={!useImage ? { backgroundColor: logoColor } : undefined}
    >
      {useImage ? (
        <Image
          src={espnUrl}
          alt={`${abbreviation} logo`}
          width={sizeConfig.image}
          height={sizeConfig.image}
          className="object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={sizeConfig.text}>
          {abbreviation.slice(0, size === "xs" ? 2 : 3)}
        </span>
      )}
    </div>
  )
}
