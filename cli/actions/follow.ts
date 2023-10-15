import type { Actor, Game, ActionResult } from "../lib/types"
import { chooseOne } from "../lib/utils"
import { beforeAction } from "./_before"
import { move } from "./move"

/**
 * Follow another character
 */
export function follow(actor: Actor, target: Actor, game: Game): ActionResult {
  const pre = beforeAction(actor, game)
  if (pre.verb !== "pending") return pre

  // current tile
  const tile = game.map.tiles[actor.y][actor.x]

  // try to move towards the target ... with a tiny bit of randomness
  const dirX = Math.random() < 0.2 ? chooseOne([-1, 0, 1]) : target.x > actor.x ? 1 : target.x < actor.x ? -1 : 0
  const dirY = Math.random() < 0.2 ? chooseOne([-1, 0, 1]) : target.y > actor.y ? 1 : target.y < actor.y ? -1 : 0

  return move(dirX, dirY, game, actor)
}
