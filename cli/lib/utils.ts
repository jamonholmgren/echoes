import os from "os"
import path from "path"
import { Game, type GameMap } from "./types"
import { choose, inputKeys } from "bluebun"

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

export function getTilesAround(map: GameMap, x: number, y: number, radius: number) {
  const tiles = []

  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      const tile = map.tiles[y + j]?.[x + i]
      if (tile) tiles.push(tile)
    }
  }

  return tiles
}

export function distance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function chooseOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
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
