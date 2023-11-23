const graph = [];

type edge = { id: number, nodes: number[] };
type node = { id: number, x: number, y: number };

type edges = edge[];
type nodes = node[];

export const edges: edge[] = [];
export const nodes: node[] = [];

let nextNodeId: number = 0;
let nextEdgeId: number = 0;

const addNode = (u: node) => {
  nodes.push(u);
}

const addEdge = (u: number, v: number) => {
  const edge: edge = {
    id: nextEdgeId,
    nodes: [u, v],
  };

  edges.push(edge);
  nextEdgeId += 1;
}

for (let i = 0; i < 10; i++) {
  addNode({
    id: nextNodeId,
    x: Math.random(),
    y: Math.random()
  });
  nextNodeId += 1;
}

for (let i = 0; i < 10; i++) {
  addEdge(
    Math.floor(Math.random() * nodes.length),
    Math.floor(Math.random() * nodes.length)
  );
}

console.log(nodes, edges);