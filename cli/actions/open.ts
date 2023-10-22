import { playAudio } from "../audio/playAudio"
import { ActionResult, Actor, Game, Tile } from "../types"

export async function open(actor: Actor, destinationTile: Tile, game: Game): Promise<ActionResult> {
  actor.time += actor.speed

  destinationTile.type = "openDoor"

  // play the opening door sound
  if (game.sound) playAudio(`door`, { volume: 0.2 })

  // maybe?
  if (actor === game.me) actor.mood = "thinking"

  return { verb: "opened", tile: destinationTile }
}
