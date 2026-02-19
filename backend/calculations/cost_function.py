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

    def lat_long_to_radians(self, lat1, lon1, lat2, lon2):
        # Convert latitude and longitude from degrees to radians (assume in decimal degrees)
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

        return lat1, lon1, lat2, lon2

    def get_distance(self, lat1, lon1, lat2, lon2):

        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2) ** 2
        c = 2*math.asin(math.sqrt(a))

        # Radius of earth in kilometers
        r = 6371
        distance = c*r

        return distance
    
    def lat_long_to_cartesian():
    # pull lat_long

    # do math & make new vector (cartesian_src_dest)
    # return cartesian_src_dest


    def cartesian_to_lat_long():
	# pull cartesian

	# do math & make new vector (lat_long_src_dest)
    # return lat_long_src_dest


    def get_nodes_per_layer():

	# convert from spherical to cartesian, call spherical_to_cartesian()

	# num_of_nodes=4

	# dist_btw_nodes=5

	# dist_btw_layer=50

	# create a loop that will iterate from 0 to the number of layers-1

		# calculate orthogonal vector
		
		# find magnitude of layer vectors (multiply 2 x dist_btw_nodes)
		
		# create a loop that will iterate from 0 to num_of_nodes-1

			# add node on the line

			# add 

			# multiply the two calculated node values by -1

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
