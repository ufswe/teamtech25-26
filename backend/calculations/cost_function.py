from backend.data_structures.node import Node

class cost:

    def __init__(self, src: Node, dest: Node):
        self.src = src
        self.dest = dest
        # Paramters for Boeing 737 model (uncomment)

        # self.k = 3.16 #C)2/kg fuel burned
        # self.fuel_mass_flow = #(kg/s)
        # self.specific_fuel_consumption = #(kg of fuel/thrust/second)
        # self.aircraft_weight = 
        # self.LD = #Lift-to-drag ratio at cruise 

    # Using the Haversine equation to calcuate the distance between two points
    # Output: distance (in Km)
    def get_distance(self):
        pass

    # first calcaute fuel mass, then calculate C02
    def get_carbon_emissions(self):
        pass 
    
    # Might use flight history for heatmap 
    # traffic 
    def get_air_traffic_desity(self):
        pass 


    
