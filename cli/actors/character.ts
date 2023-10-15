import type { Actor } from "../lib/types"
import { chooseKey } from "../lib/utils"
import { inputKey, delay } from "bluebun"
import { actionEffects } from "../gameplay/actionEffects"
import { handleInput } from "../gameplay/handleInput"
import { dialog } from "../lib/dialog"

export function makeCharacter(props: Partial<Actor>): Actor {
  // half second delay between movement inputs on purpose
  let inputDelay = 200
  let delayTimer: Promise<unknown> | undefined = undefined

  const character: Actor = {
    x: 1,
    y: 1,
    mood: "sleeping",
    name: "You",
    race: "human",
    eyesight: 14,
    speed: 10,
    time: 0,
    discovered: true,
    history: [],
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

        // didn't handle anything, so loop back around to try again
        if (result.verb === "pending") continue

        // handle effects that happen due to the action
        await actionEffects(result, game)

        return result
      }
    },
    ...props,
  }

  return character
}
