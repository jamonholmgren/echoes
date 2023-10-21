import type { ActionResult, Game, Tile } from "../lib/types"

export async function discovered(tile: Tile, game: Game): Promise<ActionResult> {
  const t = tile.type
  const me = game.me
  if (t === "door") {
    me.mood = "surprised"
  } else if (t === "openDoor") {
    me.mood = "surprised"
  } else if (t === "torch") {
    me.mood = "thinking"
  } else {
    // me.mood = "neutral"
  }

  tile.discovered = true

  return { verb: "pending", tile }
}
