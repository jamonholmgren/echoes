import { WALL_TORCH_RADIUS } from "../gameplay/constants"
import { tileTypes, type GameMap, type Tile, itemTypes, TileType, Item } from "../types"
import { getTilesAround, keys } from "../lib/utils"
import { canSee } from "../lib/visibility"

const tileTypeNames = keys(tileTypes)

// starting point for character: ☻
const tiles = `
###############################################################
#☼............................................................#
#.............................................................#
#.###/######/#######/####.....................................#
#.#☼.....#☼....☼#.......#.....................................#
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
      let type: TileType = "unknown"

      // ffs typescript
      const itemType = Object.keys(itemTypes).find((k: any) => (itemTypes as any)[k].tile === tile) as Item["type"]

      if (itemType) {
        // this is an item specification, so it's just a floor here
        type = "floor"
      } else {
        type = tileTypeNames.find((k) => tileTypes[k].tile === tile) || "unknown"
      }

      const t: Tile = {
        x,
        y,
        type,
        discovered: false,
        items: [],
        actor: undefined,
        lit: false,
      }

      if (itemType) {
        t.items.push({
          name: itemType,
          type: itemType,
          quantity: 1,
          discovered: false,
          owner: t,
        })
      }

      return t
    })
  )

export function calculateStaticMapLighting(tiles: Tile[][]) {
  // pre-calculate lighting
  tiles.forEach((row, y) => {
    row.forEach((tile, x) => {
      // find any close (within 3) lighting sources
      const tilesAround = getTilesAround({ tiles, visible: [] }, { x, y }, WALL_TORCH_RADIUS)
      tile.lit = tilesAround.some(
        (t) =>
          t.items.find((i) => i.type === "torch") && canSee({ tiles, visible: [] }, t.x, t.y, x, y, WALL_TORCH_RADIUS)
      )
    })
  })
}

calculateStaticMapLighting(tiles)

export const map: GameMap = {
  tiles,
  visible: [],
}
