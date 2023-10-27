import { Item } from "../types"

export function makeItem(props: Partial<Item>): Item {
  return {
    name: "Unknown item",
    quantity: 1,
    type: "unknown",
    discovered: false,
    ...props,
  }
}
