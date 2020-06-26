import ecs from "../state/ecs";
import { Appearance, Position } from "../state/components";
import { clearCanvas, drawCell } from "../lib/canvas";

const renderableEntities = ecs.createQuery({
  all: [Position, Appearance],
});

export const render = () => {
  clearCanvas();

  renderableEntities.get().forEach((entity) => {
    drawCell(entity);
  });
};
