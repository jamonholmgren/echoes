import { cursor, delay, gray } from "bluebun"
import { ActionResult, Game } from "../lib/types"
import { wander } from "../actions/wander"
import { sleep } from "../actions/sleep"
import { rest } from "../actions/rest"
import { dialog } from "../lib/dialog"
import { logError, waitSpace } from "../lib/utils"

export async function updateNextActor(game: Game) {
  let debugLine = [10]

  game.actors.sort((a, b) => a.time - b.time)
  const actor = game.actors[0]

  // no actors found
  if (!actor) return { loop: false }

  const startTime = actor.time

  // it's this NPC actor's turn, so let's see if they have an `act` method
  let result: ActionResult = { verb: "pending", tile: undefined }

  // small delay before every actor moves, to simulate realtime
  await delay(100)

  debugLine.push(26)

  // we will retry up to 10 times to get an action from the actor
  // after that, we'll just sleep them for a turn
  let retries = 0
  while (retries < 10) {
    debugLine.push(32)
    if (actor.act) {
      result = await actor.act(game)
      debugLine.push(35)
    } else {
      // this is a character that doesn't have an `act` method, so we'll just
      // have them continue to rest
      result = await rest(actor, game)
      debugLine.push(40)
    }

    // we good?
    if (result.verb !== "pending") break
    debugLine.push(45)

    // if the actor didn't move, then we'll try again
    if (retries < 10) {
      retries++
      debugLine.push(50)
      continue
    } else {
      // just rest them for a turn
      // however, the problem with this is that it can mask other problems
      // if the actor is supposed to be moving but isn't, it'll just
      // sleep forever and we won't know why
      // we need a way to catch this situation somehow
      dialog(game, [`${actor.name} is stuck!`, gray("space to continue")])
      await waitSpace()
      result = await rest(actor, game)
      debugLine.push(61)
      break
    }
  }

  // if the actor's time didn't move forward, then _something_ went wrong!
  // the next NPC actor's time should always move forward every tick
  // and we check <= because we're paranoid ... time can't go backwards
  if (actor.time <= startTime) {
    debugLine.push(70)
    cursor.alternate(false).clearScreen()

    logError(`
      Actor ${actor.name} did not advance their time!
      This is a bug in the game. If we didn't crash here, the game would
      hang indefinitely and lock up your computer.
      Really sorry about that -- can you either email me or tell me on twitter?
      \nhello@jamon.dev or https://x.com/jamonholmgren\n
      Crash details:
      
      startTime: ${startTime}
      
      charTime: ${game.character.time}

      debugLine: ${debugLine}

      actor: ${JSON.stringify({ actor }, null, 2)}

      result: ${JSON.stringify({ result }, null, 2)}

    `)
    process.exit(1)
  }

  // loop back!
  return { loop: true }
}
