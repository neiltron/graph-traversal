import {
  circleSize, lineWidth, selectedEdges, findPath,
  findNearestNode, nodes, edges,
} from './graph';
import type { Node, Edge, position } from './graph';

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
  lastRender = performance.now();

  console.log('draw');
  if (performance.now() - lastDraw > drawInterval) {
    lastDraw = performance.now();
    drawStep += speed;
    createImage();
  }

  drawGraph();

  if (isRecording) {
    frames.push(canvas.toDataURL('image/png'));
  }

  raf = requestAnimationFrame(draw);
}

let timeout: any = null;

console.log(nodes, Object.keys(nodes), edges);

const drawGraph = () => {
  if (ctx == null) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing
  ctx.fillStyle = 'rgb(24 24 27)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const keys = Object.keys(nodes);
  for (let i = 0; i < keys.length; i += 1) {
    const node = nodes[keys[i]];
    // drawCircle(node.x, node.y, circleSize, 'rgb(148 163 184)');
    drawCircle(node.x, node.y, circleSize / 2, 'rgb(100 116 139)');
  }

  for (let i = 0; i < edges.length; i += 1) {
    const edge = edges[i];
    const startNode = edge.source;
    const endNode = edge.target;

    ctx.beginPath();
    ctx.moveTo(startNode.x, startNode.y);

    ctx.lineTo(endNode.x, endNode.y);
    ctx.strokeStyle = 'rgb(212 212 216)';
    ctx.lineWidth = lineWidth * .5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // for (let i = 0; i < selectedEdges.length; i += 1) {
  //   const edge = selectedEdges[i];
  //   const startNode: Node = edge.source;
  //   const endNode: Node = edge.target;

  //   if (startNode == null || endNode == null) {
  //     continue;
  //   }

  //   console.log(startNode);

  //   ctx.beginPath();
  //   ctx.moveTo(startNode.x, startNode.y);

  //   ctx.lineTo(endNode.x, endNode.y);
  //   ctx.strokeStyle = 'rgb(253 50 253)';

  //   ctx.lineWidth = lineWidth / 2;
  //   ctx.stroke();
  // }

  const pathKeys = Object.keys(selectedPath);
  for (let i = 0; i < pathKeys.length; i += 1) {
    const edge = selectedPath[pathKeys[i]];
    const startNode: Node = nodes[edge[0]];
    const endNode: Node = nodes[edge[1]];

    ctx.beginPath();
    ctx.moveTo(startNode.x, startNode.y);

    ctx.lineTo(endNode.x, endNode.y);
    ctx.strokeStyle = 'rgb(251 191 36)';

    ctx.lineWidth = lineWidth * 1.2;
    ctx.stroke();
  }

  drawCircle(startNode?.x, startNode?.y, circleSize * 2, 'rgb(34 197 94)');
  drawCircle(endNode?.x, endNode?.y, circleSize * 2, 'rgb(239 68 68)');
};

let startNode: Node | null = null;
let endNode: Node | null = null;
let startPos: position = { x: 0, y: 0 };
let endPos: position = { x: 0, y: 0 };

export const setEndPoints = () => {
  const time = performance.now() / 1000;
  startPos.x = (Math.atan(time / 1.8) - 1 + Math.sin(time)) * 250 + 500;
  startPos.y = Math.cos(time / .7) * 250 + 500;
  endPos.x = (Math.atan(time / 1.2) - 1 + Math.cos(time)) * 250 + 500;
  endPos.y = Math.sin(time / .9) * 250 + 500;

  // console.log(startPos);
  startNode = findNearestNode(startPos);
  endNode = findNearestNode(endPos);
};

const createImage = async () => {
  drawStep = 0;
  startDraw = performance.now();

  setEndPoints();

  if (startNode?.id != null && endNode?.id != null) {
    selectedPath = findPath(startNode?.id, endNode?.id);
  }

  drawGraph();

  clearTimeout(timeout);
  timeout = setTimeout(() => {
    createImage();
  }, selectedEdges.length * (drawInterval / (speed / 1.5)) + 1000);
}

createImage();
await draw();