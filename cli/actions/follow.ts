import type { Actor, Game, ActionResult } from "../lib/types"
import { chooseOne } from "../lib/utils"
import { tryMove } from "./tryMove"

/**
 * Follow another character
 */
export async function follow(actor: Actor, target: Actor, game: Game): Promise<ActionResult> {
  // current tile
  const tile = game.map.tiles[actor.y][actor.x]

  // try to move towards the target ... with a tiny bit of randomness
  const dirX = Math.random() < 0.2 ? chooseOne([-1, 0, 1]) : target.x > actor.x ? 1 : target.x < actor.x ? -1 : 0
  const dirY = Math.random() < 0.2 ? chooseOne([-1, 0, 1]) : target.y > actor.y ? 1 : target.y < actor.y ? -1 : 0

  return tryMove(dirX, dirY, game, actor)
}
