# make a script to get weather from every city in airports dataset

import pandas as pd

data = pd.read_csv("./airports.csv")
city_list = set(data['city'])
print(f"There are {len(city_list)} unique cities")