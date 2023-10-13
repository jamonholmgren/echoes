import { type Props, print, cursor, gray, ask, choose, inputKey, yellow, white, delay } from "bluebun"
import { ActionResult, Actor, expressions, Tile, type Game, type SavedGames } from "../lib/types"
import { map } from "../maps/dungeon"
import { tryMove } from "../lib/behaviors"
import { dialog } from "../lib/dialog"
import { drawMap } from "../lib/drawMap"
import { cancelAllAudio, playAudio } from "../lib/playAudio"

// half second delay between movement inputs on purpose
let inputDelay = 200
let delayTimer: Promise<unknown> | undefined = undefined

export default {
  name: "echoes",
  description: "Echoes the given arguments",
  run: async (props: Props) => {
    const character: Actor = {
      x: 12,
      y: 7,
      expression: "sleeping",
      name: await ask("What is your character's name? "),
      type: "player",
      // 10 is normal, 20 is slow, 5 is fast, 1 is incredibly fast
      speed: 10,
      time: 0,
      discovered: true,
    }

    // TODO: fix issue that requires setting this
    await cursor.bookmark("ask-start")

    // for now, we'll just make a new game each time
    const game: Game = {
      map,
      character,
      actors: [
        {
          x: 10,
          y: 10,
          expression: "goblin",
          name: "Goblin",
          type: "npc",
          speed: 10,
          time: 1,
          discovered: false,
        },
      ],
      interfaceWidth: 80, // total width
      interfaceHeight: 24, // total height
      viewWidth: 40,
      viewHeight: 20,
      sound: (await choose(["sound on", "sound off"])) === "sound on",
    }

    // register cleanup function when we exit
    process.on("exit", (code) => {
      // cleanup!
      cursor.alternate(false).show()
      if (game.sound) cancelAllAudio()
    })

    // add every character to the tile they are standing on
    ;[game.character, ...game.actors].forEach((actor) => {
      const tile = game.map.tiles[actor.y][actor.x]
      tile.actor = actor
    })

    cancelAllAudio() // just in case

    if (process.stdout.columns < game.interfaceWidth || process.stdout.rows < game.interfaceHeight) {
      print(yellow("Psst...make your terminal bigger! This game won't work very well at this size."))
      print(
        gray(
          `(Your terminal is ${process.stdout.columns}x${process.stdout.rows}, and we need at least ${game.interfaceWidth}x${game.interfaceHeight})`
        )
      )
      return
    }

    // alternate screen buffer
    cursor.alternate(true).hide().write("\n")

    // bookmark the top left corner of the map, which will be our game screen starting point
    const startPos = await cursor.queryPosition()

    cursor.bookmark("mapstart", { cols: startPos.cols, rows: startPos.rows + 1 })

    if (game.sound) playAudio(`${props.cliPath}/audio/music-01.wav`, { volume: 0.1, repeat: true })

    // gameloop
    while (true) {
      const discovered = drawMap(game)

      if (discovered.length > 0) {
        // eventually, say something in the log that you see something
        // for now, make the character surprised
        const interestingDiscoveredTiles = ["/", "\\"]
        const interesting = discovered.find((t) => interestingDiscoveredTiles.includes(t.type))
        if (interesting) {
          game.character.expression = "surprised"
          continue // loop back around
        }
      }

      // loop through every actor and see who is next to move
      // sort by furthest behind in time
      game.actors.sort((a, b) => a.time - b.time)
      const actor = game.actors[0]
      if (actor && actor.time < game.character.time) {
        // move the actor
        const result = tryMove(0, 0, game, actor)

        // handle result
        if (result.verb === "bumped") {
          // do nothing for now, but eventually we'll have the actor do something
          // like attack the player or talk to them or something
        }

        // advance the game time for the actor
        actor.time += actor.speed

        // loop back!
        continue
      }

      // okay, my turn!
      const k = await inputKey()

      // ensure we wait at least inputDelay before the next input
      await delayTimer

      // starts the delay timer over again
      delayTimer = delay(inputDelay)

      // quitting
      if (k === "escape") {
        dialog(game, startPos, ["Are you sure you want to quit? (y/n)"])
        const quit = await inputKey()
        if (quit === "y") break
        continue
      }

      let result: ActionResult = { verb: "stopped", tile: undefined }

      // movement
      if (k === "w") result = tryMove(0, -1, game, game.character)
      if (k === "s") result = tryMove(0, 1, game, game.character)
      if (k === "x") result = tryMove(0, 1, game, game.character)
      if (k === "a") result = tryMove(-1, 0, game, game.character)
      if (k === "d") result = tryMove(1, 0, game, game.character)
      if (k === "q") result = tryMove(-1, -1, game, game.character)
      if (k === "e") result = tryMove(1, -1, game, game.character)
      if (k === "z") result = tryMove(-1, 1, game, game.character)
      if (k === "c") result = tryMove(1, 1, game, game.character)

      // you know, i should probably use xstate for these transition effects
      if (result.verb === "woke") {
        game.character.expression = "sleepy"
        dialog(game, startPos, ["You wake up."])
        await inputKey()
        game.character.time += game.character.speed
        continue
      }
      if (result.verb === "stopped") game.character.expression = "surprised"
      if (result.verb === "moved") {
        game.character.expression = "worried"
        // advance the game time for the character
        game.character.time += game.character.speed
        if (game.sound) playAudio(`${props.cliPath}/audio/footstep.wav`, { volume: 0.5 })
      }
      if (result.verb === "opened") {
        game.character.expression = "thinking"
        // if (game.sound) playAudio(`${props.cliPath}/audio/door.wav`, { volume: 0.5 })
        // advance the game time for the character
        game.character.time += game.character.speed
      }
    }
  },
}
