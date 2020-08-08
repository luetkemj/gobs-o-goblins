import ecs from "../state/ecs";
import { addLog } from "../index";
import { readCacheSet } from "../state/cache";

import { Target, TargetingItem } from "../state/components";

const targetingEntities = ecs.createQuery({
  all: [Target, TargetingItem],
});

export const targeting = () => {
  targetingEntities.get().forEach((entity) => {
    const { item } = entity.targetingItem;

    if (item && item.has("Effects")) {
      entity.target.forEach((t) => {
        const targets = readCacheSet("entitiesAtLocation", t.locId);

        targets.forEach((eId) => {
          const target = ecs.getEntity(eId);
          if (target.isInFov) {
            item
              .get("Effects")
              .forEach((x) =>
                target.add("ActiveEffects", { ...x.serialize() })
              );
          }
        });
      });

      entity.remove("Target");
      entity.remove("TargetingItem");

      addLog(`You use a ${item.description.name}`);

      item.destroy();
    }
  });
};
