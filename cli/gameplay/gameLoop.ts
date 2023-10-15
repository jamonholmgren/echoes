import type { ActionResult, Game, Mood } from "../lib/types"
import { Props, cursor, delay, inputKey } from "bluebun"
import { move } from "../actions/move"
import { dialog } from "../lib/dialog"
import { drawMap } from "../lib/drawMap"
import { playAudio } from "../lib/playAudio"
import { chooseKey, chooseOne } from "../lib/utils"
import { updateNextActor } from "./updateNextActor"

// half second delay between movement inputs on purpose
let inputDelay = 200
let delayTimer: Promise<unknown> | undefined = undefined

export async function gameLoop(game: Game, props: Props) {
  // bookmark the top left corner of the map, which will be our game screen starting point
  const startPos = { cols: 1, rows: 1 }

  cursor.bookmark("mapstart", { cols: startPos.cols, rows: startPos.rows + 2 })

  if (game.sound) playAudio(`${props.cliPath}/audio/music-01.wav`, { volume: 0.1, repeat: true })

  // gameloop
  let runawayLoopProtection = 0
  while (true) {
    runawayLoopProtection++
    if (runawayLoopProtection > 1000) {
      console.error(game)
      throw new Error("runaway game loop detected, exiting")
    }

    const discovered = drawMap(game)

    if (discovered.length > 0) {
      // eventually, say something in the log that you see something
      // for now, make the character surprised
      const interestingDiscoveredTiles = ["/", "\\"]
      const interesting = discovered.find((t) => interestingDiscoveredTiles.includes(t.type))
      if (interesting && game.character.mood !== "surprised") {
        game.character.mood = "surprised"
        continue // loop back around so we can rerender
      }
    }

    // loop through every actor and see who is next to move
    // sort by furthest behind in time
    const { loop } = await updateNextActor(game)
    if (loop) continue

    // okay, my turn!
    const k = await inputKey()

    // ensure we wait at least inputDelay before the next input
    // this is to prevent the player from moving too fast
    // however, any processing delay will be taken into account
    await delayTimer

    // starts the delay timer over again immediately
    delayTimer = delay(inputDelay)

    // quitting
    if (k === "escape") {
      dialog(game, startPos, ["Are you sure you want to quit? (y/n)"])
      const quit = await chooseKey(["y", "n"])
      if (quit === "y") break
      continue
    }

    let result: ActionResult = { verb: "pending", tile: undefined }

    // movement
    if (k === "w") result = await move(0, -1, game, game.character)
    if (k === "s") result = await move(0, 0, game, game.character) // rest
    if (k === "x") result = await move(0, 1, game, game.character)
    if (k === "a") result = await move(-1, 0, game, game.character)
    if (k === "d") result = await move(1, 0, game, game.character)
    if (k === "q") result = await move(-1, -1, game, game.character)
    if (k === "e") result = await move(1, -1, game, game.character)
    if (k === "z") result = await move(-1, 1, game, game.character)
    if (k === "c") result = await move(1, 1, game, game.character)

    // you know, i should probably use xstate for these transition effects
    if (result.verb === "woke") {
      game.character.mood = "sleepy"
      dialog(game, startPos, ["You wake up."])
      await inputKey()
      game.character.time += game.character.speed
      continue
    }
    if (result.verb === "stopped") {
      game.character.mood = "surprised"
    }
    if (result.verb === "moved") {
      game.character.mood = chooseOne<Mood>(["neutral", "worried"])
      // advance the game time for the character

      if (game.sound) playAudio(`${props.cliPath}/audio/footstep.wav`, { volume: 0.5 })
    }
    if (result.verb === "opened") {
      game.character.mood = "thinking"
      // if (game.sound) playAudio(`${props.cliPath}/audio/door.wav`, { volume: 0.5 })
    }

    // no actions taken
    if (result.verb === "pending") {
      // do nothing
    }
    runawayLoopProtection = 0
  }
}
