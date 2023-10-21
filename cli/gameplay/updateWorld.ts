import { Game } from "../lib/types"
import { visibleTiles } from "../lib/visibility"

export async function updateWorld(game: Game) {
  // calculate visible tiles
  game.map.visible = visibleTiles(game)
}
