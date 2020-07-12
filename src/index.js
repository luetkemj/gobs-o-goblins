import { get, sample, times } from "lodash";
import "./lib/canvas.js";
import { grid, pxToCell } from "./lib/canvas";
import { toLocId } from "./lib/grid";
import { readCacheSet } from "./state/cache";
import { createDungeon } from "./lib/dungeon";
import { ai } from "./systems/ai";
import { fov } from "./systems/fov";
import { movement } from "./systems/movement";
import { render } from "./systems/render";
import ecs, { addLog } from "./state/ecs";
import { Move, Position } from "./state/components";

// init game map and player position
const dungeon = createDungeon({
  x: grid.map.x,
  y: grid.map.y,
  width: grid.map.width,
  height: grid.map.height,
});

const player = ecs.createPrefab("Player");
player.add(Position, {
  x: dungeon.rooms[0].center.x,
  y: dungeon.rooms[0].center.y,
});

const openTiles = Object.values(dungeon.tiles).filter(
  (x) => x.sprite === "FLOOR"
);

times(0, () => {
  const tile = sample(openTiles);
  ecs.createPrefab("Goblin").add(Position, { x: tile.x, y: tile.y });
});

times(50, () => {
  const tile = sample(openTiles);
  ecs.createPrefab("HealthPotion").add(Position, { x: tile.x, y: tile.y });
});

fov(player);
render(player);

let userInput = null;
let playerTurn = true;
export let gameState = "GAME";
export let selectedInventoryIndex = 0;

document.addEventListener("keydown", (ev) => {
  userInput = ev.key;
});

const processUserInput = () => {
  if (gameState === "GAME") {
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
    if (userInput === "g") {
      let pickupFound = false;
      readCacheSet("entitiesAtLocation", toLocId(player.position)).forEach(
        (eId) => {
          const entity = ecs.getEntity(eId);
          if (entity.isPickup) {
            pickupFound = true;
            player.fireEvent("pick-up", entity.id);
            entity.fireEvent("pick-up");
            addLog(`You pickup a ${entity.description.name}`);
          }
        }
      );
      if (!pickupFound) {
        addLog("There is nothing to pick up here");
      }
    }
    if (userInput === "i") {
      gameState = "INVENTORY";
    }

    userInput = null;
  }

  if (gameState === "INVENTORY") {
    if (userInput === "i" || userInput === "Escape") {
      gameState = "GAME";
    }

    if (userInput === "ArrowUp") {
      selectedInventoryIndex -= 1;
      if (selectedInventoryIndex < 0) selectedInventoryIndex = 0;
    }

    if (userInput === "ArrowDown") {
      selectedInventoryIndex += 1;
      if (selectedInventoryIndex > player.inventory.list.length - 1)
        selectedInventoryIndex = player.inventory.list.length - 1;
    }

    if (userInput === "d") {
      const entity = ecs.getEntity(
        player.inventory.list[selectedInventoryIndex]
      );
      if (entity) {
        player.fireEvent("drop", {
          index: selectedInventoryIndex,
        });
        entity.fireEvent("drop", {
          x: player.position.x,
          y: player.position.y,
        });
      }
    }

    userInput = null;
  }
};

const update = () => {
  if (player.isDead) {
    return;
  }

  if (playerTurn && userInput && gameState === "INVENTORY") {
    processUserInput();
    render(player);
    playerTurn = true;
  }

  if (playerTurn && userInput && gameState === "GAME") {
    processUserInput();
    movement();
    fov(player);
    render(player);

    if (gameState === "GAME") {
      playerTurn = false;
    }
  }

  if (!playerTurn) {
    ai(player);
    movement();
    fov(player);
    render(player);

    playerTurn = true;
  }
};

const gameLoop = () => {
  update();
  requestAnimationFrame(gameLoop);
};

requestAnimationFrame(gameLoop);

// Only do this during development
if (process.env.NODE_ENV === "development") {
  const canvas = document.querySelector("#canvas");

  canvas.onclick = (e) => {
    const [x, y] = pxToCell(e);
    const locId = toLocId({ x, y });

    readCacheSet("entitiesAtLocation", locId).forEach((eId) => {
      const entity = ecs.getEntity(eId);

      console.log(
        `${get(entity, "appearance.char", "?")} ${get(
          entity,
          "description.name",
          "?"
        )}`,
        entity.serialize()
      );
    });
  };
}
