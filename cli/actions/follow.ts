import type { Actor, Game, ActionResult } from "../types"
import { chooseOne } from "../lib/utils"
import { move } from "./move"
import { wake } from "./wake"

/**
 * Follow another character
 */
export async function follow(actor: Actor, target: Actor, game: Game): Promise<ActionResult> {
  if (actor.mood === "sleeping") return wake(actor, game)

  // current tile
  game.map.tiles[actor.y][actor.x]

  // try to move towards the target ... with a tiny bit of randomness
  const dirX = Math.random() < 0.2 ? chooseOne([-1, 0, 1]) : target.x > actor.x ? 1 : target.x < actor.x ? -1 : 0
  const dirY = Math.random() < 0.2 ? chooseOne([-1, 0, 1]) : target.y > actor.y ? 1 : target.y < actor.y ? -1 : 0

  return move(actor, dirX, dirY, game)
}
