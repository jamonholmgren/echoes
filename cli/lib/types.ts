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
  character: Actor
  actors: Actor[] // npc's, monsters, etc
  map: GameMap
  interfaceWidth: number // total terminal width we're working with
  interfaceHeight: number // total terminal height we are working with
  viewWidth: number // width of the map we are showing (x2 for character width)
  viewHeight: number // height of the map we are showing
  sound: boolean
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
  race: Race
  mood: Mood
  x: number
  y: number
  eyesight: number // how far can I see
  speed: number // how many ticks I move forward each turn
  time: number // what my current tick is
  discovered: boolean
  act?: (game: Game) => ActionResult
  history: ActionResult[]
}

export type ActionResult = {
  verb: "pending" | "stopped" | "opened" | "woke" | "moved" | "bumped" | "slept"
  tile?: Tile
}
