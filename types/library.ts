/**
 * Centralized data types for the Library/Clip architecture.
 *
 * ClipData merges the concept of PlayData (mock-datasets) with a
 * unique identifier so that copied clips in different playlists
 * remain independent.
 */

export interface ClipData {
  /** Globally unique clip identifier */
  id: string

  // --- Play-level fields (mirrors PlayData) ---
  playNumber?: number
  odk?: "O" | "D" | "K"
  quarter?: number
  down?: number
  distance?: number
  yardLine?: string
  hash?: "L" | "R" | "M"
  yards?: number
  result?: string
  gainLoss?: "Gn" | "Ls"
  defFront?: string
  defStr?: string
  coverage?: string
  blitz?: string
  game?: string
  playType?: "Pass" | "Run" | "Special Teams"
  passResult?: "Complete" | "Incomplete" | "Sack" | "Interception" | "Throwaway"
  runDirection?: "Left" | "Middle" | "Right"
  personnelO?: "11" | "12" | "21" | "22" | "10" | "Empty"
  personnelD?: "Base" | "Nickel" | "Dime" | "Goal Line"
  isTouchdown?: boolean
  isFirstDown?: boolean
  isPenalty?: boolean
  penaltyType?: string

  // --- Media fields ---
  videoUrl?: string
  startTime?: number
  duration?: number
}

export interface LibraryItemMetadata {
  clipCount: number
  duration?: string
  createdDate: string
  modifiedDate: string
}

export interface LibraryItem {
  id: string
  name: string
  type: "folder" | "video" | "playlist"
  parentId: string | null
  metadata: LibraryItemMetadata
}

/**
 * A user-created playlist that owns its clips directly.
 * Clips are stored inline so the playlist is self-contained and
 * independent of the original source data.
 */
export interface CreatedLibraryItem extends LibraryItem {
  type: "playlist"
  clips: ClipData[]
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Generate a unique clip id using a timestamp + random suffix. */
export function generateUniqueClipId(): string {
  return `clip-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/** Deep-copy an array of clips, assigning each copy a new unique id. */
export function copyClipsWithNewIds(clips: ClipData[]): ClipData[] {
  return clips.map((clip) => ({
    ...clip,
    id: generateUniqueClipId(),
  }))
}
