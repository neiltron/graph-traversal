const graph = [];

export type edge = { id: number, nodes: number[] };
export type node = { id: number, x: number, y: number };

export const gridSize: number = 25;
export const nodeCount: number = gridSize * gridSize;
export const circleSize = 5;
export const lineWidth = 4;

export let edges: edge[] = [];
export let nodes: node[] = [];
export let adjacency: object = {};
let nextEdgeId: number = 0;

export const addNode = (node: node) => {
  nodes.push(node);
}

export const clearNodes = () => { nodes = []; }
export const clearEdges = () => { edges = []; }

const addEdge = (u: number, v: number) => {
  const edge: edge = {
    id: nextEdgeId,
    nodes: [u, v],
  };

  edges.push(edge);
  nextEdgeId += 1;
}

const addAdjacency = (parent: number, neighbor: number) => {
  if (adjacency[parent] == null) { adjacency[parent] = []; }
  if (adjacency[neighbor] == null) { adjacency[neighbor] = []; }

  if (!adjacency[parent].includes(neighbor)) { adjacency[parent].push(neighbor); }
  if (!adjacency[neighbor].includes(parent)) { adjacency[neighbor].push(parent); }
}

export const addEdges = () => {
  for (let i = 0; i < nodes.length; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;

    if (col < gridSize - 1 && Math.random() < .65) {
      addEdge(i, i + 1);
    }

    if (row < gridSize && Math.random() < .65) {
      addEdge(i, i + gridSize);
    }
  }

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    addAdjacency(edge.nodes[0], edge.nodes[1]);
  }
}

export let selectedEdges: number[][] = [];

export const findPath = (start: number, end: number): object => {
  selectedEdges = [];
  const predecessor: number[] = Array(nodes.length).fill(-1); // Array to store predecessors
  const visited: boolean[] = Array(nodes.length).fill(false);
  const queue: number[] = [start];

  while (queue.length > 0) {
    const u = queue.shift();

    if (u === end) {
      break;
    }

    if (adjacency[u] != null) {
      for (let v of adjacency[u]) {
        const edgeId = edges.findIndex(edge => {
          return edge.nodes[0] === u && edge.nodes[1] === v
            || edge.nodes[1] === u && edge.nodes[0] === v;
        });

        if (edgeId !== -1) {
          if (!visited[v]) {
            visited[v] = true;
            selectedEdges.push([u, v]);
            predecessor[v] = u;
            queue.push(v);
          }
        }
      }
    }
  }

  let currentNode = end;
  const path = [];

  while (currentNode !== start) {
    if (currentNode === -1) {
      return []; // No path found
    }

    const prevNode = predecessor[currentNode];
    path.unshift([prevNode, currentNode]); // Add the edge to the path
    currentNode = prevNode;
  }

  return path;
}