import PF from "pathfinding";
import { some, times } from "lodash";
import ecs from "../state/ecs";
import cache, { readCacheSet } from "../state/cache";
import { toCell } from "./grid";
import { grid } from "./canvas";

const baseMatrix = [];
times(grid.height, () => baseMatrix.push(new Array(grid.width).fill(0)));

export const aStar = (start, goal) => {
  const matrix = JSON.parse(JSON.stringify(baseMatrix));

  const locIds = Object.keys(cache.entitiesAtLocation);

  locIds.forEach((locId) => {
    if (
      some([...readCacheSet("entitiesAtLocation", locId)], (eId) => {
        return ecs.getEntity(eId).isBlocking;
      })
    ) {
      const cell = toCell(locId);

      matrix[cell.y][cell.x] = 1;
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
