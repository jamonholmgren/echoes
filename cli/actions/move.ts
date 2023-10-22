import type { ActionResult, Actor, Game, Mood } from "../types"
import { playAudio } from "../audio/playAudio"
import { chooseOne, distance } from "../lib/utils"
import { open } from "./open"
import { wake } from "./wake"

export async function move(actor: Actor, mx: number, my: number, game: Game): Promise<ActionResult> {
  if (actor.mood === "sleeping") return wake(actor, game)

  // get the current tile
  const currentTile = game.map.tiles[actor.y]?.[actor.x]
  if (!currentTile) return { verb: "pending", tile: currentTile }

  // try to move into the square
  const destinationX = actor.x + mx
  const destinationY = actor.y + my

  const destinationTile = game.map.tiles[destinationY]?.[destinationX]
  if (!destinationTile) return { verb: "pending", tile: destinationTile }

  // if there's another actor there return that
  if (destinationTile.actor) {
    // this won't do, as we need to ask the character what they'd like to do
    actor.time += actor.speed
    return { verb: "bumped", tile: destinationTile }
  }

  // if it's a wall, don't let them move ... try again
  if (destinationTile.type === "wall") {
    return { verb: "pending", tile: destinationTile }
  }

  // if it's a door, open it
  if (destinationTile.type === "door") return open(actor, destinationTile, game)

  // otherwise, let's move to the destination square
  actor.x = destinationX
  actor.y = destinationY

  // remove the actor from its current tile
  if (currentTile.actor === actor) currentTile.actor = undefined

  // set this new tile's actor to the actor
  destinationTile.actor = actor

  // set the actor's tile to this new tile
  actor.tile = destinationTile

  // advance time for the actor
  actor.time += actor.speed

  if (game.sound) {
    // figure out distance to the character
    const d = actor.me ? 0 : distance(actor, game.me)
    const volume = (1 - d / 20) * 0.5
    if (volume > 0) playAudio(`footstep`, { volume })
  }

  game.me.mood = chooseOne<Mood>(["neutral", "worried"])

  return { verb: "moved", tile: destinationTile }
}
