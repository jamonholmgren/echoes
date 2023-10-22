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
import { type Game, moods, races, tileTypes, itemTypes } from "../types"

// print the map (assumes it's against the left side of the screen always)
export function drawMap(game: Game) {
  const me = game.me

  // hardcoded for now
  // cursor.jump("mapstart").write(gray("Echoes in the Dark") + "\n\n")
  // Echoes in the Dark but written in pseudo different font scary
  cursor.jump("mapstart").write(`${white(`Echoes`)} in the ${gray("Dark")}` + "\n\n")

  // we center the map on the character
  // remember that tiles are 2 cols wide and 1 row tall
  // but we do not take that into account here!
  const map = game.map
  const left = me.x - Math.floor(game.viewWidth / 2)
  const right = left + game.viewWidth
  const top = me.y - Math.floor(game.viewHeight / 2)
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

      // visible means within the character's eyesight and lit
      const isVisible = game.map.visible.includes(tile)

      let bgCol: string = bgColorEnd
      if (tile.discovered) {
        if (isVisible) {
          // lit areas are dark gray
          const c = 32
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
        tile.actor.visible = true

        if (tile.actor.race === "human") {
          line += moods[tile.actor.mood]
        } else {
          line += races[tile.actor.race]
        }
        continue
      } else if (!isVisible && !tile.discovered) {
        line += "  "
        if (tile.actor) tile.actor.visible = false
        continue
      }

      if (isVisible && tile.items.length > 0) {
        const firstItem = tile.items[0]
        const emoji = itemTypes[firstItem.type]?.draw
        if (emoji) {
          line += emoji
        } else {
          line += "❌"
        }
        continue
      }

      if (tile.type === "wall") {
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
      } else if (tile.type === "door") {
        // door
        line += "🚪"
      } else if (tile.type === "torch") {
        // light
        line += "🕯 "
      } else if (tile.type === "openDoor") {
        // open door
        line += "🚪"
      } else if (tile.type === "start") {
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
