import ecs from "../state/ecs";
import { Move } from "../state/components";

const movableEntities = ecs.createQuery({
  all: [Move],
});

export const movement = () => {
  movableEntities.get().forEach((entity) => {
    const mx = entity.position.x + entity.move.x;
    const my = entity.position.y + entity.move.y;

    // this is where we will run any checks to see if entity can move to new location

    entity.position.x = mx;
    entity.position.y = my;

    entity.remove(Move);
  });
};
