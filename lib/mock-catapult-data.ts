import type { FolderData } from "@/components/folder"

export const mockCatapultData: FolderData[] = [
  {
    id: "catapult-folder-1",
    name: "Offensive Game Film",
    children: [
      {
        id: "catapult-subfolder-1-1",
        name: "Red Zone Plays",
        children: [
          {
            id: "catapult-subsubfolder-1-1-1",
            name: "Week 1-4",
            items: [
              { id: "item-1-1-1-1", name: "RZ TD vs Cowboys", type: "video" },
              { id: "item-1-1-1-2", name: "RZ FG vs Eagles", type: "video" },
              { id: "item-1-1-1-3", name: "RZ Turnover vs Giants", type: "video" },
            ],
          },
          {
            id: "catapult-subsubfolder-1-1-2",
            name: "Week 5-8",
            items: [
              { id: "item-1-1-2-1", name: "RZ Success vs 49ers", type: "video" },
              { id: "item-1-1-2-2", name: "RZ Breakdown vs Seahawks", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-1-2",
        name: "Third Down Conversions",
        children: [
          {
            id: "catapult-subsubfolder-1-2-1",
            name: "Short Yardage",
            items: [
              { id: "item-1-2-1-1", name: "3rd & 2 QB Sneak", type: "video" },
              { id: "item-1-2-1-2", name: "3rd & 1 Power Run", type: "video" },
              { id: "item-1-2-1-3", name: "3rd & 3 Play Action", type: "video" },
              { id: "item-1-2-1-4", name: "3rd & 2 RPO Success", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-1-3",
        name: "Two Minute Drill",
        children: [
          {
            id: "catapult-subsubfolder-1-3-1",
            name: "End of Half",
            items: [
              { id: "item-1-3-1-1", name: "2min Drill vs Patriots", type: "video" },
              { id: "item-1-3-1-2", name: "2min Drill vs Bills", type: "video" },
              { id: "item-1-3-1-3", name: "2min Drill vs Dolphins", type: "video" },
              { id: "item-1-3-1-4", name: "2min Drill vs Jets", type: "video" },
              { id: "item-1-3-1-5", name: "2min Drill vs Ravens", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-1-4",
        name: "Play Action Passes",
        children: [
          {
            id: "catapult-subsubfolder-1-4-1",
            name: "Deep Shots",
            items: [
              { id: "item-1-4-1-1", name: "PA Deep Ball TD", type: "video" },
              { id: "item-1-4-1-2", name: "PA Seam Route", type: "video" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "catapult-folder-2",
    name: "Defensive Game Film",
    children: [
      {
        id: "catapult-subfolder-2-1",
        name: "Blitz Packages",
        children: [
          {
            id: "catapult-subsubfolder-2-1-1",
            name: "Zone Blitz",
            items: [
              { id: "item-2-1-1-1", name: "Zone Blitz Sack", type: "video" },
              { id: "item-2-1-1-2", name: "Zone Blitz INT", type: "video" },
              { id: "item-2-1-1-3", name: "Zone Blitz TFL", type: "video" },
            ],
          },
          {
            id: "catapult-subsubfolder-2-1-2",
            name: "Man Blitz",
            items: [
              { id: "item-2-1-2-1", name: "Man Blitz Pressure", type: "video" },
              { id: "item-2-1-2-2", name: "Man Blitz Coverage", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-2-2",
        name: "Coverage Schemes",
        children: [
          {
            id: "catapult-subsubfolder-2-2-1",
            name: "Cover 2",
            items: [
              { id: "item-2-2-1-1", name: "Cover 2 vs Spread", type: "video" },
              { id: "item-2-2-1-2", name: "Cover 2 vs Trips", type: "video" },
              { id: "item-2-2-1-3", name: "Cover 2 Adjustment", type: "video" },
              { id: "item-2-2-1-4", name: "Cover 2 Success", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-2-3",
        name: "Run Defense",
        children: [
          {
            id: "catapult-subsubfolder-2-3-1",
            name: "Gap Control",
            items: [
              { id: "item-2-3-1-1", name: "A Gap Stuff", type: "video" },
              { id: "item-2-3-1-2", name: "B Gap TFL", type: "video" },
              { id: "item-2-3-1-3", name: "C Gap Pursuit", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-2-4",
        name: "Third Down Defense",
        children: [
          {
            id: "catapult-subsubfolder-2-4-1",
            name: "Nickel Package",
            items: [
              { id: "item-2-4-1-1", name: "Nickel Sack", type: "video" },
              { id: "item-2-4-1-2", name: "Nickel Stop", type: "video" },
              { id: "item-2-4-1-3", name: "Nickel Coverage", type: "video" },
              { id: "item-2-4-1-4", name: "Nickel Pressure", type: "video" },
              { id: "item-2-4-1-5", name: "Nickel Success", type: "video" },
              { id: "item-2-4-1-6", name: "Nickel Adjustment", type: "video" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "catapult-folder-3",
    name: "Special Teams",
    children: [
      {
        id: "catapult-subfolder-3-1",
        name: "Punt Returns",
        children: [
          {
            id: "catapult-subsubfolder-3-1-1",
            name: "Return TDs",
            items: [
              { id: "item-3-1-1-1", name: "PR TD vs Broncos", type: "video" },
              { id: "item-3-1-1-2", name: "PR TD vs Chargers", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-3-2",
        name: "Kickoff Returns",
        children: [
          {
            id: "catapult-subsubfolder-3-2-1",
            name: "Big Returns",
            items: [
              { id: "item-3-2-1-1", name: "KR 50+ yards", type: "video" },
              { id: "item-3-2-1-2", name: "KR 40+ yards", type: "video" },
              { id: "item-3-2-1-3", name: "KR 30+ yards", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-3-3",
        name: "Field Goals",
        children: [
          {
            id: "catapult-subsubfolder-3-3-1",
            name: "50+ Yards",
            items: [
              { id: "item-3-3-1-1", name: "FG 52 yards", type: "video" },
              { id: "item-3-3-1-2", name: "FG 55 yards", type: "video" },
              { id: "item-3-3-1-3", name: "FG 51 yards", type: "video" },
              { id: "item-3-3-1-4", name: "FG 53 yards", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-3-4",
        name: "Punt Coverage",
        children: [
          {
            id: "catapult-subsubfolder-3-4-1",
            name: "Inside 20",
            items: [
              { id: "item-3-4-1-1", name: "Punt Inside 10", type: "video" },
              { id: "item-3-4-1-2", name: "Punt Inside 15", type: "video" },
              { id: "item-3-4-1-3", name: "Punt Inside 5", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-3-5",
        name: "Blocked Kicks",
        children: [
          {
            id: "catapult-subsubfolder-3-5-1",
            name: "Blocked FGs",
            items: [
              { id: "item-3-5-1-1", name: "Blocked FG vs Steelers", type: "video" },
              { id: "item-3-5-1-2", name: "Blocked FG vs Browns", type: "video" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "catapult-folder-4",
    name: "Practice Film",
    children: [
      {
        id: "catapult-subfolder-4-1",
        name: "Tuesday Practice",
        children: [
          {
            id: "catapult-subsubfolder-4-1-1",
            name: "Week 1-4",
            items: [
              { id: "item-4-1-1-1", name: "Tue Practice 9/3", type: "video" },
              { id: "item-4-1-1-2", name: "Tue Practice 9/10", type: "video" },
              { id: "item-4-1-1-3", name: "Tue Practice 9/17", type: "video" },
              { id: "item-4-1-1-4", name: "Tue Practice 9/24", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-4-2",
        name: "Wednesday Practice",
        children: [
          {
            id: "catapult-subsubfolder-4-2-1",
            name: "Week 1-4",
            items: [
              { id: "item-4-2-1-1", name: "Wed Practice 9/4", type: "video" },
              { id: "item-4-2-1-2", name: "Wed Practice 9/11", type: "video" },
              { id: "item-4-2-1-3", name: "Wed Practice 9/18", type: "video" },
              { id: "item-4-2-1-4", name: "Wed Practice 9/25", type: "video" },
              { id: "item-4-2-1-5", name: "Wed Practice 10/2", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-4-3",
        name: "Thursday Practice",
        children: [
          {
            id: "catapult-subsubfolder-4-3-1",
            name: "Week 1-4",
            items: [
              { id: "item-4-3-1-1", name: "Thu Practice 9/5", type: "video" },
              { id: "item-4-3-1-2", name: "Thu Practice 9/12", type: "video" },
              { id: "item-4-3-1-3", name: "Thu Practice 9/19", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-4-4",
        name: "Friday Walkthrough",
        children: [
          {
            id: "catapult-subsubfolder-4-4-1",
            name: "Week 1-4",
            items: [
              { id: "item-4-4-1-1", name: "Fri Walkthrough 9/6", type: "video" },
              { id: "item-4-4-1-2", name: "Fri Walkthrough 9/13", type: "video" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "catapult-folder-5",
    name: "Opponent Scouting",
    children: [
      {
        id: "catapult-subfolder-5-1",
        name: "NFC East",
        children: [
          {
            id: "catapult-subsubfolder-5-1-1",
            name: "Cowboys Offense",
            items: [
              { id: "item-5-1-1-1", name: "DAL Run Game", type: "video" },
              { id: "item-5-1-1-2", name: "DAL Pass Game", type: "video" },
              { id: "item-5-1-1-3", name: "DAL Red Zone", type: "video" },
              { id: "item-5-1-1-4", name: "DAL Third Down", type: "video" },
              { id: "item-5-1-1-5", name: "DAL Two Minute", type: "video" },
              { id: "item-5-1-1-6", name: "DAL Tendencies", type: "video" },
            ],
          },
          {
            id: "catapult-subsubfolder-5-1-2",
            name: "Eagles Defense",
            items: [
              { id: "item-5-1-2-1", name: "PHI Blitz Packages", type: "video" },
              { id: "item-5-1-2-2", name: "PHI Coverage", type: "video" },
              { id: "item-5-1-2-3", name: "PHI Run Defense", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-5-2",
        name: "AFC North",
        children: [
          {
            id: "catapult-subsubfolder-5-2-1",
            name: "Ravens Offense",
            items: [
              { id: "item-5-2-1-1", name: "BAL QB Run Game", type: "video" },
              { id: "item-5-2-1-2", name: "BAL RPO", type: "video" },
              { id: "item-5-2-1-3", name: "BAL Play Action", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-5-3",
        name: "NFC West",
        children: [
          {
            id: "catapult-subsubfolder-5-3-1",
            name: "49ers Offense",
            items: [
              { id: "item-5-3-1-1", name: "SF Outside Zone", type: "video" },
              { id: "item-5-3-1-2", name: "SF Bootleg", type: "video" },
              { id: "item-5-3-1-3", name: "SF Screen Game", type: "video" },
              { id: "item-5-3-1-4", name: "SF Motion", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-5-4",
        name: "AFC West",
        children: [
          {
            id: "catapult-subsubfolder-5-4-1",
            name: "Chiefs Offense",
            items: [
              { id: "item-5-4-1-1", name: "KC Mahomes Scrambles", type: "video" },
              { id: "item-5-4-1-2", name: "KC Kelce Routes", type: "video" },
              { id: "item-5-4-1-3", name: "KC Red Zone", type: "video" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "catapult-folder-6",
    name: "Player Development",
    children: [
      {
        id: "catapult-subfolder-6-1",
        name: "Quarterback Film",
        children: [
          {
            id: "catapult-subsubfolder-6-1-1",
            name: "Footwork Drills",
            items: [
              { id: "item-6-1-1-1", name: "3-Step Drop", type: "video" },
              { id: "item-6-1-1-2", name: "5-Step Drop", type: "video" },
              { id: "item-6-1-1-3", name: "7-Step Drop", type: "video" },
              { id: "item-6-1-1-4", name: "Play Action Footwork", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-6-2",
        name: "Wide Receiver Film",
        children: [
          {
            id: "catapult-subsubfolder-6-2-1",
            name: "Route Running",
            items: [
              { id: "item-6-2-1-1", name: "Slant Route", type: "video" },
              { id: "item-6-2-1-2", name: "Out Route", type: "video" },
              { id: "item-6-2-1-3", name: "Post Route", type: "video" },
              { id: "item-6-2-1-4", name: "Corner Route", type: "video" },
              { id: "item-6-2-1-5", name: "Comeback Route", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-6-3",
        name: "Linebacker Film",
        children: [
          {
            id: "catapult-subsubfolder-6-3-1",
            name: "Coverage Drops",
            items: [
              { id: "item-6-3-1-1", name: "Hook Zone", type: "video" },
              { id: "item-6-3-1-2", name: "Curl Zone", type: "video" },
              { id: "item-6-3-1-3", name: "Flat Zone", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-6-4",
        name: "Defensive Back Film",
        children: [
          {
            id: "catapult-subsubfolder-6-4-1",
            name: "Man Coverage",
            items: [
              { id: "item-6-4-1-1", name: "Press Man", type: "video" },
              { id: "item-6-4-1-2", name: "Off Man", type: "video" },
              { id: "item-6-4-1-3", name: "Trail Technique", type: "video" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "catapult-folder-7",
    name: "Situational Football",
    children: [
      {
        id: "catapult-subfolder-7-1",
        name: "Goal Line",
        children: [
          {
            id: "catapult-subsubfolder-7-1-1",
            name: "Goal Line Offense",
            items: [
              { id: "item-7-1-1-1", name: "GL QB Sneak", type: "video" },
              { id: "item-7-1-1-2", name: "GL Power Run", type: "video" },
              { id: "item-7-1-1-3", name: "GL Play Action", type: "video" },
              { id: "item-7-1-1-4", name: "GL Fade Route", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-7-2",
        name: "Short Yardage",
        children: [
          {
            id: "catapult-subsubfolder-7-2-1",
            name: "4th & Short",
            items: [
              { id: "item-7-2-1-1", name: "4th & 1 Success", type: "video" },
              { id: "item-7-2-1-2", name: "4th & 2 Conversion", type: "video" },
              { id: "item-7-2-1-3", name: "4th & Short Stop", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-7-3",
        name: "Prevent Defense",
        children: [
          {
            id: "catapult-subsubfolder-7-3-1",
            name: "End of Game",
            items: [
              { id: "item-7-3-1-1", name: "Prevent Success", type: "video" },
              { id: "item-7-3-1-2", name: "Prevent Breakdown", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-7-4",
        name: "Hail Mary",
        children: [
          {
            id: "catapult-subsubfolder-7-4-1",
            name: "Hail Mary Attempts",
            items: [
              { id: "item-7-4-1-1", name: "Hail Mary TD", type: "video" },
              { id: "item-7-4-1-2", name: "Hail Mary Defense", type: "video" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "catapult-folder-8",
    name: "Coaching Clinics",
    children: [
      {
        id: "catapult-subfolder-8-1",
        name: "Offensive Schemes",
        children: [
          {
            id: "catapult-subsubfolder-8-1-1",
            name: "West Coast Offense",
            items: [
              { id: "item-8-1-1-1", name: "WCO Principles", type: "video" },
              { id: "item-8-1-1-2", name: "WCO Timing Routes", type: "video" },
              { id: "item-8-1-1-3", name: "WCO Protection", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-8-2",
        name: "Defensive Schemes",
        children: [
          {
            id: "catapult-subsubfolder-8-2-1",
            name: "3-4 Defense",
            items: [
              { id: "item-8-2-1-1", name: "3-4 Base", type: "video" },
              { id: "item-8-2-1-2", name: "3-4 Blitz", type: "video" },
              { id: "item-8-2-1-3", name: "3-4 Coverage", type: "video" },
              { id: "item-8-2-1-4", name: "3-4 Adjustments", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-8-3",
        name: "Special Teams Schemes",
        children: [
          {
            id: "catapult-subsubfolder-8-3-1",
            name: "Punt Block",
            items: [
              { id: "item-8-3-1-1", name: "Punt Block Setup", type: "video" },
              { id: "item-8-3-1-2", name: "Punt Block Execution", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-8-4",
        name: "Strength & Conditioning",
        children: [
          {
            id: "catapult-subsubfolder-8-4-1",
            name: "Off-Season Program",
            items: [
              { id: "item-8-4-1-1", name: "Phase 1 Workouts", type: "video" },
              { id: "item-8-4-1-2", name: "Phase 2 Workouts", type: "video" },
              { id: "item-8-4-1-3", name: "Phase 3 Workouts", type: "video" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "catapult-folder-9",
    name: "Analytics & Metrics",
    children: [
      {
        id: "catapult-subfolder-9-1",
        name: "Player Tracking",
        children: [
          {
            id: "catapult-subsubfolder-9-1-1",
            name: "Speed Metrics",
            items: [
              { id: "item-9-1-1-1", name: "Top Speed Analysis", type: "video" },
              { id: "item-9-1-1-2", name: "Acceleration Data", type: "video" },
              { id: "item-9-1-1-3", name: "Distance Covered", type: "video" },
              { id: "item-9-1-1-4", name: "Sprint Count", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-9-2",
        name: "Formation Analysis",
        children: [
          {
            id: "catapult-subsubfolder-9-2-1",
            name: "Personnel Groupings",
            items: [
              { id: "item-9-2-1-1", name: "11 Personnel", type: "video" },
              { id: "item-9-2-1-2", name: "12 Personnel", type: "video" },
              { id: "item-9-2-1-3", name: "21 Personnel", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-9-3",
        name: "Tendency Reports",
        children: [
          {
            id: "catapult-subsubfolder-9-3-1",
            name: "Down & Distance",
            items: [
              { id: "item-9-3-1-1", name: "1st Down Tendencies", type: "video" },
              { id: "item-9-3-1-2", name: "2nd Down Tendencies", type: "video" },
              { id: "item-9-3-1-3", name: "3rd Down Tendencies", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-9-4",
        name: "Success Rate",
        children: [
          {
            id: "catapult-subsubfolder-9-4-1",
            name: "Play Type Success",
            items: [
              { id: "item-9-4-1-1", name: "Run Success Rate", type: "video" },
              { id: "item-9-4-1-2", name: "Pass Success Rate", type: "video" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "catapult-folder-10",
    name: "Injury Prevention",
    children: [
      {
        id: "catapult-subfolder-10-1",
        name: "Warm-up Routines",
        children: [
          {
            id: "catapult-subsubfolder-10-1-1",
            name: "Dynamic Stretching",
            items: [
              { id: "item-10-1-1-1", name: "Leg Swings", type: "video" },
              { id: "item-10-1-1-2", name: "High Knees", type: "video" },
              { id: "item-10-1-1-3", name: "Butt Kicks", type: "video" },
              { id: "item-10-1-1-4", name: "Carioca", type: "video" },
              { id: "item-10-1-1-5", name: "A-Skips", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-10-2",
        name: "Recovery Protocols",
        children: [
          {
            id: "catapult-subsubfolder-10-2-1",
            name: "Post-Game Recovery",
            items: [
              { id: "item-10-2-1-1", name: "Ice Bath Protocol", type: "video" },
              { id: "item-10-2-1-2", name: "Compression Therapy", type: "video" },
              { id: "item-10-2-1-3", name: "Massage Therapy", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-10-3",
        name: "Mobility Work",
        children: [
          {
            id: "catapult-subsubfolder-10-3-1",
            name: "Hip Mobility",
            items: [
              { id: "item-10-3-1-1", name: "Hip Flexor Stretch", type: "video" },
              { id: "item-10-3-1-2", name: "90/90 Hip Stretch", type: "video" },
            ],
          },
        ],
      },
      {
        id: "catapult-subfolder-10-4",
        name: "Load Management",
        children: [
          {
            id: "catapult-subsubfolder-10-4-1",
            name: "Practice Load",
            items: [
              { id: "item-10-4-1-1", name: "Weekly Load Report", type: "video" },
              { id: "item-10-4-1-2", name: "Individual Load Data", type: "video" },
              { id: "item-10-4-1-3", name: "Load Recommendations", type: "video" },
            ],
          },
        ],
      },
    ],
  },
]
