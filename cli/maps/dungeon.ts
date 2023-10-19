import { WALL_TORCH_RADIUS } from "../gameplay/constants"
import { tileTypes, type GameMap, type Tile } from "../lib/types"
import { distance, getTilesAround, keys } from "../lib/utils"
import { canSee } from "../lib/visibility"

const tileTypeNames = keys(tileTypes)

// starting point for character: ☻
const tiles = `
###############################################################
#☼............................................................#
#.............................................................#
#.###/######/#######/####.....................................#
#.#☼.....#.....☼#.......#.....................................#
#.#......#...☻..#.......#.....................................#
#.#......#......#.......#.....................................#
#.#######################.....................................#
#.............................................................#
#.............................................................#
#.............................................................#
#.............................................................#
#.............................................................#
#.............................................................#
#.............................................................#
#.............................................................#
###############################################################
`
  .split("\n")
  .filter((row) => row.length > 0) // remove empty lines
  .map((row) => row.split(""))
  .map((row, y) =>
    row.map((tile, x) => {
      const t: Tile = {
        x,
        y,
        type: tileTypeNames.find((t) => tileTypes[t].tile === tile) || "unknown",
        discovered: false,
        items: [],
        actor: undefined,
        lit: false,
      }

      return t
    })
  )

export function calculateStaticMapLighting(tiles: Tile[][]) {
  // pre-calculate lighting
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      const tile = tiles[y][x]
      // find any close (within 3) lighting sources
      const tilesAround = getTilesAround({ tiles }, x, y, WALL_TORCH_RADIUS)
      const lit = tilesAround.some((t) => t.type === "torch" && canSee({ tiles }, t.x, t.y, x, y, WALL_TORCH_RADIUS))
      tile.lit = lit
    }
  }
}

calculateStaticMapLighting(tiles)

export const map: GameMap = {
  tiles,
}
