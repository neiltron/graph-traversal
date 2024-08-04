import { adjacency, edges, nodes } from "./map-data";
import type { Node, Edge } from "./map-data";
const graph = [];

export { adjacency, edges, nodes };
export type { Node, Edge };

export type edge = { id: number; nodes: number[] };
export type node = { id: number; x: number; y: number };
export type position = { x: number; y: number };

export const gridSize: number = 50;
export const nodeCount: number = gridSize * gridSize;
export const circleSize = 5;
export const lineWidth = 4;

export let selectedEdges: Edge[] = [];

export const findPath = (start: number, end: number): object => {
  selectedEdges = [];

  const nodeCounts = Object.keys(nodes).length;
  const predecessor: number[] = Array(nodeCount).fill(-1);
  const visited: boolean[] = Array(nodeCount).fill(false);
  const queue: number[] = [start];

  while (queue.length > 0) {
    const u = queue.shift();

    if (u === end) {
      break;
    }

    if (adjacency[u] != null) {
      for (let v of adjacency[u]) {
        if (!visited[v]) {
          visited[v] = true;
          const edge = edges.find(
            (edge) => edge.source.id === u && edge.target.id === v,
          );

          if (edge != null) {
            selectedEdges.push(edge);
          }

          predecessor[v] = u;
          queue.push(v);
        }
      }
    }
  }

  let currentNode = end;
  const path = [];

  while (currentNode !== start) {
    if (currentNode === -1) {
      return []; // no path found
    }

    const prevNode = predecessor[currentNode];
    path.unshift([prevNode, currentNode]); // add edge to path
    currentNode = prevNode;
  }

  return path;
};

export const findNearestNode = (pos: position): Node | null => {
  const { x, y } = pos;
  let nearestNode: Node | null = null;
  let nearestDistance = Infinity;

  const keys = Object.keys(nodes);
  for (let i = 0; i < keys.length; i++) {
    const node = nodes[keys[i]];
    const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestNode = nodes[keys[i]];
    }
  }

  // console.log(nearestNode, nearestDistance);
  return nearestNode;
};
