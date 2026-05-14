from flask import Flask, jsonify, request
from flask_cors import CORS

import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry
from calculations.cost_function import Cost
from data_structures.graph import Graph
from data_structures.node import Node

app = Flask(__name__)
CORS(app)

@app.route('/api/optimal-path', methods=['POST'])
@app.route('/api/optimal-path', methods=['POST'])
def get_optimal_path():
    data = request.json
    src_lat = data.get("src_lat")
    src_long = data.get("src_long")
    dest_lat = data.get("dest_lat")
    dest_long = data.get("dest_long")
    WT = data.get("WT") / 100
    WC = data.get("WC") / 100
    WW = data.get("WW") / 100
    WE = data.get("WE") / 100

    if None in (src_lat, src_long, dest_lat, dest_long):
        return jsonify({"error": "Missing coordinates"}), 400

    #create src and dest nodes
    src = Node(src_lat, src_long, True, True)
    dest = Node(dest_lat, dest_long, True, True)
    
    # cost object from calculations
    print("Creating cost function...")
    cost_func = Cost(src, dest, WT=WT, WC=WC, WE=WE, WW=WW)
    num_layers = int(cost_func.get_num_of_layers(src_lat, src_long, dest_lat, dest_long))
    print(f"Number of layers: {num_layers}")
    nodes_per_layer = cost_func.get_nodes_per_layer(src_lat, src_long, dest_lat, dest_long, num_layers)
    print(f"Nodes_per_layer: {[len(layer) for layer in nodes_per_layer]}")

    # graph object from backend
    print("Initializing graph...")
    graph_obj = Graph(cost_obj=cost_func) # pass cost function to graph for edge cost calculations
    print("Initializing layers...")
    graph_obj.initialize_layers(nodes_per_layer)

    # build adjacency list for graph
    print("Building adjacency list...")
    graph_obj.build_adjacency_list()

    # find path
    print("Calculating optimal path...")
    min_cost, path = graph_obj.min_cost_path(src, dest)
    cleaned_path = graph_obj.location(path) # cleaned path to return to frontend
    print(f"Cleaned_path done")
    return jsonify({"optimal_path": cleaned_path, "min_cost": min_cost}), 200 #placeholder

@app.route('/api/optimal-path2', methods=['POST'])
def get_weather():
    data = request.json
    lat = data.get("latitude")
    lon = data.get("longitude")
    if lat is None or lon is None:
        return jsonify({"error": "Missing latitude or longitude"}), 400
    
    cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
    retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
    openmeteo = openmeteo_requests.Client(session=retry_session)

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ["temperature_2m", "windspeed_10m", "precipitation", "visibility", "lightning_potential"],
        "forecast_hours": 24  # Next 24 hours
    }
    responses = openmeteo.weather_api(url, params=params)
    response = responses[0]

    hourly = response.Hourly()
    # Extract features: assuming current hour or average
    # For simplicity, take the first hour's data
    wind = hourly.Variables(1).ValuesAsNumpy()[0]  # windspeed_10m
    precip = hourly.Variables(2).ValuesAsNumpy()[0]  # precipitation
    visibility = hourly.Variables(3).ValuesAsNumpy()[0] / 1609.34  # convert meters to miles
    lightning = hourly.Variables(4).ValuesAsNumpy()[0]  # lightning_potential (0-1 scale, treat as miles or adjust)
    
    # Time is fixed for now, say 1 hour
    time = 1.0
    # Altitude not available, set to 0 or fetch separately
    altitude = 0.0
    
    weather_features = [wind, precip, lightning, time, visibility, altitude]
    
    return jsonify({"weather_features": weather_features}), 200

@app.route('/testing2', methods=['POST'])
def testing2():
    data = request.json
    deptAirport = data.get("deptAirport")
    arrivalAirport = data.get("arrivalAirport")

    return jsonify({"deptAirport": deptAirport, "arrivalAirport": arrivalAirport})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)