import { TORCH_RADIUS } from "../gameplay/constants"
import { solidTiles, type Game, type GameMap, type Tile } from "./types"
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

  const tiles = []

  // right or left hand has a torch?
  const hasTorch = me.inventory[0]?.type === "torch" || me.inventory[1]?.type === "torch"

  for (let y = -eyesight; y <= eyesight; y++) {
    for (let x = -eyesight; x <= eyesight; x++) {
      const tile = game.map.tiles[me.y + y]?.[me.x + x]
      if (!tile) continue

      // is the tile lit by a torch? or at least close enough to the character to see it?
      const isClose = y >= -1 && y <= 1 && x >= -1 && x <= 1
      let isLit = tile.lit || isClose || (hasTorch && distance(me, tile) <= TORCH_RADIUS)
      if (!isLit) continue // no point, since the tile isn't lit up!

      // okay, it's lit up!
      // now, can we see it?

      // check direct line-of-sight
      let visible = canSee(game.map, me.x, me.y, tile.x, tile.y, eyesight)

      if (!visible) {
        // if we can't see it directly line-of-sight, then we will
        // check from the 4 corners around the player, allowing us to
        // see around corners better -- more natural lighting

        for (let ny = -1; ny <= 1; ny += 2) {
          for (let nx = -1; nx <= 1; nx += 2) {
            const dirX = Math.sign(x)
            const dirY = Math.sign(y)
            const nearTile = game.map.tiles[me.y + dirY]?.[me.x + dirX]

            visible = nearTile && canSee(game.map, nearTile.x, nearTile.y, tile.x, tile.y, eyesight)

            if (visible) break
          }
          if (visible) break
        }
      }

      if (visible) tiles.push(tile)
    }
  }

  return tiles
}
