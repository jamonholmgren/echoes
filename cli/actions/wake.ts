import { ActionResult, Actor, Game } from "../lib/types"

export function wake(actor: Actor, game: Game): ActionResult {
  actor.time += actor.speed
  return { verb: "woke", tile: undefined }
}
