from flask import Flask, jsonify, request
from flask_cors import CORS

import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry

app = Flask(__name__)
CORS(app)

@app.route('/api/optimal-path', methods=['POST'])
def get_optimal_path():
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