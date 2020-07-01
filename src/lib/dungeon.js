import { random, times } from "lodash";
import ecs from "../state/ecs";
import { rectangle, rectsIntersect } from "./grid";

import { Position } from "../state/components";

function digHorizontalPassage(x1, x2, y) {
  const tiles = {};
  const start = Math.min(x1, x2);
  const end = Math.max(x1, x2) + 1;
  let x = start;

  while (x < end) {
    tiles[`${x},${y}`] = { x, y, sprite: "FLOOR" };
    x++;
  }

  return tiles;
}

function digVerticalPassage(y1, y2, x) {
  const tiles = {};
  const start = Math.min(y1, y2);
  const end = Math.max(y1, y2) + 1;
  let y = start;

  while (y < end) {
    tiles[`${x},${y}`] = { x, y, sprite: "FLOOR" };
    y++;
  }

  return tiles;
}

export const createDungeon = ({
  x,
  y,
  width,
  height,
  minRoomSize = 6,
  maxRoomSize = 12,
  maxRoomCount = 30,
}) => {
  // fill the entire space with walls so we can dig it out later
  const dungeon = rectangle(
    { x, y, width, height },
    {
      sprite: "WALL",
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
      { x: rx, y: ry, width: rw, height: rh, hasWalls: true },
      { sprite: "FLOOR" }
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
        ...digHorizontalPassage(prev.x, curr.x, curr.y),
        ...digVerticalPassage(prev.y, curr.y, prev.x),
      };
    }

    prevRoom = room;
  }

  dungeon.rooms = rooms;
  dungeon.tiles = { ...dungeon.tiles, ...roomTiles, ...passageTiles };

  // create tile entities
  Object.keys(dungeon.tiles).forEach((key) => {
    const tile = dungeon.tiles[key];

    if (tile.sprite === "WALL") {
      ecs.createPrefab("Wall").add(Position, dungeon.tiles[key]);
    }

    if (tile.sprite === "FLOOR") {
      ecs.createPrefab("Floor").add(Position, dungeon.tiles[key]);
    }
  });

  return dungeon;
};
