from typing import Self

from backend.calculations.cost_function import get_nodes_per_layers

from backend.data_structures.node import Node

import numpy as np

class PathCost:
	def __init__(self, src: Node, dest: Node):
		self.restricted_zones = [
			{"type": "P-56A", "center": (38.8977, -77.0365), "radius_km": 3.011},
			{"type": "P-56B", "center": (38.9213, -77.0669), "radius_km": 0.805},
			{"type": "P-47",  "center": (35.3006, -101.6181), "radius_km": 5.922},
			{"type": "P-49",  "center": (31.5825, -97.5436), "radius_km": 3.704},
			{"type": "P-40",  "center": (39.6333, -77.4667), "radius_km": 5.556},
			{"type": "P-73",  "center": (38.7078, -77.0833), "radius_km": 0.805},
			{"type": "P-50",  "center": (30.7990, -81.5640), "radius_km": 3.704},
			{"type": "P-51",  "center": (47.7219, -122.7692), "radius_km": 6.737},
			{"type": "P-67",  "center": (43.3333, -70.0428), "radius_km": 1.609}
		]

	def add_restricted_zone(self, zone_dict):
		self.restricted_zones.append(zone_dict)

	def point_in_circle(self, lat, lon, center_lat, center_lon, radius_km):
		d = self.get_distance(lat, lon, center_lat, center_lon)
		return d <= radius_km

	def is_restricted(self, lat, lon):
		for zone in self.restricted_zones:
			c_lat, c_lon = zone["center"]
			if self.point_in_circle(lat, lon, c_lat, c_lon, zone["radius_km"]):
				return True
		return False

	def get_distance(self, lat1, lon1, lat2, lon2):
		from math import radians, cos, sin, asin, sqrt
		lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
		dlon = lon2 - lon1
		dlat = lat2 - lat1
		a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
		c = 2 * asin(sqrt(a))
		km = 6371 * c
		return km
	
	def check_network_restrictions(self, node_network):
		for layer in node_network:
			for (lat, lon) in layer:
				if self.is_restricted(lat, lon):
					print("Restricted zone violation detected")

pc = PathCost(Node(0, 0), Node(0, 0))
network = get_nodes_per_layers(pc, 40.0000, -75.0000, 38.8977, -77.0365, 5)
pc.check_network_restrictions(network)