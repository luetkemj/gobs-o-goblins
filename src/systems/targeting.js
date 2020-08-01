import { findIndex } from "lodash";
import ecs, { addLog } from "../state/ecs";
import { readCacheSet } from "../state/cache";

import { Target, TargetingItem } from "../state/components";

const targetingEntities = ecs.createQuery({
  all: [Target, TargetingItem],
});

export const targeting = () => {
  targetingEntities.get().forEach((entity) => {
    const item = ecs.getEntity(entity.targetingItem.eId);

    if (item && item.has("Effects")) {
      const targets = readCacheSet("entitiesAtLocation", entity.target.locId);

      targets.forEach((eId) => {
        const target = ecs.getEntity(eId);
        item
          .get("Effects")
          .forEach((x) => target.add("ActiveEffects", { ...x.serialize() }));
      });

      entity.remove("Target");
      entity.remove("TargetingItem");

      addLog(`You use a ${item.description.name}`);
    }
  });
};
