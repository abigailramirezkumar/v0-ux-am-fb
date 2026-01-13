"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { FolderData } from "@/components/folder"
import type { LibraryItemData } from "@/components/library-item"

export type SortDirection = "asc" | "desc" | null

export interface Column {
  id: string
  label: string
  visible: boolean
  width: number
  align?: "left" | "center" | "right"
  fixed?: boolean
}

// --- DATA GENERATORS (Ported from useAuth.ts) ---

// Helper to generate random library items for leaf nodes so the UI isn't empty
const generateLeafItems = (year: number, folderId: string, count = 2): LibraryItemData[] => {
  const items: LibraryItemData[] = []

  const baseMonth = 9
  const baseDay = 8

  for (let i = 0; i < count; i++) {
    const month = baseMonth + Math.floor(Math.random() * 4)
    const day = baseDay + i * 7
    const dateStr = `${String(month).padStart(2, "0")} ${String(day).padStart(2, "0")} ${year.toString().slice(-2)}`
    const durationMin = 20 + Math.floor(Math.random() * 100)
    const sizeGB = (1 + Math.random() * 4).toFixed(1)

    items.push({
      id: `item-${folderId}-${i}`,
      name: `${dateStr} Sample Game`,
      type: "video",
      dateModified: `Oct ${10 + i}, ${year}`,
      createdDate: `Sep ${day}, ${year}`,
      hasData: Math.random() > 0.3,
      itemCount: Math.floor(Math.random() * 150) + 50,
      duration: `${Math.floor(durationMin / 60)}:${String(durationMin % 60).padStart(2, "0")}:00`,
      size: `${sizeGB} GB`,
      angles: 2 + Math.floor(Math.random() * 3),
      comments: Math.floor(Math.random() * 20),
      thumbnailUrl: "/football-field.png",
    })
  }
  return items
}

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

  for (let year = 2025; year >= 2006; year--) {
    const yearId = `self-scout-${year}`
    yearFolders.push({
      id: yearId,
      name: year.toString(),
      dateModified: `Dec 31, ${year}`,
      children: [
        {
          id: `${yearId}-offseason`,
          name: "Offseason Studies",
          dateModified: `Feb 28, ${year}`,
          children: createOffseasonStudiesStructure(year, `${yearId}-offseason`),
        },
        {
          id: `${yearId}-minicamp`,
          name: "Mini-Camp OTA",
          dateModified: `Jun 15, ${year}`,
          children: createMiniCampOTAStructure(year, `${yearId}-minicamp`),
        },
        {
          id: `${yearId}-training-camp`,
          name: "Training Camp",
          dateModified: `Aug 15, ${year}`,
          children: createTrainingCampStructure(year, `${yearId}-training-camp`),
        },
        {
          id: `${yearId}-self-scout`,
          name: "Self Scout",
          dateModified: `Dec 31, ${year}`,
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

  const createStandardSubfolders = (sectionId: string): FolderData[] =>
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

  for (let year = 2008; year <= 2025; year++) {
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
  const yearStr = yearRange.split("-")[1] || "2025"
  const year = Number.parseInt(yearStr)

  const createSchoolFolders = (prefix: string): FolderData[] => {
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
      items: generateLeafItems(year, `${prefix}-${i}`, 2),
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
      children: [
        { name: "Division I", children: createSchoolFolders(`${parentId}-div1`) as unknown as ScoutingFolder[] },
        {
          name: "Division II - Others",
          children: createSchoolFolders(`${parentId}-div2`) as unknown as ScoutingFolder[],
        },
      ],
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
            { name: "American Player Profiles", items: true },
            { name: "National Player Profiles", items: true },
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
        { name: "HBCU Legacy Bowl", items: true },
        { name: "FCS Bowl", items: true },
        { name: "College Gridiron Showcase", items: true },
      ],
    },
    {
      name: "Combine",
      children: [
        { name: "Informal Interviews", items: true },
        { name: "Position Workouts", items: true },
        { name: "TV Broadcast", items: true },
        { name: "International Pipeline Players", items: true },
      ],
    },
    { name: "Pro Days", items: true },
    {
      name: "NFL Games",
      children: [
        "ARZ O-D-K",
        "ATL O-D-K",
        "BLT O-D-K",
        "BUF O-D-K",
        "CAR O-D-K",
        "CHI O-D-K",
        "CIN O-D-K",
        "CLV O-D-K",
        "DAL O-D-K",
        "DEN O-D-K",
        "DET O-D-K",
        "GB O-D-K",
        "HST O-D-K",
        "IND O-D-K",
        "JAX O-D-K",
        "KC O-D-K",
        "LA O-D-K",
        "LAC O-D-K",
        "LV O-D-K",
        "MIA O-D-K",
        "MIN O-D-K",
        "NE O-D-K",
        "NO O-D-K",
        "NYG O-D-K",
        "NYJ O-D-K",
        "PHI O-D-K",
        "PIT O-D-K",
        "SEA O-D-K",
        "SF O-D-K",
        "TB O-D-K",
        "TEN O-D-K",
        "WAS O-D-K",
      ].map((n) => ({ name: n, items: true })),
    },
    {
      name: "CFL Games",
      children: [
        "British Columbia",
        "Calgary",
        "Edmonton",
        "Hamilton",
        "Montreal",
        "Ottawa",
        "Saskatchewan",
        "Toronto",
        "Winnipeg",
      ].map((n) => ({ name: n, items: true })),
    },
    { name: "UFL Games", items: true },
    { name: "FA Workouts", items: true },
    { name: "NFS Cutups", items: true },
  ]

  return structure.map((f, i) => {
    const id = `${parentId}-${i}`

    let children: FolderData[] | undefined = undefined
    if (f.children) {
      children = f.children.map((c, j) => {
        const childId = `${id}-${j}`
        const grandChildren = (c as ScoutingFolder).children
          ? (c as ScoutingFolder).children!.map((gc, k) => ({
              id: `${childId}-${k}`,
              name: gc.name,
              dateModified: `Feb 8, ${year}`,
              items: gc.items ? generateLeafItems(year, `${childId}-${k}`) : undefined,
              children: (gc as ScoutingFolder).children as FolderData[] | undefined,
            }))
          : undefined

        return {
          id: childId,
          name: c.name,
          dateModified: `Feb 8, ${year}`,
          items: c.items ? generateLeafItems(year, childId) : undefined,
          children: grandChildren,
        }
      }) as FolderData[]
    }

    return {
      id,
      name: f.name,
      dateModified: `Feb 8, ${year}`,
      items: f.items ? generateLeafItems(year, id) : undefined,
      children,
    }
  })
}

function createScoutingFolders(): FolderData[] {
  const folders: FolderData[] = []
  for (let year = 2026; year >= 2009; year--) {
    const yearRange = `${year - 1}-${year}`
    folders.push({
      id: `scouting-${yearRange}`,
      name: yearRange,
      dateModified: `May 15, ${year}`,
      children: createCollegeScoutingStructure(yearRange),
    })
  }
  return folders
}

const generateRamsLibrary = (): FolderData[] => {
  return [
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
        createTeamStructure("Carolina Panthers", "Panthers"),
        createTeamStructure("Chicago Bears", "Bears"),
        createTeamStructure("Cincinnati Bengals", "Bengals"),
        createTeamStructure("Cleveland Browns", "Browns"),
        createTeamStructure("Dallas Cowboys", "Cowboys"),
        createTeamStructure("Denver Broncos", "Broncos"),
        createTeamStructure("Detroit Lions", "Lions"),
        createTeamStructure("Green Bay Packers", "Packers"),
        createTeamStructure("Houston Texans", "Texans"),
        createTeamStructure("Indianapolis Colts", "Colts"),
        createTeamStructure("Jacksonville Jaguars", "Jaguars"),
        createTeamStructure("Kansas City Chiefs", "Chiefs"),
        createTeamStructure("Las Vegas Raiders", "Raiders"),
        createTeamStructure("Los Angeles Chargers", "Chargers"),
        createTeamStructure("Miami Dolphins", "Dolphins"),
        createTeamStructure("Minnesota Vikings", "Vikings"),
        createTeamStructure("New England Patriots", "Patriots"),
        createTeamStructure("New Orleans Saints", "Saints"),
        createTeamStructure("New York Giants", "Giants"),
        createTeamStructure("New York Jets", "Jets"),
        createTeamStructure("Philadelphia Eagles", "Eagles"),
        createTeamStructure("Pittsburgh Steelers", "Steelers"),
        createTeamStructure("San Francisco 49ers", "49ers"),
        createTeamStructure("Seattle Seahawks", "Seahawks"),
        createTeamStructure("Tampa Bay Buccaneers", "Buccaneers"),
        createTeamStructure("Tennessee Titans", "Titans"),
        createTeamStructure("Washington Commanders", "Commanders"),
      ],
    },
    {
      id: "scouting",
      name: "Scouting",
      dateModified: "Dec 13, 2024",
      children: createScoutingFolders(),
    },
    {
      id: "visitor-share",
      name: "Visitor Share",
      dateModified: "Dec 12, 2024",
      items: generateLeafItems(2024, "visitor-share"),
    },
    {
      id: "practice",
      name: "Practice",
      dateModified: "Dec 11, 2024",
      items: generateLeafItems(2024, "practice"),
    },
    {
      id: "cge-network",
      name: "CGE Network",
      dateModified: "Dec 10, 2024",
      items: generateLeafItems(2024, "cge"),
    },
    {
      id: "coaches-project",
      name: "Coaches Project",
      dateModified: "Dec 9, 2024",
      items: generateLeafItems(2024, "coaches"),
    },
    {
      id: "special-projects",
      name: "Special Projects",
      dateModified: "Dec 8, 2024",
      items: generateLeafItems(2024, "special-projects"),
    },
    {
      id: "offense-play-concepts",
      name: "99-05_OFFENSE Play Concepts",
      dateModified: "Dec 7, 2024",
      items: generateLeafItems(2024, "play-concepts"),
    },
    {
      id: "analytics",
      name: "PERFORMANCE ANALYTICS",
      dateModified: "Dec 6, 2024",
      items: generateLeafItems(2024, "analytics"),
    },
  ]
}

// --- CONTEXT ---

interface LibraryContextType {
  columns: Column[]
  sort: { columnId: string; direction: SortDirection }
  folderOrder: Record<string, string[]>
  activeWatchItemId: string | null
  renamingId: string | null
  folders: FolderData[]
  libraryView: "team" | "my"
  selectedFolders: Set<string>
  selectedItems: Set<string>
  expandedFolders: Set<string>
  currentFolderId: string | null
  breadcrumbs: Array<{ id: string; name: string }>
  clipboard: { mode: "full" | "structure"; data: FolderData } | null
  setSort: (columnId: string) => void
  toggleColumnVisibility: (columnId: string) => void
  setColumns: (columns: Column[]) => void
  updateFolderOrder: (parentId: string, newOrder: string[]) => void
  resizeColumn: (columnId: string, width: number) => void
  moveColumn: (dragIndex: number, hoverIndex: number) => void
  setWatchItem: (itemId: string | null) => void
  setRenamingId: (id: string | null) => void
  setFolders: React.Dispatch<React.SetStateAction<FolderData[]>>
  setLibraryView: (view: "team" | "my") => void
  setSelectedFolders: (ids: Set<string>) => void
  setSelectedItems: (ids: Set<string>) => void
  setExpandedFolders: (ids: Set<string>) => void
  setCurrentFolderId: (id: string | null) => void
  setBreadcrumbs: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string }>>>
  copyFolder: (id: string, mode: "full" | "structure") => void
  pasteFolder: (targetId: string) => void
}

const defaultColumns: Column[] = [
  { id: "name", label: "Name", visible: true, width: 300, align: "left", fixed: true },
  { id: "dateModified", label: "Modified", visible: true, width: 120, align: "left" },
  { id: "type", label: "Type", visible: true, width: 80, align: "left" },
  { id: "hasData", label: "Data", visible: true, width: 60, align: "center" },
  { id: "itemCount", label: "Items", visible: true, width: 80, align: "left" },
  { id: "angles", label: "Angles", visible: true, width: 80, align: "left" },
  { id: "duration", label: "Duration", visible: true, width: 90, align: "left" },
  { id: "size", label: "Size", visible: true, width: 90, align: "left" },
  { id: "comments", label: "Comments", visible: true, width: 100, align: "left" },
  { id: "createdDate", label: "Created", visible: true, width: 120, align: "left" },
]

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [columns, setColumns] = useState<Column[]>(defaultColumns)
  const [sort, setSortState] = useState<{ columnId: string; direction: SortDirection }>({
    columnId: "",
    direction: null,
  })
  const [folderOrder, setFolderOrder] = useState<Record<string, string[]>>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeWatchItemId, setActiveWatchItemId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [clipboard, setClipboard] = useState<{ mode: "full" | "structure"; data: FolderData } | null>(null)

  const [folders, setFolders] = useState<FolderData[]>(generateRamsLibrary())
  const [libraryView, setLibraryView] = useState<"team" | "my">("team")
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set())
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    try {
      const savedColumnOrder = localStorage.getItem("library_column_order")
      const savedFolderOrder = localStorage.getItem("library_folder_order")

      if (savedColumnOrder) {
        const orderIds = JSON.parse(savedColumnOrder) as string[]
        const reordered: Column[] = []
        orderIds.forEach((id) => {
          const def = defaultColumns.find((c) => c.id === id)
          if (def) reordered.push({ ...def })
        })
        defaultColumns.forEach((def) => {
          if (!reordered.find((c) => c.id === def.id)) {
            reordered.push({ ...def })
          }
        })
        setColumns(reordered)
      } else {
        setColumns(defaultColumns.map((c) => ({ ...c })))
      }

      if (savedFolderOrder) {
        setFolderOrder(JSON.parse(savedFolderOrder))
      }
    } catch (e) {
      console.error("Failed to load library settings", e)
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      const orderIds = columns.map((c) => c.id)
      localStorage.setItem("library_column_order", JSON.stringify(orderIds))
      localStorage.setItem("library_folder_order", JSON.stringify(folderOrder))
    }
  }, [columns, folderOrder, isLoaded])

  const setSort = (columnId: string) => {
    setSortState((prev) => {
      if (prev.columnId === columnId) {
        if (prev.direction === "asc") return { columnId, direction: "desc" }
        if (prev.direction === "desc") return { columnId: "", direction: null }
      }
      return { columnId, direction: "asc" }
    })
  }

  const toggleColumnVisibility = (columnId: string) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === columnId) {
          return { ...col, visible: !col.visible }
        }
        return col
      }),
    )
  }

  const updateFolderOrder = (parentId: string, newOrder: string[]) => {
    setFolderOrder((prev) => ({
      ...prev,
      [parentId]: newOrder,
    }))
  }

  const resizeColumn = (columnId: string, newWidth: number) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, width: Math.max(50, newWidth) } : col)))
  }

  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    setColumns((prev) => {
      const newCols = [...prev]
      const targetCol = newCols[hoverIndex]
      const draggedCol = newCols[dragIndex]
      if (targetCol.fixed || draggedCol.fixed) return prev
      const [removed] = newCols.splice(dragIndex, 1)
      newCols.splice(hoverIndex, 0, removed)
      return newCols
    })
  }

  const setWatchItem = (itemId: string | null) => {
    setActiveWatchItemId(itemId)
  }

  const copyFolder = (id: string, mode: "full" | "structure") => {
    // Recursive finder
    const findFolder = (nodes: FolderData[]): FolderData | null => {
      for (const node of nodes) {
        if (node.id === id) return node
        if (node.children) {
          const found = findFolder(node.children)
          if (found) return found
        }
      }
      return null
    }

    const folderToCopy = findFolder(folders)
    if (!folderToCopy) return

    // Deep Clone
    const clone = JSON.parse(JSON.stringify(folderToCopy)) as FolderData

    // If Structure mode, strip items recursively
    if (mode === "structure") {
      const stripItems = (node: FolderData) => {
        node.items = []
        if (node.children) {
          node.children.forEach(stripItems)
        }
      }
      stripItems(clone)
    }

    setClipboard({ mode, data: clone })
  }

  const pasteFolder = (targetId: string) => {
    if (!clipboard) return

    // Recursive ID Regenerator to avoid duplicates
    const regenerateIds = (node: FolderData): FolderData => {
      const newNode = { ...node }
      newNode.id = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      if (newNode.items) {
        newNode.items = newNode.items.map((item) => ({
          ...item,
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }))
      }

      if (newNode.children) {
        newNode.children = newNode.children.map(regenerateIds)
      }
      return newNode
    }

    const payload = regenerateIds(clipboard.data)
    // Append "Copy" to top level name to distinguish
    payload.name = `${clipboard.data.name} (Copy)`

    // Insert into folders tree
    setFolders((prev) => {
      const newFolders = JSON.parse(JSON.stringify(prev)) as FolderData[]

      const insertInto = (nodes: FolderData[]): boolean => {
        for (const node of nodes) {
          if (node.id === targetId) {
            node.children = node.children || []
            node.children.push(payload)
            return true
          }
          if (node.children) {
            if (insertInto(node.children)) return true
          }
        }
        return false
      }

      insertInto(newFolders)
      return newFolders
    })

    // Auto-expand the target folder
    setExpandedFolders((prev) => new Set(prev).add(targetId))
  }

  return (
    <LibraryContext.Provider
      value={{
        columns,
        sort,
        folderOrder,
        activeWatchItemId,
        renamingId,
        folders,
        libraryView,
        selectedFolders,
        selectedItems,
        expandedFolders,
        currentFolderId,
        breadcrumbs,
        clipboard,
        setSort,
        toggleColumnVisibility,
        setColumns,
        updateFolderOrder,
        resizeColumn,
        moveColumn,
        setWatchItem,
        setRenamingId,
        setFolders,
        setLibraryView,
        setSelectedFolders,
        setSelectedItems,
        setExpandedFolders,
        setCurrentFolderId,
        setBreadcrumbs,
        copyFolder,
        pasteFolder,
      }}
    >
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibraryContext() {
  const context = useContext(LibraryContext)
  if (context === undefined) {
    throw new Error("useLibraryContext must be used within a LibraryProvider")
  }
  return context
}
