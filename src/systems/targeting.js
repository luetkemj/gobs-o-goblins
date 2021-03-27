import { addLog } from '../index';
import { readCacheSet } from '../state/cache';
import {
  ActiveEffects,
  Effects,
  Target,
  TargetingItem,
} from '../state/components';
import world from '../state/ecs';

const targetingEntities = world.createQuery({
  all: [Target, TargetingItem],
});

export const targeting = (player) => {
  targetingEntities.get().forEach((entity) => {
    const item = world.getEntity(entity.targetingItem.itemId);

    if (item && item.has(Effects)) {
      entity.target.forEach((t, idx) => {
        const targets = readCacheSet('entitiesAtLocation', t.locId);

        targets.forEach((eId) => {
          const target = world.getEntity(eId);
          if (target.isInFov) {
            item.effects.forEach((x) => {
              target.add(ActiveEffects, { ...x.serialize() });
            });
          }
        });
        entity.remove(entity.target[idx]);
      });
      entity.remove(entity.targetingItem);

      addLog(`You use a ${item.description.name}`);
      player.fireEvent('consume', item);
    }
  });
};
