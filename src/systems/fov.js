import { grid } from '../lib/canvas';
import createFOV from '../lib/fov';
import { readCache, readCacheSet } from '../state/cache';
import { IsInFov, IsOpaque, IsRevealed } from '../state/components';
import world from '../state/ecs';

const inFovEntities = world.createQuery({
  all: [IsInFov],
});

const opaqueEntities = world.createQuery({
  all: [IsOpaque],
});

export const fov = (origin) => {
  const { width, height } = grid;

  const originX = origin.position.x;
  const originY = origin.position.y;

  const FOV = createFOV(
    opaqueEntities,
    width,
    height,
    originX,
    originY,
    readCache('z'),
    10
  );

  // clear out stale fov
  inFovEntities.get().forEach((x) => x.remove(x.isInFov));

  FOV.fov.forEach((locId) => {
    const entitiesAtLoc = readCacheSet('entitiesAtLocation', locId);

    if (entitiesAtLoc) {
      entitiesAtLoc.forEach((eId) => {
        const entity = world.getEntity(eId);
        entity.add(IsInFov);

        if (!entity.has(IsRevealed)) {
          entity.add(IsRevealed);
        }
      });
    }
  });
};
