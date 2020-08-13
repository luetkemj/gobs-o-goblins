import { get, sample, times } from "lodash";
import "./lib/canvas.js";
import { grid, pxToCell } from "./lib/canvas";
import { toCell, toLocId, circle } from "./lib/grid";
import {
  addCache,
  clearCache,
  deserializeCache,
  readCacheSet,
  readCache,
  serializeCache,
} from "./state/cache";
import { createDungeon } from "./lib/dungeon";
import { ai } from "./systems/ai";
import { animation } from "./systems/animation";
import { effects } from "./systems/effects";
import { fov } from "./systems/fov";
import { movement } from "./systems/movement";
import { render } from "./systems/render";
import { targeting } from "./systems/targeting";
import ecs from "./state/ecs";
import { IsInFov, Move, Position, Ai } from "./state/components";

export let messageLog = ["", "Welcome to Gobs 'O Goblins!", ""];
export const addLog = (text) => {
  messageLog.unshift(text);
};

const saveGame = () => {
  const gameSaveData = {
    ecs: ecs.serialize(),
    cache: serializeCache(),
    playerId: player.id,
    messageLog,
  };
  localStorage.setItem("gameSaveData", JSON.stringify(gameSaveData));
  addLog("Game saved");
};

const loadGame = () => {
  const data = JSON.parse(localStorage.getItem("gameSaveData"));
  if (!data) {
    addLog("Failed to load - no saved games found");
    return;
  }

  for (let entity of ecs.entities.all) {
    entity.destroy();
  }

  ecs.deserialize(data.ecs);
  deserializeCache(data.cache);

  player = ecs.getEntity(data.playerId);

  userInput = null;
  playerTurn = true;
  gameState = "GAME";
  selectedInventoryIndex = 0;

  messageLog = data.messageLog;
  addLog("Game loaded");
};

const newGame = () => {
  for (let item of ecs.entities.all) {
    item.destroy();
  }
  clearCache();

  userInput = null;
  playerTurn = true;
  gameState = "GAME";
  selectedInventoryIndex = 0;

  messageLog = ["", "Welcome to Gobs 'O Goblins!", ""];

  initGame();
};

const enemiesInFOV = ecs.createQuery({ all: [IsInFov, Ai] });

const createDungeonLevel = () => {
  const dungeon = createDungeon({
    x: grid.map.x,
    y: grid.map.y,
    z: readCache("z"),
    width: grid.map.width,
    height: grid.map.height,
  });

  const openTiles = Object.values(dungeon.tiles).filter(
    (x) => x.sprite === "FLOOR"
  );

  times(5, () => {
    const tile = sample(openTiles);
    ecs.createPrefab("Goblin").add(Position, tile);
  });

  times(10, () => {
    const tile = sample(openTiles);
    ecs.createPrefab("HealthPotion").add(Position, tile);
  });

  times(10, () => {
    const tile = sample(openTiles);
    ecs.createPrefab("ScrollLightning").add(Position, tile);
  });

  times(10, () => {
    const tile = sample(openTiles);
    ecs.createPrefab("ScrollParalyze").add(Position, tile);
  });

  times(10, () => {
    const tile = sample(openTiles);
    ecs.createPrefab("ScrollFireball").add(Position, tile);
  });

  let stairsUp, stairsDown;

  times(1, () => {
    const tile = sample(openTiles);
    stairsUp = ecs.createPrefab("StairsUp");
    stairsUp.add(Position, tile);
  });

  times(1, () => {
    const tile = sample(openTiles);
    stairsDown = ecs.createPrefab("StairsDown");
    stairsDown.add(Position, tile);
  });

  return { dungeon, stairsUp, stairsDown };
};

const initGame = () => {
  const { dungeon, stairsUp, stairsDown } = createDungeonLevel();

  player = ecs.createPrefab("Player");

  addCache(`floors.${1}`, {
    stairsUp: toLocId(stairsUp.position),
    stairsDown: toLocId(stairsDown.position),
  });

  player.add(Position, stairsUp.position);

  fov(player);
  render(player);
};

const goToDungeonLevel = (level) => {
  const goingUp = readCache("z") < level;
  const floor = readCache("floors")[level];

  if (floor) {
    addCache("z", level);
    player.remove(Position);
    if (goingUp) {
      player.add(Position, toCell(floor.stairsDown));
    } else {
      player.add(Position, toCell(floor.stairsUp));
    }
  } else {
    addCache("z", level);
    const { stairsUp, stairsDown } = createDungeonLevel();

    addCache(`floors.${level}`, {
      stairsUp: toLocId(stairsUp.position),
      stairsDown: toLocId(stairsDown.position),
    });

    player.remove(Position);

    if (goingUp) {
      player.add(Position, toCell(stairsDown.position));
    } else {
      player.add(Position, toCell(stairsUp.position));
    }
  }

  fov(player);
  render(player);
};

let player = {};
let userInput = null;
let playerTurn = true;
export let gameState = "GAME";
export let selectedInventoryIndex = 0;

initGame();

document.addEventListener("keydown", (ev) => {
  userInput = ev.key;
});

const processUserInput = () => {
  if (userInput === "l") {
    loadGame();
  }

  if (userInput === "n") {
    newGame();
  }

  if (userInput === "s") {
    saveGame();
  }

  if (gameState === "GAME") {
    if (userInput === ">") {
      console.log(`going to ${readCache("z") + 1}`);
      goToDungeonLevel(readCache("z") + 1);
    }

    if (userInput === "<") {
      console.log(`going to ${readCache("z") - 1}`);
      goToDungeonLevel(readCache("z") - 1);
    }

    if (userInput === "ArrowUp") {
      player.add(Move, { x: 0, y: -1, z: readCache("z") });
    }
    if (userInput === "ArrowRight") {
      player.add(Move, { x: 1, y: 0, z: readCache("z") });
    }
    if (userInput === "ArrowDown") {
      player.add(Move, { x: 0, y: 1, z: readCache("z") });
    }
    if (userInput === "ArrowLeft") {
      player.add(Move, { x: -1, y: 0, z: readCache("z") });
    }
    if (userInput === "g") {
      let pickupFound = false;
      readCacheSet("entitiesAtLocation", toLocId(player.position)).forEach(
        (eId) => {
          const entity = ecs.getEntity(eId);
          if (entity.isPickup) {
            pickupFound = true;
            player.fireEvent("pick-up", entity);
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

    if (userInput === "z") {
      gameState = "TARGETING";
    }

    userInput = null;
  }

  if (gameState === "TARGETING") {
    if (userInput === "z" || userInput === "Escape") {
      gameState = "GAME";
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
      if (player.inventory.list.length) {
        addLog(`You drop a ${player.inventory.list[0].description.name}`);
        player.fireEvent("drop", player.inventory.list[0]);
      }
    }

    if (userInput === "c") {
      const entity = player.inventory.list[selectedInventoryIndex];

      if (entity) {
        if (entity.requiresTarget) {
          if (entity.requiresTarget.acquired === "RANDOM") {
            // get a target that is NOT the player
            const target = sample([...enemiesInFOV.get()]);

            if (target) {
              player.add("TargetingItem", { item: entity });
              player.add("Target", { locId: toLocId(target.position) });
            } else {
              addLog(`The scroll disintegrates uselessly in your hand`);
              entity.destroy();
            }
          }

          if (entity.requiresTarget.acquired === "MANUAL") {
            player.add("TargetingItem", { item: entity });
            gameState = "TARGETING";
            return;
          }
        } else if (entity.has("Effects")) {
          // clone all effects and add to self
          entity
            .get("Effects")
            .forEach((x) => player.add("ActiveEffects", { ...x.serialize() }));

          addLog(`You consume a ${entity.description.name}`);
          entity.destroy();
        }

        if (selectedInventoryIndex > player.inventory.list.length - 1)
          selectedInventoryIndex = player.inventory.list.length - 1;

        gameState = "GAME";
      }
    }

    userInput = null;
  }
};

const update = () => {
  animation();

  if (player.isDead) {
    if (gameState !== "GAMEOVER") {
      addLog("You are dead.");
      render(player);
    }
    gameState = "GAMEOVER";
    processUserInput();
    return;
  }

  if (playerTurn && userInput && gameState === "TARGETING") {
    processUserInput();
    render(player);
    playerTurn = true;
  }

  if (playerTurn && userInput && gameState === "INVENTORY") {
    processUserInput();
    targeting();
    effects();
    render(player);
    playerTurn = true;
  }

  if (playerTurn && userInput && gameState === "GAME") {
    processUserInput();
    effects();
    movement();
    fov(player);
    render(player);

    if (gameState === "GAME") {
      playerTurn = false;
    }
  }

  if (!playerTurn) {
    ai(player);
    effects();
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

const canvas = document.querySelector("#canvas");

canvas.onclick = (e) => {
  const [x, y] = pxToCell(e);
  const locId = toLocId({ x, y, z: readCache("z") });

  readCacheSet("entitiesAtLocation", locId).forEach((eId) => {
    const entity = ecs.getEntity(eId);

    // Only do this during development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `${get(entity, "appearance.char", "?")} ${get(
          entity,
          "description.name",
          "?"
        )}`,
        entity.serialize()
      );
    }

    if (gameState === "TARGETING") {
      const entity = player.inventory.list[selectedInventoryIndex];
      if (entity.requiresTarget.aoeRange) {
        const targets = circle({ x, y }, entity.requiresTarget.aoeRange).map(
          (locId) => `${locId},${readCache("z")}`
        );
        targets.forEach((locId) => player.add("Target", { locId }));
      } else {
        player.add("Target", { locId });
      }

      gameState = "GAME";
      targeting();
      effects();
      render(player);
    }
  });
};
