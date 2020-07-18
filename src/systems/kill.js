import ecs from "../state/ecs";

import { Health } from "../state/components";

const killableEntities = ecs.createQuery({
  all: [Health],
});

export const kill = () => {
  killableEntities.get().forEach((entity) => {
    if (entity.health.current <= 0) {
      entity.appearance.char = "%";
      entity.remove("Ai");
      entity.remove("IsBlocking");
      entity.add("IsDead");
      entity.remove("Layer400");
      entity.add("Layer300");
      entity.remove("Health");
    }
  });
};
