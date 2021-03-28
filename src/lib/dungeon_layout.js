import { grid } from './canvas';

export const DUNGEON_LAYOUT = {
  1: {
    maxRoomCount: 6,
    width: Math.round(grid.map.width * 0.6),
    height: Math.round(grid.map.height * 0.6),
  },
  5: {
    maxRoomCount: 12,
    width: Math.round(grid.map.width * 0.8),
    height: Math.round(grid.map.height * 0.8),
  },
  9: {
    maxRoomCount: 18,
    width: grid.map.width,
    height: grid.map.height,
  },
  14: {
    maxRoomCount: 24,
    width: grid.map.width,
    height: grid.map.height,
  },
  19: { maxRoomCount: 30, width: grid.map.width, height: grid.map.height },
};
