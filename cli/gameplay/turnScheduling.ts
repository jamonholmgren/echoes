import { delay } from "bluebun"
import { ActionResult, Game } from "../lib/types"
import { rest } from "../actions/rest"
import { dialogSpace } from "../lib/dialog"
import { guardActorTime } from "../lib/guards"

export async function turnScheduling(game: Game) {
  game.actors.sort((a, b) => a.time - b.time)
  const actor = game.actors[0]

  const startTime = actor.time

  // it's this NPC actor's turn, so let's see if they have an `act` method
  let result: ActionResult = { verb: "pending", tile: undefined }

  // small delay before every actor moves, to simulate realtime
  await delay(100)

  // we will retry up to 10 times to get an action from the actor
  // after that, we'll just sleep them for a turn
  let retries = 0
  while (retries < 10) {
    if (actor.act) {
      result = await actor.act(game)
    } else {
      // this is a character that doesn't have an `act` method, so we'll just
      // have them continue to rest
      result = await rest(actor, game)
    }

    // we good?
    if (result.verb !== "pending") break

    // if the actor didn't move, then we'll try again
    if (retries < 10) {
      retries++
      continue
    } else {
      // just rest them for a turn
      // however, the problem with this is that it can mask other problems
      // if the actor is supposed to be moving but isn't, it'll just
      // sleep forever and we won't know why
      // we need a way to catch this situation somehow
      await dialogSpace(game, [`${actor.name} is stuck!`])
      result = await rest(actor, game)
      break
    }
  }

  guardActorTime(actor, startTime, result, game)

  // loop back!
  return { loop: true }
}
