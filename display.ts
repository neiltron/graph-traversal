import { edges, nodes } from './graph';

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('width', '100%');
svg.setAttribute('height', '100%');
svg.setAttribute('viewBox', '0 0 1000 1000');

document.body.appendChild(svg);

for (let i = 0; i < nodes.length; i += 1) {
  const node = nodes[i];
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', String(node.x * 1000));
  circle.setAttribute('cy', String(node.y * 1000));
  circle.setAttribute('r', '5');
  circle.setAttribute('fill', 'black');
  svg.appendChild(circle);
}

for (let i = 0; i < edges.length; i += 1) {
  const edge = edges[i];
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', String(nodes[edge.nodes[0]].x * 1000));
  line.setAttribute('y1', String(nodes[edge.nodes[0]].y * 1000));
  line.setAttribute('x2', String(nodes[edge.nodes[1]].x * 1000));
  line.setAttribute('y2', String(nodes[edge.nodes[1]].y * 1000));
  line.setAttribute('stroke', 'black');
  svg.appendChild(line);
}