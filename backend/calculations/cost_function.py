from turtle import distance
from ..data_structures.node import Node
import math
import numpy as np
from collections import defaultdict
"""
To run, call this from teamtech25-26 root folder
use: python -m backend.calculations.cost_function

"""
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
        # self.altitude = #(feet)

    def get_num_of_layers(self):

        self.total_distance = self.get_distance(self.src.getLatitude(), self.src.getLongitude(), 
                                                self.dest.getLatitude(), self.dest.getLongitude())
        
        num_of_layers = (self.total_distance / self.dist_btw_layers)

        return num_of_layers

    def get_nodes_per_layer(self, lat1, lon1, lat2, lon2, num_of_layers):

        # convert latitude longitude to cartesian

        x1, y1, z1 = self.lat_long_to_cartesian(lat1, lon1)
        x2, y2, z2 = self.lat_long_to_cartesian(lat2, lon2)

       # lat1, lon1, lat2, lon2 = self.lat_long_to_cartesian(lat1, lon1),  self.lat_long_to_cartesian(lat2, lon2)

        #create vector from source to destination
        src = np.array([x1, y1, z1])
        dest = np.array([x2, y2, z2])

        src_dest_vector = dest - src

        unit_vector = src_dest_vector / np.linalg.norm(src_dest_vector)

        # calculating the perpecducular vector 

        up = np.array([0, 0, 1]) # just using this for cross porduct, just points up 
        perp_vector = np.cross(unit_vector, up)
        perp_vector = perp_vector / np.linalg.norm(perp_vector) # normalinze vector to become 1

    
        # num_of_nodes=4
        num_of_nodes = 4

        # dist_btw_nodes=5
        dist_btw_nodes = 5

        # dist_btw_layer=50
        dist_btw_layer = 50

        # node_array = np.array([])

        node_network = []

        # create a loop that will iterate from 0 to the number of layers-1
        # shoudl iterate from 1, because layer 0 is the src point

        for i in range (1, num_of_layers):
            flight_progress = unit_vector * dist_btw_layer * i
            layer_center = src + (flight_progress) # basically moving the central point by the distance along the untit_distance vector
            
            # # calculate vector perpendicular to src_dest_vector and scale by dist_btw_nodes
            # layer_vector = np.array([-(flight_progress[1]), (flight_progress[0])])
            
            # calculate magnitude of layer vectors (multiply 2 x dist_btw_nodes)
            
            # create a loop that will iterate from 0 to num_of_layers-1

            layer_nodes = []
            for j in range(-2, num_of_nodes-1):
                    
                node_cart = layer_center + perp_vector * dist_btw_nodes * j #scaling up and down from cetner
                
                # convert back to lat and long (call cartesian_to_lat_long function)
                lat, long = self.cartesian_to_lat_long(node_cart[0], node_cart[1], node_cart[2])
                    
                # add the four calculated node values for each layer to an array
                layer_nodes.append((lat, long))
                    
                # add the new array to a node network
            node_network.append(layer_nodes)


        return node_network

    # helper functions 
    def lat_long_to_radians(self, lat, lon):
        # Convert latitude and longitude from degrees to radians (assume in decimal degrees)
        lat, lon = map(math.radians, [lat, lon])

        return lat, lon
    
    def lat_long_to_cartesian(self, lat, lon, r=6371):

        lat, lon = self.lat_long_to_radians(lat, lon)
        
        x = r * np.cos(lat) * np.cos(lon)
        y = r * np.cos(lat) * np.sin(lon)
        z = r * np.sin(lat)

        cartesian_coordinates = [x, y, z]

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
    

    # Cost function calcs

    # Using the Haversine equation to calculate the distance between two points
    # Output: distance (in Km)
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
    
    # first calculate fuel mass, then calculate C02
    def get_carbon_emissions(self):
        pass 
    
    # Might use flight history for heatmap 
    # traffic
    def fetch_aircraft_near_point(self, lat: float, lon:float, radius_nm: int=100, timeout_s: int=10) -> list:
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            raise ValueError("Invalid latitude or longitude")
        if not (0 < radius_nm <= 250):
            raise ValueError("Radius must be between 1 and 250 nautical miles")
        
        url= f"https://api.adsb.lol/v2/point/{lat}/{lon}/{radius_nm}"
        r= requests.get(url, timeout=timeout_s)
        r.raise_for_status()
        data = r.json()
        return data.get("ac", [])
    
    def get_air_traffic_density(self, radius_nm: int=100, cell_degree: float=0.25) -> dict:
        src_lat=self.src.getLatitude()
        src_lon=self.src.getLongitude()
        aircraft_list = self.fetch_aircraft_near_point(src_lat, src_lon, radius_nm)
        bins=defaultdict(int)
        for ac in aircraft_list:
            lat=ac.get("lat")
            lon=ac.get("lon")
            hex_id=ac.get("hex")
            if lat is None or lon is None or hex_id is None:
                continue
            cell_lat=math.floor(lat/cell_degree)*cell_degree
            cell_lon=math.floor(lon/cell_degree)*cell_degree
            bins[(round(cell_lat, 5), round(cell_lon, 5))]+=1

        return dict(bins)
    def get_collision_density_score(self, radius_nm: int=100, cell_degree: float=0.25) -> dict:
        bins=self.get_air_traffic_density(radius_nm, cell_degree)
        return sum(bins.values()) 
    


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
    
    def time_of_flight(self,distance):
        time = (distance/self.speed)/3600 #km/s
        return time

    # returns overall cost 
    def get_total_cost(self):
        #Placeholder for now 
        distance = 0 # lower the better
        time = 0 # lower the better 
        collision_density = self.get_collision_density_score()
        carbon_emissions = 0

        w1 = 0.25
        w2 = 0.25 
        w3 = 0.35 
        w4 = 0.25 

        return (w1 * distance + w2 * time + w3 * collision_density + w4 * carbon_emissions)





# For testing------Ignore
c = cost(None, None)

layers = 2  

node_network = c.get_nodes_per_layer(
    29.687330584,-82.269665588,
    33.942791, -118.410042,
    layers
)

print(node_network)



