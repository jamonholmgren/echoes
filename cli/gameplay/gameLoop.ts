import type { Game } from "../lib/types"
import { Props, cursor } from "bluebun"
import { drawMap } from "../lib/drawMap"
import { playAudio } from "../lib/playAudio"
import { updateNextActor } from "./updateNextActor"
import { logError } from "../lib/utils"

export async function gameLoop(game: Game, props: Props) {
  cursor.bookmark("mapstart", { cols: game.startPos.cols, rows: game.startPos.rows + 2 })

  if (game.sound) playAudio(`music`, { volume: 0.1, repeat: true })

  // gameloop
  let runawayLoopProtection = 0
  while (true) {
    runawayLoopProtection++
    if (runawayLoopProtection > 1000) {
      logError("runaway game loop detected, exiting")
      process.exit(1)
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
    // includes the main character too
    await updateNextActor(game)

    runawayLoopProtection = 0
  }
}
