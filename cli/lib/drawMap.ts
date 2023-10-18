import {
  CursorPos,
  cursor,
  gray,
  green,
  white,
  bgColorEnd,
  colorEnd,
  colorStart,
  ansiColors,
  bgColorRGBStart,
} from "bluebun"
import { Game, Tile, moods, races } from "./types"
import { distance } from "./utils"
import { TORCH_RADIUS } from "../gameplay/constants"

// print the map (assumes it's against the left side of the screen always)
export function drawMap(game: Game, visible: Tile[]) {
  const c = game.me

  // hardcoded for now
  // cursor.jump("mapstart").write(gray("Echoes in the Dark") + "\n\n")
  // Echoes in the Dark but written in pseudo different font scary
  cursor.jump("mapstart").write(`${white(`Echoes`)} in the ${gray("Dark")}` + "\n\n")

  // we center the map on the character
  // remember that tiles are 2 cols wide and 1 row tall
  // but we do not take that into account here!
  const map = game.map
  const left = c.x - Math.floor(game.viewWidth / 2)
  const right = left + game.viewWidth
  const top = c.y - Math.floor(game.viewHeight / 2)
  const bottom = top + game.viewHeight

  // print the map
  // print the top border
  cursor.write("┌" + "──".repeat(game.viewWidth) + "┐\n")
  for (let y = top; y < bottom; y++) {
    const row = map.tiles[y]
    if (!row) {
      // make sure to draw the border too
      cursor.write("│" + "  ".repeat(game.viewWidth) + "│\n")
      continue
    }

    let line = ""
    let curCol = ""
    let curBg = ""

    for (let x = left; x < right; x++) {
      const tile = row[x]

      if (!tile) {
        if (curBg !== bgColorEnd) {
          line += bgColorEnd
          curBg = bgColorEnd
        }
        line += "  " // out of bounds
        continue
      }

      // calculate dynamic light based on how far from the character this tile is
      // and add it to the tile's base lighting
      const characterLit = distance(c, tile) < TORCH_RADIUS
      const isLit = tile.lit || characterLit

      // const isVisible = canSeeTile(map, c.x, c.y, x, y, c.eyesight)
      // visible means within the character's eyesight and lit
      const isVisible = visible.includes(tile) && isLit

      let bgCol: string = bgColorEnd
      if (tile.discovered) {
        if (isVisible) {
          // use the light for gray
          const c = 64
          bgCol = bgColorRGBStart(c, c, c)
        } else {
          // discovered but not visible means we have a black background
          bgCol = bgColorEnd
        }
      }

      if (curBg !== bgCol) {
        line += bgCol
        curBg = bgCol
      }

      if (isVisible && tile.actor) {
        tile.actor.tags.visible = true

        if (tile.actor.race === "human") {
          line += moods[tile.actor.mood]
        } else {
          line += races[tile.actor.race]
        }
        continue
      } else if (!isVisible && !tile.discovered) {
        line += "  "
        if (tile.actor) tile.actor.tags.visible = false
        continue
      }

      if (tile.type === "#") {
        // not sure which of these wall icons is best
        // line += col(gray("⬛️"))
        // line += col("██")
        // line += col("▓▓")

        if (curCol != colorEnd) {
          line += colorEnd
          curCol = colorEnd
        }

        line += "░░"
        // line += col("▒▒")
        // line += col("██")
      } else if (tile.type === "/") {
        // door
        line += "🚪"
      } else if (tile.type === "☼") {
        // light
        line += "🕯 "
      } else if (tile.type === "\\") {
        // open door
        line += "🚪"
      } else if (tile.type === "☻") {
        // player
        line += "··"
      } else {
        // not sure which of these is best
        // line += col(gray("⬛️"))
        const g = colorStart(ansiColors.gray)
        if (curCol != g) {
          line += g
          curCol = g
        }

        line += "··"
        // line += col("  ")
      }
    }
    cursor.write("│" + line + colorEnd + bgColorEnd + "│\n")

    // logError(JSON.stringify(line, null, 2))
  }
  // print the bottom border
  cursor.write("└" + "─".repeat(game.viewWidth * 2) + "┘\n")

  drawHUD(game)
}

let hudPos: CursorPos
function drawHUD(game: Game) {
  const mapStart = cursor.bookmarks["mapstart"]

  const c = game.me

  hudPos = {
    cols: mapStart.cols + game.viewWidth * 2 + 2,
    rows: mapStart.rows,
  }

  hud(3, green(`  ${c.name} ${moods[c.mood]}`))
  hud(4, `  Pos: ${c.x}x${c.y}`)
  hud(5, `  Time: ${c.time}`)
  hud(6, `  Speed: ${c.speed}`)
  hud(7, ``)
}

function hud(row: number, s: string) {
  cursor.goto(hudPos).down(row).write(s)
}
