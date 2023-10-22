import type { Actor, ActionResult, Game } from "../types"
import { cursor } from "bluebun"
import { logError } from "./utils"

export function guardActors(game: Game) {
  if (game.actors.length === 0) {
    logError("No actors found. This is a bug.")
    process.exit(1)
  }
}

export function guardActorTime(actor: Actor, startTime: number, result: ActionResult, game: Game) {
  // if the actor's time didn't move forward, then _something_ went wrong!
  // the next NPC actor's time should always move forward every tick
  // and we check <= because we're paranoid ... time can't go backwards
  if (actor.time <= startTime) {
    cursor.alternate(false).clearScreen()

    logError(`
      Actor ${actor.name} did not advance their time!
      This is a bug in the game. If we didn't crash here, the game would
      hang indefinitely and lock up your computer.
      Really sorry about that -- can you either email me or tell me on twitter?
      \nhello@jamon.dev or https://x.com/jamonholmgren\n
      Crash details:
      
      startTime: ${startTime}
      
      charTime: ${game.me.time}

      actor: ${JSON.stringify({ actor }, null, 2)}

      result: ${JSON.stringify({ result }, null, 2)}

    `)
    process.exit(1)
  }
}
