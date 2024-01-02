import networkx as nx
import matplotlib.pyplot as plt

# Step 1: Load Nodes
def load_nodes(file_path):
    nodes = {}
    with open(file_path, 'r', encoding='utf-8') as file:
        for line in file:
            parts = line.strip().split(',')
            if len(parts) == 2:
                node_id, name = parts
                nodes[node_id] = name
    return nodes

# Step 2: Load Edges
def load_edges(file_path):
    edges = []
    with open(file_path, 'r', encoding='utf-8') as file:
        for line in file:
            parts = line.strip().split()
            if len(parts) == 2:
                edges.append(tuple(parts))
    return edges

# Step 3: Create and Plot Graph
import numpy as np

def plot_graph(nodes, edges):
    G = nx.Graph()
    for node_id, name in nodes.items():
        G.add_node(node_id, label=name.replace("$", ""))
    G.add_edges_from(edges)

    degrees = dict(G.degree())
    node_size = [v * 20 for v in degrees.values()]

    # Initial layout
    pos = nx.spring_layout(G, k=0.15)

    # Custom adjustment for node positions
    for _ in range(50):  # Number of iterations
        for i, node1 in enumerate(G.nodes()):
            for node2 in G.nodes():
                if node1 != node2:
                    delta = np.array(pos[node1]) - np.array(pos[node2])
                    dist = np.linalg.norm(delta)
                    size1, size2 = node_size[i], node_size[list(G.nodes()).index(node2)]
                    desired_dist = (size1 + size2) / 2 * 0.1  # adjust the 0.1 factor as needed

                    if dist < desired_dist:
                        # Push nodes apart
                        shift = delta / dist * (desired_dist - dist)
                        pos[node1] += shift
                        pos[node2] -= shift

    labels = nx.get_node_attributes(G, 'label')

    plt.figure(figsize=(12, 12))
    nx.draw(G, pos, node_size=node_size, alpha=0.5, node_color="blue", with_labels=False)
    nx.draw_networkx_labels(G, pos, labels, font_size=6)
    plt.title("Knowledge Graph")
    plt.show()

# Usage
nodes_file_path = './enwiki-2013-names-trimmed.csv'
edges_file_path = './enwiki-2013-trimmed.txt'

nodes = load_nodes(nodes_file_path)
edges = load_edges(edges_file_path)
plot_graph(nodes, edges)
