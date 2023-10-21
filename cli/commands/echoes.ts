import { type Props, print, cursor, gray, ask, yellow, delay, inputKey } from "bluebun"
import type { Actor, Game } from "../lib/types"
import { map } from "../maps/dungeon"
import { cancelAllAudio } from "../lib/playAudio"
import { chooseKey, getErrors, logError } from "../lib/utils"
import { makeGoblin } from "../actors/goblin"
import { gameLoop } from "../gameplay/gameLoop"
import { makeCharacter } from "../actors/character"
import { guardActors } from "../lib/guards"

const interfaceWidth = 80 // total width
const interfaceHeight = 24 // total height

export default {
  name: "echoes",
  description: "Echoes the given arguments",
  run: async (props: Props) => {
    const debug = !!props.options.debug

    cursor.write(`\nWelcome to Echoes of the Dark!\n\n`)

    if (process.stdout.columns < interfaceWidth || process.stdout.rows < interfaceHeight) {
      print(yellow("Psst...make your terminal bigger! This game won't work very well at this size."))
      print(
        gray(
          `(Your terminal is ${process.stdout.columns}x${process.stdout.rows}, and we need at least ${interfaceWidth}x${interfaceHeight})`
        )
      )
      return
    }

    if (process.env.TERM_PROGRAM === "Apple_Terminal") {
      print(yellow("\nPsst...you're using Apple's Terminal.app. This game won't work very well in that.\n"))
      print(gray(`Try Visual Studio Code's built-in terminal or Warp instead!`))
      print(gray("It might also work with iTerm2, but I have not tested it"))
      print(gray("The reason is because Terminal doesn't support background"))
      print(gray("colors nor hex/rgb colors, which this game uses.\n"))
      return
    }

    // get the character starting position from the map
    const { x, y } = map.tiles.reduce(
      (acc, row, y) => row.reduce((acc, tile, x) => (tile.type === "start" ? { x, y } : acc), acc),
      { x: 0, y: 0 }
    )

    if (x === 0 && y === 0) throw new Error("Could not find starting position for character")

    const name = await ask("What is your character's name? ")
    cursor.write("Turn on sound? (y/n)")
    const sound = (await chooseKey(["y", "n"])) === "y"

    const character = makeCharacter({ x, y, name })

    // for now, we'll just make a new game each time
    const game: Game = {
      map,
      // we keep a special reference to the main character
      me: character,
      // but they're also just a normal actor in some ways
      actors: [character, makeGoblin({ name: "Guard", x: 12, y: 2 })],
      // bookmark the top left corner of the map, which will be our game screen starting point
      startPos: { cols: 1, rows: 1 },
      interfaceWidth,
      interfaceHeight,
      viewWidth: 40,
      viewHeight: 20,
      sound,
    }

    function cleanup(code: number) {
      if (code === 0 || code === null) {
        // cleanup!
        if (!debug) cursor.alternate(false)
        cursor.show().write(`

      I hope you enjoyed Echoes of the Dark!

      If you have any feedback, please let me know on Twitter: https://x.com/jamonholmgren

      I'd love to hear from you!

      `)
      }

      cursor.show().write(`
      ---
      ${getErrors()
        .map((e, i) => `Error ${i}:\n${e}`)
        .join("\n\n")}
      ---
      `)

      cancelAllAudio()
    }

    // register cleanup function when we exit
    process.on("exit", cleanup)

    guardActors(game)

    // add every character to the tile they are standing on
    game.actors.forEach((actor) => {
      const tile = game.map.tiles[actor.y][actor.x]

      if (!tile) {
        logError(`Actor ${actor.name} is not on a tile! This is a bug.`)
        logError(`Actor info: ${JSON.stringify(actor, null, 2)}`)
        process.exit(1)
      }

      // doubly linked objects
      tile.actor = actor
      actor.tile = tile
    })

    cancelAllAudio() // just in case

    // alternate screen buffer
    if (!debug) cursor.alternate(true)

    await delay(1)

    cursor.hide().clearScreen()

    await gameLoop(game, props)
  },
}
