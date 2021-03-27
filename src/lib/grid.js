import { sample } from 'lodash';
import { grid } from './canvas';

export const CARDINAL = [
  { x: 0, y: -1 }, // N
  { x: 1, y: 0 }, // E
  { x: 0, y: 1 }, // S
  { x: -1, y: 0 }, // W
];

export const DIAGONAL = [
  { x: 1, y: -1 }, // NE
  { x: 1, y: 1 }, // SE
  { x: -1, y: 1 }, // SW
  { x: -1, y: -1 }, // NW
];

export const ALL = [...CARDINAL, ...DIAGONAL];

export const toCell = (cellOrId) => {
  let cell = cellOrId;
  if (typeof cell === 'string') cell = idToCell(cell);

  return cell;
};

export const toLocId = (cellOrId) => {
  let locId = cellOrId;
  if (typeof locId !== 'string') locId = cellToId(locId);

  return locId;
};

const insideCircle = (center, tile, radius) => {
  const dx = center.x - tile.x;
  const dy = center.y - tile.y;
  const distance_squared = dx * dx + dy * dy;
  return distance_squared <= radius * radius;
};

export const circle = (center, radius) => {
  const diameter = radius % 1 ? radius * 2 : radius * 2 + 1;
  const top = center.y - radius;
  const bottom = center.y + radius;
  const left = center.x - radius;
  const right = center.x + radius;

  const locsIds = [];

  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      const cx = Math.ceil(x);
      const cy = Math.ceil(y);
      if (insideCircle(center, { x: cx, y: cy }, radius)) {
        locsIds.push(`${cx},${cy}`);
      }
    }
  }

  return locsIds;
};

export const rectangle = ({ x, y, z, width, height, hasWalls }, tileProps) => {
  const tiles = {};

  const x1 = x;
  const x2 = x + width - 1;
  const y1 = y;
  const y2 = y + height - 1;
  if (hasWalls) {
    for (let yi = y1 + 1; yi <= y2 - 1; yi++) {
      for (let xi = x1 + 1; xi <= x2 - 1; xi++) {
        tiles[`${xi},${yi},${z}`] = { x: xi, y: yi, z, ...tileProps };
      }
    }
  } else {
    for (let yi = y1; yi <= y2; yi++) {
      for (let xi = x1; xi <= x2; xi++) {
        tiles[`${xi},${yi},${z}`] = { x: xi, y: yi, z, ...tileProps };
      }
    }
  }

  const center = {
    x: Math.round((x1 + x2) / 2),
    y: Math.round((y1 + y2) / 2),
    z,
  };

  return { x1, x2, y1, y2, center, hasWalls, tiles };
};

export const rectsIntersect = (rect1, rect2) => {
  return (
    rect1.x1 <= rect2.x2 &&
    rect1.x2 >= rect2.x1 &&
    rect1.y1 <= rect2.y2 &&
    rect1.y2 >= rect2.y1
  );
};

export const distance = (cell1, cell2) => {
  const x = Math.pow(cell2.x - cell1.x, 2);
  const y = Math.pow(cell2.y - cell1.y, 2);
  return Math.floor(Math.sqrt(x + y));
};

export const idToCell = (id) => {
  const coords = id.split(',');
  return {
    x: parseInt(coords[0], 10),
    y: parseInt(coords[1], 10),
    z: parseInt(coords[2], 10),
  };
};

export const cellToId = ({ x, y, z }) => `${x},${y},${z}`;

export const isOnMapEdge = (x, y) => {
  const { width, height, x: mapX, y: mapY } = grid.map;

  if (x === mapX) return true; // west edge
  if (y === mapY) return true; // north edge
  if (x === mapX + width - 1) return true; // east edge
  if (y === mapY + height - 1) return true; // south edge
  return false;
};

export const getNeighbors = ({ x, y }, direction = CARDINAL) => {
  const points = [];
  for (let dir of direction) {
    let candidate = {
      x: x + dir.x,
      y: y + dir.y,
    };
    if (
      candidate.x >= 0 &&
      candidate.x < grid.width &&
      candidate.y >= 0 &&
      candidate.y < grid.height
    ) {
      points.push(candidate);
    }
  }
  return points;
};

export const getNeighborIds = (cellOrId, direction = 'CARDINAL') => {
  let cell = toCell(cellOrId);

  if (direction === 'CARDINAL') {
    return getNeighbors(cell, CARDINAL).map(cellToId);
  }

  if (direction === 'DIAGONAL') {
    return getNeighbors(cell, DIAGONAL).map(cellToId);
  }

  if (direction === 'ALL') {
    return [
      ...getNeighbors(cell, CARDINAL).map(cellToId),
      ...getNeighbors(cell, DIAGONAL).map(cellToId),
    ];
  }
};

export const isNeighbor = (a, b) => {
  let posA = a;
  if (typeof posA === 'string') {
    posA = idToCell(a);
  }

  let posB = b;
  if (typeof posB === 'string') {
    posB = idToCell(b);
  }

  const { x: ax, y: ay } = posA;
  const { x: bx, y: by } = posB;

  if (
    (ax - bx === 1 && ay - by === 0) ||
    (ax - bx === 0 && ay - by === -1) ||
    (ax - bx === -1 && ay - by === 0) ||
    (ax - bx === 0 && ay - by === 1)
  ) {
    return true;
  }

  return false;
};

export const randomNeighbor = (startX, startY) => {
  const direction = sample(CARDINAL);
  const x = startX + direction.x;
  const y = startY + direction.y;
  return { x, y };
};

export const getNeighbor = (x, y, dir) => {
  const dirMap = { N: 0, E: 1, S: 2, W: 3 };
  const direction = CARDINAL[dirMap[dir]];
  return {
    x: x + direction.x,
    y: y + direction.y,
  };
};

export const getDirection = (a, b) => {
  const cellA = toCell(a);
  const cellB = toCell(b);

  const { x: ax, y: ay } = cellA;
  const { x: bx, y: by } = cellB;

  let dir;

  if (ax - bx === 1 && ay - by === 0) dir = '→';
  if (ax - bx === 0 && ay - by === -1) dir = '↑';
  if (ax - bx === -1 && ay - by === 0) dir = '←';
  if (ax - bx === 0 && ay - by === 1) dir = '↓';

  return dir;
};
