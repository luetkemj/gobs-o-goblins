import { Engine } from "geotic";
import {
  Ai,
  Appearance,
  Description,
  Defense,
  Health,
  IsBlocking,
  IsDead,
  IsInFov,
  IsOpaque,
  IsPickup,
  IsRevealed,
  Layer100,
  Layer300,
  Layer400,
  Move,
  Position,
  Power,
} from "./components";

import {
  Being,
  Item,
  Tile,
  HealthPotion,
  Goblin,
  Player,
  Wall,
  Floor,
} from "./prefabs";

const ecs = new Engine();

// all Components must be `registered` by the engine
ecs.registerComponent(Ai);
ecs.registerComponent(Appearance);
ecs.registerComponent(Description);
ecs.registerComponent(Defense);
ecs.registerComponent(Health);
ecs.registerComponent(IsBlocking);
ecs.registerComponent(IsDead);
ecs.registerComponent(IsInFov);
ecs.registerComponent(IsOpaque);
ecs.registerComponent(IsPickup);
ecs.registerComponent(IsRevealed);
ecs.registerComponent(Layer100);
ecs.registerComponent(Layer300);
ecs.registerComponent(Layer400);
ecs.registerComponent(Move);
ecs.registerComponent(Position);
ecs.registerComponent(Power);

// register "base" prefabs first!
ecs.registerPrefab(Being);
ecs.registerPrefab(Item);
ecs.registerPrefab(Tile);

ecs.registerPrefab(HealthPotion);
ecs.registerPrefab(Wall);
ecs.registerPrefab(Floor);
ecs.registerPrefab(Goblin);
ecs.registerPrefab(Player);

export const messageLog = ["", "Welcome to Gobs 'O Goblins!", ""];
export const addLog = (text) => {
  messageLog.unshift(text);
};

export default ecs;
