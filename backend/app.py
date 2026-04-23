from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import pandas as pd
import openmeteo_requests
import requests_cache
from retry_requests import retry
from calculations.cost_function import Cost
from data_structures.graph import Graph
from data_structures.node import Node
app = Flask(__name__)
CORS(app)
@app.route('/api/optimal-path', methods=['POST'])
def get_optimal_path():
    data = request.json
    src_lat = data.get("src_lat")
    src_long = data.get("src_long")
    dest_lat = data.get("dest_lat")
    dest_long = data.get("dest_long")
    if None in (src_lat, src_long, dest_lat, dest_long):
        return jsonify({"error": "Missing coordinates"}), 400
    #create src and dest nodes
    src = Node(src_lat, src_long, True, True)
    dest = Node(dest_lat, dest_long, True, True)
    # cost object from calculations
    cost_func = Cost(src, dest)
    num_layers = int(cost_func.get_num_of_layers(src_lat, src_long, dest_lat, dest_long))
    nodes_per_layer = cost_func.get_nodes_per_layer(src_lat, src_long, dest_lat, dest_long, num_layers)
    print("nodes_per_layer", nodes_per_layer)
    #graph object from backend
    graph_obj = Graph()
    graph_obj.initialize_layers(nodes_per_layer)
    print("layers:", graph_obj._layers)
    graph_obj.build_adjacency_list()
    min_cost, path = graph_obj.min_cost_path(src, dest) #optimal path
    cleaned_path = graph_obj.location(path) #cleaned path to return to frontend
    print("cleaned_path:", cleaned_path)
    return jsonify({"optimal_path": cleaned_path, "min_cost": min_cost}), 200 #placeholder
@app.route('/api/optimal-path2', methods=['GET'])
def get_weather():
    #place holders for now
    # data = request.json
    # lat = data.get("lat")
    # long = data.get("long")
    FORECAST_DAYS = 7 #example value
    HIGH_WIND_THRESHOLD_KN = 20  #example value
    # cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
    # retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
    # openmeteo = openmeteo_requests.Client(session=retry_session)
    # ---- API CALL ----
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": 29,
        "longitude": 137,
        "daily": [
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "snowfall_sum",
            "wind_speed_10m_max",
        ],
        "hourly": [
            "dew_point_2m",
            "apparent_temperature",
            "wind_speed_10m",
            "temperature_2m",
            "precipitation_probability",
        ],
        "temperature_unit": "fahrenheit",
        "wind_speed_unit": "kn",
        "precipitation_unit": "inch",
        "timezone": "auto",
        "forecast_days": FORECAST_DAYS,
    }
    response = requests.get(url, params=params)
    data = response.json()
    # ---- PROCESS DAILY DATA ----
    daily = data["daily"]
    df_daily = pd.DataFrame({
        "date": daily["time"],
        "temp_max_f": daily["temperature_2m_max"],
        "temp_min_f": daily["temperature_2m_min"],
        "precip_inches": daily["precipitation_sum"],
        "snowfall_cm": daily["snowfall_sum"],       # comes back in cm regardless
        "wind_max_kn": daily["wind_speed_10m_max"],
    })
    # ---- PROCESS HOURLY DATA ----
    hourly = data["hourly"]
    df_hourly = pd.DataFrame({
        "datetime": pd.to_datetime(hourly["time"]),
        "dew_point_f": hourly["dew_point_2m"],
        "feels_like_f": hourly["apparent_temperature"],
        "wind_kn": hourly["wind_speed_10m"],
        "temp_f": hourly["temperature_2m"],
        "precip_prob": hourly["precipitation_probability"],
    })
    df_hourly["date"] = df_hourly["datetime"].dt.date.astype(str)
    # ---- AGGREGATE HOURLY → DAILY ----
    hourly_agg = df_hourly.groupby("date").agg(
        dew_point_max_f=("dew_point_f", "max"),
        dew_point_min_f=("dew_point_f", "min"),
        avg_feels_like_f=("feels_like_f", "mean"),
        avg_wind_kn=("wind_kn", "mean"),
        # Icing: hours where temp ≤ 32°F AND precip probability > 0
        icing_risk_hours=("temp_f", lambda x: (
            (x <= 32) & (df_hourly.loc[x.index, "precip_prob"] > 0)
        ).sum())
    ).reset_index()
    # ---- MERGE ----
    df = pd.merge(df_daily, hourly_agg, on="date")
    # ---- DERIVED / CALCULATED VARIABLES ----
    df["temp_range_f"]       = df["temp_max_f"] - df["temp_min_f"]
    df["dew_point_range_f"]  = df["dew_point_max_f"] - df["dew_point_min_f"]
    df["snowfall_inches"]    = df["snowfall_cm"] / 2.54          # cm → inches
    df["has_snow"]           = df["snowfall_inches"] > 0
    df["has_precipitation"]  = df["precip_inches"] > 0
    df["high_wind"]          = df["wind_max_kn"] > HIGH_WIND_THRESHOLD_KN
    df["icing_risk"]         = df["icing_risk_hours"] > 0        # True if ANY icing hour
    # ---- FINAL CLEAN OUTPUT ----
    ml_features = df[[
        "date",
        "temp_max_f",
        "temp_min_f",
        "temp_range_f",
        "dew_point_max_f",
        "dew_point_min_f",
        "dew_point_range_f",
        "precip_inches",
        "avg_wind_kn",
        "snowfall_inches",
        "avg_feels_like_f",
        "icing_risk",
        "has_snow",
        "has_precipitation",
        "high_wind",
    ]]
    return jsonify(ml_features.to_dict(orient='records')), 200
@app.route('/testing2', methods=['POST'])
def testing2():
    data = request.json
    deptAirport = data.get("deptAirport")
    arrivalAirport = data.get("arrivalAirport")
    return jsonify({"deptAirport": deptAirport, "arrivalAirport": arrivalAirport})
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
