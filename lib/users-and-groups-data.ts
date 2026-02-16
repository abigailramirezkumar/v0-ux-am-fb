export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
}

export interface UserGroup {
  id: string
  name: string
  memberIds: string[]
}

export type PermissionLevel = "view" | "edit" | "comment" | "manage" | "restrict"

// Generate 20 dummy users
export const users: User[] = [
  { id: "u1", name: "Matt Allison", email: "matt.allison@team.com", role: "Team Mascot" },
  { id: "u2", name: "John Smith", email: "john.smith@team.com", role: "Quarterback" },
  { id: "u3", name: "Mike Johnson", email: "mike.johnson@team.com", role: "Running Back" },
  { id: "u4", name: "David Williams", email: "david.williams@team.com", role: "Wide Receiver" },
  { id: "u5", name: "Chris Brown", email: "chris.brown@team.com", role: "Tight End" },
  { id: "u6", name: "James Davis", email: "james.davis@team.com", role: "Offensive Lineman" },
  { id: "u7", name: "Robert Miller", email: "robert.miller@team.com", role: "Defensive End" },
  { id: "u8", name: "Michael Wilson", email: "michael.wilson@team.com", role: "Linebacker" },
  { id: "u9", name: "William Moore", email: "william.moore@team.com", role: "Cornerback" },
  { id: "u10", name: "Richard Taylor", email: "richard.taylor@team.com", role: "Safety" },
  { id: "u11", name: "Joseph Anderson", email: "joseph.anderson@team.com", role: "Kicker" },
  { id: "u12", name: "Thomas Thomas", email: "thomas.thomas@team.com", role: "Punter" },
  { id: "u13", name: "Charles Jackson", email: "charles.jackson@team.com", role: "Long Snapper" },
  { id: "u14", name: "Daniel White", email: "daniel.white@team.com", role: "Head Coach" },
  { id: "u15", name: "Matthew Harris", email: "matthew.harris@team.com", role: "Offensive Coordinator" },
  { id: "u16", name: "Anthony Martin", email: "anthony.martin@team.com", role: "Defensive Coordinator" },
  { id: "u17", name: "Mark Thompson", email: "mark.thompson@team.com", role: "Special Teams Coach" },
  { id: "u18", name: "Donald Garcia", email: "donald.garcia@team.com", role: "Quarterbacks Coach" },
  { id: "u19", name: "Steven Martinez", email: "steven.martinez@team.com", role: "Linebackers Coach" },
  { id: "u20", name: "Paul Robinson", email: "paul.robinson@team.com", role: "Defensive Backs Coach" },
]

// 4 user groups with subsets of users
export const userGroups: UserGroup[] = [
  {
    id: "g1",
    name: "Offense",
    memberIds: ["u2", "u3", "u4", "u5", "u6", "u15", "u18"],
  },
  {
    id: "g2",
    name: "Defense",
    memberIds: ["u7", "u8", "u9", "u10", "u16", "u19", "u20"],
  },
  {
    id: "g3",
    name: "Special Teams",
    memberIds: ["u11", "u12", "u13", "u17"],
  },
  {
    id: "g4",
    name: "Coaches",
    memberIds: ["u14", "u15", "u16", "u17", "u18", "u19", "u20"],
  },
]

export interface PermissionEntry {
  id: string
  type: "user" | "group"
  entityId: string
  permission: PermissionLevel
}
