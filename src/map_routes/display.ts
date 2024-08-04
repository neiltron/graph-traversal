import {
  circleSize,
  lineWidth,
  selectedEdges,
  findPath,
  findNearestNode,
  nodes,
  edges,
} from "./graph";
import type { Node, Edge, position } from "./graph";

const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx = canvas!.getContext("2d");

canvas.width = 1000;
canvas.height = 1000;

document.body.appendChild(canvas);

let drawStep: number = 0;
let lastDraw: number = performance.now();
let lastRender: number = performance.now();
let startDraw: number = performance.now();
let raf: number | null = null;
let drawInterval = 100;
let speed = 1;
let isRecording = false;
let selectedPath = {};
let segmentLengths: number[] = [];
let currentSegment: number = 0;
let lastSegmentStart: number = 0;
const frames: string[] = [];

document.addEventListener("keydown", (e) => {
  if (e.key === "r") {
    isRecording = !isRecording;
    if (isRecording) {
      console.log("recording");
      frames.length = 0;
      createImage();
    } else {
      console.log("done recording", frames.length);

      frames.forEach((frame, i) => {
        setTimeout(() => {
          downloadPng(frame, i);
        }, i * 150);
      });
    }
    // endNode = nodes.length - 1;
  }
});

function drawCircle(x, y, r, fill) {
  ctx!.beginPath();
  ctx!.arc(x, y, r, 0, 2 * Math.PI, false);
  ctx!.fillStyle = fill;
  ctx!.fill();
}

const intToFourDigit = (num: number) => {
  const str = num.toString();
  return "0".repeat(4 - str.length) + str;
};

const downloadPng = (dataUrl: string, frame: number) => {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `image-${intToFourDigit(frame)}.png`;
  a.click();

  window.URL.revokeObjectURL(dataUrl);
};

const draw = async () => {
  lastRender = performance.now();

  // console.log('draw');
  if (drawStep >= drawInterval + 50) {
    lastDraw = performance.now();
    createImage();
  }

  drawStep += speed;
  drawGraph();

  if (isRecording) {
    frames.push(canvas.toDataURL("image/png"));
  }

  raf = requestAnimationFrame(draw);
};

let timeout: any = null;

console.log(nodes, Object.keys(nodes), edges);

const drawGraph = () => {
  if (ctx == null) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing
  ctx.fillStyle = "rgb(24 24 27)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /**
   * draw map nodes
   */
  const keys = Object.keys(nodes);
  for (let i = 0; i < keys.length; i += 1) {
    const node = nodes[keys[i]];
    // drawCircle(node.x, node.y, circleSize, 'rgb(148 163 184)');
    drawCircle(
      node.x * canvas.width,
      node.y * canvas.height,
      circleSize / 1.5,
      "rgb(100 116 139)",
    );
  }

  /**
   * draw map edges
   */
  for (let i = 0; i < edges.length; i += 1) {
    const edge = edges[i];
    const startNode = edge.source;
    const endNode = edge.target;

    ctx.beginPath();
    ctx.moveTo(startNode.x * canvas.width, startNode.y * canvas.height);

    ctx.lineTo(endNode.x * canvas.width, endNode.y * canvas.height);
    ctx.strokeStyle = "rgb(212 212 216)";
    ctx.lineWidth = lineWidth * 0.5;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  /**
   * draw search area
   **/
  // for (let i = 0; i < selectedEdges.length; i += 1) {
  //   const edge = selectedEdges[i];
  //   const startNode: Node = edge.source;
  //   const endNode: Node = edge.target;

  //   if (startNode == null || endNode == null) {
  //     continue;
  //   }

  //   // console.log(startNode);

  //   ctx.beginPath();
  //   ctx.moveTo(startNode.x * canvas.width, startNode.y * canvas.height);

  //   ctx.lineTo(endNode.x * canvas.width, endNode.y * canvas.height);
  //   ctx.strokeStyle = "rgb(253 50 253)";

  //   ctx.lineWidth = lineWidth / 2;
  //   ctx.stroke();
  //   ctx.closePath();
  // }

  /**
   * draw yellow line between points
   */
  if (drawStep - lastSegmentStart > segmentLengths[currentSegment]) {
    currentSegment += 1;
    lastSegmentStart = drawStep;
  }
  const pathKeys = Object.keys(selectedPath);

  console.log(
    pathKeys.length,
    segmentLengths.length,
    currentSegment,
    drawInterval,
    drawStep,
    lastSegmentStart,
    segmentLengths[currentSegment],
  );

  // console.log(drawStep);
  for (
    let i = 0;
    i <= currentSegment && currentSegment < segmentLengths.length;
    i += 1
  ) {
    const edge = selectedPath[pathKeys[i]];
    const startNode: Node = nodes[edge[0]];
    const endNode: Node = nodes[edge[1]];
    const progress =
      (drawStep - lastSegmentStart) / segmentLengths[currentSegment];

    ctx.beginPath();
    ctx.moveTo(startNode.x * canvas.width, startNode.y * canvas.height);

    if (i == currentSegment) {
      const { x, y } = calculateCurrentPosition(
        startNode,
        endNode,
        segmentLengths[currentSegment],
        progress,
      );

      console.log("what");
      ctx.lineTo(x * canvas.width, y * canvas.height);
      ctx.strokeStyle = "rgb(251 171 36)";
      ctx.lineWidth = lineWidth * 1.2;
      ctx.stroke();

      drawCircle(
        x * canvas.width,
        y * canvas.height,
        circleSize,
        "rgb(239 68 68)",
      );
    } else {
      ctx.lineTo(endNode.x * canvas.width, endNode.y * canvas.height);
      ctx.strokeStyle = "rgb(251 191 36)";
      ctx.lineWidth = lineWidth * 1.2;
      ctx.stroke();
    }
  }

  // console.log(startNode?.x, startNode?.y);
  drawCircle(
    startNode!.x * canvas.width,
    startNode!.y * canvas.height,
    circleSize * 2,
    "rgb(34 197 94)",
  );
  drawCircle(
    endNode!.x * canvas.width,
    endNode!.y * canvas.height,
    circleSize * 2,
    "rgb(239 68 68)",
  );
};

let startNode: Node | null = null;
let endNode: Node | null = null;
let startPos: position = { x: 0, y: 0 };
let endPos: position = { x: 0, y: 0 };

export const setEndPoints = () => {
  const time = performance.now() / 1000;
  startPos.x = Math.atan(time / 1.8) - 1 + Math.sin(time) / 2;
  startPos.y = Math.cos(time / 0.7) / 2;
  // startPos.x = 0;
  // startPos.y = 0;
  endPos.x = Math.atan(time / 1.2) - 1 + Math.cos(time) / 2;
  endPos.y = Math.sin(time / 0.9) / 2;

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

  calculateSegmentLengths();
  lastSegmentStart = 0;
  currentSegment = 0;

  drawGraph();

  // clearTimeout(timeout);
  // timeout = setTimeout(
  //   () => {
  //     createImage();
  //   },
  //   selectedEdges.length * (drawInterval / (speed / 1.5)) + 3000,
  // );
};

const calculateCurrentPosition = (
  startNode: Node,
  endNode: Node,
  segmentLength: number,
  progress: number,
) => {
  const dx = endNode.x - startNode.x;
  const dy = endNode.y - startNode.y;
  const x = startNode.x + dx * progress;
  const y = startNode.y + dy * progress;

  return { x, y };
};

const calculateSegmentLengths = async () => {
  const pathKeys = Object.keys(selectedPath);
  segmentLengths = [];

  for (let i = 0; i < pathKeys.length; i += 1) {
    const edge = selectedPath[pathKeys[i]];
    const startNode: Node = nodes[edge[0]];
    const endNode: Node = nodes[edge[1]];

    const dx = endNode.x - startNode.x;
    const dy = endNode.y - startNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    segmentLengths.push(length);
  }

  // sum of segmentLengths
  drawInterval = segmentLengths.reduce((a, b) => a + b, 0);

  // normalize segment lengths by drawInterval
  segmentLengths = segmentLengths.map((length) =>
    Math.floor(length / (drawInterval / 100)),
  );

  drawInterval = segmentLengths.reduce((a, b) => a + b, 0);
  console.log(drawInterval);
};

createImage();
await draw();
