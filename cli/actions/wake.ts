import { gray } from "bluebun"
import { dialog } from "../lib/dialog"
import { ActionResult, Actor, Game } from "../lib/types"
import { waitSpace } from "../lib/utils"

export async function wake(actor: Actor, game: Game): Promise<ActionResult> {
  actor.time += actor.speed

  if (actor.mood !== "sleeping") {
    dialog(game, [
      "ERROR: Tried to wake an actor that wasn't sleeping ... this shouldn't happen",
      JSON.stringify(actor, null, 2),
      gray("space to continue"),
    ])
    await waitSpace()
  }

  actor.mood = "sleepy"
  return { verb: "woke", tile: undefined }
}
