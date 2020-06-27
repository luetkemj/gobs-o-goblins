import { readCacheSet } from "../state/cache";
import ecs, { player } from "../state/ecs";
import { grid } from "../lib/canvas";
import createFOV from "../lib/fov";
import { IsInFov, IsOpaque, IsRevealed } from "../state/components";

const inFovEntities = ecs.createQuery({
  all: [IsInFov],
});

const opaqueEntities = ecs.createQuery({
  all: [IsOpaque],
});

export const fov = () => {
  const { width, height } = grid;

  const originX = player.position.x;
  const originY = player.position.y;

  const FOV = createFOV(opaqueEntities, width, height, originX, originY, 10);

  // clear out stale fov
  inFovEntities.get().forEach((x) => x.remove(IsInFov));

  FOV.fov.forEach((locId) => {
    const entitiesAtLoc = readCacheSet("entitiesAtLocation", locId);

    if (entitiesAtLoc) {
      entitiesAtLoc.forEach((eId) => {
        const entity = ecs.getEntity(eId);
        entity.add(IsInFov);

        if (!entity.has("IsRevealed")) {
          entity.add(IsRevealed);
        }
      });
    }
  });
};
