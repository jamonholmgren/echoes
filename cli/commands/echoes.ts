import { type Props, print, cursor, gray, ask, choose, inputKey, yellow, white, delay, inputKeys } from "bluebun"
import { ActionResult, Actor, moods, Tile, type Game, type SavedGames, Mood } from "../lib/types"
import { map } from "../maps/dungeon"
import { tryMove } from "../actions/tryMove"
import { dialog } from "../lib/dialog"
import { drawMap } from "../lib/drawMap"
import { cancelAllAudio, playAudio } from "../lib/playAudio"
import { chooseOne, chooseKey } from "../lib/utils"
import { goblin } from "../npcs/goblin"

// half second delay between movement inputs on purpose
let inputDelay = 200
let delayTimer: Promise<unknown> | undefined = undefined

const interfaceWidth = 80 // total width
const interfaceHeight = 24 // total height

export default {
  name: "echoes",
  description: "Echoes the given arguments",
  run: async (props: Props) => {
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
      (acc, row, y) => row.reduce((acc, tile, x) => (tile.type === "☻" ? { x, y } : acc), acc),
      { x: 0, y: 0 }
    )

    if (x === 0 && y === 0) throw new Error("Could not find starting position for character")

    const name = await ask("What is your character's name? ")
    cursor.write("Turn on sound? (y/n)")
    const sound = (await chooseKey(["y", "n"])) === "y"

    const character: Actor = {
      x,
      y,
      mood: "sleeping",
      name,
      race: "human",
      eyesight: 14,
      speed: 10,
      time: 0,
      discovered: true,
      history: [],
    }

    // for now, we'll just make a new game each time
    const game: Game = {
      map,
      character,
      actors: [goblin({ x: 10, y: 10 })],
      interfaceWidth,
      interfaceHeight,
      viewWidth: 40,
      viewHeight: 20,
      sound,
    }

    function cleanup() {
      // cleanup!
      cursor.alternate(false).show().write(`

I hope you enjoyed Echoes of the Dark!

If you have any feedback, please let me know on Twitter: https://x.com/jamonholmgren

I'd love to hear from you!

      \n`)

      cancelAllAudio()
    }

    // register cleanup function when we exit
    process.on("exit", cleanup)

    // add every character to the tile they are standing on
    ;[game.character, ...game.actors].forEach((actor) => {
      const tile = game.map.tiles[actor.y][actor.x]
      tile.actor = actor
    })

    cancelAllAudio() // just in case

    // alternate screen buffer
    cursor.alternate(true)

    await delay(1)

    cursor.hide().clearScreen()

    // bookmark the top left corner of the map, which will be our game screen starting point
    const startPos = { cols: 1, rows: 1 }

    cursor.bookmark("mapstart", { cols: startPos.cols, rows: startPos.rows + 2 })

    if (game.sound) playAudio(`${props.cliPath}/audio/music-01.wav`, { volume: 0.1, repeat: true })

    // gameloop
    let runawayLoopProtection = 0
    while (true) {
      runawayLoopProtection++
      if (runawayLoopProtection > 1000) {
        console.error(game)
        throw new Error("runaway game loop detected, exiting")
      }

      const discovered = drawMap(game)

      if (discovered.length > 0) {
        // eventually, say something in the log that you see something
        // for now, make the character surprised
        const interestingDiscoveredTiles = ["/", "\\"]
        const interesting = discovered.find((t) => interestingDiscoveredTiles.includes(t.type))
        if (interesting && game.character.mood !== "surprised") {
          game.character.mood = "surprised"
          continue // loop back around so we can rerender
        }
      }

      // loop through every actor and see who is next to move
      // sort by furthest behind in time
      game.actors.sort((a, b) => a.time - b.time)
      const actor = game.actors[0]
      if (actor && actor.time < game.character.time) {
        // it's the actor's turn
        if (actor.act) {
          // small delay before every actor
          await delay(250)
          const result = await actor.act(game)

          // handle result
          if (result.verb === "bumped") {
            // do nothing for now, but eventually we'll have the actor do something
            // like attack the player or talk to them or something
          }
        }

        // advance the game time for the actor
        actor.time += actor.speed

        // loop back!
        continue
      }

      // okay, my turn!
      const k = await inputKey()

      // ensure we wait at least inputDelay before the next input
      // this is to prevent the player from moving too fast
      // however, any processing delay will be taken into account
      await delayTimer

      // starts the delay timer over again immediately
      delayTimer = delay(inputDelay)

      // quitting
      if (k === "escape") {
        dialog(game, startPos, ["Are you sure you want to quit? (y/n)"])
        const quit = await chooseKey(["y", "n"])
        if (quit === "y") break
        continue
      }

      let result: ActionResult = { verb: "pending", tile: undefined }

      // movement
      if (k === "w") result = tryMove(0, -1, game, game.character)
      if (k === "s") result = tryMove(0, 0, game, game.character) // rest
      if (k === "x") result = tryMove(0, 1, game, game.character)
      if (k === "a") result = tryMove(-1, 0, game, game.character)
      if (k === "d") result = tryMove(1, 0, game, game.character)
      if (k === "q") result = tryMove(-1, -1, game, game.character)
      if (k === "e") result = tryMove(1, -1, game, game.character)
      if (k === "z") result = tryMove(-1, 1, game, game.character)
      if (k === "c") result = tryMove(1, 1, game, game.character)

      // you know, i should probably use xstate for these transition effects
      if (result.verb === "woke") {
        game.character.mood = "sleepy"
        dialog(game, startPos, ["You wake up."])
        await inputKey()
        game.character.time += game.character.speed
        continue
      }
      if (result.verb === "stopped") {
        game.character.mood = "surprised"
      }
      if (result.verb === "moved") {
        game.character.mood = chooseOne<Mood>(["neutral", "worried"])
        // advance the game time for the character

        if (game.sound) playAudio(`${props.cliPath}/audio/footstep.wav`, { volume: 0.5 })
      }
      if (result.verb === "opened") {
        game.character.mood = "thinking"
        // if (game.sound) playAudio(`${props.cliPath}/audio/door.wav`, { volume: 0.5 })
      }

      // no actions taken
      if (result.verb === "pending") {
        // do nothing
      }
      runawayLoopProtection = 0
    }

    cleanup()
    process.exit(0)
  },
}
