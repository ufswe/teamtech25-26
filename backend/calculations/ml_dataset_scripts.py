#This script reads the ml_ready_dataset.csv file (added in .gitignore since its a very large file)
#counts the number of unsafe and safe weather conditions based on the 'unsafe_weather' column

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

    print("Number of unsafe weather conditions:", unsafe_weather_count)     #11786
    print("Number of safe weather conditions:", safe_weather_count)         #1036789


n = int(safe_weather_count / unsafe_weather_count)
print("Ratio of safe to unsafe weather conditions:", n)     #87


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
    
    # print("Length of safe data:", len(safe_weather_data), "| new unsafe data:", len(unsafe_weather_data))
    # print()
    # print(safe_weather_data[0])
    # print()
    # print(unsafe_weather_data[0])