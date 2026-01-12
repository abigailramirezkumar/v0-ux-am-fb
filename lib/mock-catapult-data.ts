import type { FolderData } from "@/components/folder"
import type { LibraryItemData } from "@/components/library-item"

// Helper to generate random library items for leaf nodes
const generateLeafItems = (year: number, folderId: string, count = 2): LibraryItemData[] => {
  const items: LibraryItemData[] = []

  // NFL-style dates (approximate regular season start)
  const baseMonth = 9 // September
  const baseDay = 8

  for (let i = 0; i < count; i++) {
    const month = baseMonth + Math.floor(Math.random() * 4)
    const day = baseDay + i * 7
    const dateStr = `${String(month).padStart(2, "0")} ${String(day).padStart(2, "0")} ${year.toString().slice(-2)}`

    // Randomize some metadata
    const durationMin = 20 + Math.floor(Math.random() * 100)
    const sizeGB = (1 + Math.random() * 4).toFixed(1)

    items.push({
      id: `item-${folderId}-${i}`,
      name: `${dateStr} Sample Game`,
      type: "video",
      dateModified: `Oct ${10 + i}, ${year}`,
      createdDate: `Sep ${day}, ${year}`,
      hasData: Math.random() > 0.3,
      itemCount: Math.floor(Math.random() * 150) + 50, // Clip count
      duration: `${Math.floor(durationMin / 60)}:${String(durationMin % 60).padStart(2, "0")}:00`,
      size: `${sizeGB} GB`,
      angles: 2 + Math.floor(Math.random() * 3),
      comments: Math.floor(Math.random() * 20),
    })
  }

  return items
}

// --- Structure Generators ---

function createSelfScoutSubfolderStructure(year: number, parentId: string): FolderData[] {
  const baseId = `${parentId}-sub`

  const structure: { name: string; children?: { name: string }[] }[] = [
    { name: "Masters Work" },
    { name: "Masters" },
    { name: "Practice Masters" },
    { name: "Offensive Reporting" },
    { name: "Defensive Reporting" },
    { name: "Special Team Reporting" },
    {
      name: "Offense Share",
      children: [
        { name: "Games" },
        { name: "Preseason Games" },
        { name: "Cutups" },
        { name: "Hot Folder" },
        { name: "Meetings" },
        { name: "Practice Drills" },
        { name: "Player Profiles" },
        { name: "Situational Masters" },
      ],
    },
    { name: "Defense Share" },
    { name: "Special Teams Share" },
    { name: "Gameday" },
    { name: "Temp Plane Work" },
    { name: "Work" },
  ]

  return structure.map((f, i) => {
    const id = `${baseId}-${i}`
    const children = f.children
      ? f.children.map((c, j) => ({
          id: `${id}-${j}`,
          name: c.name,
          dateModified: `Dec ${10 + j}, ${year}`,
          items: generateLeafItems(year, `${id}-${j}`),
        }))
      : undefined

    return {
      id,
      name: f.name,
      dateModified: `Dec ${5 + i}, ${year}`,
      children,
      items: children ? undefined : generateLeafItems(year, id),
    }
  })
}

function createTrainingCampStructure(year: number, parentId: string): FolderData[] {
  const baseId = `${parentId}-tc`

  const structure: { name: string; children?: { name: string }[] }[] = [
    { name: "Masters Work" },
    { name: "Meeting Masters" },
    {
      name: "Practice Masters",
      children: [{ name: "Practice Masters Today" }],
    },
    { name: "Offense Share" },
    { name: "Defense Share" },
    { name: "Special Teams Share" },
    { name: "Work" },
  ]

  return structure.map((f, i) => {
    const id = `${baseId}-${i}`
    const children = f.children
      ? f.children.map((c, j) => ({
          id: `${id}-${j}`,
          name: c.name,
          dateModified: `Jul 25, ${year}`,
          items: generateLeafItems(year, `${id}-${j}`),
        }))
      : undefined

    return {
      id,
      name: f.name,
      dateModified: `Jul ${15 + i}, ${year}`,
      children,
      items: children ? undefined : generateLeafItems(year, id),
    }
  })
}

function createOffseasonStudiesStructure(year: number, parentId: string): FolderData[] {
  const baseId = `${parentId}-off`

  const structure: { name: string; children?: { name: string }[] }[] = [
    {
      name: "Offense Share",
      children: [
        { name: "Hot Folder" },
        { name: "13 GB OFF PFF Cutups" },
        { name: `${year} LaFleur Cutups` },
        { name: `${year.toString().slice(-2)} CIN OFF PFF Cutups` },
        { name: `${year.toString().slice(-2)} LA OFF PFF Cutups` },
      ],
    },
    { name: "Defense Share" },
    { name: "Special Teams Share" },
    { name: "Work" },
  ]

  return structure.map((f, i) => {
    const id = `${baseId}-${i}`
    const children = f.children
      ? f.children.map((c, j) => ({
          id: `${id}-${j}`,
          name: c.name,
          dateModified: `Feb ${5 + j}, ${year}`,
          items: generateLeafItems(year, `${id}-${j}`),
        }))
      : undefined

    return {
      id,
      name: f.name,
      dateModified: `Jan ${10 + i}, ${year}`,
      children,
      items: children ? undefined : generateLeafItems(year, id),
    }
  })
}

function createMiniCampOTAStructure(year: number, parentId: string): FolderData[] {
  const baseId = `${parentId}-ota`

  const structure: { name: string; children?: { name: string }[] }[] = [
    { name: "Masters Work" },
    { name: "Meeting Masters" },
    { name: "Practice Masters" },
    {
      name: "Offense Share",
      children: [
        { name: "Mini Camp OTA Installs" },
        { name: "Hot Folder" },
        { name: "Workouts" },
        { name: "Meetings" },
        { name: "Cutups" },
        { name: "Phase 1 Field Work Week 01" },
        { name: "Phase 1 Field Work Week 02" },
        { name: "Phase 2 Practice Week 01" },
        { name: "Phase 2 Practice Week 02" },
        { name: "Phase 3 Practice Week 01" },
        { name: "Mauicamp Practice" },
        { name: "Practice Drills" },
      ],
    },
    { name: "Defense Share" },
    { name: "Special Teams Share" },
    { name: "Work" },
  ]

  return structure.map((f, i) => {
    const id = `${baseId}-${i}`
    const children = f.children
      ? f.children.map((c, j) => ({
          id: `${id}-${j}`,
          name: c.name,
          dateModified: `May ${25 + j}, ${year}`,
          items: generateLeafItems(year, `${id}-${j}`),
        }))
      : undefined

    return {
      id,
      name: f.name,
      dateModified: `May ${15 + i}, ${year}`,
      children,
      items: children ? undefined : generateLeafItems(year, id),
    }
  })
}

function createSelfScoutYearFolders(): FolderData[] {
  const yearFolders: FolderData[] = []

  // Create folders for years 2020-2025 (Reduced range for performance, can extend to 2006)
  for (let year = 2025; year >= 2020; year--) {
    const yearId = `self-scout-${year}`
    yearFolders.push({
      id: yearId,
      name: year.toString(),
      dateModified: `Dec 31, ${year}`,
      children: [
        {
          id: `${yearId}-offseason`,
          name: "Offseason Studies",
          children: createOffseasonStudiesStructure(year, `${yearId}-offseason`),
        },
        {
          id: `${yearId}-minicamp`,
          name: "Mini-Camp OTA",
          children: createMiniCampOTAStructure(year, `${yearId}-minicamp`),
        },
        {
          id: `${yearId}-training-camp`,
          name: "Training Camp",
          children: createTrainingCampStructure(year, `${yearId}-training-camp`),
        },
        {
          id: `${yearId}-self-scout`,
          name: "Self Scout",
          children: createSelfScoutSubfolderStructure(year, `${yearId}-self-scout`),
        },
      ],
    })
  }

  return yearFolders
}

function createDetailedOpponentStructure(year: number, teamName: string, parentId: string): FolderData[] {
  const teamSlug = teamName.toLowerCase().replace(/\s+/g, "-")
  const baseId = `${parentId}-${year}-${teamSlug}`

  const createStandardSubfolders = (sectionId: string) =>
    [
      { name: "Games" },
      { name: "Breakdown Games" },
      { name: "Cutups" },
      { name: "Meetings" },
      { name: "Practice 01" },
      { name: "Practice 02" },
      { name: "Practice 03" },
    ].map((f, i) => ({
      id: `${sectionId}-${i}`,
      name: f.name,
      dateModified: `Dec 14, ${year}`,
      items: generateLeafItems(year, `${sectionId}-${i}`),
    }))

  const structure: { name: string; children?: FolderData[] }[] = [
    { name: "Masters Work" },
    { name: "Meeting Masters" },
    { name: "Practice Masters" },
    { name: "Offensive Reporting" },
    { name: "Special Teams Reporting" },
    {
      name: "Offense Share",
      children: createStandardSubfolders(`${baseId}-off`),
    },
    {
      name: "Defense Share",
      children: createStandardSubfolders(`${baseId}-def`),
    },
    {
      name: "Special Teams Share",
      children: createStandardSubfolders(`${baseId}-st`),
    },
    { name: "Work" },
  ]

  return structure.map((f, i) => {
    const id = `${baseId}-${i}`

    return {
      id,
      name: f.name,
      dateModified: `Dec 14, ${year}`,
      children: f.children,
      items: f.children ? undefined : generateLeafItems(year, id),
    }
  })
}

function createTeamStructure(teamName: string, teamNickname: string): FolderData {
  const years: FolderData[] = []
  const teamId = teamName.toLowerCase().replace(/\s+/g, "-")

  // Create year folders from 2022-2025
  for (let year = 2022; year <= 2025; year++) {
    const yearId = `${teamId}-${year}`
    years.push({
      id: yearId,
      name: `${year} ${teamNickname}`,
      dateModified: `Dec 14, ${year}`,
      children: createDetailedOpponentStructure(year, teamNickname, yearId),
    })
  }

  return {
    id: teamId,
    name: teamName,
    dateModified: "Dec 14, 2024",
    children: years,
  }
}

function createCollegeScoutingStructure(yearRange: string): FolderData[] {
  const parentId = `scouting-${yearRange}`
  const endYear = Number.parseInt(yearRange.split("-")[1])

  const createAlphabetFolders = (prefix: string) => {
    const schools = [
      "A Schools",
      "C Schools",
      "D Schools",
      "F Schools",
      "G Schools",
      "H Schools",
      "I Schools",
      "K Schools",
      "L Schools",
      "M Schools",
      "N Schools",
      "O Schools",
      "P Schools",
      "R Schools",
      "S Schools",
      "T Schools",
      "U Schools",
      "V Schools",
      "W Schools",
    ]
    return schools.map((school, i) => ({
      id: `${prefix}-${i}`,
      name: school,
      dateModified: "Feb 15, 2025",
      items: generateLeafItems(endYear, `${prefix}-${i}`, 3),
    }))
  }

  interface ScoutingFolder {
    name: string
    items?: boolean
    children?: ScoutingFolder[]
  }

  const structure: ScoutingFolder[] = [
    { name: "Masters", items: true },
    { name: "Masters Working", items: true },
    {
      name: "College Games",
      children: [{ name: "Division I" }, { name: "Division II - Others" }],
    },
    {
      name: "All Star Games",
      children: [
        {
          name: "Senior Bowl",
          children: [
            { name: "Hot Folder", items: true },
            { name: "Game", items: true },
            { name: "American Team Practice", items: true },
            { name: "National Team Practice", items: true },
            { name: "TV Content", items: true },
          ],
        },
        {
          name: "East-West Shrine Bowl",
          children: [
            { name: "Hot Folder", items: true },
            { name: "Game", items: true },
            { name: "East Team Practice", items: true },
            { name: "West Team Practice", items: true },
          ],
        },
        { name: "Hula Bowl", items: true },
        { name: "Tropical Bowl", items: true },
      ],
    },
    {
      name: "Combine",
      children: [
        { name: "Informal Interviews", items: true },
        { name: "Position Workouts", items: true },
        { name: "TV Broadcast", items: true },
      ],
    },
    { name: "Pro Days", items: true },
    { name: "NFL Games", items: true },
  ]

  const processChildren = (children: ScoutingFolder[], parentPrefix: string): FolderData[] => {
    return children.map((c, j) => {
      const childId = `${parentPrefix}-${j}`
      let processedChildren: FolderData[] | undefined = undefined

      if (c.name === "Division I" || c.name === "Division II - Others") {
        processedChildren = createAlphabetFolders(childId)
      } else if (c.children) {
        processedChildren = processChildren(c.children, childId)
      }

      return {
        id: childId,
        name: c.name,
        dateModified: "Feb 10, 2025",
        items: c.items ? generateLeafItems(endYear, childId) : undefined,
        children: processedChildren,
      }
    })
  }

  return structure.map((f, i) => {
    const id = `${parentId}-${i}`

    return {
      id,
      name: f.name,
      dateModified: "Feb 8, 2025",
      items: f.items ? generateLeafItems(endYear, id) : undefined,
      children: f.children ? processChildren(f.children, id) : undefined,
    }
  })
}

// --- Main Data Export ---

export const mockCatapultData: FolderData[] = [
  {
    id: "self-scout",
    name: "Self Scout",
    dateModified: "Dec 15, 2024",
    createdDate: "Sep 1, 2010",
    children: createSelfScoutYearFolders(),
  },
  {
    id: "opponent-scout",
    name: "Opponent Scout",
    dateModified: "Dec 14, 2024",
    children: [
      createTeamStructure("Arizona Cardinals", "Cardinals"),
      createTeamStructure("Atlanta Falcons", "Falcons"),
      createTeamStructure("Baltimore Ravens", "Ravens"),
      createTeamStructure("Buffalo Bills", "Bills"),
      createTeamStructure("Chicago Bears", "Bears"),
      createTeamStructure("Dallas Cowboys", "Cowboys"),
      createTeamStructure("Denver Broncos", "Broncos"),
      createTeamStructure("Detroit Lions", "Lions"),
      createTeamStructure("Green Bay Packers", "Packers"),
      createTeamStructure("Kansas City Chiefs", "Chiefs"),
      createTeamStructure("Los Angeles Rams", "Rams"),
      createTeamStructure("Minnesota Vikings", "Vikings"),
      createTeamStructure("New England Patriots", "Patriots"),
      createTeamStructure("New Orleans Saints", "Saints"),
      createTeamStructure("New York Giants", "Giants"),
      createTeamStructure("Philadelphia Eagles", "Eagles"),
      createTeamStructure("San Francisco 49ers", "49ers"),
      createTeamStructure("Seattle Seahawks", "Seahawks"),
    ],
  },
  {
    id: "scouting",
    name: "Scouting",
    dateModified: "Dec 13, 2024",
    children: [
      {
        id: "scouting-2023-2024",
        name: "2023-2024",
        dateModified: "May 15, 2024",
        children: createCollegeScoutingStructure("2023-2024"),
      },
      {
        id: "scouting-2024-2025",
        name: "2024-2025",
        dateModified: "May 15, 2025",
        children: createCollegeScoutingStructure("2024-2025"),
      },
      {
        id: "scouting-2025-2026",
        name: "2025-2026",
        dateModified: "May 15, 2026",
        children: createCollegeScoutingStructure("2025-2026"),
      },
    ],
  },
  {
    id: "practice",
    name: "Practice",
    dateModified: "Dec 11, 2024",
    items: generateLeafItems(2024, "practice"),
  },
  {
    id: "special-projects",
    name: "Special Projects",
    dateModified: "Dec 8, 2024",
    items: generateLeafItems(2024, "special-projects"),
  },
  {
    id: "analytics",
    name: "Performance Analytics",
    dateModified: "Dec 6, 2024",
    items: generateLeafItems(2024, "analytics"),
  },
]
