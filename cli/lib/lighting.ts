import { solidTiles, type Game, type GameMap, type Tile } from "./types"
import { distance, getTilesAround } from "./utils"

// how much light does this tile have?
export function tileLight(game: Game, x: number, y: number): number {
  const tile = game.map.tiles[y][x]
  if (!tile) return 0

  // if the tile is a light source, return 1
  if (tile.type === "☼") return 1

  // now search the tiles around this for light sources
  const tiles = getTilesAround(game, x, y, 6)

  const light = tiles.reduce((acc, t) => {
    if (t.type === "☼") {
      // is this light source close enough?
      const dist = distance(tile, t)
      if (dist > 6) return acc

      // can this tile even see that light source?
      if (!canSee(tile.x, tile.y, t.x, t.y, game.map, 6)) return acc

      // now calculate additive light based on distance
      return acc + 1 - dist / 3
    }

    // max light is 1
    return Math.min(1, acc)
  }, 0)

  return light
}

export function canSee(x1: number, y1: number, x2: number, y2: number, map: GameMap, maxDistance: number): boolean {
  if (distance({ x: x1, y: y1 }, { x: x2, y: y2 }) > maxDistance) return false

  let dx = Math.abs(x2 - x1)
  let dy = Math.abs(y2 - y1)
  let sx = x1 < x2 ? 1 : -1
  let sy = y1 < y2 ? 1 : -1
  let err = dx - dy

  while (true) {
    const tile = map.tiles[y1]?.[x1]
    if (!tile) return false

    // We've reached the target point
    if (x1 === x2 && y1 === y2) return true

    // Check if it's a wall
    if (solidTiles.includes(tile.type)) return false

    let e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x1 += sx
    }
    if (e2 < dx) {
      err += dx
      y1 += sy
    }
  }
}

export function visibleTiles(game: Game) {
  const me = game.me
  const eyesight = me.eyesight

  const tiles = []

  for (let y = -eyesight; y <= eyesight; y++) {
    for (let x = -eyesight; x <= eyesight; x++) {
      const tile = game.map.tiles[me.y + y]?.[me.x + x]
      if (tile && canSee(tile.x, tile.y, me.x, me.y, game.map, eyesight)) {
        tiles.push(tile)
      }
    }
  }

  return tiles
}
