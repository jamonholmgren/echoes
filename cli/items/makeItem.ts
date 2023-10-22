import { Item } from "../types"

export function makeItem(props: Partial<Item>): Item {
  return {
    x: 0,
    y: 0,
    name: "Unknown item",
    quantity: 1,
    type: "unknown",
    discovered: false,
    ...props,
  }
}
