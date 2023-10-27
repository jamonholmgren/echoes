import { CursorPos, cursor, gray, inputKey, stripANSI } from "bluebun"
import { type Game } from "../types"
import { waitSpace } from "./utils"

export function dialog(game: Game, lines: string[]) {
  const widestString = lines.reduce((a, b) => (stripANSI(a).length > stripANSI(b).length ? a : b), "")
  const dialogWidth = widestString.length + 4
  const dialogHeight = lines.length + 2
  const mapViewportWidth = game.viewWidth * 2
  const mapViewportHeight = game.viewHeight

  const left = Math.ceil((mapViewportWidth - dialogWidth) / 2) + game.startLoc.x
  const top = Math.ceil((mapViewportHeight - dialogHeight) / 2) + game.startLoc.y

  // draw the box
  cursor.goto({ cols: left, rows: top }).write("┌" + "─".repeat(dialogWidth) + "┐")
  for (let i = 0; i < dialogHeight - 2; i++) {
    const text = lines[i]
    const padding = " ".repeat(dialogWidth - 2 - stripANSI(text || "").length)
    cursor.goto({ cols: left, rows: top + 1 + i }).write("│" + "  " + text + padding + "│")
  }
  cursor.goto({ cols: left, rows: top + dialogHeight - 1 }).write("└" + "─".repeat(dialogWidth) + "┘")
}

export async function dialogSpace(game: Game, lines: string[]) {
  dialog(game, lines.concat(["", gray("space to continue")]))
  await waitSpace()
}
