from os import path
import queue
import heapq

from calculations.cost_function import Cost


class Graph:
    def __init__(self):
        self._adjacency_list = {} #store nodes to all neighbors
        self._dp_table = {} #{node: (minimum_cost_to_reach_node, parent_node),...}
        self._layers = [] #list of lists of nodes, each list is a layer of nodes

    def add_vertex(self, node, cost):
        pass

    def initialize_layers(self, layers):
        self._layers = []
        self._layers.append(layers[0])
        for layer in layers[1]:
            self._layers.append(layer)
        self._layers.append(layers[2])

    def min_cost_path(self, start, end):
       path = []
       self._dp_table = {} 
       if not end.airport:
           return None
       for i in range(len(self._layers)):
          for node in self._layers[i]:
              if node.isOpen:
                  self._dp_table[node] = (float('inf'), None)

       self._dp_table[start] = (0, None)

       for i in range(len(self._layers)):
           for node in self._layers[i]:
               if not node.isOpen: 
                   continue
               if self._dp_table[node][0] == float('inf'):
                   continue
               
               for neighbor in self._adjacency_list.get(node, []):
                    if not neighbor.isOpen:
                       continue
                    cost_obj = Cost(node,neighbor)
                    cost_to_neighbor = cost_obj.get_total_cost() + self._dp_table[node][0]
                    if cost_to_neighbor < self._dp_table[neighbor][0]:
                       self._dp_table[neighbor] = (cost_to_neighbor, node)
                    
       if self._dp_table[end][0] == float('inf'):
           return (float('inf'), [])
       
       current = end
       while current is not None:
            path.append(current)
            current = self._dp_table[current][1]
       path.reverse()

       return (self._dp_table[end][0], path)
       
    #    if end.airport == True: ##will need to change this when editing
        #    self._dp_table[start] = (0, None)  #node -> (cost to reach node, parent node)
        #    for i in range(0, len(self._layers)):
        #        for node in self._layers[i]:
        #                if node.isOpen == False:
        #                    continue
        #                #will only do this next code if its open/no plane is there   
        #                self._dp_table[node] = (float('inf'), None)  #Initialize cost to reach node as infinity
        #                for neighbor in self._adjacency_list.get(node, []):
        #                    if neighbor in self._dp_table:
        #                        #getCost function from calculations
        #                        cost1 = cost_function.cost(node,neighbor)
        #                        cost_to_neighbor = cost1.get_total_cost() + self._dp_table[node][0] #cost to reach node + cost to reach neighbor from node
        #                    if cost_to_neighbor < self._dp_table[neighbor][0]:
        #                        self._dp_table[neighbor] = (cost_to_neighbor, node)
        #                    else: #maybe?
        #                        self._dp_table[neighbor] = (cost1.get_total_cost() + self._dp_table[node][0], node) #added this line check if its right
        #                    #if its not in the self self.dp_table the cost hasn't been calculated so add it to the dp table as a new neighbor
          
        #    source = self.dp_table[end][1]
        #    while source is not None:
        #        path.append(source)
        #        source = self._dp_table[source][1]
        #    path.reverse()
        #    path.append(end)
        #    return (self._dp_table[end][0], path) #return the minimum cost to reach the end node


    def location(self, nodes):
        return [(node.getLatitude(), node.getLongitude()) for node in nodes]

    def build_adjacency_list(self):
        # for i in range(len(self._layers) - 1):
        #     current_layer = self._layers[i]
        #     if len(current_layer) == 1:
        #         continue
        #     next_layer = self._layers[i + 1]

        #     for node in current_layer:
        #         self._adjacency_list[node] = []
        #         for next_node in next_layer:
        #             self._adjacency_list[node].append(next_node)
        
        # return self._adjacency_list
        for i in range(len(self._layers) - 1):
            current_layer = self._layers[i]
            next_layer = self._layers[i + 1]

            for node in current_layer:
                self._adjacency_list[node] = []
                for next_node in next_layer:
                    self._adjacency_list[node].append(next_node)
    
        return self._adjacency_list

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
