import type { Actor } from "../types"
import { chooseKey, waitSpace } from "../lib/utils"
import { inputKey, delay, gray } from "bluebun"
import { handleInput } from "../gameplay/handleInput"
import { dialog, dialogSpace } from "../lib/dialog"
import { discovered } from "../reactions/discovered"

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
    discovered: true,
    visible: true,
    tags: {},
    inventory: [],
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
        if (result.verb === "woke" && !game.me.tags.firstWake) {
          game.me.tags.firstWake = true
          await dialogSpace(game, ["You wake up."])
        }
        return result
      },
      discovered: async (result, game) => {
        if (result.tile) discovered(result.tile, game)
      },
    },
    ...props,
  }

  return character
}
