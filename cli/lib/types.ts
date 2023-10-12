export const expressions = ["😑", "🙂", "😬", "😉"]
export type Expression = (typeof expressions)[number]

export type Game = {
  name: string
  x: number
  y: number
  // expressions
  e: Expression
  explored: boolean[][]
}

export type SavedGames = {
  games: Game[]
}
