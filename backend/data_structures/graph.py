import queue
import heapq
'''
questions:
are we still using dijkstra's algorithm??
recommendations on how to split up backend who work on what
'''
class Graph:
    def __init__(self):
        self._adjacency_list = {} #store nodes to all neighbors
        self._layers = {} #{[source_air],[node_a, node_b],[node_c, node_d],[destination]}
        self.dp_table = {} #{node: (minimum_cost_to_reach_node, parent_node),...}

    def add_vertex(self, node, cost):
        pass

    def dijkstra(self, start, end):
       dist = {node: float('inf') for node in self._adjacency_list}
       dist[start] = 0
       prev = {node: None for node in self._adjacency_list}
       pq = [(0, start)]

       while pq:
           current_dist, current_node = heapq.heappop(pq)


           if current_dist > dist[current_node]:
               continue

           for neighbor, weight in self._adjacency_list[current_node].items():
               new_distance = current_dist + weight['weight']

               if new_distance < dist[neighbor]:
                   dist[neighbor] = new_distance
                   prev[neighbor] = current_node
                   heapq.heappush(pq, (new_distance, neighbor))
       return dist

    def isConnected(self, node1, node2):
       visited = set()
       q = queue.Queue(maxsize=-1) #initializes size to infinity?

       visited.add(node1)
       q.put(node1)

       while not q.empty():
           u = q.queue[0]  #this is similar to peek
           q.get()  # popping q
           neighbors = self._adjacency_list.get(u, []) #this is a guess on how we are going to store adjacency nodes??
           for v in neighbors:
               if v not in visited:
                   visited.add(v)
                   q.put(v)
                   if v == node2: #found node2
                       return True
       return False #node2 was never found