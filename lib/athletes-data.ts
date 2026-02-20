import type { Athlete, Position } from "@/types/athlete"

// ---------------------------------------------------------------------------
// Full athlete dataset (50 players)
// ---------------------------------------------------------------------------

export const athletes: (Athlete & { id: string })[] = [
  // ── Quarterbacks ──────────────────────────────────────────────────────
  { id: "ath-001", name: "Lamar Jackson", team: "BAL", position: "QB", jersey_number: 8, height: "6'2", weight: 215, college: "Louisville", stats: { passing_yards: 7851, passing_tds: 65, rushing_yards: 1625, rushing_tds: 11, receiving_yards: 0, receiving_tds: 0, tackles: 0, sacks: 0 } },
  { id: "ath-002", name: "Josh Allen", team: "BUF", position: "QB", jersey_number: 17, height: "6'5", weight: 237, college: "Wyoming", stats: { passing_yards: 8037, passing_tds: 57, rushing_yards: 1120, rushing_tds: 27, receiving_yards: 0, receiving_tds: 0, tackles: 0, sacks: 0 } },
  { id: "ath-003", name: "Patrick Mahomes", team: "KC", position: "QB", jersey_number: 15, height: "6'2", weight: 225, college: "Texas Tech", stats: { passing_yards: 8111, passing_tds: 53, rushing_yards: 780, rushing_tds: 2, receiving_yards: 0, receiving_tds: 0, tackles: 0, sacks: 0 } },
  { id: "ath-004", name: "Jared Goff", team: "DET", position: "QB", jersey_number: 16, height: "6'4", weight: 217, college: "California", stats: { passing_yards: 9204, passing_tds: 67, rushing_yards: 42, rushing_tds: 2, receiving_yards: 0, receiving_tds: 0, tackles: 0, sacks: 0 } },
  { id: "ath-005", name: "Joe Burrow", team: "CIN", position: "QB", jersey_number: 9, height: "6'4", weight: 215, college: "LSU", stats: { passing_yards: 7227, passing_tds: 58, rushing_yards: 210, rushing_tds: 1, receiving_yards: 0, receiving_tds: 0, tackles: 0, sacks: 0 } },
  { id: "ath-006", name: "C.J. Stroud", team: "HOU", position: "QB", jersey_number: 7, height: "6'3", weight: 218, college: "Ohio State", stats: { passing_yards: 8214, passing_tds: 48, rushing_yards: 340, rushing_tds: 5, receiving_yards: 0, receiving_tds: 0, tackles: 0, sacks: 0 } },
  { id: "ath-007", name: "Brock Purdy", team: "SF", position: "QB", jersey_number: 13, height: "6'1", weight: 220, college: "Iowa State", stats: { passing_yards: 8144, passing_tds: 59, rushing_yards: 290, rushing_tds: 4, receiving_yards: 0, receiving_tds: 0, tackles: 0, sacks: 0 } },

  // ── Running Backs ─────────────────────────────────────────────────────
  { id: "ath-008", name: "Saquon Barkley", team: "PHI", position: "RB", jersey_number: 26, height: "6'0", weight: 232, college: "Penn State", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 2967, rushing_tds: 19, receiving_yards: 620, receiving_tds: 6, tackles: 0, sacks: 0 } },
  { id: "ath-009", name: "Christian McCaffrey", team: "SF", position: "RB", jersey_number: 23, height: "5'11", weight: 210, college: "Stanford", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 2192, rushing_tds: 21, receiving_yards: 1027, receiving_tds: 10, tackles: 0, sacks: 0 } },
  { id: "ath-010", name: "Derrick Henry", team: "BAL", position: "RB", jersey_number: 22, height: "6'3", weight: 247, college: "Alabama", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 3088, rushing_tds: 28, receiving_yards: 380, receiving_tds: 2, tackles: 0, sacks: 0 } },
  { id: "ath-011", name: "James Cook", team: "BUF", position: "RB", jersey_number: 4, height: "5'11", weight: 190, college: "Georgia", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 2245, rushing_tds: 10, receiving_yards: 890, receiving_tds: 5, tackles: 0, sacks: 0 } },
  { id: "ath-012", name: "Breece Hall", team: "NYJ", position: "RB", jersey_number: 20, height: "6'1", weight: 220, college: "Iowa State", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 2054, rushing_tds: 12, receiving_yards: 1391, receiving_tds: 8, tackles: 0, sacks: 0 } },
  { id: "ath-013", name: "Jahmyr Gibbs", team: "DET", position: "RB", jersey_number: 5, height: "5'9", weight: 200, college: "Alabama", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 2357, rushing_tds: 26, receiving_yards: 680, receiving_tds: 2, tackles: 0, sacks: 0 } },
  { id: "ath-014", name: "Kyren Williams", team: "LAR", position: "RB", jersey_number: 23, height: "5'9", weight: 194, college: "Notre Dame", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 2427, rushing_tds: 27, receiving_yards: 410, receiving_tds: 5, tackles: 0, sacks: 0 } },

  // ── Wide Receivers ────────────────────────────────────────────────────
  { id: "ath-015", name: "Justin Jefferson", team: "MIN", position: "WR", jersey_number: 18, height: "6'1", weight: 195, college: "LSU", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 2607, receiving_tds: 15, tackles: 0, sacks: 0 } },
  { id: "ath-016", name: "Ja'Marr Chase", team: "CIN", position: "WR", jersey_number: 1, height: "6'0", weight: 201, college: "LSU", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 2924, receiving_tds: 24, tackles: 0, sacks: 0 } },
  { id: "ath-017", name: "Tyreek Hill", team: "MIA", position: "WR", jersey_number: 10, height: "5'10", weight: 191, college: "West Alabama", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 45, rushing_tds: 0, receiving_yards: 2758, receiving_tds: 19, tackles: 0, sacks: 0 } },
  { id: "ath-018", name: "Amon-Ra St. Brown", team: "DET", position: "WR", jersey_number: 14, height: "6'0", weight: 202, college: "USC", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 2778, receiving_tds: 22, tackles: 0, sacks: 0 } },
  { id: "ath-019", name: "CeeDee Lamb", team: "DAL", position: "WR", jersey_number: 88, height: "6'2", weight: 200, college: "Oklahoma", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 215, rushing_tds: 2, receiving_yards: 2943, receiving_tds: 18, tackles: 0, sacks: 0 } },
  { id: "ath-020", name: "Puka Nacua", team: "LAR", position: "WR", jersey_number: 12, height: "6'2", weight: 205, college: "BYU", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 2476, receiving_tds: 9, tackles: 0, sacks: 0 } },
  { id: "ath-021", name: "Garrett Wilson", team: "NYJ", position: "WR", jersey_number: 5, height: "6'0", weight: 192, college: "Ohio State", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 2146, receiving_tds: 10, tackles: 0, sacks: 0 } },
  { id: "ath-022", name: "Drake London", team: "ATL", position: "WR", jersey_number: 5, height: "6'4", weight: 213, college: "USC", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 2176, receiving_tds: 11, tackles: 0, sacks: 0 } },

  // ── Tight Ends ────────────────────────────────────────────────────────
  { id: "ath-023", name: "Travis Kelce", team: "KC", position: "TE", jersey_number: 87, height: "6'5", weight: 250, college: "Cincinnati", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 1807, receiving_tds: 8, tackles: 0, sacks: 0 } },
  { id: "ath-024", name: "Sam LaPorta", team: "DET", position: "TE", jersey_number: 87, height: "6'3", weight: 245, college: "Iowa", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 1678, receiving_tds: 14, tackles: 0, sacks: 0 } },
  { id: "ath-025", name: "Brock Bowers", team: "LV", position: "TE", jersey_number: 89, height: "6'4", weight: 240, college: "Georgia", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 1194, receiving_tds: 5, tackles: 0, sacks: 0 } },
  { id: "ath-026", name: "George Kittle", team: "SF", position: "TE", jersey_number: 85, height: "6'4", weight: 250, college: "Iowa", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 2126, receiving_tds: 14, tackles: 0, sacks: 0 } },

  // ── Defensive Ends ────────────────────────────────────────────────────
  { id: "ath-027", name: "Myles Garrett", team: "CLE", position: "DE", jersey_number: 95, height: "6'4", weight: 272, college: "Texas A&M", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 98, sacks: 37.0 } },
  { id: "ath-028", name: "Maxx Crosby", team: "LV", position: "DE", jersey_number: 98, height: "6'5", weight: 255, college: "Eastern Michigan", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 115, sacks: 22.0 } },
  { id: "ath-029", name: "Nick Bosa", team: "SF", position: "DE", jersey_number: 97, height: "6'4", weight: 266, college: "Ohio State", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 85, sacks: 21.0 } },
  { id: "ath-030", name: "Aidan Hutchinson", team: "DET", position: "DE", jersey_number: 97, height: "6'7", weight: 268, college: "Michigan", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 65, sacks: 18.0 } },
  { id: "ath-031", name: "Danielle Hunter", team: "HOU", position: "DE", jersey_number: 55, height: "6'5", weight: 263, college: "LSU", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 104, sacks: 28.5 } },
  { id: "ath-032", name: "Josh Hines-Allen", team: "JAX", position: "DE", jersey_number: 41, height: "6'5", weight: 255, college: "Kentucky", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 106, sacks: 25.5 } },
  { id: "ath-033", name: "Trey Hendrickson", team: "CIN", position: "DE", jersey_number: 91, height: "6'4", weight: 270, college: "Florida Atlantic", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 63, sacks: 35.0 } },

  // ── Defensive Tackles ─────────────────────────────────────────────────
  { id: "ath-034", name: "Chris Jones", team: "KC", position: "DT", jersey_number: 95, height: "6'6", weight: 310, college: "Mississippi State", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 59, sacks: 15.5 } },
  { id: "ath-035", name: "Dexter Lawrence", team: "NYG", position: "DT", jersey_number: 97, height: "6'4", weight: 342, college: "Clemson", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 76, sacks: 13.5 } },
  { id: "ath-036", name: "Quinnen Williams", team: "NYJ", position: "DT", jersey_number: 95, height: "6'3", weight: 303, college: "Alabama", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 94, sacks: 10.5 } },

  // ── Linebackers ───────────────────────────────────────────────────────
  { id: "ath-037", name: "T.J. Watt", team: "PIT", position: "LB", jersey_number: 90, height: "6'4", weight: 252, college: "Wisconsin", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 108, sacks: 30.5 } },
  { id: "ath-038", name: "Micah Parsons", team: "DAL", position: "LB", jersey_number: 11, height: "6'3", weight: 245, college: "Penn State", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 103, sacks: 14.0 } },
  { id: "ath-039", name: "Fred Warner", team: "SF", position: "LB", jersey_number: 54, height: "6'3", weight: 230, college: "BYU", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 132, sacks: 2.5 } },
  { id: "ath-040", name: "Roquan Smith", team: "BAL", position: "LB", jersey_number: 0, height: "6'1", weight: 236, college: "Georgia", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 158, sacks: 1.5 } },

  // ── Defensive Backs (CB/S) ────────────────────────────────────────────
  { id: "ath-041", name: "Sauce Gardner", team: "NYJ", position: "CB", jersey_number: 1, height: "6'3", weight: 200, college: "Cincinnati", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 57, sacks: 0 } },
  { id: "ath-042", name: "Patrick Surtain II", team: "DEN", position: "CB", jersey_number: 2, height: "6'2", weight: 202, college: "Alabama", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 69, sacks: 0 } },
  { id: "ath-043", name: "Jalen Ramsey", team: "MIA", position: "CB", jersey_number: 5, height: "6'1", weight: 208, college: "Florida State", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 50, sacks: 0 } },
  { id: "ath-044", name: "Trent McDuffie", team: "KC", position: "CB", jersey_number: 22, height: "5'11", weight: 193, college: "Washington", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 80, sacks: 3.0 } },
  { id: "ath-045", name: "Kyle Hamilton", team: "BAL", position: "S", jersey_number: 14, height: "6'4", weight: 220, college: "Notre Dame", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 81, sacks: 3.0 } },
  { id: "ath-046", name: "Minkah Fitzpatrick", team: "PIT", position: "S", jersey_number: 39, height: "6'1", weight: 207, college: "Alabama", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 64, sacks: 0 } },
  { id: "ath-047", name: "Derwin James", team: "LAC", position: "S", jersey_number: 3, height: "6'2", weight: 215, college: "Florida State", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 125, sacks: 2.0 } },
  { id: "ath-048", name: "Jessie Bates III", team: "ATL", position: "S", jersey_number: 3, height: "6'1", weight: 200, college: "Wake Forest", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 132, sacks: 0 } },
  { id: "ath-049", name: "Antoine Winfield Jr.", team: "TB", position: "S", jersey_number: 31, height: "5'9", weight: 203, college: "Minnesota", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 122, sacks: 6.0 } },
  { id: "ath-050", name: "Justin Simmons", team: "ATL", position: "S", jersey_number: 31, height: "6'2", weight: 202, college: "Boston College", stats: { passing_yards: 0, passing_tds: 0, rushing_yards: 0, rushing_tds: 0, receiving_yards: 0, receiving_tds: 0, tackles: 70, sacks: 1.0 } }
];

// Lookup helpers remain the same...
export function getAthletesByTeam(teamAbbreviation: string) { return athletes.filter((a) => a.team === teamAbbreviation) }
export function getAthletesByPosition(position: Position) { return athletes.filter((a) => a.position === position) }
export function getAthleteByName(name: string) { return athletes.find((a) => a.name === name) }
export function getAthleteById(id: string) { return athletes.find((a) => a.id === id) }
export function searchAthletes(query: string) { return athletes.filter((a) => a.name.toLowerCase().includes(query.toLowerCase())) }
export function getAllPositions(): Position[] { return [...new Set(athletes.map((a) => a.position))] }
export function getAllTeams(): string[] { return [...new Set(athletes.map((a) => a.team))] }
