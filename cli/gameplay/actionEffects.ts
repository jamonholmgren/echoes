import { Props, inputKey } from "bluebun"
import { dialog } from "../lib/dialog"
import { playAudio } from "../lib/playAudio"
import { ActionResult, Game, Mood } from "../lib/types"
import { chooseOne } from "../lib/utils"

export async function actionEffects(result: ActionResult, game: Game) {
  if (result.verb === "woke") {
    game.character.mood = "sleepy"
    dialog(game, ["You wake up."])
    await inputKey()
    game.character.time += game.character.speed
  }

  if (result.verb === "stopped") {
    game.character.mood = "surprised"
  }

  if (result.verb === "moved") {
    game.character.mood = chooseOne<Mood>(["neutral", "worried"])

    if (game.sound) playAudio(`footstep`, { volume: 0.5 })
  }

  if (result.verb === "opened") {
    game.character.mood = "thinking"
    // if (game.sound) playAudio(`${props.cliPath}/audio/door.wav`, { volume: 0.5 })
  }

  // no actions taken
  if (result.verb === "pending") {
    // do nothing
  }
}
