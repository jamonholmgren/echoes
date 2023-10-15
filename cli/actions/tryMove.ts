import type { ActionResult, Actor, Game } from "../lib/types"

export function tryMove(mx: number, my: number, game: Game, actor: Actor): ActionResult {
  // first off, if the character is sleeping, wake them up
  if (actor.mood === "sleeping") {
    return { verb: "woke", tile: undefined }
  }

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

  // let's set this tile's actor to the actor
  destinationTile.actor = actor

  return { verb: "moved", tile: destinationTile }
}
