from turtle import distance
from backend.data_structures.node import Node
import math
import numpy as np

class cost:

    def __init__(self, src: Node, dest: Node):
        self.src = src #in lat and long
        self.dest = dest #in lat and long
        self.total_distance = 0
        self.dist_btw_layers = 50
        
        # Parameters for Boeing 737 model (uncomment)
        #C)2/kg fuel burned

        # self.k = 3.16 
        # self.fuel_mass_flow = self.specific_fuel_consumption * self.aircraft_weight/self.LD #(kg/s)
        # self.specific_fuel_consumption = 1.734*10^-7 #(kg of fuel/thrust/second)
        # self.g= 9.81 #m/s^2
        # self.aircraft_mass_takeoff=79002 #kg
        # self.aircraft_mass_landing=66349 #kg
        # self.aircraft_weight = self.aircraft_mass_takeoff * self.aircraft_mass_landing* self.g * .5 #N
        # self.LD = 18.1 #Lift to drag ratio
        #weather risk bound variables
        # self.wind = #(knots)
        # self.precipitation = #(inches)
        # self.lightning = #(miles)
        # self.time = #(hours)
        # self.visibility = #(miles)


    def get_num_of_layers(self):

        self.total_distance = self.get_distance(self.src.getLatitude(), self.src.getLongitude(), 
                                                self.dest.getLatitude(), self.dest.getLongitude())
        
        return (self.total_distance / self.dist_btw_layers)


    # Using the Haversine equation to calculate the distance between two points
    # Output: distance (in Km)

    def lat_long_to_radians(self, lat, lon):
        # Convert latitude and longitude from degrees to radians (assume in decimal degrees)
        lat, lon = map(math.radians, [lat, lon])

        return lat, lon

    def get_distance(self, lat1, lon1, lat2, lon2):
        
        lat1, lon1 = self.lat_long_to_radians(lat1, lon1)
        lat2, lon2 = self.lat_long_to_radians(lat2, lon2)

        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2) ** 2
        c = 2*math.asin(math.sqrt(a))

        # Radius of earth in kilometers
        r = 6371
        distance = c*r

        return distance
    
    def lat_long_to_cartesian(self, lat, lon,r=6371):

        lat, lon = self.lat_long_to_radians(lat, lon)
        
        x1 = r * np.cos(lat) * np.cos(lon)
        y1 = r * np.cos(lat) * np.sin(lon)
        z1 = r * np.sin(lat)

        cartesian_coordinates = [x1, y1, z1]

        return cartesian_coordinates

    
    def cartesian_to_lat_long(self, x, y, z):
        # Calculate the radius
        r = np.sqrt(x**2 + y**2 + z**2)
        
        # Calculate latitude and longitude
        lat = np.arcsin(z / r)  # latitude in radians
        lon = np.arctan2(y, x)  # longitude in radians

        # Convert back to degrees
        lat_deg = np.degrees(lat)
        lon_deg = np.degrees(lon)

        return lat_deg, lon_deg
    


    def get_nodes_per_layer(self):

	# convert latitude longitude to cartesian

	# num_of_nodes=4

	# dist_btw_nodes=5

	# dist_btw_layer=50

	# create a loop that will iterate from 0 to the number of layers-1

        # flight_progress = dist_btw_layer * i

		# calculate orthogonal vector
		
		# find magnitude of layer vectors (multiply 2 x dist_btw_nodes)
		
		# create a loop that will iterate from 0 to num_of_layers-1

			# add node on the line (using flight_progress)

			# scale the vector by negative 5 and -10

            # convert back to lat and long (call cartesian_to_lat_long function)

			# add the four calculated node values for each layer to an array

			# add the new array to a node network

	

	# return node network


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
