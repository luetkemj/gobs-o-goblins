import ecs from "../state/ecs";
import { addLog } from "../index";
import { addCacheSet, deleteCacheSet, readCacheSet } from "../state/cache";
import { grid } from "../lib/canvas";
import { Move } from "../state/components";

const movableEntities = ecs.createQuery({
  all: [Move],
});

const attack = (entity, target) => {
  const damage = entity.power.current - target.defense.current;
  target.fireEvent("take-damage", { amount: damage });

  if (target.health.current <= 0) {
    return addLog(
      `${entity.description.name} kicked a ${target.description.name} for ${damage} damage and killed it!`
    );
  }

  addLog(
    `${entity.description.name} kicked a ${target.description.name} for ${damage} damage!`
  );
};

export const movement = () => {
  movableEntities.get().forEach((entity) => {
    if (entity.has("Paralyzed")) {
      return entity.remove(Move);
    }

    let mx = entity.move.x;
    let my = entity.move.y;

    if (entity.move.relative) {
      mx = entity.position.x + entity.move.x;
      my = entity.position.y + entity.move.y;
    }

    // this is where we will run any checks to see if entity can move to new location
    // observe map boundaries
    mx = Math.min(grid.map.width + grid.map.x - 1, Math.max(21, mx));
    my = Math.min(grid.map.height + grid.map.y - 1, Math.max(3, my));

    // check for blockers
    const blockers = [];
    // read from cache
    const entitiesAtLoc = readCacheSet("entitiesAtLocation", `${mx},${my}`);

    for (const eId of entitiesAtLoc) {
      if (ecs.getEntity(eId).isBlocking) {
        blockers.push(eId);
      }
    }
    if (blockers.length) {
      blockers.forEach((eId) => {
        const target = ecs.getEntity(eId);
        if (target.has("Health") && target.has("Defense")) {
          attack(entity, target);
        } else {
          addLog(
            `${entity.description.name} bump into a ${target.description.name}`
          );
        }
      });

      entity.remove(Move);
      return;
    }

    entity.remove("Position");
    entity.add("Position", { x: mx, y: my });

    entity.remove(Move);
  });
};
