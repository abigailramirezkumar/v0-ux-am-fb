export type League = "NFL" | "NCAA (FBS)"

export interface Team {
  id: string
  name: string
  abbreviation: string
  logoColor: string
}

export interface Conference {
  id: string
  name: string
  teams: Team[]
  subdivisions?: Conference[]
}

export const sportsData: Record<League, { seasons: string[]; conferences: Conference[] }> = {
  NFL: {
    seasons: ["2024", "2023", "2022", "2021", "2020"],
    conferences: [
      {
        id: "afc",
        name: "AFC",
        teams: [],
        subdivisions: [
          {
            id: "afc-north",
            name: "AFC North",
            teams: [
              { id: "bal", name: "Baltimore Ravens", abbreviation: "BAL", logoColor: "#241773" },
              { id: "cin", name: "Cincinnati Bengals", abbreviation: "CIN", logoColor: "#FB4F14" },
              { id: "cle", name: "Cleveland Browns", abbreviation: "CLE", logoColor: "#311D00" },
              { id: "pit", name: "Pittsburgh Steelers", abbreviation: "PIT", logoColor: "#FFB612" },
            ],
          },
          {
            id: "afc-east",
            name: "AFC East",
            teams: [
              { id: "buf", name: "Buffalo Bills", abbreviation: "BUF", logoColor: "#00338D" },
              { id: "mia", name: "Miami Dolphins", abbreviation: "MIA", logoColor: "#008E97" },
              { id: "ne", name: "New England Patriots", abbreviation: "NE", logoColor: "#002244" },
              { id: "nyj", name: "New York Jets", abbreviation: "NYJ", logoColor: "#125740" },
            ],
          },
          {
            id: "afc-south",
            name: "AFC South",
            teams: [
              { id: "hou", name: "Houston Texans", abbreviation: "HOU", logoColor: "#03202F" },
              { id: "ind", name: "Indianapolis Colts", abbreviation: "IND", logoColor: "#002C5F" },
              { id: "jax", name: "Jacksonville Jaguars", abbreviation: "JAX", logoColor: "#006778" },
              { id: "ten", name: "Tennessee Titans", abbreviation: "TEN", logoColor: "#0C2340" },
            ],
          },
          {
            id: "afc-west",
            name: "AFC West",
            teams: [
              { id: "den", name: "Denver Broncos", abbreviation: "DEN", logoColor: "#FB4F14" },
              { id: "kc", name: "Kansas City Chiefs", abbreviation: "KC", logoColor: "#E31837" },
              { id: "lv", name: "Las Vegas Raiders", abbreviation: "LV", logoColor: "#000000" },
              { id: "lac", name: "Los Angeles Chargers", abbreviation: "LAC", logoColor: "#0080C6" },
            ],
          },
        ],
      },
      {
        id: "nfc",
        name: "NFC",
        teams: [],
        subdivisions: [
          {
            id: "nfc-north",
            name: "NFC North",
            teams: [
              { id: "chi", name: "Chicago Bears", abbreviation: "CHI", logoColor: "#0B162A" },
              { id: "det", name: "Detroit Lions", abbreviation: "DET", logoColor: "#0076B6" },
              { id: "gb", name: "Green Bay Packers", abbreviation: "GB", logoColor: "#203731" },
              { id: "min", name: "Minnesota Vikings", abbreviation: "MIN", logoColor: "#4F2683" },
            ],
          },
          {
            id: "nfc-east",
            name: "NFC East",
            teams: [
              { id: "dal", name: "Dallas Cowboys", abbreviation: "DAL", logoColor: "#003594" },
              { id: "nyg", name: "New York Giants", abbreviation: "NYG", logoColor: "#0B2265" },
              { id: "phi", name: "Philadelphia Eagles", abbreviation: "PHI", logoColor: "#004C54" },
              { id: "was", name: "Washington Commanders", abbreviation: "WAS", logoColor: "#5A1414" },
            ],
          },
          {
            id: "nfc-south",
            name: "NFC South",
            teams: [
              { id: "atl", name: "Atlanta Falcons", abbreviation: "ATL", logoColor: "#A71930" },
              { id: "car", name: "Carolina Panthers", abbreviation: "CAR", logoColor: "#0085CA" },
              { id: "no", name: "New Orleans Saints", abbreviation: "NO", logoColor: "#D3BC8D" },
              { id: "tb", name: "Tampa Bay Buccaneers", abbreviation: "TB", logoColor: "#D50A0A" },
            ],
          },
          {
            id: "nfc-west",
            name: "NFC West",
            teams: [
              { id: "ari", name: "Arizona Cardinals", abbreviation: "ARI", logoColor: "#97233F" },
              { id: "lar", name: "Los Angeles Rams", abbreviation: "LAR", logoColor: "#003594" },
              { id: "sf", name: "San Francisco 49ers", abbreviation: "SF", logoColor: "#AA0000" },
              { id: "sea", name: "Seattle Seahawks", abbreviation: "SEA", logoColor: "#002244" },
            ],
          },
        ],
      },
    ],
  },
  "NCAA (FBS)": {
    seasons: ["2024", "2023", "2022"],
    conferences: [
      {
        id: "sec",
        name: "SEC",
        teams: [
          { id: "ala", name: "Alabama Crimson Tide", abbreviation: "ALA", logoColor: "#9E1B32" },
          { id: "geo", name: "Georgia Bulldogs", abbreviation: "UGA", logoColor: "#BA0C2F" },
          { id: "tex", name: "Texas Longhorns", abbreviation: "TEX", logoColor: "#BF5700" },
          { id: "okl", name: "Oklahoma Sooners", abbreviation: "OKL", logoColor: "#841617" },
          { id: "lsu", name: "LSU Tigers", abbreviation: "LSU", logoColor: "#461D7C" },
          { id: "aub", name: "Auburn Tigers", abbreviation: "AUB", logoColor: "#0C2340" },
          { id: "fla", name: "Florida Gators", abbreviation: "FLA", logoColor: "#0021A5" },
          { id: "tenn", name: "Tennessee Volunteers", abbreviation: "TENN", logoColor: "#FF8200" },
        ],
      },
      {
        id: "big10",
        name: "Big Ten",
        teams: [
          { id: "mich", name: "Michigan Wolverines", abbreviation: "MICH", logoColor: "#00274C" },
          { id: "osu", name: "Ohio State Buckeyes", abbreviation: "OSU", logoColor: "#BB0000" },
          { id: "psu", name: "Penn State Nittany Lions", abbreviation: "PSU", logoColor: "#041E42" },
          { id: "ore", name: "Oregon Ducks", abbreviation: "ORE", logoColor: "#154733" },
          { id: "usc", name: "USC Trojans", abbreviation: "USC", logoColor: "#990000" },
          { id: "ucla", name: "UCLA Bruins", abbreviation: "UCLA", logoColor: "#2D68C4" },
          { id: "wis", name: "Wisconsin Badgers", abbreviation: "WIS", logoColor: "#C5050C" },
          { id: "iowa", name: "Iowa Hawkeyes", abbreviation: "IOWA", logoColor: "#FFCD00" },
        ],
      },
      {
        id: "big12",
        name: "Big 12",
        teams: [
          { id: "utahst", name: "Utah Utes", abbreviation: "UTAH", logoColor: "#CC0000" },
          { id: "colo", name: "Colorado Buffaloes", abbreviation: "COLO", logoColor: "#CFB87C" },
          { id: "arist", name: "Arizona State Sun Devils", abbreviation: "ASU", logoColor: "#8C1D40" },
          { id: "byu", name: "BYU Cougars", abbreviation: "BYU", logoColor: "#002E5D" },
          { id: "tcu", name: "TCU Horned Frogs", abbreviation: "TCU", logoColor: "#4D1979" },
          { id: "ksu", name: "Kansas State Wildcats", abbreviation: "KSU", logoColor: "#512888" },
        ],
      },
      {
        id: "acc",
        name: "ACC",
        teams: [
          { id: "clem", name: "Clemson Tigers", abbreviation: "CLEM", logoColor: "#F56600" },
          { id: "fsu", name: "Florida State Seminoles", abbreviation: "FSU", logoColor: "#782F40" },
          { id: "miami", name: "Miami Hurricanes", abbreviation: "MIA", logoColor: "#F47321" },
          { id: "nc", name: "North Carolina Tar Heels", abbreviation: "UNC", logoColor: "#7BAFD4" },
          { id: "ncst", name: "NC State Wolfpack", abbreviation: "NCST", logoColor: "#CC0000" },
          { id: "duke", name: "Duke Blue Devils", abbreviation: "DUKE", logoColor: "#003087" },
        ],
      },
    ],
  },
}
