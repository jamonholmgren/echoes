import { type Props, print, cursor, gray, ask, choose } from "bluebun"
import type { Game, SavedGames } from "../lib/types"
import { map } from "../maps/forest"

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

    cursor.write("123").write("456").write("789\n")

    // for now, we'll just make a new game each time
    // const game: Game = {
    //   name: await ask("What is your character's name? "),
    // }

    // print the map
    // map.tiles.forEach((row) => {
    //   for (let i = 0; i < row.length; i++) {
    //     const tile = row[i]
    //     if (tile === "#") {
    //       cursor.write(gray("██"))
    //     } else if (tile === "x") {
    //       cursor.write("Jamon")
    //     } else {
    //       cursor.write(gray("· "))
    //     }
    //   }
    //   cursor.write("\n")
    // })
  },
}
