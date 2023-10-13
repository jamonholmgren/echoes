import { CursorPos, cursor, gray, green, white } from "bluebun"
import { Game, Tile, expressions } from "./types"
import { canSeeTile } from "./utils"

// print the map (assumes it's against the left side of the screen always)
export function drawMap(game: Game) {
  const discovered: Tile[] = []

  // hardcoded for now
  cursor.jump("mapstart").write(gray("Echoes in the Dark") + "\n\n")

  // we center the map on the character
  // remember that tiles are 2 cols wide and 1 row tall
  // but we do not take that into account here!
  const map = game.map
  const left = game.character.x - Math.floor(game.viewWidth / 2)
  const right = left + game.viewWidth
  const top = game.character.y - Math.floor(game.viewHeight / 2)
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

      const visible = canSeeTile(map, game.character.x, game.character.y, x, y, 5)

      if (visible && (!tile.discovered || !tile.actor?.discovered)) {
        tile.discovered = true
        discovered.push(tile)
      }

      if (visible && tile.actor) {
        line += expressions[tile.actor.expression]
        continue
      }

      const col = visible ? white : tile.discovered ? gray : (_: string) => "  "

      if (tile.type === "#") {
        line += col("██")
      } else if (tile.type === "/") {
        // door
        line += col("🚪")
      } else if (tile.type === "\\") {
        // open door
        line += col("[]")
      } else {
        line += col(gray("⬛️"))
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
  const mapStart = cursor.getBookmark("mapstart")

  const c = game.character

  hudPos = {
    cols: mapStart.cols + game.viewWidth * 2 + 2,
    rows: mapStart.rows,
  }

  hud(3, green(`  ${c.name} ${expressions[c.expression]}`))
  hud(4, `  Pos: ${c.x}x${c.y}`)
  hud(5, ``)
}

function hud(row: number, s: string) {
  cursor.goto(hudPos).down(row).write(s)
}
