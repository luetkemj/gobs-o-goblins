import "./lib/canvas.js";
import { clearCanvas, drawChar } from "./lib/canvas";

const player = {
  char: "@",
  color: "white",
  position: {
    x: 0,
    y: 0,
  },
};

drawChar(player);

let userInput = null;

document.addEventListener("keydown", (ev) => {
  userInput = ev.key;
  processUserInput();
});

const processUserInput = () => {
  if (userInput === "ArrowUp") {
    player.position.y -= 1;
  }
  if (userInput === "ArrowRight") {
    player.position.x += 1;
  }
  if (userInput === "ArrowDown") {
    player.position.y += 1;
  }
  if (userInput === "ArrowLeft") {
    player.position.x -= 1;
  }

  clearCanvas();
  drawChar(player);
};
