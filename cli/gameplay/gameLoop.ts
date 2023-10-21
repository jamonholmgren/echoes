import type { Game } from "../lib/types"
import { Props, cursor } from "bluebun"
import { drawMap } from "../lib/drawMap"
import { playAudio } from "../lib/playAudio"
import { turnScheduling } from "./turnScheduling"
import { logError } from "../lib/utils"
import { updateWorld } from "./updateWorld"
import { storyline } from "./storyline"

export async function gameLoop(game: Game, props: Props) {
  cursor.bookmark("mapstart", { cols: game.startPos.cols, rows: game.startPos.rows + 2 })

  if (game.sound) playAudio(`music`, { volume: 0.1, repeat: true })

  // first, it's just the character who is visible
  game.map.visible = [game.map.tiles[game.startPos.rows][game.startPos.cols]]

  // gameloop
  let runawayLoopProtection = 0
  while (true) {
    runawayLoopProtection++
    if (runawayLoopProtection > 1000) {
      logError("runaway game loop detected, exiting")
      process.exit(1)
    }

    drawMap(game)

    // loop through every actor and see who is next to move
    // sort by furthest behind in time
    // includes the main character too
    await turnScheduling(game)

    // update the world based on new information
    await updateWorld(game)

    // run the storyline!
    await storyline(game)

    runawayLoopProtection = 0
  }
}
