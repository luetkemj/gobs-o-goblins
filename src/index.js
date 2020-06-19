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

let userInput = null;
let playerTurn = false;

document.addEventListener("keydown", (ev) => (userInput = ev.key));

const processUserInput = () => {
  if (!userInput) {
    return;
  }

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
};

function gameTick() {
  clearCanvas();
  drawChar(player);
}

function update() {
  if (userInput && playerTurn) {
    processUserInput();
    gameTick();
    userInput = null;
    playerTurn = false;
  }

  if (!playerTurn) {
    gameTick();
    playerTurn = true;
  }
}

function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

gameLoop();
