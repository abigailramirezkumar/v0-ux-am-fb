/**
 * Athlete data types.
 *
 * Represents NFL player profiles and their stats.
 * Team abbreviations align with those in lib/sports-data.ts (e.g. "BAL", "KC").
 */

// ---------------------------------------------------------------------------
// Positions
// ---------------------------------------------------------------------------

export type OffensivePosition = "QB" | "RB" | "WR" | "TE" | "OL"
export type DefensivePosition = "DE" | "DT" | "LB" | "CB" | "S"
export type Position = OffensivePosition | DefensivePosition

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export interface AthleteStats {
  passing_yards: number
  passing_tds: number
  rushing_yards: number
  rushing_tds: number
  receiving_yards: number
  receiving_tds: number
  tackles: number
  sacks: number
}

// ---------------------------------------------------------------------------
// Athlete
// ---------------------------------------------------------------------------

export interface Athlete {
  /** Unique athlete identifier (e.g. "ath-001") */
  id?: string
  /** Player full name (unique identifier for now) */
  name: string
  /** Team abbreviation matching sports-data.ts (e.g. "BAL", "KC", "SF") */
  team: string
  /** Player position */
  position: Position
  /** Jersey number */
  jersey_number: number
  /** Height as display string (e.g. "6'2") */
  height: string
  /** Weight in pounds */
  weight: number
  /** College the player attended */
  college: string
  /** Aggregate career stats */
  stats: AthleteStats
}
