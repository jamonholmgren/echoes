import { move } from "../actions/move"
import { rest } from "../actions/rest"
import { ActionResult, Game } from "../types"

export async function handleInput(k: string, game: Game) {
  let result: ActionResult = { verb: "pending", tile: undefined }

  const c = game.me

  if (k === "s") result = await rest(c, game)
  if (k === "w") result = await move(c, 0, -1, game)
  if (k === "x") result = await move(c, 0, 1, game)
  if (k === "a") result = await move(c, -1, 0, game)
  if (k === "d") result = await move(c, 1, 0, game)
  if (k === "q") result = await move(c, -1, -1, game)
  if (k === "e") result = await move(c, 1, -1, game)
  if (k === "z") result = await move(c, -1, 1, game)
  if (k === "c") result = await move(c, 1, 1, game)

  return result
}
