import { move } from "../actions/move"
import { dialogSpace } from "../lib/dialog"
import { drawMap } from "../graphics/drawMap"
import { Game } from "../types"
import { getActorNamed, getTile, logError } from "../lib/utils"
import { makeItem } from "../items/makeItem"

export async function storyline(game: Game) {
  const me = game.me

  if (!me.storyline.start) {
    drawMap(game)
    await dialogSpace(game, [
      "A single candle flickers on the wall nearby.",
      "As you look around, you realize you are in a dungeon cell.",
      "You see a door on one wall. The cell is empty otherwise.",
    ])
    return (me.storyline.start = true)
  }

  if (!me.storyline.guardKnock) {
    await dialogSpace(game, [
      "Suddenly, a voice booms out from behind the door.",
      `"GET UP, WRETCHES! BACK TO THE MINES FOR YOU!"`,
    ])
    return (me.storyline.guardKnock = true)
  }

  if (!me.storyline.guardOpen) {
    const door = game.map.tiles[3][12]
    if (!door || door.type !== "door") {
      logError("Couldn't get the closest door! It was a " + door.type)
      process.exit(1)
    }
    door.type = "openDoor"
    drawMap(game)

    await dialogSpace(game, ["The door bursts open."])

    return (me.storyline.guardOpen = true)
  }

  if (!me.storyline.guardShow) {
    const guard = getActorNamed(game, "Guard")
    await move(guard, 0, 1, game)
    await move(guard, 0, 1, game)
    drawMap(game)

    await dialogSpace(game, ["A hulking guard stands there.", `"YOU! GET UP!"`])

    return (me.storyline.guardShow = true)
  }

  if (!me.storyline.guardGivePickaxe) {
    const guard = getActorNamed(game, "Guard")

    let tile = getTile(game.map, { x: me.x, y: me.y - 1 })
    if (tile.type !== "floor") tile = getTile(game.map, { x: me.x, y: me.y + 1 })
    if (tile.type !== "floor") tile = getTile(game.map, { x: me.x - 1, y: me.y })
    if (tile.type !== "floor") tile = getTile(game.map, { x: me.x + 1, y: me.y })
    if (tile.type !== "floor") {
      logError("Couldn't find a suitable spot to put the pickaxe!")
      process.exit(1)
    }

    const pickaxe = makeItem({
      name: "Rusty Pickaxe",
      type: "pick",
      tile: tile,
      x: tile.x,
      y: tile.y,
      discovered: false,
    })

    tile.items.push(pickaxe)

    drawMap(game)

    await dialogSpace(game, [
      `You stand, shakily. The guard throws something at your feet.`,
      `It's a rusty old pickaxe.`,
      `"TIME TO GO MINING! GRAB A CANDLE."`,
    ])

    return (me.storyline.guardGivePickaxe = true)
  }

  if (me.storyline.guardLeave === 0) {
    const guard = getActorNamed(game, "Guard")
    await move(guard, 0, -1, game)
    drawMap(game)

    await dialogSpace(game, [`The guard leaves.`])

    return (me.storyline.guardLeave = 1)
  }

  if (me.storyline.guardLeave >= 1 && me.storyline.guardLeave <= 4) {
    const guardPath = [
      [0, -1],
      [0, -1],
      [1, 0],
      [1, 0],
    ]
    const guard = getActorNamed(game, "Guard")
    const mx = guardPath[me.storyline.guardLeave - 1][0]
    const my = guardPath[me.storyline.guardLeave - 1][1]
    await move(guard, mx, my, game)
    return (me.storyline.guardLeave += 1)
  }
}
