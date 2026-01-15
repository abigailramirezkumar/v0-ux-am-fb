export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
  type: "user"
}

export interface Group {
  id: string
  name: string
  description: string
  memberCount: number
  type: "group" | "org"
}

export const CURRENT_ORG: Group = {
  id: "org-1",
  name: "Hudl Hooligans",
  description: "Entire Organization",
  memberCount: 145,
  type: "org",
}

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Dan Campbell", email: "dan.campbell@hudl.com", role: "Head Coach", type: "user" },
  { id: "u2", name: "Ben Johnson", email: "ben.johnson@hudl.com", role: "Offensive Coordinator", type: "user" },
  { id: "u3", name: "Aaron Glenn", email: "aaron.glenn@hudl.com", role: "Defensive Coordinator", type: "user" },
  { id: "u4", name: "Dave Fipp", email: "dave.fipp@hudl.com", role: "Special Teams Coordinator", type: "user" },
  { id: "u5", name: "Hank Fraley", email: "hank.fraley@hudl.com", role: "Offensive Line Coach", type: "user" },
  { id: "u6", name: "Kelvin Sheppard", email: "kelvin.sheppard@hudl.com", role: "Linebackers Coach", type: "user" },
  { id: "u7", name: "Deshea Townsend", email: "deshea.townsend@hudl.com", role: "Defensive Backs Coach", type: "user" },
  {
    id: "u8",
    name: "Scottie Montgomery",
    email: "scottie.montgomery@hudl.com",
    role: "Running Backs Coach",
    type: "user",
  },
  {
    id: "u9",
    name: "Antwaan Randle El",
    email: "antwaan.randle-el@hudl.com",
    role: "Wide Receivers Coach",
    type: "user",
  },
  { id: "u10", name: "Jared Goff", email: "jared.goff@hudl.com", role: "Quarterback", type: "user" },
  { id: "u11", name: "Amon-Ra St. Brown", email: "amon-ra.stbrown@hudl.com", role: "Wide Receiver", type: "user" },
  { id: "u12", name: "Jahmyr Gibbs", email: "jahmyr.gibbs@hudl.com", role: "Running Back", type: "user" },
  { id: "u13", name: "Penei Sewell", email: "penei.sewell@hudl.com", role: "Offensive Tackle", type: "user" },
  { id: "u14", name: "Aidan Hutchinson", email: "aidan.hutchinson@hudl.com", role: "Defensive End", type: "user" },
  { id: "u15", name: "Matt Allison", email: "matt.allison@hudl.com", role: "Video Coordinator", type: "user" },
]

export const MOCK_GROUPS: Group[] = [
  {
    id: "g1",
    name: "Offensive Staff",
    description: "All offensive coaches and assistants",
    memberCount: 12,
    type: "group",
  },
  {
    id: "g2",
    name: "Defensive Staff",
    description: "All defensive coaches and assistants",
    memberCount: 10,
    type: "group",
  },
  {
    id: "g3",
    name: "Special Teams Staff",
    description: "ST coordinators and assistants",
    memberCount: 4,
    type: "group",
  },
  { id: "g4", name: "All Coaches", description: "Full coaching staff", memberCount: 26, type: "group" },
  { id: "g5", name: "All Athletes", description: "Active roster players", memberCount: 53, type: "group" },
]

export const users = MOCK_USERS
export const userGroups = MOCK_GROUPS.map((g) => ({
  id: g.id,
  name: g.name,
  memberIds: MOCK_USERS.slice(0, g.memberCount > MOCK_USERS.length ? MOCK_USERS.length : g.memberCount).map(
    (u) => u.id,
  ),
}))

export type PermissionLevel = "viewer" | "editor" | "manager" | "owner" | null

export interface PermissionEntry {
  id: string
  type: "user" | "group" | "org"
  entityId: string
  permission: PermissionLevel
  inherited?: boolean
}
