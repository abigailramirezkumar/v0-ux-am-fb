export interface Play {
  id: string
  playNumber: number
  quarter: number
  down: number
  distance: number
  yardline: number
  gain: number
  series: number
  markIn: number // Frames
  duration: number // Frames
}

export function parseXchange(xml: string): Play[] {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xml, "text/xml")
  const playNodes = xmlDoc.getElementsByTagName("Play")

  const plays: Play[] = []

  for (let i = 0; i < playNodes.length; i++) {
    const node = playNodes[i]

    // Helper to safely get tag content
    const getVal = (tag: string, def = "0") => {
      const el = node.getElementsByTagName(tag)[0]
      return el ? el.textContent || def : def
    }

    // Parse View Timing
    // Strategy: Look for "SL" (Sideline) view first, else default to first view
    const viewNodes = node.getElementsByTagName("View")
    let markIn = 0
    let duration = 0

    for (let j = 0; j < viewNodes.length; j++) {
      const view = viewNodes[j]
      const cam = view.getElementsByTagName("CameraView")[0]?.textContent
      const m = Number.parseInt(view.getElementsByTagName("MarkIn")[0]?.textContent || "0")
      const d = Number.parseInt(view.getElementsByTagName("Duration")[0]?.textContent || "0")

      if (cam === "SL") {
        markIn = m
        duration = d
        break
      }
      // Fallback to first view found if no SL yet
      if (j === 0) {
        markIn = m
        duration = d
      }
    }

    plays.push({
      id: getVal("FullSequence"),
      playNumber: Number.parseInt(getVal("PlayNumber")),
      quarter: Number.parseInt(getVal("Quarter")),
      down: Number.parseInt(getVal("Down")),
      distance: Number.parseInt(getVal("Distance")),
      yardline: Number.parseInt(getVal("Yardline")),
      gain: Number.parseInt(getVal("Gain")),
      series: Number.parseInt(getVal("Series")),
      markIn,
      duration,
    })
  }

  return plays
}
