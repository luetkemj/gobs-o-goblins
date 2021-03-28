import { random, sample, times } from 'lodash';
import { readCache } from '../state/cache';
import { Position } from '../state/components';
import world from '../state/ecs';
import {
  getEntityChancesForLevel,
  getHighestMatch,
  getWeightedValue,
} from '../utils/misc';
import { grid } from './canvas';
import { DUNGEON_LAYOUT } from './dungeon_layout';
import { rectangle, rectsIntersect } from './grid';
import {
  ITEM_WEIGHT,
  MAX_ITEMS_BY_FLOOR,
  MAX_MONSTERS_BY_FLOOR,
  MONSTER_WEIGHT,
} from './level_entities';

function digHorizontalPassage(x1, x2, y, z) {
  const tiles = {};
  const start = Math.min(x1, x2);
  const end = Math.max(x1, x2) + 1;
  let x = start;

  while (x < end) {
    tiles[`${x},${y},${z}`] = { x, y, z, sprite: 'FLOOR' };
    x++;
  }

  return tiles;
}

function digVerticalPassage(y1, y2, x, z) {
  const tiles = {};
  const start = Math.min(y1, y2);
  const end = Math.max(y1, y2) + 1;
  let y = start;

  while (y < end) {
    tiles[`${x},${y},${z}`] = { x, y, z, sprite: 'FLOOR' };
    y++;
  }

  return tiles;
}

export const createDungeon = ({
  x,
  y,
  z,
  width,
  height,
  minRoomSize = 6,
  maxRoomSize = 12,
  maxRoomCount = 30,
}) => {
  // fill the entire space with walls so we can dig it out later
  const dungeon = rectangle(
    { x, y, z, width, height },
    {
      sprite: 'WALL',
    }
  );

  const rooms = [];
  let roomTiles = {};

  times(maxRoomCount, () => {
    let rw = random(minRoomSize, maxRoomSize);
    let rh = random(minRoomSize, maxRoomSize);
    let rx = random(x, width + x - rw - 1);
    let ry = random(y, height + y - rh - 1);

    // create a candidate room
    const candidate = rectangle(
      { x: rx, y: ry, z, width: rw, height: rh, hasWalls: true },
      { sprite: 'FLOOR' }
    );

    // test if candidate is overlapping with any existing rooms
    if (!rooms.some((room) => rectsIntersect(room, candidate))) {
      rooms.push(candidate);
      roomTiles = { ...roomTiles, ...candidate.tiles };
    }
  });

  let prevRoom = null;
  let passageTiles;

  for (let room of rooms) {
    if (prevRoom) {
      const prev = prevRoom.center;
      const curr = room.center;

      passageTiles = {
        ...passageTiles,
        ...digHorizontalPassage(prev.x, curr.x, curr.y, z),
        ...digVerticalPassage(prev.y, curr.y, prev.x, z),
      };
    }

    prevRoom = room;
  }

  dungeon.rooms = rooms;
  dungeon.tiles = { ...dungeon.tiles, ...roomTiles, ...passageTiles };

  // create tile entities
  Object.keys(dungeon.tiles).forEach((key) => {
    const tile = dungeon.tiles[key];

    if (tile.sprite === 'WALL') {
      world.createPrefab('Wall').add(Position, { ...dungeon.tiles[key], z });
    }

    if (tile.sprite === 'FLOOR') {
      world.createPrefab('Floor').add(Position, { ...dungeon.tiles[key], z });
    }
  });

  return dungeon;
};

export const getOpenTiles = (dungeon) => {
  const openTiles = Object.values(dungeon.tiles).filter(
    (x) => x.sprite === 'FLOOR'
  );
  return sample(openTiles);
};

export const createDungeonLevel = ({
  createStairsUp = true,
  createStairsDown = true,
} = {}) => {
  const currentLevel = Math.abs(readCache('z'));
  const dimensions =
    DUNGEON_LAYOUT[getHighestMatch(Object.keys(DUNGEON_LAYOUT), currentLevel)];

  const dungeon = createDungeon({
    x: grid.map.x,
    y: grid.map.y,
    z: readCache('z'),
    width: dimensions.width,
    height: dimensions.height,
    maxRoomCount: dimensions.maxRoomCount,
  });

  generateEntities(currentLevel, MAX_ITEMS_BY_FLOOR, ITEM_WEIGHT, dungeon);
  generateEntities(
    currentLevel,
    MAX_MONSTERS_BY_FLOOR,
    MONSTER_WEIGHT,
    dungeon
  );

  let stairsUp, stairsDown;

  if (createStairsUp) {
    times(1, () => {
      stairsUp = world.createPrefab('StairsUp');
      stairsUp.add(Position, getOpenTiles(dungeon));
    });
  }

  if (createStairsDown) {
    times(1, () => {
      stairsDown = world.createPrefab('StairsDown');
      stairsDown.add(Position, getOpenTiles(dungeon));
    });
  }

  return { dungeon, stairsUp, stairsDown };
};

const generateEntities = (level, maxEntitiesByFloor, entityWeight, dungeon) => {
  const amount =
    maxEntitiesByFloor[getHighestMatch(Object.keys(maxEntitiesByFloor), level)];
  getEntitiesAtRandom(entityWeight, amount, level, dungeon);
};

const getEntitiesAtRandom = (
  weightedChances,
  amountOfEntities,
  currentLevel,
  dungeon
) => {
  const entityWeightedChances = getEntityChancesForLevel(
    weightedChances,
    currentLevel
  );

  times(Math.floor(Math.random() * amountOfEntities + 1), () => {
    let prefab = getWeightedValue(entityWeightedChances);
    world.createPrefab(prefab).add(Position, getOpenTiles(dungeon));
  });
};
