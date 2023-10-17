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
}

export const tileTypes = ["☻", "#", "/", "\\", "☼"] as const

// these block movement and sight
export const solidTiles = ["#", "/"]

export type Tile = {
  // do we need these?
  x: number
  y: number
  type: (typeof tileTypes)[number]
  light: number // 0 to 1
  discovered: boolean
  items: Item[]
  actor?: Actor
}

export type Item = {
  name: string
  type: string
  quantity: number
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
  eyesight: number // how far can I see
  speed: number // how many ticks I move forward each turn
  time: number // what my current tick is
  act?: (game: Game) => Promise<ActionResult>
  on: { [event: string]: (result: ActionResult, game: Game) => Promise<ActionResult> }
  // history: ActionResult[]
  tags: { [tag: string]: unknown } // what has this particular instance done? for storyline purposes
}

export type ActionResult = {
  verb: "pending" | "stopped" | "rested" | "opened" | "woke" | "moved" | "bumped" | "slept" | "fell asleep"
  tile?: Tile
  startTime?: number
  endTime?: number
}
