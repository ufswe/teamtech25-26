from turtle import distance
from backend.data_structures.node import Node
import math

class cost:

    def __init__(self, src: Node, dest: Node):
        self.src = src
        self.dest = dest
        self.total_distance = 0
        self.dist_btw_layers = 50
        
        # Parameters for Boeing 737 model (uncomment)

        # self.k = 3.16 #C)2/kg fuel burned
        # self.fuel_mass_flow =  (kg/s)
        # self.specific_fuel_consumption = 1.734*10^-7 #(kg of fuel/thrust/second)
        #self.g=9.81 #m/s^2
        # self.aircraft_mass_takeoff=79002 #kg
        #self.aircraft_mass_landing=66349 #kg
        # self.aircraft_weight = self.aircraft_mass_takeoff * self.aircraft_mass_landing * self.g * .5 #N

        # weather risk bound variables
        #self.wind = #(knots)
        #self.precipitation = #(inches)
        #self.lightning = #(miles)
        #self.time = #(hours)
        #self.visibility = #(miles)


    def get_num_of_layers(self):

        self.total_distance = self.get_distance(self.src.getLatitude(), self.src.getLongitude(), 
                                                self.dest.getLatitude(), self.dest.getLongitude())
        
        return (self.total_distance / self.dist_btw_layers)



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


    def check_warning_status(self, wind, precipitation, lightning, time) -> bool:  
        # tornado warning
        if wind >= 34:
            Warning = True
        # thunderstorm warning
        elif precipitation >= 1 and wind >= 50:
            Warning = True
        #winter storm warning
        elif  (precipitation >= 6 and time <= 12) or (precipitation >= 9 and time <= 24):
            Warning = True
        # blizzard warning
        elif wind >= 30 and precipitation >= 6:
            Warning = True
        # high wind warning
        elif (wind >= 35 and time >= 1) or (wind >= 50):
            Warning = True
        #airport weather warning
        elif lightning >= 5 and wind >= 20:
            Warning = True
        #general warning 
        elif visibility <= 3:
            Warning = True
        else:
            Warning = False

        return Warning
