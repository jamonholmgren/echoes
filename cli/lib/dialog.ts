import { CursorPos, cursor, inputKey } from "bluebun"
import { type Game } from "./types"

export function dialog(game: Game, topleft: CursorPos, lines: string[]) {
  const widestString = lines.reduce((a, b) => (a.length > b.length ? a : b), "")
  const dialogWidth = widestString.length + 4
  const dialogHeight = lines.length + 2
  const mapViewportWidth = game.playWidth * 2
  const mapViewportHeight = game.playHeight

  const left = Math.ceil((mapViewportWidth - dialogWidth) / 2) + topleft.cols
  const top = Math.ceil((mapViewportHeight - dialogHeight) / 2) + topleft.rows

  // // for debugging only
  // cursor.goto({ cols: 1, rows: 24 })
  // console.log({
  //   dialogWidth,
  //   dialogHeight,
  //   mapViewportWidth,
  //   mapViewportHeight,
  //   left,
  //   top,
  //   tlc: topleft.cols,
  //   tlr: topleft.rows,
  //   mapstart: cursor.getBookmark("mapstart"),
  //   leftCalc: `(mapWidth(${mapViewportWidth}) - dialogWidth(${dialogWidth})) / 2 + topleft.cols(${topleft.cols})`,
  //   topCalc: `(mapHeight(${mapViewportHeight}) - dialogHeight(${dialogHeight})) / 2 + topleft.rows(${topleft.rows})`,
  // })

  // draw the box
  cursor.goto({ cols: left, rows: top }).write("┌" + "─".repeat(dialogWidth) + "┐")
  for (let i = 0; i < dialogHeight - 2; i++) {
    const text = lines[i]
    const padding = " ".repeat(dialogWidth - 2 - text.length)
    cursor.goto({ cols: left, rows: top + 1 + i }).write("│" + "  " + text + padding + "│")
  }
  cursor.goto({ cols: left, rows: top + dialogHeight - 1 }).write("└" + "─".repeat(dialogWidth) + "┘")
}
