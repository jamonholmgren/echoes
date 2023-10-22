import { TORCH_RADIUS } from "../gameplay/constants"
import { solidTiles, type Game, type GameMap, type Tile } from "../types"
import { distance } from "./utils"

export function canSee(map: GameMap, x0: number, y0: number, x1: number, y1: number, maxDistance: number): boolean {
  if (distance({ x: x0, y: y0 }, { x: x1, y: y1 }) > maxDistance) return false

  let dx = Math.abs(x1 - x0)
  let dy = Math.abs(y1 - y0)

  let sx = x0 < x1 ? 1 : -1
  let sy = y0 < y1 ? 1 : -1

  let err = dx - dy

  while (true) {
    const tile = map.tiles[y0]?.[x0]
    if (!tile) return false

    if (solidTiles.includes(tile.type)) return x0 === x1 && y0 === y1

    if (x0 === x1 && y0 === y1) return true

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
}

/**
 * Visible tiles from the character's perspective.
 * Also takes into account lighting.
 */
export function visibleTiles(game: Game) {
  const me = game.me
  const eyesight = me.eyesight

  const visTiles: Tile[] = []

  // right or left hand has a torch?
  const hasTorch = me.inventory[0]?.type === "torch" || me.inventory[1]?.type === "torch"

  for (let y = -eyesight; y <= eyesight; y++) {
    for (let x = -eyesight; x <= eyesight; x++) {
      const tile = game.map.tiles[me.y + y]?.[me.x + x]
      if (!tile) continue

      // is the tile lit by a torch? or at least close enough to the character to see it?
      const isClose = y >= -1 && y <= 1 && x >= -1 && x <= 1

      if (isClose) {
        // shortcut for speed
        visTiles.push(tile)
        continue
      }

      let isLit = tile.lit || (hasTorch && distance(me, tile) <= TORCH_RADIUS)
      if (!isLit) continue // no point, since the tile isn't lit up!

      // okay, it's lit up!
      // now, can we see it?

      // check direct line-of-sight
      let isVisible = canSee(game.map, me.x, me.y, tile.x, tile.y, eyesight)

      if (!isVisible) {
        // first, are any of its directly adjacent neighbors visible, AND are
        // directly horizontally or vertically aligned with the player?
        // this helps us see down hallway walls much more naturally
        if (Math.abs(tile.x - me.x) === 1 || Math.abs(tile.y - me.y) === 1) {
          const north = game.map.tiles[tile.y - 1]?.[tile.x]
          const south = game.map.tiles[tile.y + 1]?.[tile.x]
          const east = game.map.tiles[tile.y]?.[tile.x + 1]
          const west = game.map.tiles[tile.y]?.[tile.x - 1]

          isVisible ||= canSee(game.map, me.x, me.y, north?.x ?? 0, north?.y ?? 0, eyesight)
          isVisible ||= canSee(game.map, me.x, me.y, south?.x ?? 0, south?.y ?? 0, eyesight)
          isVisible ||= canSee(game.map, me.x, me.y, east?.x ?? 0, east?.y ?? 0, eyesight)
          isVisible ||= canSee(game.map, me.x, me.y, west?.x ?? 0, west?.y ?? 0, eyesight)
        }

        // if we can't see it directly line-of-sight, then we will
        // check from the 4 corners around the player, allowing us to
        // see around corners better -- more natural lighting

        for (let ny = -1; ny <= 1; ny += 2) {
          if (isVisible) break
          for (let nx = -1; nx <= 1; nx += 2) {
            if (isVisible) break

            const dirX = Math.sign(x)
            const dirY = Math.sign(y)
            const nearTile = game.map.tiles[me.y + dirY]?.[me.x + dirX]

            isVisible ||= canSee(game.map, nearTile?.x || 0, nearTile?.y || 0, tile.x, tile.y, eyesight)
          }
        }
      }

      if (isVisible) visTiles.push(tile)
    }
  }

  return visTiles
}
