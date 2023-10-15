import { cursor, delay } from "bluebun"
import { Game } from "../lib/types"
import { wander } from "../actions/wander"

export async function updateNextActor(game: Game) {
  game.actors.sort((a, b) => a.time - b.time)
  const actor = game.actors[0]

  // main character is the next to move, so we're done here
  if (!actor || actor.time > game.character.time) return { loop: false }

  const startTime = actor.time

  // it's this NPC actor's turn, so let's see if they have an `act` method
  if (actor.act) {
    // small delay before every actor
    await delay(250)
    const result = await actor.act(game)

    // handle result
    if (result.verb === "bumped") {
      // do nothing for now, but eventually we'll have the actor do something
      // like attack the player or talk to them or something
    }
  } else {
    // this is a character that doesn't have an `act` method, so we'll just
    // move them randomly for now
    const result = wander(actor, game)
  }

  // if the actor's time didn't move forward, then _something_ went wrong!
  // the next NPC actor's time should always move forward every tick
  // and we check <= because we're paranoid ... time can't go backwards
  if (actor.time <= startTime) {
    cursor.alternate(false).clearScreen()
    console.log("\n\n")
    console.error(`Actor ${actor.name} did not advance their time!\n`)
    console.log(`This is a bug in the game. If we didn't crash here, the game would`)
    console.log(`hang indefinitely and lock up your computer.`)
    console.log(`Really sorry about that -- can you either email me or tell me on twitter?`)
    console.log(`\nhello@jamon.dev or https://x.com/jamonholmgren\n`)
    console.error(`Crash details:`)
    console.error({ actor })
    process.exit(1)
  }

  // loop back!
  return { loop: true }
}
