import type { ActionResult, Actor, Game } from "../lib/types"
import { wake } from "./wake"

export async function move(mx: number, my: number, game: Game, actor: Actor): Promise<ActionResult> {
  if (actor.mood === "sleeping") return wake(actor, game)

  // get the current tile
  const currentTile = game.map.tiles[actor.y][actor.x]

  // try to move into the square
  const destinationX = actor.x + mx
  const destinationY = actor.y + my

  const destinationTile = game.map.tiles[destinationY][destinationX]

  if (!destinationTile) return { verb: "stopped", tile: destinationTile }

  // if there's another actor there return that
  if (destinationTile.actor) return { verb: "bumped", tile: destinationTile }

  // if it's a wall, stop
  if (destinationTile.type === "#") return { verb: "stopped", tile: destinationTile }

  // if it's a door, open it
  if (destinationTile.type === "/") {
    // change the wall to open door (backslash)
    destinationTile.type = "\\"
    return { verb: "opened", tile: destinationTile }
  }

  // otherwise, let's move to the destination square
  actor.x = destinationX
  actor.y = destinationY

  // remove the actor from its current tile
  if (currentTile.actor === actor) currentTile.actor = undefined

  // set this new tile's actor to the actor
  destinationTile.actor = actor

  // advance time for the actor
  actor.time += actor.speed

  return { verb: "moved", tile: destinationTile }
}
