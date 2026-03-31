class Node:
   # Group 1 work on developing class


   # Public
   def __init__(self, latitude, longitude, airport, isOpen):
       self.latitude = latitude  # latitude coordinate
       self.longitude = longitude  # longitude coordinate
       self.airport = airport  # boolean that indicates whether node is an airport or not
       self.isOpen = isOpen  # boolean that indicates whether node is available to fly or not
       self.radius = 5  # 5 mile radius around the center point


   def setLatitude(self, latitude):
       self.latitude = latitude


   def setLongitude(self, longitude):
       self.longitude = longitude


   def isAirport(self):
       return self.airport


   def getLatitude(self):
       return self.latitude


   def getLongitude(self):
       return self.longitude


   def __hash__(self):
       return hash((self.latitude, self.longitude))


   def __eq__(self, other):
       return (self.latitude, self.longitude) == (other.latitude, other.longitude)




class Graph:
   def __init__(self):
       self._adjacency_list = {}  # store nodes to all neighbors
       self._layers = {}  # {[source_air],[node_a, node_b],[node_c, node_d],[destination]}
       self._dp_table = {}  # {node: (minimum_cost_to_reach_node, parent_node),...}


   def add_vertex(self, node, cost):
       pass


   def getCost(self, node, neighbor):
       costs = {
           ("Start", "A"): 2,
           ("Start", "B"): 5,
           ("A", "C"): 2,
           ("B", "D"): 1,
           ("C", "End"): 3,
           ("D", "End"): 10
       }
       return 1


   # when creating the new algorithm we can use this function to increment by 4's
   def min_cost_path(self, start, end):
       path = []
       self._dp_table = {}  # reset each time


       if not end.airport:
           return None


       # Initialize all nodes in all layers
       for i in range(len(self._layers)):
           for node in self._layers[i]:
               if node.isOpen:
                   self._dp_table[node] = (float('inf'), None)


       # Start node cost = 0
       self._dp_table[start] = (0, None)


       # DP over layers (DAG-style)
       for i in range(len(self._layers)):
           for node in self._layers[i]:
               if not node.isOpen:
                   continue


               # If node was never reached, skip it
               if self._dp_table[node][0] == float('inf'):
                   continue


               for neighbor in self._adjacency_list.get(node, []):
                   if not neighbor.isOpen:
                       continue


                   cost_to_neighbor = (
                           self._dp_table[node][0] + self.getCost(node, neighbor)
                   )


                   if cost_to_neighbor < self._dp_table[neighbor][0]:
                       self._dp_table[neighbor] = (cost_to_neighbor, node)


       # If end is unreachable
       if self._dp_table[end][0] == float('inf'):
           return (float('inf'), [])


       # Reconstruct path
       current = end
       while current is not None:
           path.append(current)
           current = self._dp_table[current][1]


       path.reverse()


       return (self._dp_table[end][0], path)
def main():
   graph = Graph()
   # Create nodes
   start = Node(0, 0, True, True)
   a = Node(1, 1, False, True)
   b = Node(2, 2, False, True)
   c = Node(3, 3, False, True)
   d = Node(4, 4, False, True)
   end = Node(5, 5, True, True)


   # Add vertices and edges to the graph
   # graph.add_vertex(start, 0)
   # graph.add_vertex(a, 2)
   # graph.add_vertex(b, 5)
   # graph.add_vertex(c, 2)
   # graph.add_vertex(d, 1)
   # graph.add_vertex(end, 0)


   # Define adjacency list
   graph._adjacency_list[start] = [a, b]
   graph._adjacency_list[a] = [c]
   graph._adjacency_list[b] = [d]
   graph._adjacency_list[c] = [end]
   graph._adjacency_list[d] = [end]


   # Define layers
   graph._layers[0] = [start]
   graph._layers[1] = [a, b]
   graph._layers[2] = [c, d]
   graph._layers[3] = [end]


   # Find minimum cost path from start to end
   min_cost, path = graph.min_cost_path(start, end)
   print(f"Minimum cost: {min_cost}")
   #print(f"Path: {path}")
   print("Path:", " -> ".join([f"({node.latitude}, {node.longitude})" for node in path]))


main()


