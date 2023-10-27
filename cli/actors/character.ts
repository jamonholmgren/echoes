import { storyline, type Actor } from "../types"
import { chooseKey, waitSpace } from "../lib/utils"
import { inputKey, delay, gray } from "bluebun"
import { handleInput } from "../gameplay/handleInput"
import { dialog, dialogSpace } from "../lib/dialog"
import { discovered } from "../reactions/discovered"
import { wake } from "../actions/wake"

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
    storyline,
    inventory: [],
    async act(game) {
      if (!storyline.firstWake) return wake(this, game)

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
        const eventHook = this.on[result.verb]
        if (eventHook) await eventHook(result, game)

        return result
      }
    },
    on: {
      woke: async (result, game) => {
        if (!game.me.storyline.firstWake) {
          game.me.storyline.firstWake = true
          await dialogSpace(game, ["You wake up."])
        }
        return result
      },
      discovered: async (result, game) => {
        if (result.tile) discovered(result.tile, game)
      },
      moved: async (result, game) => {
        // check if we moved onto a tile with an item
        if (result.tile && result.tile.items.length > 0) {
          const tile = result.tile!

          tile.items.forEach(async (item, i) => {
            if (item.discovered) return

            item.discovered = true

            dialog(game, [`You found a ${gray(item.name)}.`, `Pick it up? (y/n)`])
            const pickup = await chooseKey(["y", "n"])
            if (pickup !== "y") return

            game.me.inventory.push(item)

            // remove the item from the tile
            tile.items.splice(i, 1)
            item.owner = game.me
          })
        }
      },
    },
    ...props,
  }

  return character
}
