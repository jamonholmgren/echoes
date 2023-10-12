export const expressions = {
  sleeping: "😴",
  sleepy: "🥱",
  neutral: "😐",
  happy: "🙂",
  determined: "😤",
  strained: "😣",
  sad: "😞",
  hurt: "😣",
  dead: "💀",
  injured: "🤕",
  confused: "😕",
  angry: "😡",
  scared: "😨",
  worried: "😟",
  thinking: "🤔",
  surprised: "😲",
  laughing: "😆",

  // npc's
  goblin: "👺",
}
export type Expression = keyof typeof expressions

export type Game = {
  character: Actor
  actors: Actor[] // npc's, monsters, etc
  map: GameMap
  width: number
  height: number
  playWidth: number
  playHeight: number
}

export type SavedGames = {
  games: Game[]
}

export type GameMap = {
  tiles: Tile[][]
}

export type Tile = {
  // do we need these?
  // x: number
  // y: number
  type: string
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
  name: string
  type: "player" | "npc"
  expression: Expression // mainly for the main character
  x: number
  y: number
  speed: number // how many ticks I move forward each turn
  time: number // what my current tick is
  discovered: boolean
  // hp: number
  // maxHp: number
  // attack: number
  // defense: number
  // inventory: Item[]
}

export type ActionResult = {
  verb: "stopped" | "opened" | "woke" | "moved" | "bumped"
  tile?: Tile
}
