import type { Actor } from "../lib/types"
import { wander } from "../actions/wander"
import { follow } from "../actions/follow"
import { sleep } from "../actions/sleep"
import { canSee } from "../lib/visibility"

export function makeGoblin(props: Partial<Actor>): Actor {
  return {
    me: false,
    x: 1,
    y: 1,
    race: "goblin",
    mood: "neutral",
    name: "Goblin",
    speed: 12,
    time: 0,
    eyesight: 8,
    // history: [],
    visible: false,
    discovered: false,
    tags: {},
    async act(game) {
      const tile = game.map.tiles[this.y][this.x]

      // until the goblin is discovered, it just sleeps
      if (!tile.discovered) return sleep(this, game)

      // can I see the player?
      // const visible = canSeeTile(game.map, this.x, this.y, game.me.x, game.me.y, this.eyesight)
      const visible = canSee(game.map, this.x, this.y, game.me.x, game.me.y, this.eyesight)

      if (visible) {
        // go towards the player
        return follow(this, game.me, game)
      } else {
        // just wander
        return wander(this, game)
      }
    },
    on: {},
    ...props,
  }
}
