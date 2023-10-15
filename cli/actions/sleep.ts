import { ActionResult, Actor, Game } from "../lib/types"

export function sleep(actor: Actor, game: Game): ActionResult {
  actor.time += actor.speed
  return { verb: "slept", tile: undefined }
}
