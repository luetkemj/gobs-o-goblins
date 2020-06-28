import { sample, times } from "lodash";
import "./lib/canvas.js";
import { grid } from "./lib/canvas";
import { createDungeon } from "./lib/dungeon";
import { ai } from "./systems/ai";
import { fov } from "./systems/fov";
import { movement } from "./systems/movement";
import { render } from "./systems/render";
import ecs, { player } from "./state/ecs";
import {
  Ai,
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

times(5, () => {
  const tile = sample(openTiles);

  const goblin = ecs.createEntity();
  goblin.add(Ai);
  goblin.add(Appearance, { char: "g", color: "green" });
  goblin.add(Description, { name: "goblin" });
  goblin.add(IsBlocking);
  goblin.add(Layer400);
  goblin.add(Position, { x: tile.x, y: tile.y });
});

fov();
render();

let userInput = null;
let playerTurn = true;

document.addEventListener("keydown", (ev) => {
  userInput = ev.key;
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

  userInput = null;
};

const update = () => {
  if (playerTurn && userInput) {
    console.log("I am @, hear me roar.");
    processUserInput();
    movement();
    fov();
    render();

    playerTurn = false;
  }

  if (!playerTurn) {
    ai();
    movement();
    fov();
    render();

    playerTurn = true;
  }
};

const gameLoop = () => {
  update();
  requestAnimationFrame(gameLoop);
};

requestAnimationFrame(gameLoop);
