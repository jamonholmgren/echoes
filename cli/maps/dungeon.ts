import { GameMap } from "../lib/types"

const tiles = `
################################
#..............#...../.........#
#............../....##.........#
#..............#..###..........#
#..............####............#
#..............#...............#
#..............#...............#
#..............#...............#
#..............#...............#
######/######################/##
#..............#...............#
#..............#...............#
#..............#...............#
#............../...............#
#..............#...............#
################################`
  .split("\n")
  .filter((row) => row.length > 0) // remove empty lines
  .map((row) => row.split(""))
  .map((row, y) =>
    row.map((tile, x) => ({
      type: tile,
      discovered: false,
      items: [],
      actor: undefined,
      // x,
      // y,
    }))
  )

export const map: GameMap = {
  tiles,
}
