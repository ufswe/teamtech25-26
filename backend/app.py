from flask import Flask, jsonify, request
from flask_cors import CORS

import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry
from calculations.cost_function import CostFunction
from data_structures.graph import Graph
from data_structures.node import Node

app = Flask(__name__)
CORS(app)

@app.route('/api/optimal-path', methods=['POST'])
def get_optimal_path():
    jfk_lat = 40.6446
    jfk_long = -73.7822
    lax_lat = 33.9425
    lax_long = -118.4081

    #hardcoded jfk and lax airports
    src = Node(jfk_lat, jfk_long)
    dest = Node(lax_lat, lax_long)

    #cost object from calculations 
    cost_func = CostFunction(src, dest)
    num_layers = cost_func.get_num_of_layers() 
    nodes_per_layer = cost_func.get_nodes_per_layer(jfk_lat, jfk_long, lax_lat, lax_long, num_layers)
    
    #graph object from backend
    graph_obj = Graph()
    graph_obj.build_adjacency_list(nodes_per_layer)
    min_cost, path = graph_obj.min_cost_path(src, dest) #optimal path
    cleaned_path = graph_obj.location(path) #cleaned path to return to frontend
    return jsonify({"optimal_path": cleaned_path, "min_cost": min_cost}), 200 #placeholder

    # TODO: implement
    # - get data from frontend
    # - create node network
    # - create graph
    # - find optimal path
    pass

@app.route('/api/optimal-path2', methods=['POST'])
def get_weather():
    cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
    retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
    openmeteo = openmeteo_requests.Client(session=retry_session)

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": 29.6520,
        "longitude": 82.3250,
        "hourly": "temperature_2m",
    }
    responses = openmeteo.weather_api(url, params=params)
    response = responses[0]

    hourly = response.Hourly()
    hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()

    hourly_data = {"date": pd.date_range(
        start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
        end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=hourly.Interval()),
        inclusive="left"
    )}
    hourly_data["temperature_2m"] = hourly_temperature_2m
    hourly_dataframe = pd.DataFrame(data=hourly_data)

    return jsonify({"message": f"Weather data retrieved for coordinates: {response.Latitude()}, {response.Longitude()}"}), 200

@app.route('/testing2', methods=['POST'])
def testing2():
    data = request.json
    deptAirport = data.get("deptAirport")
    arrivalAirport = data.get("arrivalAirport")

    return jsonify({"deptAirport": deptAirport, "arrivalAirport": arrivalAirport})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)