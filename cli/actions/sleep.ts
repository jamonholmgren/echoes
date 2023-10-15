import { ActionResult, Actor, Game } from "../lib/types"

export async function sleep(actor: Actor, game: Game): Promise<ActionResult> {
  actor.time += actor.speed
  return { verb: "slept", tile: undefined }
}
