import { Engine } from "geotic";
import { Appearance, IsBlocking, Move, Position } from "./components";

const ecs = new Engine();

// all Components must be `registered` by the engine
ecs.registerComponent(Appearance);
ecs.registerComponent(IsBlocking);
ecs.registerComponent(Move);
ecs.registerComponent(Position);

export const player = ecs.createEntity();
player.add(Appearance, { char: "@", color: "#fff" });
player.add(Position);

export default ecs;
