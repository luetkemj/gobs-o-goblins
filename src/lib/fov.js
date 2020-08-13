import { distance, idToCell } from "./grid";

const octantTransforms = [
  { xx: 1, xy: 0, yx: 0, yy: 1 },
  { xx: 1, xy: 0, yx: 0, yy: -1 },
  { xx: -1, xy: 0, yx: 0, yy: 1 },
  { xx: -1, xy: 0, yx: 0, yy: -1 },
  { xx: 0, xy: 1, yx: 1, yy: 0 },
  { xx: 0, xy: 1, yx: -1, yy: 0 },
  { xx: 0, xy: -1, yx: 1, yy: 0 },
  { xx: 0, xy: -1, yx: -1, yy: 0 },
];

// width: width of map (or visible map?)
// height: height of map (or visible map?)
export default function createFOV(
  opaqueEntities,
  width,
  height,
  originX,
  originY,
  originZ,
  radius
) {
  const visible = new Set();

  const blockingLocations = new Set();
  opaqueEntities.get().forEach((x) => {
    if (x.position.z === originZ) {
      blockingLocations.add(`${x.position.x},${x.position.y},${x.position.z}`);
    }
  });

  const isOpaque = (x, y) => {
    const locId = `${x},${y},${originZ}`;
    return !!blockingLocations.has(locId);
  };
  const reveal = (x, y) => {
    return visible.add(`${x},${y},${originZ}`);
  };

  function castShadows(originX, originY, row, start, end, transform, radius) {
    let newStart = 0;
    if (start < end) return;

    let blocked = false;

    for (let distance = row; distance < radius && !blocked; distance++) {
      let deltaY = -distance;
      for (let deltaX = -distance; deltaX <= 0; deltaX++) {
        let currentX = originX + deltaX * transform.xx + deltaY * transform.xy;
        let currentY = originY + deltaX * transform.yx + deltaY * transform.yy;

        let leftSlope = (deltaX - 0.5) / (deltaY + 0.5);
        let rightSlope = (deltaX + 0.5) / (deltaY - 0.5);

        if (
          !(
            currentX >= 0 &&
            currentY >= 0 &&
            currentX < width &&
            currentY < height
          ) ||
          start < rightSlope
        ) {
          continue;
        } else if (end > leftSlope) {
          break;
        }

        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= radius) {
          reveal(currentX, currentY);
        }

        if (blocked) {
          if (isOpaque(currentX, currentY)) {
            newStart = rightSlope;
            continue;
          } else {
            blocked = false;
            start = newStart;
          }
        } else {
          if (isOpaque(currentX, currentY) && distance < radius) {
            blocked = true;
            castShadows(
              originX,
              originY,
              distance + 1,
              start,
              leftSlope,
              transform,
              radius
            );
            newStart = rightSlope;
          }
        }
      }
    }
  }

  reveal(originX, originY);
  for (let octant of octantTransforms) {
    castShadows(originX, originY, 1, 1, 0, octant, radius);
  }

  return {
    fov: visible,
    distance: [...visible].reduce((acc, val) => {
      const cell = idToCell(val);
      acc[val] = distance({ x: originX, y: originY }, { x: cell.x, y: cell.y });
      return acc;
    }, {}),
  };
}
