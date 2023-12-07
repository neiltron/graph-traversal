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
graphData.nodes.forEach((node, i) => {
    nodes[node.id] = {
        id: node.id,
        x: ((Math.abs((Math.abs(node.x) - Math.abs(Math.floor(node.x)))) - .7) * 20) * 2000,
        y: ((Math.abs((Math.abs(node.y) - Math.abs(Math.floor(node.y)))) - .81) * 20) * -2200 + 2450,
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
