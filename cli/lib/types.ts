import type { CursorPos } from "bluebun"

export const moods = {
  sleeping: "😴",
  sleepy: "🥱",
  neutral: "😐",
  happy: "🙂",
  determined: "😤",
  strained: "😣",
  sad: "😞",
  hurt: "😣",
  injured: "🤕",
  confused: "😕",
  angry: "😡",
  scared: "😨",
  worried: "😟",
  thinking: "🤔",
  surprised: "😲",
  laughing: "😆",
  dead: "💀",
}
export type Mood = keyof typeof moods

export const races = {
  human: "👤",
  goblin: "👹",
}
export type Race = keyof typeof races

export type Game = {
  me: Actor
  actors: Actor[] // npc's, monsters, etc
  map: GameMap
  interfaceWidth: number // total terminal width we're working with
  interfaceHeight: number // total terminal height we are working with
  viewWidth: number // width of the map we are showing (x2 for character width)
  viewHeight: number // height of the map we are showing
  startPos: CursorPos
  sound: boolean
}

export type SavedGames = {
  games: Game[]
}

export type GameMap = {
  tiles: Tile[][]
  visible: Tile[]
}

export const tileTypes = {
  start: {
    tile: "☻",
    draw: "··",
  },
  wall: {
    tile: "#",
    draw: "░░",
  },
  floor: {
    tile: ".",
    draw: "··",
  },
  door: {
    tile: "/",
    draw: "🚪",
  },
  openDoor: {
    tile: "\\",
    draw: "🚪",
  },
  torch: {
    tile: "☼",
    draw: "🕯",
  },
} as const

export type TileType = keyof typeof tileTypes | "unknown"

// these block movement and sight
export const solidTiles: TileType[] = ["wall", "door"]

export type Tile = {
  x: number
  y: number
  type: TileType
  lit: boolean
  discovered: boolean
  items: Item[]
  actor?: Actor
}

export const itemTypes = {
  torch: {
    tile: "☼",
    draw: "🕯",
  },
  sword: {
    tile: "┼",
    draw: "🗡",
  },
  shield: {
    tile: "╬",
    draw: "🛡",
  },
  potion: {
    tile: "⌂",
    draw: "🧪",
  },
  key: {
    tile: "¶",
    draw: "🔑",
  },
  gold: {
    tile: "$",
    draw: "💰",
  },
  meat: {
    tile: "%",
    draw: "🍗",
  },
  pick: {
    tile: "┬",
    draw: "⛏ ",
  },
  axe: {
    tile: "╕",
    draw: "🪓",
  },
  unknown: {
    tile: "X",
    draw: "❌",
  },
} as const

export type Item = {
  x: number
  y: number
  name: string
  type: keyof typeof itemTypes | "unknown"
  quantity: number
  discovered: boolean
  tile?: Tile
  actor?: Actor
}

export type Actor = {
  me: boolean // is this the main character?
  name: string
  race: Race
  mood: Mood
  x: number
  y: number
  discovered: boolean
  visible: boolean
  tile?: Tile // current tile I'm on
  eyesight: number // how far can I see (assuming there's light)
  speed: number // how many ticks I move forward each turn
  time: number // what my current tick is
  act?: (game: Game) => Promise<ActionResult>
  on: { [event: string]: (result: ActionResult, game: Game) => Promise<ActionResult | void> }
  tags: { [tag: string]: unknown } // what has this particular instance done? for storyline purposes
  inventory: Item[] // items at position 0 and 1 are in right and left hands, respectively
}

export type ActionResult = {
  verb:
    | "pending"
    | "stopped"
    | "rested"
    | "opened"
    | "woke"
    | "moved"
    | "bumped"
    | "slept"
    | "fell asleep"
    | "discovered"
  tile?: Tile
  startTime?: number
  endTime?: number
}
