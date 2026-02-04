export interface PlayData {
  id: string
  playNumber: number
  odk: "O" | "D" | "K"
  quarter: number
  down: number
  distance: number
  yardLine: string
  hash: "L" | "R" | "M"
  yards: number
  result: string
  gainLoss: "Gn" | "Ls"
  defFront: string
  defStr: string
  coverage: string
  blitz: string
  game: string
}

export interface Dataset {
  id: string
  name: string
  plays: PlayData[]
}

export const VIDEO_POOL = [
  "https://www.youtube.com/embed/LDGIdxOFgTc",
  "https://www.youtube.com/embed/3iBuXdGL7ZM",
  "https://www.youtube.com/embed/LDGIdxOFgTc",
  "https://www.youtube.com/embed/r4cjaa3u_Ls",
  "https://www.youtube.com/embed/jj0yzxcPMJE",
  "https://www.youtube.com/embed/8-8L1-OQykU",
  "https://www.youtube.com/embed/2txa-GRAFRE",
  "https://www.youtube.com/embed/B2fbxpJoz3o",
  "https://www.youtube.com/embed/kGw9oVQFseA",
  "https://www.youtube.com/embed/N1rBDCTNnXA",
]

export function getRandomVideoUrl(excludeUrl?: string | null): string {
  const available = excludeUrl ? VIDEO_POOL.filter((url) => url !== excludeUrl) : VIDEO_POOL

  if (available.length === 0) return VIDEO_POOL[0]

  const randomIndex = Math.floor(Math.random() * available.length)
  return available[randomIndex]
}

const generatePlays = (count: number, gameName: string): PlayData[] => {
  return Array.from({ length: count }).map((_, i) => {
    const gain = Math.floor(Math.random() * 20) - 5
    return {
      id: `play-${i}`,
      playNumber: i + 1,
      odk: Math.random() > 0.5 ? "O" : Math.random() > 0.5 ? "D" : "K",
      quarter: Math.floor(i / (count / 4)) + 1,
      down: (i % 4) + 1,
      distance: Math.floor(Math.random() * 10) + 1,
      yardLine: `${Math.random() > 0.5 ? "-" : "+"}${Math.floor(Math.random() * 50)}`,
      hash: ["L", "R", "M"][Math.floor(Math.random() * 3)] as "L" | "R" | "M",
      yards: Math.abs(gain),
      result: gain > 10 ? "Run" : "Pass",
      gainLoss: gain >= 0 ? "Gn" : "Ls",
      defFront: ["Over", "Under", "Bear", "Okie"][Math.floor(Math.random() * 4)],
      defStr: ["Strong", "Weak"][Math.floor(Math.random() * 2)],
      coverage: ["Cov 1", "Cov 2", "Cov 3", "Quarters"][Math.floor(Math.random() * 4)],
      blitz: Math.random() > 0.8 ? "Yes" : "No",
      game: gameName,
    }
  })
}

export const MOCK_DATASETS: Dataset[] = [
  {
    id: "dataset-a",
    name: "NFL Highlights",
    plays: generatePlays(10, "BUF vs LA 01.01.26"),
  },
  {
    id: "dataset-b",
    name: "Practice Drills",
    plays: generatePlays(12, "Practice - Wed 10.12"),
  },
  {
    id: "dataset-c",
    name: "Scrimmage",
    plays: generatePlays(15, "LSU Spring Scrimmage"),
  },
  {
    id: "dataset-d",
    name: "Full Game",
    plays: generatePlays(20, "SF vs PHI 12.03.23"),
  },
]

export function getDatasetForItem(itemId: string | null): Dataset {
  if (!itemId) return MOCK_DATASETS[0]
  const index = itemId.length % MOCK_DATASETS.length
  return MOCK_DATASETS[index]
}

export function getAllUniqueClips(): Dataset {
  const allPlays: PlayData[] = []
  const seenIds = new Set<string>()

  MOCK_DATASETS.forEach((dataset) => {
    dataset.plays.forEach((play) => {
      // Create a unique key combining dataset and play id
      const uniqueKey = `${dataset.id}-${play.id}`
      if (!seenIds.has(uniqueKey)) {
        seenIds.add(uniqueKey)
        allPlays.push({
          ...play,
          id: uniqueKey, // Use unique key as the play id
        })
      }
    })
  })

  return {
    id: "all-clips",
    name: "All Clips",
    plays: allPlays,
  }
}

// Lookup function to retrieve full video data using only IDs
export function findPlaysByIds(ids: string[]): PlayData[] {
  const allClips = getAllUniqueClips().plays
  return allClips.filter((play) => ids.includes(play.id))
}
