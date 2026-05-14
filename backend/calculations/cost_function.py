from tkinter import NO
from turtle import distance
from data_structures.node import Node
import math
import numpy as np
from collections import defaultdict
import requests
from pathlib import Path
from typing import Optional, Sequence, Any
"""
To run, call this from teamtech25-26 root folder
use: python -m backend.calculations.cost_function

"""
class Cost:

    def __init__(self, src: Node, dest: Node, WD=0.2, WT=0.2, WC=0.2, WE=0.2, WW=0.2):
        self.src = src #in lat and long
        self.dest = dest #in lat and long
        self.total_distance = 0
        self.dist_btw_layers = 200
        
        # Parameters for Boeing 737 model (uncomment)
        #C)2/kg fuel burned
        self.k = 3.16 
        self.g = 9.81 #m/s^2
        self.LD = 18.1 #Lift to drag ratio
        self.speed = 850 #km/h (cruising speed)


        self.specific_fuel_consumption = 1.734*10E-7 #(kg of fuel/thrust/second)
        self.aircraft_mass_takeoff = 79002 #kg
        self.aircraft_mass_landing = 66349 #kg
        self.g = 9.81 #m/s^2
        self.aircraft_weight = self.aircraft_mass_takeoff * self.aircraft_mass_landing * self.g *.5 #N
        self.radius=50*.539957 #km to nautical miles, radius of area around each node to check for air traffic density
        
        self._traffic_cache = {} 
        self._edge_cost_cache = {}
        self._weather_prediction_cache = {}
        self._weather_features_cache = {}

        self._weather_grid_deg = 0.67
        
        # self.fuel_mass_flow = self.specific_fuel_consumption * self.aircraft_weight/self.LD #(kg/s)

        # weights
        self.WD = WD
        self.WT = WT
        self.WC = WC
        self.WE = WE
        self.WW = WW

        #weather risk bound variables
        # self.wind = #(knots)
        # self.precipitation = #(inches)
        # self.lightning = #(miles)
        # self.time = #(hours)
        # self.visibility = #(miles)
        # self.altitude = #(feet)

        # Single sklearn Pipeline saved from the notebook.
        # Expected to be: (scaler -> KNN) so we can call `.predict(X)` or `.predict_proba(X)`.
        self._weather_knn_pipeline: Any = None
        self._models_dir = Path(__file__).resolve().parent / "models"
        self._weather_knn_path = self._models_dir / "weather_knn.joblib"

    def _snap_to_grid(self, lat, lon):
            """Round lat/lon to nearest grid cell for cache key."""
            g = self._weather_grid_deg
            return (round(round(lat / g) * g, 4), round(round(lon / g) * g, 4))
    
    def fetch_weather_features(self, lat, lon) -> Optional[Sequence[float]]:
        try:
            return [0.0, 0.0, 0.0, 1.0, 10.0]

        except Exception as e:
            print(f"Weather fetch failed for ({lat:.2f}, {lon:.2f}): {e}")
            return None
        
    def get_weather_features_cached(self, lat, lon) -> Optional[Sequence[float]]:
        key = self._snap_to_grid(lat, lon)
        if key not in self._weather_features_cache:
            self._weather_features_cache[key] = self.fetch_weather_features(lat, lon)
            print(f"Weather cache MISS → fetched for grid {key}")
        else:
            print(f"Weather cache HIT  → grid {key}")
        return self._weather_features_cache[key]

    def get_num_of_layers(self, lat1, long1, lat2, long2):

        self.total_distance = self.get_distance(lat1, long1, 
                                                lat2, long2)
        
        num_of_layers = (self.total_distance / self.dist_btw_layers)

        return num_of_layers

    def get_nodes_per_layer(self, lat1, lon1, lat2, lon2, num_of_layers):

        # convert latitude and longitude to cartesian coordinates

        x1, y1, z1 = self.lat_long_to_cartesian(lat1, lon1)
        x2, y2, z2 = self.lat_long_to_cartesian(lat2, lon2)

        # lat1, lon1, lat2, lon2 = self.lat_long_to_cartesian(lat1, lon1),  self.lat_long_to_cartesian(lat2, lon2)

        # create vector from source to destination

        src = np.array([x1, y1, z1])
        dest = np.array([x2, y2, z2])
        print(f"src: {src}")
        print(f"dest: {dest}")
        

        src_dest_vector = dest - src
        # print(f"src_dest_vector: {src_dest_vector}")

        unit_vector = src_dest_vector / np.linalg.norm(src_dest_vector)

        # calculating the perpendicular vector 

        up = np.array([0, 0, 1]) # using this for cross product, just points up 
        perp_vector = np.cross(unit_vector, up)
        perp_vector = perp_vector / np.linalg.norm(perp_vector) # normalize vector to become 1

        num_of_nodes = 4

        # dist_btw_nodes=5
        dist_btw_nodes = 20
        dist_btw_layer = 50

        node_network = []

        # create a loop that will iterate from 0 to the number of layers-1
        # should iterate from 1, because layer 0 is the src point

        for i in range (1, num_of_layers):
            flight_progress = unit_vector * dist_btw_layer * i
            # print(f"Progress: {flight_progress} i: {i} unit_vector: {unit_vector}")
            layer_center = src + (flight_progress) # basically moves the central point by the distance along the unit_distance vector


            
            # # calculate vector perpendicular to src_dest_vector and scale by dist_btw_nodes
            # layer_vector = np.array([-(flight_progress[1]), (flight_progress[0])])
            
            # calculate magnitude of layer vectors (multiply 2 x dist_btw_nodes)
            
            # create a loop that will iterate from 0 to num_of_layers-1

            layer_nodes = []
            for j in range(-2, num_of_nodes-1):
                    
                node_cart = layer_center + perp_vector * dist_btw_nodes * j #scaling up and down from center

                #print(node_cart)

                # convert back to lat and long (call cartesian_to_lat_long function)
                lat, long = self.cartesian_to_lat_long(node_cart[0], node_cart[1], node_cart[2])

                #print(lat, long)
                    
                # add the four calculated node values for each layer to an array
                newNode = Node(lat, long, False, True); 
                
                layer_nodes.append(newNode)
                
                    
                # add the new array to a node network

            node_network.append(layer_nodes)

            


        return [[Node(lat1, lon1, True, True)],
        node_network,
        [Node(lat2, lon2, True, True)]
        ]


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
        fuel_mass_flow = self.specific_fuel_consumption * (self.aircraft_weight/ self.LD)

        fuel_mass_entire_trip = fuel_mass_flow * (self.time_of_flight(self.get_distance(self.src.getLatitude(), self.src.getLongitude(), self.dest.getLatitude(), self.dest.getLongitude())) * 3600)

        CO2 = self.k * fuel_mass_entire_trip

        return CO2
 
    
    # Might use flight history for heatmap 
    # traffic
    def fetch_aircraft_near_point(self, lat: float, lon:float, timeout_s: int=10) -> list:
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            raise ValueError("Invalid latitude or longitude")
        url= f"https://api.adsb.lol/v2/point/{lat}/{lon}/{self.radius}"
        r= requests.get(url, timeout=timeout_s)
        r.raise_for_status()
        data = r.json()
        return data.get("ac", [])
    
    def get_air_traffic_density(self, lat: float, lon: float, cell_degree: float = 0.25) -> dict:
        aircraft_list = self.fetch_aircraft_near_point(lat, lon) 
        bins = defaultdict(int)
        for ac in aircraft_list:
            ac_lat = ac.get("lat")
            ac_lon = ac.get("lon")
            hex_id = ac.get("hex")
            if ac_lat is None or ac_lon is None or hex_id is None:
                continue
            cell_lat = math.floor(ac_lat / cell_degree) * cell_degree
            cell_lon = math.floor(ac_lon / cell_degree) * cell_degree
            bins[(round(cell_lat, 5), round(cell_lon, 5))] += 1
        return dict(bins)
        
    # def get_collision_density_score(self, cell_degree: float=0.25) -> float:
    #     bins=self.get_air_traffic_density(cell_degree)
    #     area= math.pi*(self.radius**2)
    #     density = sum(bins.values()) / area if area > 0 else 0.0
    #     critical_density = 0.04
    #     collision_density_score=min(1.0,(density/critical_density)**2)
    #     return float(collision_density_score)
 
    def get_collision_density_score(self, lat: float, lon: float, cell_degree: float = 0.25) -> float:
        # coarse cache key — reuses result within ~55km, avoids redundant API calls
        key = (round(lat / 0.5) * 0.5, round(lon / 0.5) * 0.5)

        if key not in self._traffic_cache:
            try:
                bins = self.get_air_traffic_density(lat, lon, cell_degree)
                area = math.pi * (self.radius ** 2)
                density = sum(bins.values()) / area if area > 0 else 0.0
                critical_density = 0.04
                self._traffic_cache[key] = min(1.0, (density / critical_density) ** 2)
            except Exception as e:
                print(f"Traffic fetch failed for ({lat:.2f}, {lon:.2f}): {e}")
                self._traffic_cache[key] = 0.0  # fail safe

        return self._traffic_cache[key]


    def check_warning_status(self, wind, precipitation, lightning, time, visibility: Optional[float] = None) -> bool:  
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
        elif visibility is not None and visibility <= 3:
            Warning = True
        else:
            Warning = False

        return Warning

    def _load_weather_knn(self):
        # Loads in the knn pipeline saved from notebook 

        if self._weather_knn_pipeline is not None:
            return self._weather_knn_pipeline

        if not self._weather_knn_path.is_file():
            return None

        try:
            import joblib  # type: ignore
        except Exception:
            return None

        self._weather_knn_pipeline = joblib.load(self._weather_knn_path)
        return self._weather_knn_pipeline

    # def predict_weather_risk(self, features: Sequence[float]) -> float:
    #     # returns either the probailtiy of safe/unsafe weather but if not, returns the predicted class. 
    #     pipeline = self._load_weather_knn()
    #     if pipeline is None:
    #         return 0.0

    #     X = np.asarray(features, dtype=float).reshape(1, -1)

    #     if hasattr(pipeline, "predict_proba"):
    #         proba = pipeline.predict_proba(X)
    #         return float(proba[0][1])

    #     pred = pipeline.predict(X)
    #     return float(pred[0])
    

    def predict_weather_risk(self, features):
        key = tuple(round(float(x), 2) for x in features)

        if key in self._weather_prediction_cache:
            return self._weather_prediction_cache[key]

        pipeline = self._load_weather_knn()

        if pipeline is None:
            return 0.0

        X = np.asarray(features, dtype=float).reshape(1, -1)

        if hasattr(pipeline, "predict_proba"):
            result = float(pipeline.predict_proba(X)[0][1])
        else:
            result = float(pipeline.predict(X)[0])

        self._weather_prediction_cache[key] = result
        return result
    
    def time_of_flight(self, distance):

        # print(distance)

        time = ( distance / self.speed) /3600 #km/s

        return time

    # returns overall cost 

    # Weather passed in from backend API fetch

    def get_total_cost(self, weather_features: Optional[Sequence[float]] = None):
        # Cache by node pair
        src_key = (self.src.getLatitude(), self.src.getLongitude())
        dest_key = (self.dest.getLatitude(), self.dest.getLongitude())
        # cache_key = (src_key, dest_key)

        cache_key = (
            round(src_key[0], 4),
            round(src_key[1], 4),
            round(dest_key[0], 4),
            round(dest_key[1], 4),
        )
        if cache_key in self._edge_cost_cache:
            return self._edge_cost_cache[cache_key]
        
        # values
        distance =  self.get_distance(self.src.getLatitude(), self.src.getLongitude(), self.dest.getLatitude(), self.dest.getLongitude())
        time = self.time_of_flight(distance) # lower the better 

        mid_lat = (self.src.getLatitude() + self.dest.getLatitude()) / 2
        mid_lon = (self.src.getLongitude() + self.dest.getLongitude()) / 2
        collision_density = self.get_collision_density_score(mid_lat, mid_lon)

        carbon_emissions = self.get_carbon_emissions() # lower the better

        prediction = 0.0
        if weather_features is not None:
            prediction = self.predict_weather_risk(weather_features) ## if using proba, will result in score 0-1, if not then will return only 0/1

        # normalize to same scale
        norm_distance = distance / 15000
        norm_time = time / 20
        norm_carbon = carbon_emissions / 500000

        result = (self.WD * norm_distance + 
                  self.WT * norm_time  + 
                  self.WC * collision_density + 
                  self.WE * norm_carbon + 
                  self.WW * prediction)
        
        self._edge_cost_cache[cache_key] = result

        return result





# For testing------Ignore

# cost = Cost(Node(self, latitude, longitude, airport, isOpen))
# cost = Cost(Node(27.3, -82.55, True, False), Node(27.4, -82.386, True, False))
# print(cost.get_total_cost())

# num_of_layers = (int) (cost.get_num_of_layers(27.3, -82.55, 33.75,-85.386))

# node_network = cost.get_nodes_per_layer(
#    27.3, -82.55,
#    33.75, -85.386, num_of_layers)

# print(node_network)



