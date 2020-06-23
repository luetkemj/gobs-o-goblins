import ecs from "../state/ecs";
import { rectangle } from "./grid";
import { grid } from "./canvas";

import { Appearance, Position } from "../state/components";

export const createDungeon = () => {
  const dungeon = rectangle(grid.map);
  Object.keys(dungeon.tiles).forEach((key) => {
    const tile = ecs.createEntity();
    tile.add(Appearance, { char: "•", color: "#555" });
    tile.add(Position, dungeon.tiles[key]);
  });

  return dungeon;
};
