import { addEdges, addNode, edges, nodes, selectedEdges, findPath, clearEdges, clearNodes } from './graph';
import type { edge, node } from './graph';
import { generate } from './gradio';

const canvas: HTMLCanvasElement = document.createElement('canvas');
const ctx = canvas!.getContext('2d');

canvas.width = 1000;
canvas.height = 1000;

document.body.appendChild(canvas);

function drawCircle(x, y, r, fill) {
  ctx!.beginPath();
  ctx!.arc(x, y, r, 0, 2 * Math.PI, false);
  ctx!.fillStyle = fill;
  ctx!.fill();
}

let drawStep: number = 0;
let lastDraw: number = performance.now();
let startDraw: number = performance.now();
let raf: number | null = null
let drawInterval = 10000 / 60;
const circleSize: number = 10;

const draw = () => {
  if (performance.now() - lastDraw > drawInterval) {
    lastDraw = performance.now();
    drawStep += 1;
  }

  drawGraph();

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
    drawCircle(node.x, node.y, circleSize / 2, 'rgb(24 24 27)');
  }

  for (let i = 0; i < edges.length; i += 1) {
    const edge = edges[i];
    const startNode = nodes[edge.nodes[0]];
    const endNode = nodes[edge.nodes[1]];

    ctx.beginPath();
    ctx.moveTo(startNode.x, startNode.y);
    ctx.lineTo(endNode.x, endNode.y);
    ctx.strokeStyle = 'rgb(148 163 184)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let i = 0; i < Math.min(selectedEdges.length, drawStep); i += 1) {
    const edge = selectedEdges[i];
    const startNode: node = nodes[edge[0]];
    const endNode: node = nodes[edge[1]];

    ctx.beginPath();
    ctx.moveTo(startNode.x, startNode.y);

    if (i < drawStep - 1) {
      ctx.lineTo(endNode.x, endNode.y);
      ctx.strokeStyle = 'rgb(203 213 225)';
    } else {
      const progress = (performance.now() - lastDraw) / drawInterval;

      // console.log(progress)
      // ctx.lineTo(endX, endY);
      ctx.lineTo(
        startNode.x + progress * (endNode.x - startNode.x),
        startNode.y + progress * (endNode.y - startNode.y)
      );
      ctx.strokeStyle = 'rgb(253 224 71)';
    }
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  // console.log(nodes, startNode);
  drawCircle(nodes[startNode].x, nodes[startNode].y, 30, 'rgb(134 239 172)');
  drawCircle(nodes[endNode].x, nodes[endNode].y, 30, 'rgb(254 202 202)');
};

const addNodes = () => {
  let nextNodeId: number = 0;
  const offset = Math.random() * 5;

  for (let i = 0; i < 20; i++) {
    addNode({
      id: i,
      // x: Math.max(.1, Math.min(.9, (Math.sin(i + offset) / 1.5 + 1) / 2)) * 1000,
      // y: Math.max(.1, Math.min(.9, (Math.cos(i + offset) / 1.5 + 1) / 2)) * 1000,

      x: Math.floor(i % 4) * 250 + 125,
      y: Math.floor(i / 4) * 175 + 125,
    });
  }
};

let startNode: number = 0;
let endNode: number = 0;


const createImage = async () => {
  drawStep = 0;
  startDraw = performance.now();
  clearNodes();
  clearEdges();

  addNodes();

  endNode = startNode = Math.floor(Math.random() * nodes.length);
  // startNode = 0;
  while (endNode === startNode) {
    endNode = Math.floor(Math.random() * nodes.length);
  }
  // endNode = nodes.length - 1;


  addEdges();
  console.log(endNode, findPath(startNode, endNode));
  drawGraph();

  clearTimeout(timeout);

  timeout = setTimeout(() => {
    createImage();
  }, selectedEdges.length * drawInterval + 1000);


  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob == null) {
        reject('blob is null');
      } else {
        resolve(blob);
      }
    });
  });
}

createImage();
draw();
// for (let i = 0; i < 1; i++) {
//   const img: any = createImage();

//   // img.then(async resp => {
//   //   console.log('resp', resp);
//   //   const img = new Image();
//   //   img.src = URL.createObjectURL(resp);
//   //   document.body.appendChild(img);

//   //   const request = await generate(resp);
//   //   console.log(request);

//   //   // // download img
//   //   const a = document.createElement('a');
//   //   a.href = URL.createObjectURL(img);
//   //   a.download = `image-${performance.now()}.png`;
//   //   a.click();
//   // }).catch(err => {
//   //   console.log('err', err);
//   // });
// }