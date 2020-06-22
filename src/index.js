import "./lib/canvas.js";
import { movement } from "./systems/movement";
import { render } from "./systems/render";
import { player } from "./state/ecs";
import { Move } from "./state/components";

render();

let userInput = null;

document.addEventListener("keydown", (ev) => {
  userInput = ev.key;
  processUserInput();
});

const processUserInput = () => {
  if (userInput === "ArrowUp") {
    // player.position.y -= 1;
    player.add(Move, { x: 0, y: -1 });
  }
  if (userInput === "ArrowRight") {
    // player.position.x += 1;
    player.add(Move, { x: 1, y: 0 });
  }
  if (userInput === "ArrowDown") {
    // player.position.y += 1;
    player.add(Move, { x: 0, y: 1 });
  }
  if (userInput === "ArrowLeft") {
    // player.position.x -= 1;
    player.add(Move, { x: -1, y: 0 });
  }

  movement();
  render();
};
