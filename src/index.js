import { get, sample } from 'lodash';
import { pxToCell } from './lib/canvas';
import { createDungeonLevel, getOpenTiles } from './lib/dungeon';
import { circle, toCell, toLocId } from './lib/grid';
import {
  addCache,
  clearCache,
  deserializeCache,
  readCache,
  readCacheSet,
  serializeCache,
} from './state/cache';
import {
  ActiveEffects,
  Ai,
  Effects,
  IsInFov,
  Move,
  Position,
  Target,
  TargetingItem,
} from './state/components';
import world from './state/ecs';
import { ai } from './systems/ai';
import { animation } from './systems/animation';
import { effects } from './systems/effects';
import { fov } from './systems/fov';
import { movement } from './systems/movement';
import { render } from './systems/render';
import { targeting } from './systems/targeting';

export let messageLog = ['', "Welcome to Gobs 'O Goblins!", ''];
export const addLog = (text) => {
  messageLog.unshift(text);
};

const saveGame = () => {
  const gameSaveData = {
    world: world.serialize(),
    cache: serializeCache(),
    playerId: player.id,
    messageLog,
  };
  localStorage.setItem('gameSaveData', JSON.stringify(gameSaveData));
  addLog('Game saved');
};

const loadGame = () => {
  const data = JSON.parse(localStorage.getItem('gameSaveData'));
  if (!data) {
    addLog('Failed to load - no saved games found');
    return;
  }

  for (let entity of world.getEntities()) {
    entity.destroy();
  }
  clearCache();

  world.deserialize(data.world);
  deserializeCache(data.cache);

  player = world.getEntity(data.playerId);

  userInput = null;
  playerTurn = true;
  gameState = 'GAME';
  selectedInventoryIndex = 0;

  messageLog = data.messageLog;
  addLog('Game loaded');
};

const newGame = () => {
  for (let item of world.getEntities()) {
    item.destroy();
  }
  clearCache();

  userInput = null;
  playerTurn = true;
  gameState = 'GAME';
  selectedInventoryIndex = 0;

  messageLog = ['', "Welcome to Gobs 'O Goblins!", ''];

  initGame();
};

const enemiesInFOV = world.createQuery({ all: [IsInFov, Ai] });

export const goToDungeonLevel = (level) => {
  const goingUp = readCache('z') < level;
  const floor = readCache('floors')[level];

  addCache('z', level);
  player.remove(player.position);

  let newPosition = goingUp ? floor?.stairsDown : floor?.stairsUp;

  if (!floor) {
    const { stairsDown, stairsUp } = createDungeonLevel();

    addCache(`floors.${level}`, {
      stairsDown: toLocId(stairsDown.position),
      stairsUp: toLocId(stairsUp.position),
    });

    newPosition = goingUp ? stairsDown.position : stairsUp.position;
  }

  player.add(Position, toCell(newPosition));

  fov(player);
  render(player);
};

const initGame = () => {
  const { dungeon, stairsDown, stairsUp } = createDungeonLevel({
    createStairsUp: false,
  });

  player = world.createPrefab('Player');

  addCache(`floors.${-1}`, {
    stairsDown: toLocId(stairsDown.position),
  });

  const playerSpawn = stairsUp ? stairsUp.position : getOpenTiles(dungeon);

  player.add(Position, playerSpawn);

  fov(player);
  render(player);
};

let player = {};
let userInput = null;
let playerTurn = true;
export let gameState = 'GAME';
export let selectedInventoryIndex = 0;

initGame();

document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Shift') {
    userInput = ev.key;
  }
});

const processUserInput = () => {
  if (userInput === 'l') {
    loadGame();
  }

  if (userInput === 'n') {
    newGame();
  }

  if (userInput === 's') {
    saveGame();
  }

  if (gameState === 'GAME') {
    if (userInput === '>') {
      if (
        toLocId(player.position) !==
        readCache(`floors.${readCache('z')}.stairsDown`)
      ) {
        addLog('There are no stairs to descend');
      }
      addLog('You descend deeper into the dungeon');
      goToDungeonLevel(readCache('z') - 1);
    }

    if (userInput === '<') {
      if (
        toLocId(player.position) !==
        readCache(`floors.${readCache('z')}.stairsUp`)
      ) {
        addLog('There are no stairs to climb');
      }
      addLog('You climb from the depths of the dungeon');
      goToDungeonLevel(readCache('z') + 1);
    }

    if (userInput === 'ArrowUp') {
      player.add(Move, { x: 0, y: -1, z: readCache('z') });
    }
    if (userInput === 'ArrowRight') {
      player.add(Move, { x: 1, y: 0, z: readCache('z') });
    }
    if (userInput === 'ArrowDown') {
      player.add(Move, { x: 0, y: 1, z: readCache('z') });
    }
    if (userInput === 'ArrowLeft') {
      player.add(Move, { x: -1, y: 0, z: readCache('z') });
    }
    if (userInput === 'g') {
      let pickupFound = false;
      readCacheSet('entitiesAtLocation', toLocId(player.position)).forEach(
        (eId) => {
          const entity = world.getEntity(eId);
          if (entity.isPickup) {
            pickupFound = true;
            player.fireEvent('pick-up', entity);
            addLog(`You pickup a ${entity.description.name}`);
          }
        }
      );
      if (!pickupFound) {
        addLog('There is nothing to pick up here');
      }
    }
    if (userInput === 'i') {
      gameState = 'INVENTORY';
    }

    if (userInput === 'z') {
      gameState = 'TARGETING';
    }

    userInput = null;
  }

  if (gameState === 'TARGETING') {
    if (userInput === 'z' || userInput === 'Escape') {
      player.remove(player.targetingItem);
      gameState = 'GAME';
    }

    userInput = null;
  }

  if (gameState === 'INVENTORY') {
    if (userInput === 'i' || userInput === 'Escape') {
      gameState = 'GAME';
    }

    if (userInput === 'ArrowUp') {
      selectedInventoryIndex -= 1;
      if (selectedInventoryIndex < 0) selectedInventoryIndex = 0;
    }

    if (userInput === 'ArrowDown') {
      selectedInventoryIndex += 1;
      if (selectedInventoryIndex > player.inventory.inventoryItems.length - 1)
        selectedInventoryIndex = player.inventory.inventoryItems.length - 1;
    }

    if (userInput === 'd') {
      if (player.inventory.inventoryItems.length) {
        const entity = player.inventory.inventoryItems[selectedInventoryIndex];
        addLog(`You drop a ${entity.description.name}`);
        player.fireEvent('drop', entity);
      }
    }

    if (userInput === 'c') {
      const entity = player.inventory.inventoryItems[selectedInventoryIndex];

      if (entity) {
        if (entity.requiresTarget) {
          if (entity.requiresTarget.acquired === 'RANDOM') {
            // get a target that is NOT the player
            const target = sample([...enemiesInFOV.get()]);

            if (target) {
              player.add(TargetingItem, { itemId: entity.id });
              player.add(Target, { locId: toLocId(target.position) });
              targeting(player);
            } else {
              addLog(`The scroll disintegrates uselessly in your hand`);
              player.fireEvent('consume', entity);
            }
          } else if (entity.requiresTarget.acquired === 'MANUAL') {
            player.add(TargetingItem, { itemId: entity.id });
            gameState = 'TARGETING';
            return;
          }
        } else if (entity.has(Effects)) {
          // clone all effects and add to self
          entity.effects.forEach((x) =>
            player.add(ActiveEffects, { ...x.serialize() })
          );

          addLog(`You consume a ${entity.description.name}`);
          player.fireEvent('consume', entity);
        }

        selectedInventoryIndex = 0;

        gameState = 'GAME';
      }
    }

    userInput = null;
  }
};

const update = () => {
  animation();

  if (player.isDead) {
    if (gameState !== 'GAMEOVER') {
      addLog('You are dead.');
      render(player);
    }
    gameState = 'GAMEOVER';
    processUserInput();
    return;
  }

  if (playerTurn && userInput && gameState === 'TARGETING') {
    processUserInput();
    effects();
    render(player);

    playerTurn = true;
  }

  if (playerTurn && userInput && gameState === 'INVENTORY') {
    processUserInput();
    effects();
    gameState === 'TARGETING';
    render(player);
    playerTurn = true;
  }

  if (playerTurn && userInput && gameState === 'GAME') {
    processUserInput();
    effects();
    movement();
    fov(player);
    render(player);

    playerTurn = false;
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

const canvas = document.querySelector('#canvas');

canvas.onclick = (e) => {
  const [x, y] = pxToCell(e);
  const locId = toLocId({ x, y, z: readCache('z') });

  readCacheSet('entitiesAtLocation', locId).forEach((eId) => {
    const entity = world.getEntity(eId);

    // Only do this during development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${get(entity, 'appearance.char', '?')} ${get(
          entity,
          'description.name',
          '?'
        )}`,
        entity.serialize()
      );
    }

    if (gameState === 'TARGETING') {
      const entity = player.inventory.inventoryItems[selectedInventoryIndex];
      if (entity.requiresTarget.aoeRange) {
        const targets = circle({ x, y }, entity.requiresTarget.aoeRange).map(
          (locId) => `${locId},${readCache('z')}`
        );
        targets.forEach((locId) => player.add(Target, { locId }));
      } else {
        player.add(Target, { locId });
      }

      gameState = 'GAME';
      targeting(player);
      effects();
      render(player);
    }
  });
};
