import { ActionResult, Actor, Game } from "../types"

export async function rest(actor: Actor, game: Game): Promise<ActionResult> {
  actor.time += actor.speed
  // eventually, heal?
  return { verb: "rested", tile: undefined }
}
