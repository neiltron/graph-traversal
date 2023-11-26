const graph = [];

export type edge = { id: number, nodes: number[], distance: number };
export type node = { id: number, x: number, y: number };

export let edges: edge[] = [];
export let nodes: node[] = [];
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
    distance: Math.sqrt(Math.pow(nodes[u].x - nodes[v].x, 2) + Math.pow(nodes[u].y - nodes[v].y, 2)),
  };

  edges.push(edge);
  nextEdgeId += 1;
}

// x: Math.floor(i % 4) * 250 + 125,
// y: Math.floor(i / 4) * 175 + 125,

export const addEdges = () => {
  for (let i = 0; i < nodes.length; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;

    if (col < 3 && Math.random() < .75) {
      addEdge(i, i + 1);
    }

    if (row < 4 && Math.random() < .75) {
      addEdge(i, i + 4);
    }
  }
}

export let selectedEdges: number[][] = [];

export const findPath = (start: number, end: number) => {
  selectedEdges = [];

  function dfs(u: number, visited: boolean[] = []) {
    if (visited[u] === true) {
      console.log('visited')
      return 'visited';
    }



    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];

      if (edge.nodes[0] === u && visited[edge.nodes[1]] !== true) {
        visited[u] = true;
        selectedEdges.push([edge.nodes[0], edge.nodes[1]]);

        if (edge.nodes[1] === end || edge.nodes[0] === end) {
          return 'end';
        }

        return dfs(edge.nodes[1], visited);
      } else if (visited[edge.nodes[0]] !== true && edge.nodes[1] === u) {
        selectedEdges.push([edge.nodes[1], edge.nodes[0]]);

        if (edge.nodes[1] === end || edge.nodes[0] === end) {
          return 'end';
        }

        return dfs(edge.nodes[0], visited);
      }
    }
  }

  return dfs(start);
}

console.log(nodes, edges);