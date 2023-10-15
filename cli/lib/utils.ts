import os from "os"
import path from "path"
import { type GameMap } from "./types"
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

/**
 * Checks if the tile in question is in line of sight (and no further than d distance away)
 */
export function canSeeTile(map: GameMap, x: number, y: number, tx: number, ty: number, d: number = 5) {
  // if within 1, always return true
  if (Math.abs(tx - x) <= 1 && Math.abs(ty - y) <= 1) return true

  const dx = tx - x
  const dy = ty - y
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist > d) return false // too far away

  return isLineOfSightClear(map, x, y, tx, ty)
}

export function isLineOfSightClear(map: GameMap, x0: number, y0: number, x1: number, y1: number): boolean {
  let dx = Math.abs(x1 - x0)
  let dy = Math.abs(y1 - y0)

  let sx = x0 < x1 ? 1 : -1
  let sy = y0 < y1 ? 1 : -1

  let err = dx - dy

  const solid = ["#", "/"]

  while (true) {
    const row = map.tiles[y0]
    if (!row) return false
    const tile = row[x0]
    if (!tile) return false

    if (solid.includes(tile.type)) return y0 === y1 && x0 === x1

    if (x0 === x1 && y0 === y1) break

    let e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x0 += sx
    }
    if (e2 < dx) {
      err += dx
      y0 += sy
    }
  }

  return true
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
