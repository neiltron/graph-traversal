import osmnx
import json
import networkx as nx
from shapely.geometry import LineString

def convert_linestring(obj):
    """Convert LineString objects to a list of coordinates."""
    if isinstance(obj, LineString):
        return list(obj.coords)
    return obj

location = "barcelona, spain"
graph = osmnx.graph_from_address(location)
data = nx.node_link_data(graph)

# convert LineString objects to a list of coordinates
class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, LineString):
            return convert_linestring(obj)
        return json.JSONEncoder.default(self, obj)

with open('graph_data.json', 'w') as f:
    json.dump(data, f, cls=CustomEncoder)
