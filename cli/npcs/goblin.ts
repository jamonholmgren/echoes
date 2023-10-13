import { CursorPos } from "bluebun"
import { ActionResult, Actor } from "../lib/types"
import { follow, wander } from "./actions"
import { canSeeTile } from "../lib/utils"

export function goblin(props: Partial<Actor>): Actor {
  return {
    x: 1,
    y: 1,
    race: "goblin",
    mood: "neutral",
    name: "Goblin",
    speed: 12,
    time: 0,
    eyesight: 8,

    discovered: false,
    async act(game) {
      const tile = game.map.tiles[this.y][this.x]
      if (!tile.discovered) return { verb: "slept", tile }

      // can I see the player?
      const visible = canSeeTile(game.map, this.x, this.y, game.character.x, game.character.y, this.eyesight)

      if (visible) {
        // go towards the player
        return follow(this, game.character, game)
      } else {
        // just wander
        return wander(this, game)
      }
    },
    ...props,
  }
}
