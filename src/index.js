import { get, sample, times } from "lodash";
import "./lib/canvas.js";
import { grid, pxToCell } from "./lib/canvas";
import { toLocId } from "./lib/grid";
import { readCacheSet } from "./state/cache";
import { createDungeon } from "./lib/dungeon";
import { ai } from "./systems/ai";
import { animation } from "./systems/animation";
import { effects } from "./systems/effects";
import { fov } from "./systems/fov";
import { kill } from "./systems/kill";
import { movement } from "./systems/movement";
import { render } from "./systems/render";
import { targeting } from "./systems/targeting";
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

times(5, () => {
  const tile = sample(openTiles);
  ecs.createPrefab("Goblin").add(Position, { x: tile.x, y: tile.y });
});

times(10, () => {
  const tile = sample(openTiles);
  ecs.createPrefab("HealthPotion").add(Position, { x: tile.x, y: tile.y });
});

times(10, () => {
  const tile = sample(openTiles);
  ecs.createPrefab("ScrollLightning").add(Position, { x: tile.x, y: tile.y });
});

fov(player);
render(player);

let userInput = null;
let playerTurn = true;
export let gameState = "GAME"; // GAME INVENTORY TARGETING
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
      selectedInventoryIndex = 0;
    }

    if (userInput === "z") {
      gameState = "TARGETING";
    }

    userInput = null;
  }

  if (gameState === "TARGETING") {
    if (userInput === "z" || userInput === "Escape") {
      gameState = "GAME";
    }
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

    if (userInput === "u") {
      const entity = ecs.getEntity(
        player.inventory.list[selectedInventoryIndex]
      );

      if (!entity) return;

      if (entity.requiresTarget) {
        player.add("TargetingItem", {
          eId: player.inventory.list[selectedInventoryIndex],
        });
        gameState = "TARGETING";
      } else {
        if (entity.isConsumable) {
          if (entity.has("Effects")) {
            // clone all effects and add to self
            entity
              .get("Effects")
              .forEach((x) =>
                player.add("ActiveEffects", { ...x.serialize() })
              );
          }

          addLog(`You use a ${entity.description.name}`);

          player.fireEvent("remove", {
            index: selectedInventoryIndex,
          });

          if (selectedInventoryIndex > player.inventory.list.length - 1)
            selectedInventoryIndex = player.inventory.list.length - 1;
        }
      }
    }

    if (userInput === "d") {
      const entity = ecs.getEntity(
        player.inventory.list[selectedInventoryIndex]
      );
      if (entity) {
        player.fireEvent("remove", {
          index: selectedInventoryIndex,
        });
        entity.fireEvent("drop", {
          x: player.position.x,
          y: player.position.y,
        });
      }

      addLog(`You drop a ${entity.description.name} on the floor`);

      if (selectedInventoryIndex > player.inventory.list.length - 1)
        selectedInventoryIndex = player.inventory.list.length - 1;
    }

    userInput = null;
  }
};

const update = () => {
  animation();

  if (player.isDead) {
    return;
  }

  if (playerTurn && userInput && gameState === "INVENTORY") {
    processUserInput();
    effects();
    render(player);
    playerTurn = true;
  }

  if (playerTurn && userInput && gameState === "GAME") {
    processUserInput();
    effects();
    movement();
    kill();
    fov(player);
    render(player);

    if (gameState === "GAME") {
      playerTurn = false;
    }
  }

  if (!playerTurn) {
    targeting();
    effects();
    kill();

    ai(player);
    movement();
    effects();
    kill();

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
const canvas = document.querySelector("#canvas");

canvas.onclick = (e) => {
  const [x, y] = pxToCell(e);
  const locId = toLocId({ x, y });

  if (gameState === "TARGETING") {
    player.add("Target", { locId });
    gameState = "GAME";
    playerTurn = false;
  }

  if (process.env.NODE_ENV === "development") {
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
  }
};
