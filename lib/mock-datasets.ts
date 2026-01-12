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
  startTime: number // Seconds for video seeking
}

export interface Dataset {
  id: string
  name: string
  videoUrl: string
  plays: PlayData[]
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
      startTime: i * 15 + 10, // Mock timestamp: every play starts 15s apart
    }
  })
}

export const MOCK_DATASETS: Dataset[] = [
  {
    id: "dataset-a",
    name: "NFL Highlights",
    videoUrl: "https://www.youtube.com/embed/uJaqnJ6-xfY",
    plays: generatePlays(25, "BUF vs LA 01.01.26"),
  },
  {
    id: "dataset-b",
    name: "Practice Drills",
    videoUrl: "https://www.youtube.com/embed/8D8GDAgKZAU",
    plays: generatePlays(50, "Practice - Wed 10.12"),
  },
  {
    id: "dataset-c",
    name: "Scrimmage",
    videoUrl: "https://www.youtube.com/embed/NqPDZK9ZMEg",
    plays: generatePlays(75, "LSU Spring Scrimmage"),
  },
  {
    id: "dataset-d",
    name: "Full Game",
    videoUrl: "https://www.youtube.com/embed/9xl6IYH9nrY",
    plays: generatePlays(100, "SF vs PHI 12.03.23"),
  },
]

export function getDatasetForItem(itemId: string | null): Dataset {
  if (!itemId) return MOCK_DATASETS[0]
  // Deterministic selection based on item ID length or char code
  const index = itemId.length % MOCK_DATASETS.length
  return MOCK_DATASETS[index]
}
