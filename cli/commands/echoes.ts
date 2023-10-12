import { type Props, print, cursor, gray, ask, choose, inputKey, yellow, white } from "bluebun"
import { ActionResult, Actor, expressions, Tile, type Game, type SavedGames } from "../lib/types"
import { map } from "../maps/dungeon"
import { canSeeTile } from "../lib/utils"
import { tryMove } from "../lib/behaviors"

export default {
  name: "echoes",
  description: "Echoes the given arguments",
  run: async (props: Props) => {
    // print(gray("\n\n\n      Echoes in the Dark\n\n\n"))

    // // Get the folder where we save app data
    // const savedir = await appdir()
    // const savefile = savedir + "/echoes-saves.json"
    // print(savefile)

    // // Load any saved games
    // let saved: SavedGames = {
    //   games: [
    //     {
    //       name: "Empty 1",
    //     },
    //     {
    //       name: "Empty 2",
    //     },
    //     {
    //       name: "Empty 3",
    //     },
    //     {
    //       name: "Empty 4",
    //     },
    //     {
    //       name: "Empty 5",
    //     },
    //   ],
    // }

    // let game = saved.games[0]

    // try {
    //   saved = await Bun.file(savefile).json()
    // } catch (e) {
    //   // no saved games, so we'll just ignore this
    // }

    // // choose a save slot (of 5)
    // print("Choose a save slot:")
    // const slots = [
    //   saved.games[0]?.name || "Empty 1",
    //   saved.games[1]?.name || "Empty 2",
    //   saved.games[2]?.name || "Empty 3",
    //   saved.games[3]?.name || "Empty 4",
    //   saved.games[4]?.name || "Empty 5",
    // ]
    // const slot = await choose(slots)

    // game = saved.games.find((g) => g.name === slot) || game

    // // if empty, ask for a name
    // if (game.name.startsWith("Empty")) {
    //   game.name = await ask("What is your character's name? ")
    // }

    // await fs.writeFile(savefile, JSON.stringify(saved))

    // // print the saved games
    // console.log(saved, savefile)

    // get the cursor position
    // const startPos = await cursor.queryPosition()
    // cursor.show().write("\n")
    // console.log({ startPos })

    const character: Actor = {
      x: 2,
      y: 2,
      expression: "sleeping",
      name: await ask("What is your character's name? "),
      type: "player",
    }

    // alternate screen buffer
    cursor.alternate(true).hide()

    // for now, we'll just make a new game each time
    const game: Game = {
      map,
      character,
    }

    // bookmark the top left corner of the map, which will be our game screen starting point
    const startPos = await cursor.queryPosition()

    cursor.bookmark("mapstart", { cols: startPos.cols, rows: startPos.rows + 1 })

    // print the map
    function drawMap() {
      const discovered: Tile[] = []

      cursor.jump("mapstart")
      map.tiles.forEach((row, y) => {
        let line = ""
        for (let x = 0; x < row.length; x++) {
          const tile = row[x]

          if (x === game.character.x && y === game.character.y) {
            line += expressions[game.character.expression]
            continue
          }

          const visible = canSeeTile(map, game.character.x, game.character.y, x, y, 5)

          if (visible && !tile.explored) {
            tile.explored = true
            discovered.push(tile)
          }

          const col = visible ? white : tile.explored ? gray : (_: string) => "  "

          if (tile.type === "#") {
            line += col("██")
          } else if (tile.type === "/") {
            // door
            line += col("🚪")
          } else if (tile.type === "\\") {
            // open door
            line += col("[]")
          } else {
            line += col(gray("⬛️"))
          }
        }
        cursor.write(line + "\n")
      })

      return discovered
    }

    // gameloop
    while (true) {
      const discovered = drawMap()

      if (discovered.length > 0) {
        // eventually, say something in the log that you see something
        // for now, make the character surprised
        const interestingDiscoveredTiles = ["/", "\\"]
        const interesting = discovered.find((t) => interestingDiscoveredTiles.includes(t.type))
        if (interesting) {
          game.character.expression = "surprised"
          drawMap() // draw again -- not very efficient, but it works for now
        }
      }

      const k = await inputKey()

      // quitting
      if (k === "escape") {
        cursor.goto({ cols: startPos.cols + 10, rows: startPos.rows + 3 })
        cursor.write("  Are you sure you want to quit? (y/n)  ")
        const quit = await inputKey()
        if (quit === "y") {
          cursor.alternate(false).show()
          break
        }
        continue
      }

      let result: ActionResult = { verb: "stopped", tile: undefined }

      // movement
      if (k === "w") result = tryMove(0, -1, game)
      if (k === "s") result = tryMove(0, 1, game)
      if (k === "x") result = tryMove(0, 1, game)
      if (k === "a") result = tryMove(-1, 0, game)
      if (k === "d") result = tryMove(1, 0, game)
      if (k === "q") result = tryMove(-1, -1, game)
      if (k === "e") result = tryMove(1, -1, game)
      if (k === "z") result = tryMove(-1, 1, game)
      if (k === "c") result = tryMove(1, 1, game)

      if (result.verb === "woke") game.character.expression = "sleepy"
      if (result.verb === "stopped") game.character.expression = "surprised"
      if (result.verb === "moved") game.character.expression = "happy"
      if (result.verb === "opened") game.character.expression = "worried"
    }
  },
}
