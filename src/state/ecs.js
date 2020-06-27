import { Engine } from "geotic";
import { cache } from "./cache";
import {
  Appearance,
  IsBlocking,
  IsInFov,
  IsOpaque,
  IsRevealed,
  Layer100,
  Layer400,
  Move,
  Position,
} from "./components";

const ecs = new Engine();

// all Components must be `registered` by the engine
ecs.registerComponent(Appearance);
ecs.registerComponent(IsBlocking);
ecs.registerComponent(IsInFov);
ecs.registerComponent(IsOpaque);
ecs.registerComponent(IsRevealed);
ecs.registerComponent(Layer100);
ecs.registerComponent(Layer400);
ecs.registerComponent(Move);
ecs.registerComponent(Position);

export const player = ecs.createEntity();
player.add(Appearance, { char: "@", color: "#fff" });
player.add(Layer400);

export default ecs;

window.game = {
  ecs,
  cache,
  player,
};
