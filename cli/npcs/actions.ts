import { tryMove } from "../lib/behaviors"
import { ActionResult, Actor, Game } from "../lib/types"
import { chooseOne } from "../lib/utils"

/**
 * Default 'wandering' behavior
 */
export async function wander(actor: Actor, game: Game): Promise<ActionResult> {
  // current tile
  const tile = game.map.tiles[actor.y][actor.x]
  // 3 in 4 chance of just staying put
  if (Math.random() < 0.75) return { verb: "slept", tile }
  // pick a random direction -- any 8 directions
  const dirX = Math.floor(Math.random() * 3) - 1
  const dirY = Math.floor(Math.random() * 3) - 1
  // try to move in that direction
  return tryMove(dirX, dirY, game, actor)
}

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
