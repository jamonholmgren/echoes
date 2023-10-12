import { type Props, print, cursor, gray, ask, choose, inputKey, yellow, white } from "bluebun"
import { expressions, type Game, type SavedGames } from "../lib/types"
import { map } from "../maps/forest"
import { canSeeTile } from "../lib/utils"

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

    // for now, we'll just make a new game each time
    const game: Game = {
      name: await ask("What is your character's name? "),
      x: 2,
      y: 2,
      // expression
      e: "😑",
      explored: map.tiles.map((row) => row.split("").map(() => false)),
    }

    // bookmark the top left corner of the map
    // const startPos = await cursor.queryPosition()

    await cursor.bookmark("mapstart")

    // print the map
    function drawMap() {
      cursor.hide().jump("mapstart")
      map.tiles.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
          const tile = row[x]

          if (x === game.x && y === game.y) {
            cursor.write(game.e)
            continue
          }

          const visible = canSeeTile(map.tiles, game.x, game.y, x, y, 5)

          if (visible) game.explored[y][x] = true

          const col = visible ? white : game.explored[y][x] ? gray : (s: string) => "  "

          if (tile === "#") {
            cursor.write(col("██"))
          } else if (tile === "/") {
            // door
            cursor.write(col("🚪"))
          } else {
            cursor.write(col("··"))
          }
        }
        cursor.write("\n")
      })
    }

    // loop for input
    while (true) {
      // change expression
      game.e = expressions[Math.floor(Math.random() * expressions.length)]
      drawMap()

      const k = await inputKey()

      if (k === "ctrl-c") break
      if (k === "up") {
        if (map.tiles[game.y - 1][game.x] === "#") continue
        game.y--
      }
      if (k === "down") {
        if (map.tiles[game.y + 1][game.x] === "#") continue
        game.y++
      }
      if (k === "left") {
        if (map.tiles[game.y][game.x - 1] === "#") continue
        game.x--
      }
      if (k === "right") {
        if (map.tiles[game.y][game.x + 1] === "#") continue
        game.x++
      }
    }
    cursor.show()
  },
}
