import ecs from "../state/ecs";
const { ActiveEffects } = require("../state/components");

const activeEffectsEntities = ecs.createQuery({
  all: [ActiveEffects],
});

export const effects = () => {
  activeEffectsEntities.get().forEach((entity) => {
    entity.activeEffects.forEach((c) => {
      // handle component deltas
      if (entity[c.component]) {
        entity[c.component].current += c.delta;

        if (entity[c.component].current > entity[c.component].max) {
          entity[c.component].current = entity[c.component].max;
        }
      }

      // fire events
      if (c.events.length) {
        c.events.forEach((event) => entity.fireEvent(event.name, event.args));
      }

      // handle addComponents
      if (c.addComponents.length) {
        c.addComponents.forEach((component) => {
          if (!entity.has(component.name)) {
            entity.add(component.name, component.properties);
          }
        });
      }

      entity.add("Animate", { ...c.animate });

      // cleanup
      if (!c.duration) {
        c.remove();

        if (c.addComponents.length) {
          c.addComponents.forEach((component) => {
            if (entity.has(component.name)) {
              entity.remove(component.name, component.properties);
            }
          });
        }
      } else {
        c.duration -= 1;
      }
    });
  });
};
