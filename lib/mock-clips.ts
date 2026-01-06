export interface Clip {
  id: string
  gameId: string
  matchup: string // e.g., "GB @ CHI"
  date: string
  quarter: number
  time: string
  down: number
  distance: number
  yardLine: string // e.g., "GB 45"
  hash: "L" | "R" | "M"
  personnel: {
    offense: string // e.g., "11 Pers"
    defense: string // e.g., "Nickel 4-2-5"
  }
  playType: "Pass" | "Run" | "Special Teams"
  result: string // e.g., "Pass complete deep right to J.Reed for 25 yards"
  gain: number
  videoUrl: string
  thumbnailUrl: string
  pffGrade?: number
}

// Realistic matchups and results
const matchups = ["GB @ CHI", "KC @ BAL", "SF @ DAL", "PHI @ NYG", "DET @ MIN", "MIA @ BUF", "LAR @ SEA", "DEN @ LV"]
const passResults = [
  "Pass complete short left to T.Kelce for 12 yards",
  "Pass incomplete deep right intended for D.Adams",
  "Pass complete middle to C.Lamb for 8 yards",
  "Pass complete short right to A.Brown for 15 yards (TD)",
  "Sack for -7 yards",
  "Pass complete deep left to J.Jefferson for 45 yards",
  "Pass incomplete short middle",
  "Pass complete short left to G.Kittle for 6 yards",
  "Interception by CB #24",
  "Pass complete middle to T.Hill for 22 yards",
]
const runResults = [
  "Run up middle by D.Henry for 4 yards",
  "Run left end by J.Taylor for 8 yards",
  "Run right tackle by N.Harris for 2 yards",
  "Run left guard by S.Barkley for 12 yards",
  "Run up middle by A.Kamara for -1 yards",
  "Run right end by B.Robinson for 6 yards (TD)",
  "Run left tackle by D.Cook for 3 yards",
  "Run up middle by J.Gibbs for 15 yards",
]
const offensePersonnel = ["11 Pers", "12 Pers", "21 Pers", "22 Pers", "13 Pers", "10 Pers", "20 Pers"]
const defensePersonnel = ["Nickel 4-2-5", "Base 4-3", "Dime 4-1-6", "Base 3-4", "Nickel 3-3-5", "Goal Line"]

// Generate 50 realistic mock clips
export const mockClips: Clip[] = Array.from({ length: 50 }).map((_, i) => {
  const isPass = i % 2 === 0
  const gain = isPass ? Math.floor(Math.random() * 30) - 5 : Math.floor(Math.random() * 15) - 2

  return {
    id: `clip-${String(i + 1).padStart(4, "0")}`,
    gameId: `game-${Math.floor(i / 10)}`,
    matchup: matchups[i % matchups.length],
    date: "2024-11-17",
    quarter: (i % 4) + 1,
    time: `${String(15 - (i % 15)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
    down: (i % 4) + 1,
    distance: Math.floor(Math.random() * 10) + 1,
    yardLine: i % 2 === 0 ? `OWN ${20 + (i % 30)}` : `OPP ${40 - (i % 20)}`,
    hash: i % 3 === 0 ? "L" : i % 3 === 1 ? "R" : "M",
    personnel: {
      offense: offensePersonnel[i % offensePersonnel.length],
      defense: defensePersonnel[i % defensePersonnel.length],
    },
    playType: isPass ? "Pass" : "Run",
    result: isPass ? passResults[i % passResults.length] : runResults[i % runResults.length],
    gain,
    videoUrl: "/placeholder-video.mp4",
    thumbnailUrl: "/football-field-aerial.png",
    pffGrade: Number.parseFloat((40 + Math.random() * 60).toFixed(1)),
  }
})
