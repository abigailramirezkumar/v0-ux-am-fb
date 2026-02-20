import { describe, it, expect } from "vitest"
import {
  getValueForCategory,
  getNumericValueForRange,
  matchesSetFilters,
  matchesRangeFilters,
  matchesFilters,
  filterPlays,
} from "@/lib/filters/filter-engine"
import type { PlayData } from "@/lib/mock-datasets"
import type { FilterState, RangeFilterState } from "@/types/filters"

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** A complete pass play on 2nd & 5 from the +30. */
const passPlay: PlayData = {
  id: "test-pass-1",
  playNumber: 1,
  odk: "O",
  quarter: 2,
  down: 2,
  distance: 5,
  yardLine: "+30",
  yardLineNumeric: 30,
  hash: "L",
  yards: 12,
  result: "Complete",
  gainLoss: "Gn",
  defFront: "Over",
  defStr: "Strong",
  coverage: "Cov 2",
  blitz: "No",
  game: "BUF vs LA 01.01.26",
  epa: 1.5,
  successRate: true,
  explosivePlay: false,
  formationName: "Trips Right",
  isShotgun: true,
  timeToPass: 2.8,
  passLocation: "Middle",
  runGap: undefined,
  isTwoMinuteDrill: false,
  offenseIds: ["ath-001"],
  defenseIds: ["ath-027"],
  playType: "Pass",
  passResult: "Complete",
  runDirection: undefined,
  personnelO: "11",
  personnelD: "Nickel",
  isTouchdown: false,
  isFirstDown: true,
  isPenalty: false,
  penaltyType: undefined,
}

/** A short run play on 3rd & 1 from the -45. */
const runPlay: PlayData = {
  id: "test-run-1",
  playNumber: 2,
  odk: "O",
  quarter: 3,
  down: 3,
  distance: 1,
  yardLine: "-45",
  yardLineNumeric: 45,
  hash: "R",
  yards: 3,
  result: "Run",
  gainLoss: "Gn",
  defFront: "Under",
  defStr: "Weak",
  coverage: "Cov 1",
  blitz: "Yes",
  game: "SF vs PHI 12.03.23",
  epa: -0.5,
  successRate: false,
  explosivePlay: false,
  formationName: "I-Form Tight",
  isShotgun: false,
  timeToPass: undefined,
  passLocation: undefined,
  runGap: "B-Gap",
  isTwoMinuteDrill: false,
  offenseIds: ["ath-008"],
  defenseIds: ["ath-037"],
  playType: "Run",
  passResult: undefined,
  runDirection: "Left",
  personnelO: "22",
  personnelD: "Base",
  isTouchdown: false,
  isFirstDown: true,
  isPenalty: false,
  penaltyType: undefined,
}

/** A special-teams play (kickoff). */
const specialPlay: PlayData = {
  id: "test-special-1",
  playNumber: 3,
  odk: "K",
  quarter: 1,
  down: 1,
  distance: 10,
  yardLine: "+35",
  yardLineNumeric: 35,
  hash: "M",
  yards: 0,
  result: "Special Teams",
  gainLoss: "Ls",
  defFront: "Bear",
  defStr: "Strong",
  coverage: "Cov 3",
  blitz: "No",
  game: "BUF vs LA 01.01.26",
  epa: -2.1,
  successRate: false,
  explosivePlay: false,
  formationName: "Empty Strong",
  isShotgun: false,
  timeToPass: undefined,
  passLocation: undefined,
  runGap: undefined,
  isTwoMinuteDrill: false,
  offenseIds: ["ath-015"],
  defenseIds: ["ath-041"],
  playType: "Special Teams",
  passResult: undefined,
  runDirection: undefined,
  personnelO: "Empty",
  personnelD: "Goal Line",
  isTouchdown: false,
  isFirstDown: false,
  isPenalty: true,
  penaltyType: "Offsides",
}

/** A short touchdown pass that matches "Short: 1-3" distance chip. */
const shortTDPass: PlayData = {
  ...passPlay,
  id: "test-short-td",
  distance: 2,
  isTouchdown: true,
  isFirstDown: true,
  yards: 8,
}

const ALL_PLAYS = [passPlay, runPlay, specialPlay, shortTDPass]

// ---------------------------------------------------------------------------
// getValueForCategory
// ---------------------------------------------------------------------------

describe("getValueForCategory", () => {
  it("returns the string quarter", () => {
    expect(getValueForCategory(passPlay, "quarter")).toBe("2")
  })

  it("returns the string down", () => {
    expect(getValueForCategory(runPlay, "down")).toBe("3")
  })

  it("returns odk", () => {
    expect(getValueForCategory(specialPlay, "odk")).toBe("K")
  })

  it("returns hash", () => {
    expect(getValueForCategory(passPlay, "hash")).toBe("L")
  })

  it("returns playType", () => {
    expect(getValueForCategory(runPlay, "playType")).toBe("Run")
  })

  it("returns passResult for a pass play", () => {
    expect(getValueForCategory(passPlay, "passResult")).toBe("Complete")
  })

  it('returns "" for passResult on a run play', () => {
    expect(getValueForCategory(runPlay, "passResult")).toBe("")
  })

  it("returns runDirection for a run play", () => {
    expect(getValueForCategory(runPlay, "runDirection")).toBe("Left")
  })

  it('returns "" for runDirection on a pass play', () => {
    expect(getValueForCategory(passPlay, "runDirection")).toBe("")
  })

  it('returns "Yes"/"No" for boolean fields', () => {
    expect(getValueForCategory(shortTDPass, "isTouchdown")).toBe("Yes")
    expect(getValueForCategory(passPlay, "isTouchdown")).toBe("No")
    expect(getValueForCategory(passPlay, "isFirstDown")).toBe("Yes")
    expect(getValueForCategory(specialPlay, "isPenalty")).toBe("Yes")
    expect(getValueForCategory(passPlay, "isPenalty")).toBe("No")
  })

  it("returns gainLoss", () => {
    expect(getValueForCategory(passPlay, "gainLoss")).toBe("Gn")
    expect(getValueForCategory(specialPlay, "gainLoss")).toBe("Ls")
  })

  it("returns game name", () => {
    expect(getValueForCategory(passPlay, "game")).toBe("BUF vs LA 01.01.26")
  })

  it("returns personnel strings", () => {
    expect(getValueForCategory(passPlay, "personnelO")).toBe("11")
    expect(getValueForCategory(runPlay, "personnelD")).toBe("Base")
  })

  it('returns "" for an unknown category', () => {
    expect(getValueForCategory(passPlay, "nonexistent")).toBe("")
  })
})

// ---------------------------------------------------------------------------
// getNumericValueForRange
// ---------------------------------------------------------------------------

describe("getNumericValueForRange", () => {
  it("returns yardLineNumeric for yardLine category", () => {
    expect(getNumericValueForRange(passPlay, "yardLine")).toBe(30)
    expect(getNumericValueForRange(runPlay, "yardLine")).toBe(45)
  })

  it("returns distance for distanceRange category", () => {
    expect(getNumericValueForRange(passPlay, "distanceRange")).toBe(5)
    expect(getNumericValueForRange(shortTDPass, "distanceRange")).toBe(2)
  })

  it("returns yards for yardsAfterContactRange", () => {
    expect(getNumericValueForRange(runPlay, "yardsAfterContactRange")).toBe(3)
  })

  it("returns yards for puntReturnRange", () => {
    expect(getNumericValueForRange(passPlay, "puntReturnRange")).toBe(12)
  })

  it("returns yards for kickoffReturnRange", () => {
    expect(getNumericValueForRange(specialPlay, "kickoffReturnRange")).toBe(0)
  })

  it("returns null for an unknown category", () => {
    expect(getNumericValueForRange(passPlay, "nonexistent")).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// matchesSetFilters
// ---------------------------------------------------------------------------

describe("matchesSetFilters", () => {
  it("returns true when no active categories are provided", () => {
    expect(matchesSetFilters(passPlay, [])).toBe(true)
  })

  it("matches a single category with one value", () => {
    const cats: [string, Set<string>][] = [["down", new Set(["2"])]]
    expect(matchesSetFilters(passPlay, cats)).toBe(true)
    expect(matchesSetFilters(runPlay, cats)).toBe(false) // down=3
  })

  it("matches a single category with multiple values (OR within category)", () => {
    const cats: [string, Set<string>][] = [["down", new Set(["2", "3"])]]
    expect(matchesSetFilters(passPlay, cats)).toBe(true)
    expect(matchesSetFilters(runPlay, cats)).toBe(true)
    expect(matchesSetFilters(specialPlay, cats)).toBe(false) // down=1
  })

  it("applies AND logic across multiple categories", () => {
    const cats: [string, Set<string>][] = [
      ["down", new Set(["2"])],
      ["playType", new Set(["Pass"])],
    ]
    expect(matchesSetFilters(passPlay, cats)).toBe(true) // down=2, Pass
    expect(matchesSetFilters(runPlay, cats)).toBe(false) // down=3
  })

  it("handles the special distanceType chip logic — Short: 1-3", () => {
    const cats: [string, Set<string>][] = [
      ["distanceType", new Set(["Short: 1-3"])],
    ]
    expect(matchesSetFilters(shortTDPass, cats)).toBe(true) // distance=2
    expect(matchesSetFilters(passPlay, cats)).toBe(false) // distance=5
  })

  it("handles distanceType — Medium: 4-7", () => {
    const cats: [string, Set<string>][] = [
      ["distanceType", new Set(["Medium: 4-7"])],
    ]
    expect(matchesSetFilters(passPlay, cats)).toBe(true) // distance=5
    expect(matchesSetFilters(runPlay, cats)).toBe(false) // distance=1
  })

  it("handles distanceType — Long: 8+", () => {
    const cats: [string, Set<string>][] = [
      ["distanceType", new Set(["Long: 8+"])],
    ]
    expect(matchesSetFilters(specialPlay, cats)).toBe(true) // distance=10
    expect(matchesSetFilters(passPlay, cats)).toBe(false) // distance=5
  })

  it("handles distanceType with multiple chips selected (OR)", () => {
    const cats: [string, Set<string>][] = [
      ["distanceType", new Set(["Short: 1-3", "Long: 8+"])],
    ]
    expect(matchesSetFilters(shortTDPass, cats)).toBe(true) // distance=2
    expect(matchesSetFilters(specialPlay, cats)).toBe(true) // distance=10
    expect(matchesSetFilters(passPlay, cats)).toBe(false) // distance=5
  })

  it("rejects when distanceType has no matching chip", () => {
    const cats: [string, Set<string>][] = [
      ["distanceType", new Set(["Short: 1-3"])],
    ]
    // distance=10 does not fall in 1-3
    expect(matchesSetFilters(specialPlay, cats)).toBe(false)
  })

  it("handles boolean fields via isTouchdown", () => {
    const cats: [string, Set<string>][] = [
      ["isTouchdown", new Set(["Yes"])],
    ]
    expect(matchesSetFilters(shortTDPass, cats)).toBe(true)
    expect(matchesSetFilters(passPlay, cats)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// matchesRangeFilters
// ---------------------------------------------------------------------------

describe("matchesRangeFilters", () => {
  it("returns true when no active ranges are provided", () => {
    expect(matchesRangeFilters(passPlay, [])).toBe(true)
  })

  it("matches a yard-line range (inclusive bounds)", () => {
    const ranges: [string, [number, number]][] = [["yardLine", [25, 35]]]
    expect(matchesRangeFilters(passPlay, ranges)).toBe(true) // yardLineNumeric=30
    expect(matchesRangeFilters(runPlay, ranges)).toBe(false) // yardLineNumeric=45
  })

  it("matches an exact boundary value", () => {
    const ranges: [string, [number, number]][] = [["yardLine", [30, 30]]]
    expect(matchesRangeFilters(passPlay, ranges)).toBe(true)
    expect(matchesRangeFilters(runPlay, ranges)).toBe(false)
  })

  it("matches a single-point filter (lo === hi)", () => {
    const ranges: [string, [number, number]][] = [["yardLine", [45, 45]]]
    expect(matchesRangeFilters(runPlay, ranges)).toBe(true) // exactly 45
    expect(matchesRangeFilters(passPlay, ranges)).toBe(false)
  })

  it("matches distance range", () => {
    const ranges: [string, [number, number]][] = [["distanceRange", [1, 5]]]
    expect(matchesRangeFilters(passPlay, ranges)).toBe(true) // distance=5
    expect(matchesRangeFilters(specialPlay, ranges)).toBe(false) // distance=10
  })

  it("applies AND logic across multiple range filters", () => {
    const ranges: [string, [number, number]][] = [
      ["yardLine", [20, 50]],
      ["distanceRange", [1, 3]],
    ]
    // passPlay: yardLine=30 (in 20-50) but distance=5 (out of 1-3)
    expect(matchesRangeFilters(passPlay, ranges)).toBe(false)
    // runPlay: yardLine=45 (in 20-50) and distance=1 (in 1-3)
    expect(matchesRangeFilters(runPlay, ranges)).toBe(true)
  })

  it("returns false when the category is unknown (null numeric value)", () => {
    const ranges: [string, [number, number]][] = [["bogusRange", [0, 100]]]
    expect(matchesRangeFilters(passPlay, ranges)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// matchesFilters (combined)
// ---------------------------------------------------------------------------

describe("matchesFilters", () => {
  it("returns true when both filter states are empty", () => {
    expect(matchesFilters(passPlay, {}, {})).toBe(true)
  })

  it("applies set filters only", () => {
    const filters: FilterState = { down: new Set(["2"]) }
    expect(matchesFilters(passPlay, filters, {})).toBe(true)
    expect(matchesFilters(runPlay, filters, {})).toBe(false)
  })

  it("applies range filters only", () => {
    const ranges: RangeFilterState = { yardLine: [40, 50] }
    expect(matchesFilters(runPlay, {}, ranges)).toBe(true) // yardLine=45
    expect(matchesFilters(passPlay, {}, ranges)).toBe(false) // yardLine=30
  })

  it("applies both set and range filters (AND)", () => {
    const filters: FilterState = { playType: new Set(["Run"]) }
    const ranges: RangeFilterState = { yardLine: [40, 50] }
    expect(matchesFilters(runPlay, filters, ranges)).toBe(true)
    expect(matchesFilters(passPlay, filters, ranges)).toBe(false)
  })

  it("rejects when set matches but range does not", () => {
    const filters: FilterState = { playType: new Set(["Run"]) }
    const ranges: RangeFilterState = { yardLine: [0, 10] }
    // runPlay matches playType but yardLine=45 is out of 0-10
    expect(matchesFilters(runPlay, filters, ranges)).toBe(false)
  })

  it("ignores empty Sets in FilterState", () => {
    const filters: FilterState = { down: new Set() }
    // An empty set has size 0, so it's filtered out — everything matches
    expect(matchesFilters(passPlay, filters, {})).toBe(true)
    expect(matchesFilters(runPlay, filters, {})).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// filterPlays
// ---------------------------------------------------------------------------

describe("filterPlays", () => {
  it("returns the SAME array reference when no filters are active", () => {
    const result = filterPlays(ALL_PLAYS, {}, {})
    expect(result).toBe(ALL_PLAYS) // strict reference equality
  })

  it("returns the same reference when only empty Sets are present", () => {
    const result = filterPlays(ALL_PLAYS, { down: new Set() }, {})
    expect(result).toBe(ALL_PLAYS)
  })

  it("filters by a single set category", () => {
    const filters: FilterState = { playType: new Set(["Pass"]) }
    const result = filterPlays(ALL_PLAYS, filters, {})
    // passPlay and shortTDPass are Pass plays
    expect(result).toHaveLength(2)
    expect(result.every((p) => p.playType === "Pass")).toBe(true)
  })

  it("filters by multiple set categories (AND)", () => {
    const filters: FilterState = {
      playType: new Set(["Pass"]),
      isTouchdown: new Set(["Yes"]),
    }
    const result = filterPlays(ALL_PLAYS, filters, {})
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("test-short-td")
  })

  it("filters by range only", () => {
    const ranges: RangeFilterState = { yardLine: [0, 32] }
    const result = filterPlays(ALL_PLAYS, {}, ranges)
    // passPlay (30) and shortTDPass (30) match; runPlay (45) and specialPlay (35) do not
    expect(result).toHaveLength(2)
  })

  it("filters by combined set + range", () => {
    const filters: FilterState = { playType: new Set(["Pass"]) }
    const ranges: RangeFilterState = { distanceRange: [1, 3] }
    const result = filterPlays(ALL_PLAYS, filters, ranges)
    // Only shortTDPass: Pass + distance=2
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("test-short-td")
  })

  it("returns empty array when nothing matches", () => {
    const filters: FilterState = { playType: new Set(["Pass"]) }
    const ranges: RangeFilterState = { yardLine: [99, 100] }
    const result = filterPlays(ALL_PLAYS, filters, ranges)
    expect(result).toHaveLength(0)
  })

  it("handles filtering a single-element array", () => {
    const filters: FilterState = { down: new Set(["2"]) }
    const result = filterPlays([passPlay], filters, {})
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(passPlay)
  })

  it("handles filtering an empty array", () => {
    const filters: FilterState = { down: new Set(["2"]) }
    const result = filterPlays([], filters, {})
    expect(result).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("edge cases", () => {
  it("handles a play with yardLineNumeric = 0", () => {
    const zeroYardPlay: PlayData = { ...passPlay, yardLineNumeric: 0 }
    const ranges: [string, [number, number]][] = [["yardLine", [0, 0]]]
    expect(matchesRangeFilters(zeroYardPlay, ranges)).toBe(true)
  })

  it("handles distance at exact chip boundaries", () => {
    const d3: PlayData = { ...passPlay, distance: 3 }
    const d4: PlayData = { ...passPlay, distance: 4 }
    const d7: PlayData = { ...passPlay, distance: 7 }
    const d8: PlayData = { ...passPlay, distance: 8 }

    const short: [string, Set<string>][] = [["distanceType", new Set(["Short: 1-3"])]]
    const medium: [string, Set<string>][] = [["distanceType", new Set(["Medium: 4-7"])]]
    const long: [string, Set<string>][] = [["distanceType", new Set(["Long: 8+"])]]

    expect(matchesSetFilters(d3, short)).toBe(true) // upper boundary
    expect(matchesSetFilters(d3, medium)).toBe(false)
    expect(matchesSetFilters(d4, medium)).toBe(true) // lower boundary
    expect(matchesSetFilters(d7, medium)).toBe(true) // upper boundary
    expect(matchesSetFilters(d7, long)).toBe(false)
    expect(matchesSetFilters(d8, long)).toBe(true) // lower boundary
  })

  it("handles passResult = undefined safely", () => {
    // runPlay has passResult=undefined, getValueForCategory returns ""
    const cats: [string, Set<string>][] = [["passResult", new Set(["Complete"])]]
    expect(matchesSetFilters(runPlay, cats)).toBe(false)
  })

  it("handles runDirection = undefined safely", () => {
    const cats: [string, Set<string>][] = [["runDirection", new Set(["Left"])]]
    expect(matchesSetFilters(passPlay, cats)).toBe(false)
  })

  it("treats range lo > hi as impossible (no plays match)", () => {
    // An inverted range should never match
    const ranges: [string, [number, number]][] = [["yardLine", [50, 10]]]
    expect(matchesRangeFilters(passPlay, ranges)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Performance: large dataset
// ---------------------------------------------------------------------------

describe("performance", () => {
  /** Generate N deterministic plays. */
  function generateTestPlays(count: number): PlayData[] {
    const formations = ["Trey Left", "Deuce Right", "Empty Strong", "Trips Right", "I-Form Tight"]
    return Array.from({ length: count }, (_, i): PlayData => ({
      id: `perf-${i}`,
      playNumber: i + 1,
      odk: i % 3 === 0 ? "O" : i % 3 === 1 ? "D" : "K",
      quarter: (i % 4) + 1,
      down: (i % 4) + 1,
      distance: (i % 10) + 1,
      yardLine: `+${i % 50}`,
      yardLineNumeric: i % 50,
      hash: (["L", "R", "M"] as const)[i % 3],
      yards: i % 20,
      result: i % 2 === 0 ? "Complete" : "Run",
      gainLoss: i % 4 === 0 ? "Ls" : "Gn",
      defFront: "Over",
      defStr: "Strong",
      coverage: "Cov 2",
      blitz: i % 5 === 0 ? "Yes" : "No",
      game: "PERF Game",
      epa: ((i % 80) - 35) / 10,
      successRate: i % 2 === 0,
      explosivePlay: i % 20 > 15,
      formationName: formations[i % formations.length],
      isShotgun: i % 3 === 0,
      timeToPass: i % 3 === 0 ? 2.5 : undefined,
      passLocation: i % 3 === 0 ? "Middle" : undefined,
      runGap: i % 3 === 1 ? "B-Gap" : undefined,
      isTwoMinuteDrill: i % 20 === 0,
      offenseIds: [`ath-${String((i % 26) + 1).padStart(3, '0')}`],
      defenseIds: [`ath-${String((i % 24) + 27).padStart(3, '0')}`],
      playType: i % 3 === 0 ? "Pass" : i % 3 === 1 ? "Run" : "Special Teams",
      passResult: i % 3 === 0 ? "Complete" : undefined,
      runDirection: i % 3 === 1 ? "Left" : undefined,
      personnelO: "11",
      personnelD: "Nickel",
      isTouchdown: i % 20 === 0,
      isFirstDown: i % 3 === 0,
      isPenalty: i % 15 === 0,
      penaltyType: i % 15 === 0 ? "Holding" : undefined,
    }))
  }

  it("filters 5,000 plays with 3 set categories in under 50ms", () => {
    const plays = generateTestPlays(5_000)
    const filters: FilterState = {
      playType: new Set(["Pass"]),
      down: new Set(["1", "3"]),
      hash: new Set(["L"]),
    }

    const start = performance.now()
    const result = filterPlays(plays, filters, {})
    const elapsed = performance.now() - start

    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThan(plays.length)
    expect(elapsed).toBeLessThan(50)
  })

  it("filters 5,000 plays with 2 range filters in under 50ms", () => {
    const plays = generateTestPlays(5_000)
    const ranges: RangeFilterState = {
      yardLine: [10, 30],
      distanceRange: [1, 5],
    }

    const start = performance.now()
    const result = filterPlays(plays, {}, ranges)
    const elapsed = performance.now() - start

    expect(result.length).toBeGreaterThan(0)
    expect(elapsed).toBeLessThan(50)
  })

  it("filters 10,000 plays with combined set + range in under 100ms", () => {
    const plays = generateTestPlays(10_000)
    const filters: FilterState = {
      playType: new Set(["Pass", "Run"]),
      down: new Set(["2"]),
    }
    const ranges: RangeFilterState = {
      yardLine: [15, 40],
    }

    const start = performance.now()
    const result = filterPlays(plays, filters, ranges)
    const elapsed = performance.now() - start

    expect(result.length).toBeGreaterThan(0)
    expect(elapsed).toBeLessThan(100)
  })

  it("returns original array reference for 10,000 plays with empty filters", () => {
    const plays = generateTestPlays(10_000)

    const start = performance.now()
    const result = filterPlays(plays, {}, {})
    const elapsed = performance.now() - start

    expect(result).toBe(plays) // strict reference equality
    expect(elapsed).toBeLessThan(5) // should be nearly instant
  })
})
