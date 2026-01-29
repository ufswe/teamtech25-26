class Graph:
    def __init__(self):
        self._adjacency_list = {}

    def add_vertex(self, node, edges):
        self._adjacency_list[node] = edges

    def dijkstra(self, start_node, end_node):
        pass