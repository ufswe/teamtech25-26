import sqlite3
from calculations.cost_function import Cost 
def setup_database():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS flight_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            airport_code_1 VARCHAR(3) NOT NULL,
            airport_code_2 VARCHAR(3) NOT NULL,
            departure_time TEXT NOT NULL,
            duration TEXT NOT NULL,
            priority TEXT NOT NULL,
            favorites BOOLEAN NOT NULL DEFAULT 0,
            date TEXT NOT NULL
            )
    ''')
    conn.commit()
    conn.close()

def write_airports(code1, code2, depature_time, flight_path, priority, favorites, date):
    sum = 0
    for i in range(len(flight_path)-1):
        cost_function = Cost(flight_path[i], flight_path[i+1])
        distance = cost_function.get_distance(flight_path[i][0], flight_path[i][1], flight_path[i+1][0], flight_path[i+1][1])
        sum += cost_function.time_of_flight(distance)
    command = f"INSERT INTO flight_history (airport_code_1, airport_code_2, departure_time, duration, priority, favorites, date) values (\"{code1}\", \"{code2}\", \"{depature_time}\", \"{sum}\", \"{priority}\", {False}, \"{date}\")"
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute(command)
    conn.commit()
    conn.close()

