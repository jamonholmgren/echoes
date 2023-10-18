import { dialogSpace } from "../lib/dialog"
import { ActionResult, Actor, Game } from "../lib/types"

export async function wake(actor: Actor, game: Game): Promise<ActionResult> {
  actor.time += actor.speed

  if (actor.mood !== "sleeping") {
    await dialogSpace(game, [
      "ERROR: Tried to wake an actor that wasn't sleeping ... this shouldn't happen",
      JSON.stringify(actor, null, 2),
    ])
  }

  actor.mood = "sleepy"

  return { verb: "woke", tile: undefined }
}
