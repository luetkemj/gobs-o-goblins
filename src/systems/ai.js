import ecs from "../state/ecs";
import { Ai, Description } from "../state/components";

const aiEntities = ecs.createQuery({
  all: [Ai, Description],
});

export const ai = () => {
  aiEntities.get().forEach((entity) => {
    console.log(
      `${entity.description.name} ${entity.id} ponders it's existence.`
    );
  });
};
