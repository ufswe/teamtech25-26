import csv
import json

with open("airports.csv", newline="") as csvfile, open("converted_data.json", "w") as jsonfile:
        # create DictReader object
    csv_reader = csv.DictReader(csvfile)

    # write opening bracket for JSON aray
    jsonfile.write("{\n")
    
    # flag to track whether we are writing the first JSON object
    
    # needed to place the commas properly between objects
    counter = 0
    # loop thru each row (line) in the CSV
    first_object = True    
    for row in csv_reader:
        # check if it's not the first line
        # if not, write a comma before
        if not first_object:
            jsonfile.write(",\n")

        jsonfile.write(f'"obj{counter}":')
        # convert current row (a dict) into JSON
        # and write directly into JSON file
        jsonfile.write(json.dumps(row))

        # mark that the first object was written
        first_object = False
        counter+=1

    # write the closing bracket for JSON array
    jsonfile.write("}")