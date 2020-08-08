import { get, sample, times } from "lodash";
import "./lib/canvas.js";
import { grid, pxToCell } from "./lib/canvas";
import { toLocId, circle } from "./lib/grid";
import {
  clearCache,
  deserializeCache,
  readCacheSet,
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
import ecs, { addLog, loadMessageLog, messageLog } from "./state/ecs";
import { IsInFov, Move, Position, Ai } from "./state/components";

import { game } from "./state/game";
import { initGame } from "./state/init";

const { player } = game;

const enemiesInFOV = ecs.createQuery({ all: [IsInFov, Ai] });

initGame();

let userInput = null;
let playerTurn = true;
export let gameState = "GAME";
export let selectedInventoryIndex = 0;

function newGame() {
  // destory old game
  for (let item of ecs.entities.all) {
    item.destroy();
  }
  clearCache();

  // init new game
  player = initGame().player;
  userInput = null;
  playerTurn = true;
  gameState = "GAME";
  selectedInventoryIndex = 0;
  loadMessageLog(["", "Welcome to Gobs 'O Goblins!", ""]);
}

function saveGame() {
  const gameSaveData = {
    ecs: ecs.serialize(),
    cache: serializeCache(),
    gameState,
    messageLog,
    playerTurn,
    playerId: player.id,
    userInput,
  };
  localStorage.setItem("gameSaveData", JSON.stringify(gameSaveData));

  addLog("game saved");
}

function loadGame() {
  const data = JSON.parse(localStorage.getItem("gameSaveData"));
  if (!data) {
    console.log("No Saved Games Found");
    return;
  }

  for (let item of ecs.entities.all) {
    item.destroy();
  }

  ecs.deserialize(data.ecs);
  deserializeCache(data.cache);
  loadMessageLog(data.messageLog);
  gameState = data.gameState;
  userInput = data.userInput;
  playerTurn = data.playerTurn;
  player = ecs.getEntity(data.playerId);

  console.log("game loaded");
}

document.addEventListener("keydown", (ev) => {
  userInput = ev.key;
});

const processUserInput = () => {
  console.log(game.player);
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

    if (userInput === "S") {
      saveGame();
    }

    if (userInput === "L") {
      loadGame();
    }

    if (userInput === "N") {
      newGame();
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
    return;
  }

  if (playerTurn && userInput && gameState === "TARGETING") {
    processUserInput();
    render();
    playerTurn = true;
  }

  if (playerTurn && userInput && gameState === "INVENTORY") {
    processUserInput();
    targeting();
    effects();
    render();
    playerTurn = true;
  }

  if (playerTurn && userInput && gameState === "GAME") {
    processUserInput();
    effects();
    movement();
    fov();
    render();

    if (gameState === "GAME") {
      playerTurn = false;
    }
  }

  if (!playerTurn) {
    ai();
    effects();
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

const canvas = document.querySelector("#canvas");

canvas.onclick = (e) => {
  const [x, y] = pxToCell(e);
  const locId = toLocId({ x, y });

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
        const targets = circle({ x, y }, entity.requiresTarget.aoeRange);
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
