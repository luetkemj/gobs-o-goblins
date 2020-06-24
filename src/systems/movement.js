import ecs from "../state/ecs";
import { grid } from "../lib/canvas";
import { Move } from "../state/components";

const movableEntities = ecs.createQuery({
  all: [Move],
});

export const movement = () => {
  movableEntities.get().forEach((entity) => {
    let mx = entity.position.x + entity.move.x;
    let my = entity.position.y + entity.move.y;

    // this is where we will run any checks to see if entity can move to new location
    // observe map boundaries
    mx = Math.min(grid.map.width + grid.map.x - 1, Math.max(21, mx));
    my = Math.min(grid.map.height + grid.map.y - 1, Math.max(3, my));

    // check for blockers
    const blockers = [];
    for (const e of ecs.entities.all) {
      if (e.position.x === mx && e.position.y === my && e.isBlocking) {
        blockers.push(e);
      }
    }
    if (blockers.length) {
      entity.remove(Move);
      return;
    }

    entity.position.x = mx;
    entity.position.y = my;

    entity.remove(Move);
  });
};
