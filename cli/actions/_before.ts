import type { ActionResult, Actor, Game } from "../lib/types"
import { wake } from "./wake"

export function beforeAction(actor: Actor, game: Game): ActionResult {
  // first off, if the character is sleeping, wake them up and that's it for this turn
  if (actor.mood === "sleeping") return wake(actor, game)

  // otherwise, let the next action proceed
  return { verb: "pending", tile: undefined }
}
