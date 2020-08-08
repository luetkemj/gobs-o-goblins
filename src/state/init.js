import { sample, times } from "lodash";
import ecs from "./ecs";
import { game } from "./game";
import { grid } from "../lib/canvas";
import { createDungeon } from "../lib/dungeon";
import { fov } from "../systems/fov";
import { render } from "../systems/render";

export const initGame = () => {
  // init game map and player position
  const dungeon = createDungeon({
    x: grid.map.x,
    y: grid.map.y,
    width: grid.map.width,
    height: grid.map.height,
  });

  const player = ecs.createPrefab("Player");
  player.add("Position", {
    x: dungeon.rooms[0].center.x,
    y: dungeon.rooms[0].center.y,
  });

  const openTiles = Object.values(dungeon.tiles).filter(
    (x) => x.sprite === "FLOOR"
  );

  times(5, () => {
    const tile = sample(openTiles);
    ecs.createPrefab("Goblin").add("Position", { x: tile.x, y: tile.y });
  });

  times(10, () => {
    const tile = sample(openTiles);
    ecs.createPrefab("HealthPotion").add("Position", { x: tile.x, y: tile.y });
  });

  times(10, () => {
    const tile = sample(openTiles);
    ecs
      .createPrefab("ScrollLightning")
      .add("Position", { x: tile.x, y: tile.y });
  });

  times(10, () => {
    const tile = sample(openTiles);
    ecs
      .createPrefab("ScrollParalyze")
      .add("Position", { x: tile.x, y: tile.y });
  });

  times(10, () => {
    const tile = sample(openTiles);
    ecs
      .createPrefab("ScrollFireball")
      .add("Position", { x: tile.x, y: tile.y });
  });

  game.player = player;

  fov();
  render();
};
