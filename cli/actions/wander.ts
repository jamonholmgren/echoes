import type { ActionResult, Actor, Game } from "../lib/types"
import { move } from "./move"
import { sleep } from "./sleep"
import { wake } from "./wake"

/**
 * Default 'wandering' behavior
 */
export async function wander(actor: Actor, game: Game): Promise<ActionResult> {
  if (actor.mood === "sleeping") return wake(actor, game)

  // 3 in 4 chance of just staying put
  if (Math.random() < 0.75) return sleep(actor, game)

  // pick a random direction -- any 8 directions
  const dirX = Math.floor(Math.random() * 3) - 1
  const dirY = Math.floor(Math.random() * 3) - 1

  // try to move in that direction
  return move(actor, dirX, dirY, game)
}
