import type { Actor } from "../lib/types"
import { chooseKey, waitSpace } from "../lib/utils"
import { inputKey, delay, gray } from "bluebun"
import { handleInput } from "../gameplay/handleInput"
import { dialog } from "../lib/dialog"

export function makeCharacter(props: Partial<Actor>): Actor {
  // half second delay between movement inputs on purpose
  let inputDelay = 200
  let delayTimer: Promise<unknown> | undefined = undefined

  const character: Actor = {
    me: true,
    x: 1,
    y: 1,
    mood: "sleeping",
    name: "You",
    race: "human",
    eyesight: 14,
    speed: 10,
    time: 0,
    // history: [],
    discovered: true,
    visible: true,
    tags: {},
    async act(game) {
      while (true) {
        const k = await inputKey()

        // ensure we wait at least inputDelay before the next input
        // this is to prevent the player from moving too fast
        // however, any processing delay will be taken into account
        await delayTimer

        // starts the delay timer over again immediately
        delayTimer = delay(inputDelay)

        // quitting
        if (k === "escape") {
          dialog(game, ["Are you sure you want to quit? (y/n)"])
          const quit = await chooseKey(["y", "n"])
          if (quit === "y") process.exit(0)
          continue
        }

        // movement
        const result = await handleInput(k, game)

        // didn't do anything, so loop back around to try again
        if (result.verb === "pending") continue

        // event hooks
        if (this.on[result.verb]) await this.on[result.verb](result, game)

        return result
      }
    },
    on: {
      woke: async (result, game) => {
        // if it's the character and it's the first time they've woken up?
        // then we'll say something
        if (result.verb === "woke" && !game.me.tags.firstWake) {
          game.me.tags.firstWake = true
          dialog(game, [
            "You wake up in a strange place.",
            "You don't remember how you got here.",
            gray("space to continue"),
          ])
          await waitSpace()
        }
        return result
      },
    },
    ...props,
  }

  return character
}
