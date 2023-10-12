import type { ActionResult, Game } from "./types"

export function tryMove(mx: number, my: number, game: Game): ActionResult {
  // first off, if the character is sleeping, wake them up
  if (game.character.expression === "sleeping") {
    return { verb: "woke", tile: undefined }
  }

  // try to move into the square
  const x = game.character.x + mx
  const y = game.character.y + my

  const tile = game.map.tiles[y][x]

  if (!tile) return { verb: "stopped", tile }

  // if it's a wall, stop
  if (tile.type === "#") {
    // change the emoji to surprised
    game.character.expression = "surprised"
    return { verb: "stopped", tile }
  }

  // if it's a door, open it
  if (tile.type === "/") {
    // change the wall to open door (backslash)
    tile.type = "\\"
    return { verb: "opened", tile }
  }

  // otherwise, let's move
  game.character.x = x
  game.character.y = y

  return { verb: "moved", tile }
}
