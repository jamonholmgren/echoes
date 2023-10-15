import type { Actor } from "../lib/types"
import { wander } from "../actions/wander"
import { follow } from "../actions/follow"
import { canSeeTile } from "../lib/utils"
import { sleep } from "../actions/sleep"

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
    history: [],

    discovered: false,
    act(game) {
      const tile = game.map.tiles[this.y][this.x]
      if (!tile.discovered) return sleep(this, game)

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
