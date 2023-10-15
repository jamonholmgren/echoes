import type { ActionResult, Actor, Game } from "../lib/types"
import { move } from "./move"
import { wake } from "./wake"

/**
 * Default 'wandering' behavior
 */
export async function wander(actor: Actor, game: Game): Promise<ActionResult> {
  if (actor.mood === "sleeping") return wake(actor, game)

  // current tile
  const tile = game.map.tiles[actor.y][actor.x]

  // 3 in 4 chance of just staying put
  if (Math.random() < 0.75) return { verb: "slept", tile }

  // pick a random direction -- any 8 directions
  const dirX = Math.floor(Math.random() * 3) - 1
  const dirY = Math.floor(Math.random() * 3) - 1

  // try to move in that direction
  return move(dirX, dirY, game, actor)
}
