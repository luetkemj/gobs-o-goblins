const pixelRatio = window.devicePixelRatio || 1;
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

export const grid = {
  width: 100,
  height: 34,

  map: {
    width: 79,
    height: 29,
    x: 21,
    y: 3,
  },
};

const lineHeight = 1.2;

let calculatedFontSize = window.innerWidth / grid.width;
let cellWidth = calculatedFontSize * pixelRatio;
let cellHeight = calculatedFontSize * lineHeight * pixelRatio;
let fontSize = calculatedFontSize * pixelRatio;

canvas.style.cssText = `width: ${calculatedFontSize * grid.width}; height: ${
  calculatedFontSize * lineHeight * grid.height
}`;
canvas.width = cellWidth * grid.width;
canvas.height = cellHeight * grid.height;

ctx.font = `normal ${fontSize}px 'Fira Code'`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";

export const drawChar = ({ char, color, position }) => {
  ctx.fillStyle = color;
  ctx.fillText(
    char,
    position.x * cellWidth + cellWidth / 2,
    position.y * cellHeight + cellHeight / 2
  );
};

export const clearCanvas = () =>
  ctx.clearRect(0, 0, canvas.width, canvas.height);
