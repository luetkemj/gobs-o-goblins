import { Engine } from "geotic";
import {
  ActiveEffects,
  Ai,
  Animate,
  Appearance,
  Description,
  Defense,
  Effects,
  Health,
  Inventory,
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
  Paralyzed,
  Position,
  Power,
  RequiresTarget,
  Target,
  TargetingItem,
} from "./components";

import {
  Being,
  Item,
  Tile,
  HealthPotion,
  ScrollFireball,
  ScrollLightning,
  ScrollParalyze,
  Goblin,
  Player,
  Wall,
  Floor,
} from "./prefabs";

const ecs = new Engine();

// all Components must be `registered` by the engine
ecs.registerComponent(ActiveEffects);
ecs.registerComponent(Animate);
ecs.registerComponent(Ai);
ecs.registerComponent(Appearance);
ecs.registerComponent(Description);
ecs.registerComponent(Defense);
ecs.registerComponent(Effects);
ecs.registerComponent(Health);
ecs.registerComponent(Inventory);
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
ecs.registerComponent(Paralyzed);
ecs.registerComponent(Position);
ecs.registerComponent(Power);
ecs.registerComponent(RequiresTarget);
ecs.registerComponent(Target);
ecs.registerComponent(TargetingItem);

// register "base" prefabs first!
ecs.registerPrefab(Tile);
ecs.registerPrefab(Being);
ecs.registerPrefab(Item);

ecs.registerPrefab(HealthPotion);
ecs.registerPrefab(Wall);
ecs.registerPrefab(Floor);
ecs.registerPrefab(Goblin);
ecs.registerPrefab(Player);
ecs.registerPrefab(ScrollFireball);
ecs.registerPrefab(ScrollLightning);
ecs.registerPrefab(ScrollParalyze);

export const messageLog = ["", "Welcome to Gobs 'O Goblins!", ""];
export const addLog = (text) => {
  messageLog.unshift(text);
};
export const loadMessageLog = (data) => {
  messageLog.splice(0, messageLog.length);
  data.forEach((log) => messageLog.push(log));
};

export default ecs;
