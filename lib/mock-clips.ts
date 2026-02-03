import { LibraryItemData } from "@/components/library-item"

// Clip extends LibraryItemData to ensure compatibility with Library's data structure
export interface Clip extends LibraryItemData {
  // LibraryItemData fields: id, name, type, dateModified, createdDate, duration, thumbnailUrl, etc.
  // Football-specific fields:
  gameId: string
  matchup: string
  date: string
  quarter: number
  time: string
  down: number
  distance: number
  yardLine: number // 0-100
  hash: "Left" | "Middle" | "Right"
  
  // Play Context
  playDevelopment: {
    playAction: boolean
    rpo?: "Pass" | "Run"
    screen: boolean
    designedRollout: boolean
    brokenPlay: boolean
  }
  playResult: {
    touchdown?: "Pass" | "Run" | "Defensive"
    firstDown?: "Pass" | "Run"
    turnover?: "Fumble" | "Interception" | "On downs" | "Safety"
    penalty?: string
  }

  // Passing
  passing?: {
    result?: "Complete" | "Incomplete"
    pressure?: "Complete" | "Incomplete" // Result under pressure
    scramble: boolean
    sack: boolean
    throwaway: boolean
    receiver?: {
      targeted: boolean
      reception: boolean
      drop: boolean
      contested: boolean
      route: string
      depth: "Behind LOS" | "0-10" | "10-20" | "20+"
    }
    defense?: {
      breakup: boolean
      interception: boolean
      sack: boolean
      pressure: boolean
      coverage: string
    }
  }

  // Rushing
  rushing?: {
    attempt?: "Gain" | "Loss / No gain"
    yac: number
    direction: "Left end" | "Left tackle" | "Left guard" | "Center" | "Right guard" | "Right tackle" | "Right end"
    defense?: {
      tackleMade: boolean
      tackleMissed: boolean
      tfl: boolean
      forcedFumble: boolean
    }
  }

  // Blocking
  blocking?: {
    passBlock: boolean
    runBlock: boolean
    allowedPressure: boolean
    allowedSack: boolean
  }

  // Special Teams
  specialTeams?: {
    type: "Field Goal" | "PAT" | "Punt" | "Kickoff"
    result?: string // Made, Missed, Blocked, etc.
    returnYards?: number
  }

  // Legacy/Shared
  personnel: {
    offense: string
    defense: string
  }
  gain: number
  videoUrl: string
  thumbnailUrl: string
}

// Helper to generate random int
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const directions = ["Left end", "Left tackle", "Left guard", "Center", "Right guard", "Right tackle", "Right end"] as const
const depths = ["Behind LOS", "0-10", "10-20", "20+"] as const
const routes = ["Go", "Slant", "Out", "Dig", "Post", "Corner", "Curl", "Flat", "Seam"]
const matchups = ["GB @ CHI", "KC @ BAL", "SF @ DAL", "PHI @ NYG", "DET @ MIN"]

// Generate rich mock data
export const mockClips: Clip[] = Array.from({ length: 50 }).map((_, i) => {
  const isPass = Math.random() > 0.45;
  const isRun = !isPass && Math.random() > 0.2;
  const isSpecial = !isPass && !isRun;
  const gain = isPass ? randomInt(-7, 35) : isRun ? randomInt(-3, 20) : 0;
  const matchup = matchups[i % matchups.length];
  const quarter = (i % 4) + 1;
  const time = `${String(15 - (i % 15)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`;

  return {
    // LibraryItemData fields
    id: `clip-${String(i + 1).padStart(4, "0")}`,
    name: `${matchup} - Q${quarter} ${time}`,
    type: "video",
    dateModified: new Date().toLocaleDateString(),
    createdDate: "2024-11-17",
    duration: "00:10",
    
    // Football-specific fields
    gameId: `game-${Math.floor(i / 10)}`,
    matchup,
    date: "2024-11-17",
    quarter,
    time,
    down: (i % 4) + 1,
    distance: randomInt(1, 15),
    yardLine: randomInt(1, 99),
    hash: ["Left", "Middle", "Right"][randomInt(0, 2)] as "Left" | "Middle" | "Right",
    
    playDevelopment: {
      playAction: isPass && Math.random() > 0.7,
      screen: isPass && Math.random() > 0.8,
      designedRollout: isPass && Math.random() > 0.9,
      brokenPlay: Math.random() > 0.95,
      rpo: Math.random() > 0.85 ? (Math.random() > 0.5 ? "Pass" : "Run") : undefined
    },
    
    playResult: {
      touchdown: Math.random() > 0.92 ? (isPass ? "Pass" : isRun ? "Run" : "Defensive") : undefined,
      firstDown: Math.random() > 0.6 ? (isPass ? "Pass" : "Run") : undefined,
      turnover: Math.random() > 0.95 ? ["Fumble", "Interception", "On downs"][randomInt(0, 2)] as "Fumble" | "Interception" | "On downs" : undefined,
    },

    passing: isPass ? {
      result: Math.random() > 0.35 ? "Complete" : "Incomplete",
      pressure: Math.random() > 0.7 ? (Math.random() > 0.5 ? "Complete" : "Incomplete") : undefined,
      scramble: Math.random() > 0.9,
      sack: Math.random() > 0.92,
      throwaway: Math.random() > 0.95,
      receiver: {
        targeted: true,
        reception: Math.random() > 0.35,
        drop: Math.random() > 0.92,
        contested: Math.random() > 0.75,
        route: routes[randomInt(0, routes.length - 1)],
        depth: depths[randomInt(0, depths.length - 1)]
      },
      defense: {
        breakup: Math.random() > 0.85,
        interception: Math.random() > 0.97,
        sack: Math.random() > 0.92,
        pressure: Math.random() > 0.7,
        coverage: ["Man", "Zone", "Cover 2", "Cover 3", "Cover 4"][randomInt(0, 4)]
      }
    } : undefined,

    rushing: isRun ? {
      attempt: gain > 0 ? "Gain" : "Loss / No gain",
      yac: randomInt(0, 10),
      direction: directions[randomInt(0, directions.length - 1)],
      defense: {
        tackleMade: Math.random() > 0.2,
        tackleMissed: Math.random() > 0.7,
        tfl: gain < 0,
        forcedFumble: Math.random() > 0.97
      }
    } : undefined,

    blocking: (isPass || isRun) ? {
      passBlock: isPass,
      runBlock: isRun,
      allowedPressure: isPass && Math.random() > 0.7,
      allowedSack: isPass && Math.random() > 0.92
    } : undefined,

    specialTeams: isSpecial ? {
      type: ["Field Goal", "PAT", "Punt", "Kickoff"][randomInt(0, 3)] as "Field Goal" | "PAT" | "Punt" | "Kickoff",
      result: ["Made", "Missed", "Blocked", "Downed", "Touchback"][randomInt(0, 4)],
      returnYards: randomInt(0, 40)
    } : undefined,

    personnel: { 
      offense: ["11 Pers", "12 Pers", "21 Pers", "22 Pers", "13 Pers"][i % 5], 
      defense: ["Nickel 4-2-5", "Base 4-3", "Dime 4-1-6", "Base 3-4"][i % 4]
    },
    gain,
    videoUrl: "/placeholder-video.mp4",
    thumbnailUrl: "/football-field-aerial.png",
  }
})
