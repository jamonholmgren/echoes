import { ActionResult, Actor, Game } from "../lib/types"

export async function sleep(actor: Actor, _game: Game): Promise<ActionResult> {
  const startTime = actor.time
  actor.time += actor.speed
  const endTime = actor.time

  if (actor.mood !== "sleeping") {
    actor.mood = "sleeping"
    return { verb: "fell asleep", tile: undefined }
  }

  return { verb: "slept", tile: undefined, startTime, endTime }
}
