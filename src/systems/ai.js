import ecs from "../state/ecs";
import { Ai, Description } from "../state/components";
import { aStar } from "../lib/pathfinding";
import { readCache } from "../state/cache";

const aiEntities = ecs.createQuery({
  all: [Ai, Description],
});

const moveToTarget = (entity, target) => {
  const path = aStar(entity.position, target.position);
  if (path.length) {
    const newLoc = path[1];
    entity.add("Move", {
      x: newLoc[0],
      y: newLoc[1],
      z: readCache("z"),
      relative: false,
    });
  }
};

export const ai = (player) => {
  aiEntities.get().forEach((entity) => {
    if (entity.has("IsInFov")) {
      moveToTarget(entity, player);
    }
  });
};
