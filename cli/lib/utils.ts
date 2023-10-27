import os from "os"
import path from "path"
import { Actor, Game, type GameMap } from "../types"
import { inputKeys } from "bluebun"

export function appdir() {
  const homedir = os.homedir()

  switch (process.platform) {
    case "win32":
      return path.join(homedir, "AppData", "Roaming")
    case "darwin":
      return path.join(homedir, "Library", "Application Support")
    case "linux":
      return path.join(homedir, ".config")
    default:
      throw new Error("Unsupported platform")
  }
}

export type Loc = { x: number; y: number }
export function getTilesAround(map: GameMap, loc: Loc, radius: number) {
  const tiles = []

  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      const tile = map.tiles[loc.y + j]?.[loc.x + i]
      if (tile) tiles.push(tile)
    }
  }

  return tiles
}

export function getVisibleTile(map: GameMap, type: string) {
  return map.visible.find((t) => t.type === type)
}

export function getVisibleActors(map: GameMap): Actor[] {
  return map.visible.map((t) => t.actor).filter((a) => !!a) as Actor[]
}

export function getActorNamed(game: Game, named: string) {
  const actor = game.actors.find((a) => a?.name === named)
  if (!actor) {
    logError(`No actor named '${named}' found! This is required for gameplay`)
    process.exit(1)
  }
  return actor
}

export function getTile(map: GameMap, loc: Loc) {
  return map.tiles[loc.y]?.[loc.x]
}

export function getTileReq(map: GameMap, loc: Loc) {
  const tile = getTile(map, loc)
  if (!tile) {
    logError(`No tile at ${loc.x},${loc.y}! This is required for gameplay`)
    process.exit(1)
  }
  return tile
}

export function distance(pos1: Loc, pos2: Loc): number {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function chooseOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

export function alternateColors(t: string, color1: (s: string) => string, color2: (s: string) => string): string {
  let r = ""
  t.split("").forEach((c, i) => {
    r += i % 2 === 0 ? color1(c) : color2(c)
  })
  return r
}

export async function chooseKey<T extends string>(validKeys: readonly T[]): Promise<T> {
  return await inputKeys((k) => (validKeys.includes(k as T) ? (k as T) : undefined))
}

export const waitSpace = () => chooseKey([" "])

const _errors: string[] = []
export function logError(msg: string) {
  _errors.push(msg)
}

export function getErrors() {
  return _errors
}

export const keys = <T>(o: T) => Object.keys(o as any) as (keyof typeof o)[]
