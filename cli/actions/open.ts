import { playAudio } from "../lib/playAudio"
import { ActionResult, Actor, Game, Tile } from "../lib/types"

export async function open(actor: Actor, destinationTile: Tile, game: Game): Promise<ActionResult> {
  actor.time += actor.speed

  destinationTile.type = "\\"

  // play the opening door sound
  if (game.sound) playAudio(`door`, { volume: 0.2 })

  game.me.mood = "thinking"

  return { verb: "opened", tile: destinationTile }
}
