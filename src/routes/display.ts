import {
  circleSize, lineWidth,
  addEdges, addNode, edges, gridSize, nodeCount, nodes,
  selectedEdges, findPath, clearEdges, clearNodes,
  findNearestNode,
} from './graph';
import type { node, position } from './graph';

const canvas: HTMLCanvasElement = document.createElement('canvas');
const ctx = canvas!.getContext('2d');

canvas.width = 1000;
canvas.height = 1000;

document.body.appendChild(canvas);


let drawStep: number = 0;
let lastDraw: number = performance.now();
let lastRender: number = performance.now();
let startDraw: number = performance.now();
let raf: number | null = null
let drawInterval = 10;
let speed = 5;
let isRecording = false;
let selectedPath = {};
const frames: string[] = [];

document.addEventListener('keydown', (e) => {
  if (e.key === 'r') {
    isRecording = !isRecording;
    if (isRecording) {
      console.log('recording');
      frames.length = 0;
      createImage();
    } else {
      console.log('done recording', frames.length);

      frames.forEach((frame, i) => {
        setTimeout(() => {
          downloadPng(frame, i);
        }, i * 150);
      });
    }
    // endNode = nodes.length - 1;
  }
})

function drawCircle(x, y, r, fill) {
  ctx!.beginPath();
  ctx!.arc(x, y, r, 0, 2 * Math.PI, false);
  ctx!.fillStyle = fill;
  ctx!.fill();
}

const intToFourDigit = (num: number) => {
  const str = num.toString();
  return '0'.repeat(4 - str.length) + str;
}

const downloadPng = (dataUrl: string, frame: number) => {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `image-${intToFourDigit(frame)}.png`;
  a.click();

  window.URL.revokeObjectURL(dataUrl);
}

const draw = async () => {
  // if (performance.now() - lastRender > 100) {
    lastRender = performance.now();

    if (performance.now() - lastDraw > drawInterval) {
      lastDraw = performance.now();
      drawStep += speed;
      createImage();
    }

    drawGraph();
    frames.push(canvas.toDataURL('image/png'));
  // }

  raf = requestAnimationFrame(draw);
}

let timeout: any = null;

const drawGraph = () => {
  if (ctx == null) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing
  ctx.fillStyle = 'rgb(2 6 23)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    // drawCircle(node.x, node.y, circleSize, 'rgb(148 163 184)');
    drawCircle(node.x, node.y, circleSize / 5, 'rgb(100 116 139)');
  }

  for (let i = 0; i < edges.length; i += 1) {
    const edge = edges[i];
    const startNode = nodes[edge.nodes[0]];
    const endNode = nodes[edge.nodes[1]];

    ctx.beginPath();
    ctx.moveTo(startNode.x, startNode.y);

    ctx.lineTo(endNode.x, endNode.y);
    ctx.strokeStyle = 'rgb(148 163 184)';
    ctx.lineWidth = lineWidth * .5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  for (let i = 0; i < selectedPath.length; i += 1) {
    const edge = selectedPath[i];
    const startNode: node = nodes[edge[0]];
    const endNode: node = nodes[edge[1]];

    ctx.beginPath();
    ctx.moveTo(startNode.x, startNode.y);

    ctx.lineTo(endNode.x, endNode.y);
    ctx.strokeStyle = 'rgb(251 191 36)';

    ctx.lineWidth = lineWidth * 1.2;
    ctx.stroke();
  }

  // console.log(nodes, startNode);
  drawCircle(nodes[startNode].x, nodes[startNode].y, circleSize * 2, 'rgb(34 197 94)');
  drawCircle(nodes[endNode].x, nodes[endNode].y, circleSize * 2, 'rgb(239 68 68)');
};

const addNodes = () => {
  for (let i = 0; i < nodeCount + gridSize; i++) {
    const x = Math.floor(i % gridSize) * (1000 / (gridSize * 1.15)) + 70;
    const y = Math.floor(i / gridSize) * (1000 / (gridSize * 1.15)) + 70;

    addNode({
      id: i,
      x,
      y,
    });
  }
};

let startNode: number = 0;
let endNode: number = 0;
let startPos: position = { x: 0, y: 0 };
let endPos: position = { x: 0, y: 0 };


export const setEndPoints = () => {
  const time = performance.now() / 1000;
  startPos.x = (Math.atan(time / 1.8) - 1 + Math.sin(time)) * 250 + 500;
  startPos.y = Math.cos(time / 1.3) * 250 + 500;
  endPos.x = (Math.atan(time / 1.2) - 1 + Math.cos(time)) * 250 + 500;
  endPos.y = Math.sin(time / 1.4) * 250 + 500;

  startNode = findNearestNode(startPos);
  endNode = findNearestNode(endPos);
};


const createImage = async () => {
  drawStep = 0;
  startDraw = performance.now();

  setEndPoints();

  selectedPath = findPath(startNode, endNode);
  drawGraph();

  console.log('clear timeout')
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    console.log('timeoutdone')
    createImage();
  }, selectedEdges.length * (drawInterval / (speed / 1.5)) + 1000);
}

clearNodes();
clearEdges();

addNodes();
addEdges();

createImage();
await draw();