import graphData from './graph_data.json';

export type Node = {
    id: number,
    x: number,
    y: number,
    street_count: number,
}

export type Edge = {
    source: Node,
    target: Node,
    length: number,
    name: string,
    highway: string,
}

export const nodes: { [key: number]: Node } = {};
let minX, maxX, minY, maxY;
graphData.nodes.forEach((node, i) => {
    if (minX == null || node.x < minX) { minX = node.x; }
    if (maxX == null || node.x > maxX) { maxX = node.x; }
    if (minY == null || node.y < minY) { minY = node.y; }
    if (maxY == null || node.y > maxY) { maxY = node.y; }
});

graphData.nodes.forEach((node, i) => {
    const normalizedX = (node.x - minX) / (maxX - minX);
    const normalizedY = (node.y - minY) / (maxY - minY);

    nodes[node.id] = {
        id: node.id,
        x: Math.abs(normalizedX),
        y: Math.abs(normalizedY),
        street_count: node.street_count,
    };
});

export const edges: Edge[] = graphData.links.map(link => {
    return {
        source: nodes[link.source],
        target: nodes[link.target],
        length: link.length,
        name: link.name,
        highway: link.highway,
    };
});

const addAdjacency = (parent: number, neighbor: number) => {
    if (adjacency[parent] == null) { adjacency[parent] = []; }
    if (adjacency[neighbor] == null) { adjacency[neighbor] = []; }

    if (!adjacency[parent].includes(neighbor)) { adjacency[parent].push(neighbor); }
    if (!adjacency[neighbor].includes(parent)) { adjacency[neighbor].push(parent); }
}

export let adjacency: object = {};

for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    addAdjacency(edge.source.id, edge.target.id);
}
