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
}
export type Expression = keyof typeof expressions

export type Game = {
  character: Actor
  map: GameMap
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
  explored: boolean
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
  // hp: number
  // maxHp: number
  // attack: number
  // defense: number
  // inventory: Item[]
}

export type ActionResult = {
  verb: "stopped" | "opened" | "woke" | "moved"
  tile?: Tile
}
