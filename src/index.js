import { sample, times } from "lodash";
import "./lib/canvas.js";
import { grid } from "./lib/canvas";
import { createDungeon } from "./lib/dungeon";
import { fov } from "./systems/fov";
import { movement } from "./systems/movement";
import { render } from "./systems/render";
import ecs, { player } from "./state/ecs";
import {
  Appearance,
  Description,
  IsBlocking,
  Layer400,
  Move,
  Position,
} from "./state/components";

// init game map and player position
const dungeon = createDungeon({
  x: grid.map.x,
  y: grid.map.y,
  width: grid.map.width,
  height: grid.map.height,
});
player.add(Position, {
  x: dungeon.rooms[0].center.x,
  y: dungeon.rooms[0].center.y,
});

const openTiles = Object.values(dungeon.tiles).filter(
  (x) => x.sprite === "FLOOR"
);

times(100, () => {
  const tile = sample(openTiles);

  const goblin = ecs.createEntity();
  goblin.add(Appearance, { char: "g", color: "green" });
  goblin.add(IsBlocking);
  goblin.add(Layer400);
  goblin.add(Position, { x: tile.x, y: tile.y });
  goblin.add(Description, { name: "goblin" });
});

fov();
render();

let userInput = null;

document.addEventListener("keydown", (ev) => {
  userInput = ev.key;
  processUserInput();
});

const processUserInput = () => {
  if (userInput === "ArrowUp") {
    player.add(Move, { x: 0, y: -1 });
  }
  if (userInput === "ArrowRight") {
    player.add(Move, { x: 1, y: 0 });
  }
  if (userInput === "ArrowDown") {
    player.add(Move, { x: 0, y: 1 });
  }
  if (userInput === "ArrowLeft") {
    player.add(Move, { x: -1, y: 0 });
  }

  movement();
  fov();
  render();
};
