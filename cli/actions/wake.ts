import { ActionResult, Actor, Game } from "../lib/types"

export async function wake(actor: Actor, game: Game): Promise<ActionResult> {
  actor.time += actor.speed
  return { verb: "woke", tile: undefined }
}
