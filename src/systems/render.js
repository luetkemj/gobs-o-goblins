import ecs from "../state/ecs";
import { Appearance, Position } from "../state/components";
import { clearCanvas, drawChar } from "../lib/canvas";

const renderableEntities = ecs.createQuery({
  all: [Position, Appearance],
});

export const render = () => {
  clearCanvas();

  renderableEntities.get().forEach((entity) => {
    const { appearance, position } = entity;
    const { char, color } = appearance;

    drawChar({ char, color, position });
  });
};
