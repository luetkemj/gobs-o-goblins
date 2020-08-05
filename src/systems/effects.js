import ecs from "../state/ecs";
const { ActiveEffects } = require("../state/components");

const activeEffectsEntities = ecs.createQuery({
  all: [ActiveEffects],
});

export const effects = () => {
  activeEffectsEntities.get().forEach((entity) => {
    entity.activeEffects.forEach((c) => {
      if (entity[c.component]) {
        entity[c.component].current += c.delta;

        if (entity[c.component].current > entity[c.component].max) {
          entity[c.component].current = entity[c.component].max;
        }
      }

      if (c.events.length) {
        c.events.forEach((event) => entity.fireEvent(event.name, event.args));
      }

      entity.add("Animate", { ...c.animate });

      c.remove();
    });
  });
};
