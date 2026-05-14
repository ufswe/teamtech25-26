import requests_cache
from retry_requests import retry
import openmeteo_requests

def fetch_weather_features(lat: float, lon: float) -> list[float]:
    """
    Fetch weather features for a given lat/lon.
    Returns [wind (knots), precipitation (inches), lightning (0-1), time (hours), visibility (miles), altitude (feet)]
    """
    try:
        cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
        retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
        openmeteo = openmeteo_requests.Client(session=retry_session)

        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": ["windspeed_10m", "precipitation", "visibility", "lightning_potential"],
            "forecast_hours": 1  # Current/next hour
        }
        responses = openmeteo.weather_api(url, params=params)
        response = responses[0]

        hourly = response.Hourly()
        wind_knots = hourly.Variables(0).ValuesAsNumpy()[0] * 0.539957  # m/s to knots
        precip_inches = hourly.Variables(1).ValuesAsNumpy()[0] * 0.0393701  # mm to inches
        visibility_miles = hourly.Variables(2).ValuesAsNumpy()[0] / 1609.34  # meters to miles
        lightning = hourly.Variables(3).ValuesAsNumpy()[0]  # 0-1 scale
        
        time = 1.0  # Assume 1 hour flight segment
        altitude = 35000.0  # Typical cruise altitude in feet, or fetch if possible
        
        return [wind_knots, precip_inches, lightning, time, visibility_miles, altitude]
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return None  # Or default values