import ecs from "../state/ecs";
import {
  Appearance,
  Position,
  Layer100,
  Layer300,
  Layer400,
} from "../state/components";
import { clearCanvas, drawCell } from "../lib/canvas";

const layer100Entities = ecs.createQuery({
  all: [Position, Appearance, Layer100],
});

const layer300Entities = ecs.createQuery({
  all: [Position, Appearance, Layer300],
});

const layer400Entities = ecs.createQuery({
  all: [Position, Appearance, Layer400],
});

export const render = () => {
  clearCanvas();

  layer100Entities.get().forEach((entity) => {
    drawCell(entity);
  });

  layer300Entities.get().forEach((entity) => {
    drawCell(entity);
  });

  layer400Entities.get().forEach((entity) => {
    drawCell(entity);
  });
};
