import { CursorPos, bgBrightBlack, bgGray, bgRed, cursor, gray, green, white, bgColorHex } from "bluebun"
import { Game, Tile, moods, races } from "./types"
import { canSeeTile } from "./utils"

const bgDarkGray = bgColorHex("#232323")

// print the map (assumes it's against the left side of the screen always)
export function drawMap(game: Game) {
  const c = game.character
  const discovered: Tile[] = []

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
    for (let x = left; x < right; x++) {
      const tile = row[x]

      if (!tile) {
        line += "  " // out of bounds
        continue
      }

      const visible = canSeeTile(map, c.x, c.y, x, y, c.eyesight)

      if (visible && (!tile.discovered || tile.actor?.discovered === false)) {
        tile.discovered = true
        if (tile.actor) tile.actor.discovered = true
        discovered.push(tile)
      }

      if (visible && tile.actor) {
        if (tile.actor.race === "human") {
          line += bgDarkGray(moods[tile.actor.mood])
        } else {
          line += races[tile.actor.race]
        }
        continue
      }

      const col = visible ? bgDarkGray : tile.discovered ? gray : (_: string) => "  "

      if (tile.type === "#") {
        // not sure which of these wall icons is best
        // line += col(gray("⬛️"))
        // line += col("██")
        // line += col("▓▓")
        line += col("░░")
        // line += col("▒▒")
        // line += col("██")
      } else if (tile.type === "/") {
        // door
        line += col("🚪")
      } else if (tile.type === "\\") {
        // open door
        line += col("🚪")
      } else {
        // not sure which of these is best
        // line += col(gray("⬛️"))
        line += col(gray("··"))
        // line += col("  ")
      }
    }
    cursor.write("│" + line + "│\n")
  }
  // print the bottom border
  cursor.write("└" + "─".repeat(game.viewWidth * 2) + "┘\n")

  drawHUD(game)

  return discovered
}

let hudPos: CursorPos
function drawHUD(game: Game) {
  const mapStart = cursor.bookmarks["mapstart"]

  const c = game.character

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
