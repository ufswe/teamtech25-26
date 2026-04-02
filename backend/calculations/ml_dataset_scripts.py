#This script reads the ml_ready_dataset.csv file (added in .gitignore since its a very large file)
#counts the number of unsafe and safe weather conditions based on the 'unsafe_weather' column

#Running this file creates a new csv file 'balanced_ml_ready_dataset.csv' which contains all 
#the unsafe weather data and an equal amount of safe weather data 
#(every nth row of safe weather data is added until the length of safe weather data is the same as unsafe weather data)

#11786 unsafe & safe weather conditions each 

import csv

#Unsafe weather indicated by 1
#Safe weather indicated by 0

unsafe_weather_data = []
safe_weather_data = []

unsafe_weather_count = 0
safe_weather_count = 0

#Pass 1: get safe & unsafe weather count & store all unsafe weather data in an array
with open('ml_ready_dataset.csv', 'r', newline='') as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        if row['unsafe_weather'] == '1':
            unsafe_weather_count += 1
            unsafe_weather_data.append(row)
        if row['unsafe_weather'] == '0':
            safe_weather_count += 1

    #print("Number of unsafe weather conditions:", unsafe_weather_count)     #11786
    #print("Number of safe weather conditions:", safe_weather_count)         #1036789


n = int(safe_weather_count / unsafe_weather_count)
#print("Ratio of safe to unsafe weather conditions:", n)     #87


#pass 2: store every nth safe weather data in an array until its the same length as unsafe array
cnt = 0

with open('ml_ready_dataset.csv', 'r', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if len(safe_weather_data) == len(unsafe_weather_data):
            break
        if row['unsafe_weather'] == '0':
            cnt += 1
            if cnt == n:
                safe_weather_data.append(row)
                cnt = 0
    
    #print("Length of safe data:", len(safe_weather_data), "| new unsafe data:", len(unsafe_weather_data)) #11786 each
    # print()
    #print(safe_weather_data[0])
    # print()
    # print(unsafe_weather_data[0])


#write the balanced dataset to a new csv file
with open('balanced_ml_ready_dataset.csv', 'w', newline='') as csvfile:
    fieldnames = ['ï»¿max_temp_f', 'min_temp_f', 'temp_range_f', 'max_dewpoint_f', 'min_dewpoint_f', 'dewpoint_range_f', 'precip_in', 'avg_wind_speed_kts', 'snow_in', 'avg_feel', 'icing_risk', 'has_snow', 'has_precip', 'high_wind', 'high_wind', 'below_freezing', 'MONTH', 'DEP_1hrpre_num', 'DEP_1hrpost_num', 'unsafe_weather', 'FL_DATE', 'ORIGIN', 'DEST', 'MKT_CARRIER']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for row in unsafe_weather_data:
        writer.writerow(row)
    for row in safe_weather_data:
        writer.writerow(row)

