import { ActionResult, Actor, Game, Tile } from "../lib/types"

export async function open(actor: Actor, destinationTile: Tile, game: Game): Promise<ActionResult> {
  actor.time += actor.speed

  destinationTile.type = "\\"

  // play the opening door sound
  // if (game.sound) playAudio(`doorOpen`, { volume: 0.5 })

  return { verb: "opened", tile: destinationTile }
}
