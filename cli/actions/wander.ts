import type { ActionResult, Actor, Game } from "../lib/types"
import { move } from "./move"
import { beforeAction } from "./_before"

/**
 * Default 'wandering' behavior
 */
export function wander(actor: Actor, game: Game): ActionResult {
  const pre = beforeAction(actor, game)
  if (pre.verb !== "pending") return pre

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
