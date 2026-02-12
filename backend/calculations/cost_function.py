from turtle import distance
from backend.data_structures.node import Node
import math

class cost:

    def __init__(self, src: Node, dest: Node):
        self.src = src
        self.dest = dest
        # Parameters for Boeing 737 model (uncomment)

        # self.k = 3.16 #C)2/kg fuel burned
        # self.fuel_mass_flow = #(kg/s)
        # self.specific_fuel_consumption = #(kg of fuel/thrust/second)
        # self.aircraft_weight = 
        # self.LD = #Lift-to-drag ratio at cruise

        # weather risk bound variables
        #self.wind = #(knots)
        #self.precipitation = #(inches)
        #self.lightning = #(miles)
        #self.time = #(hours)

    # Using the Haversine equation to calculate the distance between two points
    # Output: distance (in Km)
        
    def get_distance(self, lat1, lon1, lat2, lon2):
        import math
        # Convert latitude and longitude from degrees to radians (assume in decimal degrees)
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2) ** 2
        c = 2*math.asin(math.sqrt(a))

        # Radius of earth in kilometers
        r = 6371
        distance = c*r

        return distance

    # first calculate fuel mass, then calculate C02
    def get_carbon_emissions(self):
        pass 
    
    # Might use flight history for heatmap 
    # traffic 
    def get_air_traffic_desity(self):
        pass 


    
