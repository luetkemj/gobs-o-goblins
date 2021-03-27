import { some, times } from 'lodash';
import PF from 'pathfinding';
import { readCache, readCacheSet } from '../state/cache';
import world from '../state/ecs';
import { grid } from './canvas';
import { toCell } from './grid';

const baseMatrix = [];
times(grid.height, () => baseMatrix.push(new Array(grid.width).fill(0)));

export const aStar = (start, goal) => {
  const matrix = JSON.parse(JSON.stringify(baseMatrix));

  const locIds = Object.keys(readCache('entitiesAtLocation'));

  locIds.forEach((locId) => {
    const cell = toCell(locId);
    if (cell.z === readCache('z')) {
      if (
        some([...readCacheSet('entitiesAtLocation', locId)], (eId) => {
          return world.getEntity(eId).isBlocking;
        })
      ) {
        matrix[cell.y][cell.x] = 1;
      }
    }
  });

  matrix[start.y][start.x] = 0;
  matrix[goal.y][goal.x] = 0;

  const grid = new PF.Grid(matrix);
  const finder = new PF.AStarFinder({
    allowDiagonal: false,
    dontCrossCorners: true,
  });

  const path = finder.findPath(start.x, start.y, goal.x, goal.y, grid);

  return path;
};
